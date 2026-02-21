import csv
from Guessing_Game.models import Location

def run(stdout):
    if Location.objects.exists():
        stdout.write("Locations already seeded")
        return

    with open("Location_satellite.csv", newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        objs = [
            Location(
                latitude=row["latitude"],
                longitude=row["longitude"],
                image=row["image"]
            )
            for row in reader
        ]

    Location.objects.bulk_create(objs)
    stdout.write(f"Inserted {len(objs)} locations")
