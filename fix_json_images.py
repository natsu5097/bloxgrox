import os
import json

# Paths
BASE_DIR = "images"
JSON_FILE = "data.json"

def build_file_map():
    """Scan images/ folders and build a lookup dict by lowercase name."""
    file_map = {}
    for root, _, files in os.walk(BASE_DIR):
        for f in files:
            name, ext = os.path.splitext(f)
            key = name.lower()
            rel_path = os.path.join(root, f).replace("\\", "/")
            file_map[key] = rel_path
    return file_map

def update_json():
    if not os.path.exists(JSON_FILE):
        print("⚠️ data.json not found.")
        return

    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    file_map = build_file_map()

    def fix_items(items):
        for item in items:
            if "name" in item:
                key = item["name"].lower().replace(" ", "_").replace("-", "_")
                if key in file_map:
                    item["image_url"] = file_map[key]
                else:
                    print(f"❌ No match for: {item['name']}")

    fix_items(data.get("fruits", []))
    fix_items(data.get("swords", []))
    fix_items(data.get("fightingStyles", []))
    fix_items(data.get("guns", []))
    fix_items(data.get("accessories", []))
    fix_items(data.get("races", []))
    fix_items(data.get("locations", []))

    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print("✅ data.json updated with correct image paths!")

if __name__ == "__main__":
    update_json()
