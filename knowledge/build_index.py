#!/usr/bin/env python3
"""
Build-time Offline Knowledge Base & Index Builder for Shalik.
Generates SQLite database (`kb-v1.sqlite`) with:
- Full-text search (FTS5) table for fast Bangla BM25 retrieval
- Vector embeddings table for semantic similarity
- Source metadata and citation tracking
"""

import os
import sys
import json
import sqlite3
import argparse
import math
from typing import List, Dict, Any

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

def simple_bangla_hash_embedding(text: str, dim: int = 128) -> List[float]:
    """Generates a lightweight deterministic semantic vector for offline indexing."""
    vec = [0.0] * dim
    words = text.split()
    for w in words:
        h = hash(w) % dim
        vec[h] += 1.0

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [round(x / norm, 4) for x in vec]

def build_knowledge_base(chunks_file: str, output_sqlite_path: str):
    print("=" * 70)
    print("SHALIK OFFLINE KNOWLEDGE BASE INDEXER (MILESTONE M5)")
    print("=" * 70)

    if not os.path.exists(chunks_file):
        print(f"Error: chunks file not found at {chunks_file}")
        sys.exit(1)

    os.makedirs(os.path.dirname(output_sqlite_path) or ".", exist_ok=True)
    if os.path.exists(output_sqlite_path):
        os.remove(output_sqlite_path)

    conn = sqlite3.connect(output_sqlite_path)
    cursor = conn.cursor()

    # 1. Chunks metadata table
    cursor.execute("""
        CREATE TABLE chunks (
            chunk_id TEXT PRIMARY KEY,
            source_id TEXT,
            source_title TEXT,
            crop TEXT,
            topic TEXT,
            passage TEXT,
            token_estimate INTEGER
        )
    """)

    # 2. FTS5 table for fast Bengali full-text search
    cursor.execute("""
        CREATE VIRTUAL TABLE chunks_fts USING fts5(
            chunk_id,
            crop,
            topic,
            passage,
            tokenize = 'unicode61'
        )
    """)

    # 3. Embeddings table
    cursor.execute("""
        CREATE TABLE embeddings (
            chunk_id TEXT PRIMARY KEY,
            vector_json TEXT
        )
    """)

    chunk_count = 0
    with open(chunks_file, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            item = json.loads(line)
            chunk_id = item["chunk_id"]
            source_id = item["source_id"]
            source_title = item["source_title"]
            crop = item["crop"]
            topic = item["topic"]
            passage = item["passage"]
            tokens = item.get("token_estimate", 150)

            # Insert metadata
            cursor.execute(
                "INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?, ?)",
                (chunk_id, source_id, source_title, crop, topic, passage, tokens)
            )

            # Insert FTS index
            cursor.execute(
                "INSERT INTO chunks_fts VALUES (?, ?, ?, ?)",
                (chunk_id, crop, topic, passage)
            )

            # Insert Vector
            emb = simple_bangla_hash_embedding(f"{crop} {topic} {passage}")
            cursor.execute(
                "INSERT INTO embeddings VALUES (?, ?)",
                (chunk_id, json.dumps(emb))
            )

            chunk_count += 1

    conn.commit()
    conn.close()

    db_size_kb = os.path.getsize(output_sqlite_path) / 1024
    print(f"Indexed {chunk_count} chunks into SQLite.")
    print(f"Database Path : {output_sqlite_path}")
    print(f"Database Size : {db_size_kb:.1f} KB")
    print("=" * 70)
    print("Status: Offline Knowledge Base Index Successfully Built")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Build Shalik Offline RAG Index")
    parser.add_argument("--chunks", default="knowledge/build/processed_chunks.jsonl", help="Input chunks jsonl")
    parser.add_argument("--output", default="knowledge/build/kb-v1.sqlite", help="Output SQLite file")
    args = parser.parse_args()

    build_knowledge_base(args.chunks, args.output)
