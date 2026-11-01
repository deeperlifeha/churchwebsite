"""Import owner-supplied images, preserving the archive and producing web-sized JPEGs."""
import sys, io, json, zipfile, re, html
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent.parent
destination = root / 'site/gallery/church'
destination.mkdir(parents=True, exist_ok=True)


def make_thumbnail(source_path: Path, output_path: Path) -> None:
    with Image.open(source_path) as source:
        photo = ImageOps.exif_transpose(source).convert('RGB')
        photo.thumbnail((480, 480), Image.Resampling.LANCZOS)
        photo.save(output_path, quality=80, optimize=True)


def write_gallery_page(records):
    page = root / 'site/gallery.html'
    content = page.read_text(encoding='utf-8')
    cards = '\n'.join(
        f'<article class="gallery-card"><a href="{r["image"]}"><img src="{r["thumbnail"]}" alt="Church gallery photo {i}" width="{r["width"]}" height="{r["height"]}" loading="lazy" decoding="async"><div class="gallery-caption"><span>{html.escape(r["original"])}</span><strong>View full photo ↗</strong></div></a></article>'
        for i, r in enumerate(records, 1)
    )
    section = f'<section class="church-album" aria-labelledby="church-album-heading"><h2 id="church-album-heading">Our church family.</h2><p>{len(records)} photos from our church collection. Select a photo to open a larger view.</p><div class="instagram-gallery church-gallery">{cards}</div></section>'
    pattern = re.compile(r'<section class="church-album"[^>]*>.*?</section>\s*(?=<h2>From our Instagram\.)', re.S)
    if pattern.search(content):
        content = pattern.sub(section, content, count=1)
    else:
        content = content.replace('<p class="gallery-intro">', section + '<h2>From our Instagram.</h2><p class="gallery-intro">', 1)
    content = content.replace('Photos and reel covers from Deeper Life Bible Church Harrisburg on Instagram.', 'Photos from our church family, gatherings, and Deeper Life Harrisburg Instagram.')
    page.write_text(content, encoding='utf-8')


def save_web_copies(source, name: str):
    """Write a 1600px web image and a 480px thumbnail; return the web image size."""
    with Image.open(source) as original:
        photo = ImageOps.exif_transpose(original).convert('RGB')
        photo.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        photo.save(destination / f'{name}.jpg', quality=85, optimize=True)
        width, height = photo.size
        photo.thumbnail((480, 480), Image.Resampling.LANCZOS)
        photo.save(destination / f'{name}-thumb.jpg', quality=80, optimize=True)
    return width, height


def sync_from_directory():
    """Convert raw uploads (e.g. IMG_1234.JPG) dropped into the gallery folder into
    numbered web images and thumbnails, then rebuild photos.json and gallery.html."""
    manifest = destination / 'photos.json'
    records = json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else []
    by_original = {r['original']: r for r in records}
    numbered = re.compile(r'^\d{3}-')
    uploads = sorted(
        p
        for p in destination.iterdir()
        if p.is_file()
        and p.suffix.lower() in {'.jpg', '.jpeg', '.png'}
        and not numbered.match(p.name)
    )
    next_index = max((int(Path(r['image']).name[:3]) for r in records), default=0) + 1
    for path in uploads:
        record = by_original.get(path.name)
        if record:
            name = Path(record['image']).stem
        else:
            slug = re.sub(r'[^a-z0-9-]+', '-', path.stem.lower()).strip('-')
            name = f'{next_index:03d}-{slug}'
            next_index += 1
            record = {'original': path.name}
            records.append(record)
        width, height = save_web_copies(path, name)
        record.update({
            'image': f'gallery/church/{name}.jpg',
            'thumbnail': f'gallery/church/{name}-thumb.jpg',
            'width': width,
            'height': height,
        })
        # The full-resolution original is not published; only the web copies are.
        path.unlink()
        print(f'Added {path.name} as {name}.jpg', flush=True)
    for record in records:
        thumb = destination / Path(record['thumbnail']).name
        if not thumb.exists() or record['thumbnail'] == record['image']:
            image = destination / Path(record['image']).name
            make_thumbnail(image, destination / f'{image.stem}-thumb.jpg')
            record['thumbnail'] = f'gallery/church/{image.stem}-thumb.jpg'
    records = [r for r in records if (destination / Path(r['image']).name).exists()]
    manifest.write_text(json.dumps(records, indent=2), encoding='utf-8')
    write_gallery_page(records)
    print(f'Updated {len(records)} gallery entries from folder scan.', flush=True)


def import_from_zip(zip_path: str):
    records = []
    with zipfile.ZipFile(zip_path) as archive:
        images = [entry for entry in archive.infolist() if Path(entry.filename).suffix.lower() in {'.jpg', '.jpeg', '.png'} and not entry.is_dir()]
        for index, entry in enumerate(images, 1):
            name = re.sub(r'[^a-z0-9-]+', '-', Path(entry.filename).stem.lower()).strip('-')
            name = f'{index:03d}-{name}'
            width, height = save_web_copies(io.BytesIO(archive.read(entry)), name)
            records.append({'original': Path(entry.filename).name, 'image': f'gallery/church/{name}.jpg', 'thumbnail': f'gallery/church/{name}-thumb.jpg', 'width': width, 'height': height})
            if index % 40 == 0:
                print(f'Processed {index}/{len(images)}', flush=True)
    (destination / 'photos.json').write_text(json.dumps(records, indent=2), encoding='utf-8')
    write_gallery_page(records)
    print(f'Imported {len(records)} photos; web images total {sum(p.stat().st_size for p in destination.glob("*.jpg")) / 1024 / 1024:.1f} MB', flush=True)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        import_from_zip(sys.argv[1])
    else:
        sync_from_directory()
