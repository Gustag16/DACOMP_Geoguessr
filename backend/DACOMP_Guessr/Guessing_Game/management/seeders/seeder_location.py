import csv
from Guessing_Game.models import Location
import os
#id,image_url,latitude,longitude,place_name,category
def run(stdout):
    if Location.objects.exists():
        stdout.write("Locations already seeded")
        return

    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "Location_satellite.csv")
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        objs = [
            Location(
                id=row["id"],
                image_url=row["image_url"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                place_name=row["place_name"],
                category=row["category"]

            )
            for row in reader
        ]

    Location.objects.bulk_create(objs)
    stdout.write(f"Inserted {len(objs)} locations")
