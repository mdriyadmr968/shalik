# data/

Raw and processed datasets. **Contents are git-ignored**; only this README is committed.

```
data/
├── raw/          # Original downloads (PDFs, image datasets, audio)
├── interim/      # Extracted / cleaned text, resized images
└── processed/    # SFT jsonl, classifier splits, eval sets
```

Every dataset must be listed in `knowledge/sources.yaml` with its licence and permission status before it is used.
Candidate image datasets: RiceLeafDiseaseBD, BanglaRiceLeaf, Dhan-Shomadhan, RiceLeafBD (Mendeley Data).
