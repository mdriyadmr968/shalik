#!/usr/bin/env python3
"""
Bangla Agricultural Document Processor & Semantic Chunker.
Cleans raw agricultural texts (DAE, BRRI, BARI), handles Bijoy-to-Unicode mapping,
normalizes Bengali Unicode (NFC), and produces structured semantic chunks.
"""

import os
import sys
import json
import re
import unicodedata
import argparse
from typing import List, Dict, Any

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Common Bijoy ASCII to Unicode Bengali transliteration mapping snippet
BIJOY_TO_UNICODE = {
    "Av": "আ", "B": "ই", "C": "ঈ", "D": "উ", "E": "ঊ",
    "F": "ঋ", "G": "এ", "H": "ঐ", "I": "ও", "J": "ঔ",
    "K": "ক", "L": "খ", "M": "গ", "N": "ঘ", "O": "ঙ",
    "P": "চ", "Q": "ছ", "R": "জ", "S": "ঝ", "T": "ঞ",
    "U": "ট", "V": "ঠ", "W": "ড", "X": "ঢ", "Y": "ণ",
    "Z": "ত", "_": "থ", "`": "দ", "a": "ধ", "b": "ন",
    "c": "প", "d": "ফ", "e": "ব", "f": "ভ", "g": "ম",
    "h": "য", "i": "র", "j": "ল", "k": "শ", "l": "ষ",
    "m": "স", "n": "হ", "o": "ড়", "p": "ঢ়", "q": "য়"
}

def normalize_bengali_text(text: str) -> str:
    """Normalizes Bengali text to standard Unicode NFC and cleans artifacts."""
    # Unicode NFC normalization
    text = unicodedata.normalize("NFC", text)
    # Remove repeated whitespaces
    text = re.sub(r'[ \t]+', ' ', text)
    # Fix broken Hasanta or Nukta sequences
    text = text.replace("্ া", "্")
    # Clean zero-width spaces or stray control characters
    text = re.sub(r'[\u200b\u200c\u200d\uFEFF]', '', text)
    return text.strip()

def chunk_text(text: str, max_words: int = 250, overlap_words: int = 30) -> List[str]:
    """Splits text into overlapping semantic passages."""
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = []
    current_word_count = 0

    for para in paragraphs:
        words = para.split()
        if not words:
            continue

        if current_word_count + len(words) <= max_words:
            current_chunk.extend(words)
            current_word_count += len(words)
        else:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                # Retain overlap from end of previous chunk
                overlap = current_chunk[-overlap_words:] if len(current_chunk) >= overlap_words else current_chunk
                current_chunk = list(overlap) + words
                current_word_count = len(current_chunk)
            else:
                chunks.append(" ".join(words))

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

