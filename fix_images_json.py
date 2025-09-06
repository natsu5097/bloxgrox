import os
import json
import difflib

JSON_FILE = "data.json"
BASE_DIR = "images"

def scan_files():
    """Scan images folder and return a dict of lowercase name -> real path."""
    file_map = {}
    for root, _, files in os.walk(BASE_DIR):
        for f in files:
            name, ext = os.path.splitext(f)
            key = name.lower()
            rel_path = os.path.join(root, f).replace("\\", "/")
            file_map[key] = rel_path
    return file_map

def best_match(name, file_map):
    """Find the closest filename to the given item name."""
    key = name.lower().replace(" ", "_").replace("-", "_")
    matches = difflib.get_close_matches(key, file_map.keys(), n=1, cutoff=0.6)
    if matches:
        return file_map[matches[0]]
    return None

def update_json():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    file_map = scan_files()

    def fix_items(items, category):
        for item in items:
            if "name" in item:
                match = best_match(item["name"], file_map)
                if match:
                    item["image_url"] = match
                    print(f"✅ {category}: {item['name']} -> {match}")
                else:
                    print(f"❌ No match for {category}: {item['name']}")

    fix_items(data.get("fruits", []), "Fruit")
    fix_items(data.get("swords", []), "Sword")
    fix_items(data.get("fightingStyles", []), "Fighting Style")
    fix_items(data.get("guns", []), "Gun")
    fix_items(data.get("accessories", []), "Accessory")
    fix_items(data.get("races", []), "Race")
    fix_items(data.get("locations", []), "Location")

    with open(JSON_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

    print("\n✅ data.json updated with real image paths!")

if __name__ == "__main__":
    update_json()
