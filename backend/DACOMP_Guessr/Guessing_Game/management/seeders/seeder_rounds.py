import csv
from Guessing_Game.models import Round
import os
#id,image_url,latitude,longitude,place_name,category
def run(stdout):
    if Round.objects.exists():
        stdout.write("Roundss already seeded")
        return

    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "rounds.csv")
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        objs = [
            Round(
                id=row["id"],
                round_number=row["round_number"],
                location_id=row["location_id"],
                session_id=row["session_id"],
            )
            for row in reader
        ]

    Round.objects.bulk_create(objs)
    stdout.write(f"Inserted {len(objs)} Rounds")
