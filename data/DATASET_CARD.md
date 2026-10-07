# Shalik Agricultural Dataset Card

## 1. Dataset Overview
- **Curators:** Shalik Project
- **Primary Languages:** Bengali (বাংলা, `bn-BD`), Bangladeshi Regional Dialects (Rangpur, Rajshahi, Barisal, Sylhet, Chittagong)
- **Primary Target Crops:** Rice (ধান - Aman, Boro, Aus), Potato (আলু), Jute (পাট), Eggplant (বেগুন), Tomato (টমেটো), Wheat (গম)
- **Source Institutions:**
  - Bangladesh Rice Research Institute (BRRI) — Rice Knowledge Bank
  - Bangladesh Agricultural Research Institute (BARI) — Krishi Projukti Hatboi
  - Department of Agricultural Extension (DAE) — Integrated Pest Management (IPM) Guides
  - Bangladesh Agricultural Research Council (BARC) — Fertilizer Recommendation Guides

## 2. Text Corpus Preprocessing
1. **Encoding Normalization:**
   - Legacy Bijoy ASCII characters mapped to standard Bengali Unicode (NFC).
   - Removal of zero-width artifacts (`\u200b`, `\u200c`, `\u200d`, `\uFEFF`).
2. **Semantic Chunking:**
   - Text divided into overlapping passages (150–250 words per chunk with 25-word overlap).
   - Each chunk tagged with metadata: `source_id`, `crop`, `topic`, `token_estimate`.
3. **Instruction Dataset (SFT):**
   - Transformed into natural conversational Q&A pairs in ShareGPT / Hugging Face format.
   - Includes colloquial farmer phrases and negative examples (out-of-domain refusals and referral to 16123 Krishi Call Center).

## 3. Vision & Image Taxonomy
- Aligned with open Bangladeshi research datasets:
  - **RiceLeafDiseaseBD** (Mendeley Data, 9,769 images across 6 classes)
  - **BanglaRiceLeaf** (BRRI experimental field benchmark, 4,152 images across 5 classes)
  - **Dhan-Shomadhan** (1,106 images across 5 common field diseases)

## 4. Safety & Content Guardrails
- **Banned Pesticides:** Excludes banned agrochemicals (Endosulfan, Paraquat, DDT, Carbofuran on vegetables) per Bangladesh Gazette and DAE regulations.
- **Protective Equipment (PPE):** Enforces mandatory safety advice (mask, gloves, pre-harvest interval) for all pesticide recommendations.
