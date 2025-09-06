import os
import json

JSON_FILE = "data.json"
BASE_DIR = "images"

def scan_files():
    found = {}
    for root, _, files in os.walk(BASE_DIR):
        for f in files:
            key = f.lower()
            path = os.path.join(root, f).replace("\\", "/")
            found[key] = path
    return found

def check_json():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    file_map = scan_files()

    def check_items(items, category):
        for item in items:
            if "image_url" in item:
                expected = item["image_url"]
                expected_file = os.path.basename(expected).lower()
                if expected_file not in file_map:
                    print(f"❌ Missing for {category}: {item['name']} ({expected})")
                else:
                    real_path = file_map[expected_file]
                    if expected != real_path:
                        print(f"⚠️ Case mismatch: {expected} -> {real_path}")

    check_items(data.get("fruits", []), "Fruit")
    check_items(data.get("swords", []), "Sword")
    check_items(data.get("fightingStyles", []), "Fighting Style")
    check_items(data.get("guns", []), "Gun")
    check_items(data.get("accessories", []), "Accessory")
    check_items(data.get("races", []), "Race")
    check_items(data.get("locations", []), "Location")

if __name__ == "__main__":
    check_json()
