package com.shalik.core.llm

import android.content.Context
import android.net.Uri
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.security.MessageDigest
import javax.inject.Inject
import javax.inject.Singleton

sealed interface ModelState {
    data object NotInstalled : ModelState
    data class Importing(val progressPercent: Int) : ModelState
    data class Ready(val modelFile: File, val sizeMb: Long) : ModelState
    data class Error(val message: String) : ModelState
}

@Singleton
class ModelManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val deviceCapabilityDetector: DeviceCapabilityDetector
) {
    private val _modelState = MutableStateFlow<ModelState>(ModelState.NotInstalled)
    val modelState: StateFlow<ModelState> = _modelState.asStateFlow()

    private val modelsDir: File
        get() = File(context.filesDir, "models").apply { if (!exists()) mkdirs() }

    init {
        checkInstalledModel()
    }

    fun getActiveModelFile(): File? {
        val spec = deviceCapabilityDetector.detectDeviceCapabilities()
        val file = File(modelsDir, spec.recommendedModelFileName)
        return if (file.exists() && file.length() > 0) file else null
    }

    fun checkInstalledModel() {
        val spec = deviceCapabilityDetector.detectDeviceCapabilities()
        val file = File(modelsDir, spec.recommendedModelFileName)
        if (file.exists() && file.length() > 1024 * 1024) { // At least 1MB
            val sizeMb = file.length() / (1024 * 1024)
            _modelState.value = ModelState.Ready(file, sizeMb)
        } else {
            _modelState.value = ModelState.NotInstalled
        }
    }

    suspend fun verifyChecksum(file: File, expectedSha256: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val digest = MessageDigest.getInstance("SHA-256")
            val buffer = ByteArray(8192)
            FileInputStream(file).use { fis ->
                var bytesRead: Int
                while (fis.read(buffer).also { bytesRead = it } != -1) {
                    digest.update(buffer, 0, bytesRead)
                }
            }
            val calculated = digest.digest().joinToString("") { "%02x".format(it) }
            calculated.equals(expectedSha256, ignoreCase = true)
        } catch (e: Exception) {
            false
        }
    }

    suspend fun importModelFromUri(sourceUri: Uri, targetFileName: String): Result<File> = withContext(Dispatchers.IO) {
        try {
            _modelState.value = ModelState.Importing(0)
            val targetFile = File(modelsDir, targetFileName)

            context.contentResolver.openInputStream(sourceUri)?.use { input ->
                val totalLength = context.contentResolver.openFileDescriptor(sourceUri, "r")?.statSize ?: -1L
                var copiedBytes = 0L

                FileOutputStream(targetFile).use { output ->
                    val buffer = ByteArray(64 * 1024) // 64KB buffer
                    var read: Int
                    while (input.read(buffer).also { read = it } != -1) {
                        output.write(buffer, 0, read)
                        copiedBytes += read
                        if (totalLength > 0) {
                            val percent = ((copiedBytes * 100) / totalLength).toInt()
                            _modelState.value = ModelState.Importing(percent)
                        }
                    }
                }
            } ?: return@withContext Result.failure(Exception("Cannot open source URI"))

            val sizeMb = targetFile.length() / (1024 * 1024)
            _modelState.value = ModelState.Ready(targetFile, sizeMb)
            Result.success(targetFile)
        } catch (e: Exception) {
            _modelState.value = ModelState.Error("Import failed: ${e.localizedMessage}")
            Result.failure(e)
        }
    }
}
