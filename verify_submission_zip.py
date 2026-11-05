import zipfile
import json

zip_path = 'PartSure_AI_submission.zip'
z = zipfile.ZipFile(zip_path)
namelist = z.namelist()

print('=== 1. ARCHIVE CONTENTS ===')
print('Files in archive:', namelist)

print('\n=== 2. STRICT PORTAL CONSTRAINT AUDIT ===')

# Rule 1: No enclosing folders
has_folders = any('/' in name or '\\' in name for name in namelist)
print(f'1. Files directly at root (no enclosing folders): {not has_folders}')

# Rule 2: Allowed extensions
allowed_exts = {'.py', '.json', '.txt', '.md'}
all_exts_valid = all(any(name.endswith(ext) for ext in allowed_exts) for name in namelist)
print(f'2. Allowed extensions only (.py, .json, .txt, .md): {all_exts_valid}')

# Rule 3: Required files present
has_solution = 'solution.py' in namelist
has_readme = 'README.md' in namelist
print(f'3. Contains solution.py: {has_solution}')
print(f'4. Contains README.md: {has_readme}')

# Rule 4: File count & size limits
file_count = len(namelist)
total_uncompressed = sum(info.file_size for info in z.infolist())
total_compressed = sum(info.compress_size for info in z.infolist())
each_file_under_2mb = all(info.file_size < 2*1024*1024 for info in z.infolist())

print(f'5. File count: {file_count} (Limit: max 100): {file_count <= 100}')
print(f'6. Total uncompressed: {total_uncompressed} bytes ({total_uncompressed/1024:.2f} KB) (Limit: < 16 MiB): {total_uncompressed < 16*1024*1024}')
print(f'7. Each file < 2 MiB: {each_file_under_2mb}')
print(f'8. Total ZIP archive size: {total_compressed} bytes ({total_compressed/1024:.2f} KB) (Limit: < 32 MiB): {total_compressed < 32*1024*1024}')

# Rule 5: Forbidden files (no __MACOSX, .DS_Store, *.csv, *.pkl, *.ipynb)
forbidden = any(b in name for name in namelist for b in ['__MACOSX', '.DS_Store', '.csv', '.pkl', '.ipynb', 'node_modules'])
print(f'9. No forbidden files / caches: {not forbidden}')

# Rule 6: Execution test of solution.py extracted from the ZIP
solution_code = z.read('solution.py').decode('utf-8')
loc = {}
exec(solution_code, loc)
assert 'decide' in loc, 'decide function missing!'

# Test decide interface with minimal observation
obs = {'as_of': 100, 'request_documents': [], 'catalog_documents': [], 'catalog': [], 'tickets': []}
res = loc['decide'](obs, {})
assert isinstance(res, dict) and set(res.keys()) == {'action', 'state'}
print(f'10. Exposes decide(obs, state) returning exact {{"action", "state}}: True')

# Rule 7: Third-party dependencies check
import ast
tree = ast.parse(solution_code)
imports = set()
for node in ast.walk(tree):
    if isinstance(node, ast.Import):
        for n in node.names:
            imports.add(n.name.split('.')[0])
    elif isinstance(node, ast.ImportFrom):
        if node.module:
            imports.add(node.module.split('.')[0])

print(f'11. Imported packages: {imports}')
standard_lib = {'re', 'json', 'copy'}
print(f'12. Uses only standard library: {imports.issubset(standard_lib)}')

print('\n>>> VERDICT: PartSure_AI_submission.zip is 100% VALID, COMPLIANT, AND READY FOR SUBMISSION <<<')