SAMPLE_AGRICULTURAL_DOCUMENTS = [
    {
        "source_id": "brri-rkb-blast",
        "crop": "ধান (Rice)",
        "topic": "ব্লাস্ট রোগ দমন (Rice Blast Management)",
        "source_title": "BRRI Rice Knowledge Bank - রোগ ও বালাই ব্যবস্থাপনা",
        "text": """ধানের ব্লাস্ট রোগ একটি মারাত্মক ছত্রাকজনিত রোগ। এটি পাইরিকুলারিয়া ওরাইজি (Pyricularia oryzae) বা ম্যাগনাপর্থে ওরাইজি নামক ছত্রাকের আক্রমণে ঘটে।
এই রোগ গাছের যেকোনো বৃদ্ধি পর্যায়ে দেখা দিতে পারে। আক্রমণের স্থানের ওপর ভিত্তি করে ব্লাস্ট রোগকে তিন ভাগে ভাগ করা হয়: পাতা ব্লাস্ট, গিট ব্লাস্ট এবং শিষ বা গ্রীবা ব্লাস্ট।

লক্ষণ: পাতা ব্লাস্টে প্রথমে পাতায় ছোট ছোট ডিম্বাকৃতি বা চোখের মতো বাদামী দাগ পড়ে। দাগগুলোর কেন্দ্রভাগ ধূসর বা সাদাটে এবং কিনারা গাঢ় বাদামী রঙের হয়। ধীরে ধীরে দাগগুলো বড় হয়ে পাতার সম্পূর্ণ অংশ পুড়িয়ে দেয়। শিষ ব্লাস্টে শিষের গোড়া কালো হয়ে ভেঙে যায় এবং ধানে কোনো দান বাঁধে না (চিটা হয়ে যায়)।

অনুকূল আবহাওয়া: রাতে ঠান্ডা, দিনে গরম, সকালে ঘন কুয়াশা ও শিশিরপাত থাকলে এই রোগ দ্রুত ছড়িয়ে পড়ে। অতিরিক্ত ইউরিয়া সার প্রয়োগ করলে রোগের তীব্রতা বৃদ্ধি পায়।

প্রতিকার ও প্রতিরোধ:
১. জমিতে ইউরিয়া সারের উপরিপ্রয়োগ সাময়িকভাবে বন্ধ রাখুন এবং অনুমোদিত মাত্রায় পটাশ সার প্রয়োগ করুন।
২. জমিতে পানি শুকিয়ে যেতে দেবেন না; সার্বক্ষণিক ছিপছিপে পানি ধরে রাখুন।
৩. রোগ দেখা দেওয়ার সাথে সাথে ট্রাইসাইক্লাজোল গ্রুপের ছত্রাকনাশক (যেমন ট্রুপার ৭৫ ডব্লিউপি বা ট্রাইকো প্রতি লিটার পানিতে ০.৭৫ গ্রাম) অথবা ডাইফেনোকোনাজল + অ্যাজোক্সিস্ট্রোবিন গ্রুপের ছত্রাকনাশক (যেমন এমিস্টার টপ প্রতি লিটার পানিতে ১ মিলি) বিকেলে স্প্রে করুন। স্প্রে করার সময় লক্ষ্য রাখতে হবে যেন গাছের সমস্ত পাতা ভালোভাবে ভিজে যায়।"""
    },
    {
        "source_id": "bari-hatboi-late-blight",
        "crop": "আলু (Potato)",
        "topic": "আলুর নাবি ধসা রোগ (Late Blight of Potato)",
        "source_title": "BARI কৃষি প্রযুক্তি হাতবই - কন্দাল ফসল",
        "text": """আলুর নাবি ধসা রোগ (লেইট ব্লাইট) ফাইটোপথোরা ইনফেস্ট্যান্স (Phytophthora infestans) নামক ছত্রাকের দ্বারা সংক্রমিত হয়। কুয়াশাচ্ছন্ন মেঘলা আবহাওয়ায় কয়েক দিনের মধ্যে পুরো মাঠের ফসল ধ্বংস হয়ে যেতে পারে।

লক্ষণ: পাতার ডগা ও কিনারায় ভেজা ভেজা তেলের মতো ছোট ছোট দাগ দেখা যায় যা দ্রুত বড় হয়ে কালচে বাদামী বর্ণ ধারণ করে। পাতার নিচের পিঠে সাদা তুলার মতো ছত্রাকের বৃদ্ধি দেখা যায়। আক্রান্ত পাতা ও কাণ্ড দ্রুত পচে পচা গন্ধ বের হয়।

ব্যবস্থাপনা:
১. রোগমুক্ত প্রত্যয়িত বীজ ব্যবহার করতে হবে।
২. কুয়াশাচ্ছন্ন ঠান্ডা আবহাওয়ার পূর্বাভাস থাকলে রোগ আসার আগেই মেনকোজেব গ্রুপের স্পর্শক ছত্রাকনাশক (যেমন ডাইথেন এম-৪৫ প্রতি লিটার পানিতে ২ গ্রাম) প্রতি ৭-১০ দিন পর পর প্রতিরোধমূলক স্প্রে করতে হবে।
৩. রোগ মাঠে ছড়িয়ে পড়লে অন্তর্বাহী ছত্রাকনাশক যেমন সাইমোক্সানিল + মেনকোজেব (কার্জেট এম-৮) বা মেটাল্যাক্সিল + মেনকোজেব (রিডোমিল গোল্ড প্রতি লিটার পানিতে ২ গ্রাম হারে) ৩-৫ দিন পর পর ২-৩ বার স্প্রে করতে হবে।
৪. সেচ সাময়িকভাবে বন্ধ রাখতে হবে এবং আক্রান্ত গাছ জমি থেকে সাবধানে অপসরণ করতে হবে।"""
    },
    {
        "source_id": "dae-bph-management",
        "crop": "ধান (Rice)",
        "topic": "বাদামী গাছফড়িং বা কারেন্ট পোকা দমন",
        "source_title": "DAE সমন্বিত বালাই ব্যবস্থাপনা নির্দেশিকা",
        "text": """বাদামী গাছফড়িং বা বিপিএইচ (Nilaparvata lugens) বাংলাদেশে কৃষকদের কাছে 'কারেন্ট পোকা' নামে পরিচিত। কারণ এই পোকা এত দ্রুত আক্রমণ করে যে মনে হয় জমিতে বিদ্যুৎস্পৃষ্ট হয়ে গাছ পুড়ে গেছে। একে 'হপারবার্ন' বলা হয়।

পোকা চেনার উপায় ও ক্ষতি: পূর্ণাঙ্গ ও বাচ্চা পোকা ধানের পাতার গোড়ায় থেকে রস চুষে খায়। ফলে গাছ হলুদ হয়ে গোল গোল চক্রাকারে পুড়ে মারা যায়।

সমন্বিত দমন ব্যবস্থা:
১. জমিতে বিলি কেটে আলো-বাতাস চলাচলের ব্যবস্থা করুন। প্রতি ১০-১২ হাত পর পর একটি করে সারি ফাঁকা রাখলে পোকার আক্রমণ অনেক কমে যায়।
২. জমির পানি নামিয়ে দিয়ে ৩-৪ দিন জমি শুকিয়ে নিতে হবে।
৩. পাইরেথ্রয়েড গ্রুপের কীটনাশক (যেমন সাইপারমেথ্রিন) কখনোই ব্যবহার করবেন না, এতে বিপিএইচ পোকার ডিম দেওয়ার ক্ষমতা বেড়ে যায়।
৪. আক্রমণের মাত্রা বেশি হলে পাইমেট্রোজিন (যেমন প্যাক্সাস / চেস) অথবা ডিনেটোফুরান বা থায়ামেথোক্সাম গ্রুপের অনুমোদিত কীটনাশক গাছের গোড়া ভিজিয়ে স্প্রে করতে হবে।"""
    }
]

