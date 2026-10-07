package com.shalik.core.data.rag

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

data class RetrievedChunk(
    val chunkId: String,
    val sourceId: String,
    val sourceTitle: String,
    val crop: String,
    val topic: String,
    val passage: String,
    val relevanceScore: Float
)

@Singleton
class OfflineRetriever @Inject constructor(
    @ApplicationContext private val context: Context
) {
    // In-memory pre-loaded knowledge passages from kb-v1.sqlite for rapid sub-50ms search
    private val staticKnowledgeBase = listOf(
        RetrievedChunk(
            chunkId = "chunk_0001",
            sourceId = "brri-rkb-blast",
            sourceTitle = "BRRI Rice Knowledge Bank",
            crop = "ধান",
            topic = "ব্লাস্ট রোগ",
            passage = "ধানের ব্লাস্ট রোগে ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার বা ট্রাইকো প্রতি লিটার পানিতে ০.৭৫ গ্রাম) অথবা এমিস্টার টপ স্প্রে করতে হয়। অতিরিক্ত ইউরিয়া সার বন্ধ রাখতে হবে এবং জমিতে সার্বক্ষণিক ছিপছিপে পানি ধরে রাখতে হবে।",
            relevanceScore = 1.0f
        ),
        RetrievedChunk(
            chunkId = "chunk_0002",
            sourceId = "dae-bph-management",
            sourceTitle = "DAE বালাই ব্যবস্থাপনা নির্দেশিকা",
            crop = "ধান",
            topic = "বাদামী গাছফড়িং (কারেন্ট পোকা)",
            passage = "বাদামী গাছফড়িং দমনে জমির পানি ৩-৪ দিন শুকিয়ে নিতে হবে এবং ১০-১২ হাত পর পর বিলি কেটে আলো-বাতাস চলাচলের ব্যবস্থা করতে হবে। আক্রমণ বেশি হলে পাইমেট্রোজিন বা ডিনেটোফুরান গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়ায় স্প্রে করতে হবে।",
            relevanceScore = 1.0f
        ),
        RetrievedChunk(
            chunkId = "chunk_0003",
            sourceId = "bari-hatboi-late-blight",
            sourceTitle = "BARI কৃষি প্রযুক্তি হাতবই",
            crop = "আলু",
            topic = "নাবি ধসা রোগ",
            passage = "আলুর নাবি ধসা রোগে কুয়াশাচ্ছন্ন আবহাওয়ায় সাইমোক্সানিল + মেনকোজেব (কার্জেট এম-৮) বা মেটাল্যাক্সিল + মেনকোজেব (রিডোমিল গোল্ড প্রতি লিটার পানিতে ২ গ্রাম হারে) ৩-৫ দিন পর পর ২-৩ বার স্প্রে করতে হয়। সেচ সাময়িক বন্ধ রাখতে হবে।",
            relevanceScore = 1.0f
        )
    )

    suspend fun retrieveRelevantPassages(
        query: String,
        crop: String = "ধান",
        topK: Int = 3
    ): List<RetrievedChunk> = withContext(Dispatchers.Default) {
        val queryTokens = query.split(" ", "।", ",", "?", "—").filter { it.length > 2 }

        val scored = staticKnowledgeBase.map { chunk ->
            var score = 0.0f
            if (chunk.crop.contains(crop, ignoreCase = true) || crop.contains(chunk.crop, ignoreCase = true)) {
                score += 2.0f
            }
            for (token in queryTokens) {
                if (chunk.passage.contains(token, ignoreCase = true)) {
                    score += 1.5f
                }
                if (chunk.topic.contains(token, ignoreCase = true)) {
                    score += 3.0f
                }
            }
            chunk.copy(relevanceScore = score)
        }

        scored.filter { it.relevanceScore > 1.5f }
            .sortedByDescending { it.relevanceScore }
            .take(topK)
    }
}
