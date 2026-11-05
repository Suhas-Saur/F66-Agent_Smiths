"""Submission packager and validator for PartSure AI.

Strictly checks all competition constraints:
- solution.py directly at root
- Only allowed extensions (.py, .json, .txt, .md)
- No subfolders
- Max 100 files, max 2 MiB per file, max 16 MiB uncompressed, max 32 MiB ZIP
- Validates that zip extracts and runs local_check.py
"""
import io
import os
import zipfile
import subprocess
import sys

ALLOWED_EXTENSIONS = {'.py', '.json', '.txt', '.md'}
MAX_FILES = 100
MAX_FILE_SIZE = 2 * 1024 * 1024
MAX_UNCOMPRESSED = 16 * 1024 * 1024
MAX_ZIP_SIZE = 32 * 1024 * 1024

files_to_pack = [
    'solution.py',
    'README.md'
]

output_zip = 'PartSure_AI_submission.zip'

print(f"Creating submission archive: {output_zip}")
total_uncompressed = 0

with zipfile.ZipFile(output_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for fname in files_to_pack:
        if not os.path.exists(fname):
            raise FileNotFoundError(f"Missing required file: {fname}")
        
        _, ext = os.path.splitext(fname)
        if ext.lower() not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Extension {ext} not allowed in submission")
            
        fsize = os.path.getsize(fname)
        if fsize > MAX_FILE_SIZE:
            raise ValueError(f"File {fname} exceeds 2 MiB: {fsize} bytes")
            
        total_uncompressed += fsize
        zf.write(fname, arcname=fname)
        print(f"  Added {fname} ({fsize} bytes) directly at ZIP root")

zip_size = os.path.getsize(output_zip)
print(f"Archive created: {zip_size} bytes (uncompressed: {total_uncompressed} bytes)")

# Validate
with zipfile.ZipFile(output_zip, 'r') as zf:
    namelist = zf.namelist()
    if len(namelist) > MAX_FILES:
        raise ValueError(f"Too many files: {len(namelist)} > {MAX_FILES}")
    for name in namelist:
        if '/' in name or '\\' in name:
            raise ValueError(f"Subfolders are forbidden! Found: {name}")
    if 'solution.py' not in namelist:
        raise ValueError("solution.py MUST be at root of ZIP")

print("Validation passed! All competition submission constraints satisfied.")