def process_documents(output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    all_chunks = []
    chunk_counter = 0

    print("=" * 70)
    print("SHALIK KNOWLEDGE PROCESSOR & CHUNKER (MILESTONE M3)")
    print("=" * 70)

    for doc in SAMPLE_AGRICULTURAL_DOCUMENTS:
        cleaned_text = normalize_bengali_text(doc["text"])
        chunks = chunk_text(cleaned_text, max_words=200, overlap_words=25)

        for idx, chunk in enumerate(chunks):
            chunk_counter += 1
            chunk_data = {
                "chunk_id": f"chunk_{chunk_counter:04d}",
                "source_id": doc["source_id"],
                "source_title": doc["source_title"],
                "crop": doc["crop"],
                "topic": doc["topic"],
                "passage": chunk,
                "token_estimate": int(len(chunk.split()) * 1.3)
            }
            all_chunks.append(chunk_data)

    output_path = os.path.join(output_dir, "processed_chunks.jsonl")
    with open(output_path, "w", encoding="utf-8") as f:
        for ch in all_chunks:
            f.write(json.dumps(ch, ensure_ascii=False) + "\n")

    print(f"Generated {len(all_chunks)} semantic knowledge chunks.")
    print(f"Saved to: {output_path}")
    print("=" * 70)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process and chunk agricultural documents")
    parser.add_argument("--output", default="knowledge/build", help="Output directory")
    args = parser.parse_args()
    process_documents(args.output)
