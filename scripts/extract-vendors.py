"""
Extract vendor → booth assignments from the 400 Market Excel master list
and emit a clean JSON file for the TS seed script to consume.

Rules applied (from the mapping Q&A):

  Filter
    • Skip rows whose booth column contains "concessions", "outside",
      "parking lot", or "building b" (case-insensitive).

  Q1 — cross-reference rows
    • Skip rows whose Vendor Name starts with "See " — those are pointers
      to real-vendor rows that already carry the authoritative booth list.

  Q2 — booth 207 ownership
    • Remove 207 from Concord Rugs, ADD 206 (it was missing).
    • Leave 207 on Farmasi.

  Q3 — booths not in the SVG
    • 1000 (Salty's Diner), 1700 (Mundo Café), 3000 (Sunrise Kitchen),
      405 (Maximum Darts), 3404 (You & Magnets 4 Ever) now exist in the
      SVG — mapping is straightforward.
    • 1724A / 1724B / 1725A / 1725B / 209A / 209B / 2523A: the SVG has
      single booths (1724, 1725, 209, 2523). Skip those assignments and
      flag them in the conflict report for later follow-up.

Outputs
  src/seed/vendors-from-excel.json        — vendor-to-booth assignments
  src/seed/vendors-conflicts.md           — human-readable conflict log

Run
  python scripts/extract-vendors.py
"""

import json
import re
from pathlib import Path

import openpyxl

EXCEL = Path(r"C:/Users/willg/Downloads/Vendors 2026-03-27 (2).xlsx")
OUT_JSON = Path("src/seed/vendors-from-excel.json")
OUT_REPORT = Path("src/seed/vendors-conflicts.md")

# Booth numbers the SVG doesn't have as individual sub-booths — any
# vendor referencing these gets flagged, not mapped.
UNMAPPABLE_BOOTHS = {"1724A", "1724B", "1725A", "1725B", "209A", "209B", "2523A"}

# Q1 — anything starting with these is a cross-ref pointer, not a vendor.
CROSSREF_PREFIXES = ("See ", "see ")


def main() -> None:
    wb = openpyxl.load_workbook(EXCEL, data_only=True)
    ws = wb["Sheet1"]

    vendors = []          # list of {name, email, active, booths: [...]}
    conflicts = []        # list of {name, booths, reason}
    skipped_filtered = 0
    skipped_crossref = []

    for name, status, email, booth in list(ws.iter_rows(values_only=True))[1:]:
        booth_str = (str(booth).strip() if booth else "")
        name_str = (str(name).strip() if name else "")
        status_str = (str(status).strip().upper() if status else "")
        email_str = (str(email).strip() if email else "")

        if not name_str or not booth_str:
            continue

        # Filter: skip non-booth rows outright.
        bl = booth_str.lower()
        if any(tok in bl for tok in ("concession", "outside", "parking", "building b")):
            skipped_filtered += 1
            continue

        # Q1 — cross-reference rows.
        if name_str.startswith(CROSSREF_PREFIXES):
            skipped_crossref.append((name_str, booth_str))
            continue

        # Extract booth codes: 3-4 digits, optional A/B/C suffix.
        codes = re.findall(r"\b(\d{3,4}[A-Z]?)\b", booth_str)
        if not codes:
            conflicts.append({
                "name": name_str,
                "booths": booth_str,
                "reason": "Could not parse any booth number from the cell.",
            })
            continue

        # Partition into mappable + flagged.
        mappable = [c for c in codes if c not in UNMAPPABLE_BOOTHS]
        flagged = [c for c in codes if c in UNMAPPABLE_BOOTHS]

        if flagged:
            conflicts.append({
                "name": name_str,
                "booths": booth_str,
                "reason": (
                    f"Excel booths {flagged} are not present in the SVG (the SVG has "
                    f"them as single booths without the A/B split). Mapping the "
                    f"remaining {mappable or '[]'} for now; skip the flagged ones "
                    f"until the SVG is split."
                ),
            })

        if not mappable and not flagged:
            # All booths parsed but none mappable — shouldn't happen, but guard.
            conflicts.append({
                "name": name_str,
                "booths": booth_str,
                "reason": "No mappable booths after filtering.",
            })
            continue

        vendors.append({
            "name": name_str,
            "email": email_str,
            "active": status_str == "ACTIVE",
            "booths": mappable,
            "originalBoothsCell": booth_str,
        })

    # Q2 — 207 ownership adjustment.
    for v in vendors:
        if v["name"] == "Concord Rugs":
            v["booths"] = [b for b in v["booths"] if b != "207"]
            if "206" not in v["booths"]:
                v["booths"].append("206")

    # Detect duplicate ownership (same booth claimed by 2+ vendors AFTER
    # Q2 adjustments). Flag but keep both in JSON — the TS seed will
    # pick the FIRST one to win.
    booth_to_owners = {}
    for v in vendors:
        for b in v["booths"]:
            booth_to_owners.setdefault(b, []).append(v["name"])
    dupes = {b: owners for b, owners in booth_to_owners.items() if len(owners) > 1}
    for b, owners in dupes.items():
        conflicts.append({
            "name": ", ".join(owners),
            "booths": b,
            "reason": (
                f"Booth {b} is listed by multiple vendors. The seed will grant it "
                f"to the first-listed vendor ({owners[0]}) and SKIP it for the "
                f"others. Revisit in the CRM."
            ),
        })

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(
        json.dumps(
            {
                "generatedAt": "run-via-scripts/extract-vendors.py",
                "sourceFile": str(EXCEL.name),
                "vendorCount": len(vendors),
                "vendors": vendors,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    # Human-readable conflict report.
    lines = ["# Vendor-mapping conflicts & follow-ups\n"]
    lines.append(
        f"Source: `{EXCEL.name}` · extracted {len(vendors)} vendors covering "
        f"{sum(len(v['booths']) for v in vendors)} booths.\n"
    )
    lines.append(
        f"Filter skipped: {skipped_filtered} rows "
        "(concessions / outside / parking lot / Building B).\n"
    )
    lines.append(
        f"Cross-reference rows skipped (Q1): {len(skipped_crossref)}.\n"
    )
    if skipped_crossref:
        lines.append("\n<details><summary>Cross-ref rows</summary>\n")
        for n, b in skipped_crossref:
            lines.append(f"- {n} → `{b}`\n")
        lines.append("</details>\n")

    lines.append("\n## Conflicts to resolve in the CRM\n")
    if not conflicts:
        lines.append("*(None — mapping is clean.)*\n")
    else:
        for c in conflicts:
            lines.append(f"- **{c['name']}** — booth(s) `{c['booths']}`: {c['reason']}\n")

    OUT_REPORT.write_text("\n".join(lines), encoding="utf-8")

    total_booths = sum(len(v["booths"]) for v in vendors)
    print(f"Wrote {OUT_JSON} ({len(vendors)} vendors, {total_booths} booth assignments)")
    print(f"Wrote {OUT_REPORT} ({len(conflicts)} conflicts)")


if __name__ == "__main__":
    main()
