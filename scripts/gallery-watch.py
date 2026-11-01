"""Watch the gallery folder for new images and rebuild the gallery automatically."""
import os
import subprocess
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parent.parent
folder = root / 'site' / 'gallery' / 'church'
folder.mkdir(parents=True, exist_ok=True)


def files_snapshot():
    return {
        path.name
        for path in folder.iterdir()
        if path.is_file() and path.suffix.lower() in {'.jpg', '.jpeg', '.png'} and not path.name.lower().endswith('-thumb.jpg') and not path.name.lower().endswith('-thumb.jpeg')
    }


last_seen = files_snapshot()
print(f'Watching {folder} for new gallery images...')

while True:
    current = files_snapshot()
    if current != last_seen:
        added = sorted(current - last_seen)
        removed = sorted(last_seen - current)
        if added or removed:
            print(f'Gallery change detected: added={added[:5]} removed={removed[:5]}')
            subprocess.run([sys.executable, str(root / 'scripts' / 'import-gallery.py')], check=False)
            last_seen = current
    time.sleep(5)
