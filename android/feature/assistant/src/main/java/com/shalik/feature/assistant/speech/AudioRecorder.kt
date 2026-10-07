package com.shalik.feature.assistant.speech

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.io.RandomAccessFile
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.sqrt

sealed interface RecordingState {
    data object Idle : RecordingState
    data class Recording(val durationMs: Long, val amplitude: Float) : RecordingState
    data class Completed(val audioFile: File, val durationMs: Long) : RecordingState
    data class Error(val message: String) : RecordingState
}

@Singleton
class AudioRecorder @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        const val SAMPLE_RATE = 16000
        const val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
        const val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
        const val MAX_RECORDING_DURATION_MS = 30000L // 30 seconds max
        const val VAD_SILENCE_THRESHOLD = 500.0 // RMS threshold for silence
    }

    private val _recordingState = MutableStateFlow<RecordingState>(RecordingState.Idle)
    val recordingState: StateFlow<RecordingState> = _recordingState.asStateFlow()

    @Volatile
    private var isRecording = false
    private var audioRecord: AudioRecord? = null

    @SuppressLint("MissingPermission")
    suspend fun startRecording(outputFile: File): Result<Unit> = withContext(Dispatchers.IO) {
        if (isRecording) {
            return@withContext Result.failure(IllegalStateException("Already recording"))
        }

        val minBufferSize = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT)
        val bufferSize = (minBufferSize * 2).coerceAtLeast(4096)

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                _recordingState.value = RecordingState.Error("মাইক্রোফোন চালু করা যায়নি")
                return@withContext Result.failure(IllegalStateException("AudioRecord initialization failed"))
            }

            audioRecord?.startRecording()
            isRecording = true

            val rawPcmFile = File(context.cacheDir, "temp_recording.pcm")
            FileOutputStream(rawPcmFile).use { fos ->
                val buffer = ShortArray(bufferSize / 2)
                val startTime = System.currentTimeMillis()

                while (isRecording) {
                    val readCount = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readCount > 0) {
                        // Write bytes (little-endian)
                        val byteBuffer = ByteArray(readCount * 2)
                        var sumSquares = 0.0
                        for (i in 0 until readCount) {
                            val sample = buffer[i]
                            byteBuffer[i * 2] = (sample.toInt() and 0xFF).toByte()
                            byteBuffer[i * 2 + 1] = ((sample.toInt() shr 8) and 0xFF).toByte()
                            sumSquares += sample * sample
                        }
                        fos.write(byteBuffer)

                        val rms = sqrt(sumSquares / readCount)
                        val elapsed = System.currentTimeMillis() - startTime
                        _recordingState.value = RecordingState.Recording(elapsed, (rms / 32768.0).toFloat())

                        if (elapsed >= MAX_RECORDING_DURATION_MS) {
                            break
                        }
                    }
                }
            }

            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
            isRecording = false

            // Convert PCM to standard 16kHz WAV file
            writeWavHeader(rawPcmFile, outputFile)
            rawPcmFile.delete()

            val totalDuration = (outputFile.length() - 44) / (SAMPLE_RATE * 2) * 1000
            _recordingState.value = RecordingState.Completed(outputFile, totalDuration)
            Result.success(Unit)
        } catch (e: Exception) {
            isRecording = false
            audioRecord?.release()
            audioRecord = null
            _recordingState.value = RecordingState.Error("রেকর্ডিং সমস্যা: ${e.localizedMessage}")
            Result.failure(e)
        }
    }

    fun stopRecording() {
        isRecording = false
    }

    private fun writeWavHeader(pcmFile: File, wavFile: File) {
        val pcmSize = pcmFile.length()
        val totalDataLen = pcmSize + 36
        val byteRate = SAMPLE_RATE * 2 // 1 channel * 16 bit / 8

        pcmFile.inputStream().use { input ->
            wavFile.outputStream().use { output ->
                val header = ByteArray(44)
                // RIFF chunk
                header[0] = 'R'.code.toByte(); header[1] = 'I'.code.toByte(); header[2] = 'F'.code.toByte(); header[3] = 'F'.code.toByte()
                header[4] = (totalDataLen and 0xff).toByte()
                header[5] = ((totalDataLen shr 8) and 0xff).toByte()
                header[6] = ((totalDataLen shr 16) and 0xff).toByte()
                header[7] = ((totalDataLen shr 24) and 0xff).toByte()
                header[8] = 'W'.code.toByte(); header[9] = 'A'.code.toByte(); header[10] = 'V'.code.toByte(); header[11] = 'E'.code.toByte()
                // fmt chunk
                header[12] = 'f'.code.toByte(); header[13] = 'm'.code.toByte(); header[14] = 't'.code.toByte(); header[15] = ' '.code.toByte()
                header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0 // Subchunk1Size
                header[20] = 1; header[21] = 0 // AudioFormat (PCM)
                header[22] = 1; header[23] = 0 // NumChannels (Mono)
                header[24] = (SAMPLE_RATE and 0xff).toByte()
                header[25] = ((SAMPLE_RATE shr 8) and 0xff).toByte()
                header[26] = ((SAMPLE_RATE shr 16) and 0xff).toByte()
                header[27] = ((SAMPLE_RATE shr 24) and 0xff).toByte()
                header[28] = (byteRate and 0xff).toByte()
                header[29] = ((byteRate shr 8) and 0xff).toByte()
                header[30] = ((byteRate shr 16) and 0xff).toByte()
                header[31] = ((byteRate shr 24) and 0xff).toByte()
                header[32] = 2; header[33] = 0 // BlockAlign (1 * 16 / 8)
                header[34] = 16; header[35] = 0 // BitsPerSample
                // data chunk
                header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte(); header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
                header[40] = (pcmSize and 0xff).toByte()
                header[41] = ((pcmSize shr 8) and 0xff).toByte()
                header[42] = ((pcmSize shr 16) and 0xff).toByte()
                header[43] = ((pcmSize shr 24) and 0xff).toByte()

                output.write(header)
                input.copyTo(output)
            }
        }
    }
}
