import os
import psycopg2

# ================= CONFIG =================
DB_CONFIG = {
    "host": "178.16.139.235",
    "port": 5432,
    "database": "aquaflo_prod",
    "user": "aquaflo",
    "password": "aquaflo2025"
}

MEDIA_DIR = "C:/Users/Admin/Desktop/AquaFlo/media"

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
DELETE_UNUSED_IMAGES = True
# =========================================


def get_db_images():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("""
        SELECT image
        FROM category_pipe
        WHERE image IS NOT NULL
          AND image <> ''
          AND is_deleted = false
    """)

    images = {row[0].strip() for row in cur.fetchall()}
    cur.close()
    conn.close()
    return images


def get_media_images():
    media_images = set()

    for root, _, files in os.walk(MEDIA_DIR):
        for f in files:
            if os.path.splitext(f.lower())[1] in VALID_EXTENSIONS:
                media_images.add(f)

    return media_images


def main():
    db_images = get_db_images()
    media_images = get_media_images()

    unused_images = media_images - db_images
    missing_images = db_images - media_images

    print("\n=== UNUSED IMAGES (in folder but not in DB) ===")
    if unused_images:
        for img in sorted(unused_images):
            print(img)
    else:
        print("None")

    print("\n=== MISSING IMAGES (in DB but not in folder) ===")
    if missing_images:
        for img in sorted(missing_images):
            print(img)
    else:
        print("None")

    print("\n=== SUMMARY ===")
    print(f"Images in DB     : {len(db_images)}")
    print(f"Images in folder : {len(media_images)}")
    print(f"Unused images    : {len(unused_images)}")
    print(f"Missing images   : {len(missing_images)}")

    # ===== DELETE UNUSED IMAGES =====
    if DELETE_UNUSED_IMAGES:
        print("\n=== DELETING UNUSED IMAGES ===")
        deleted_count = 0

        for img in unused_images:
            img_path = os.path.join(MEDIA_DIR, img)

            if os.path.exists(img_path):
                try:
                    os.remove(img_path)
                    print(f"Deleted: {img}")
                    deleted_count += 1
                except Exception as e:
                    print(f"ERROR deleting {img}: {e}")
            else:
                print(f"File not found: {img}")

        print(f"\nTotal deleted images: {deleted_count}")
    else:
        print("\n[DRY RUN] No files were deleted.")



if __name__ == "__main__":
    main()
