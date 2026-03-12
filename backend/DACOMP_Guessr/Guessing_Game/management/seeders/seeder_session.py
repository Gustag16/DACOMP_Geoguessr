import csv
from Guessing_Game.models import Session
import os
#id,image_url,latitude,longitude,place_name,category
def run(stdout):
    if Session.objects.exists():
        stdout.write("Locations already seeded")
        return

    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "sessions.csv")
    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        objs = [
            Session(
                id=row["id"],
                code=row["code"],
                name=row["name"],
                total_rounds=row["total_rounds"],
                time_limit=row["time_limit"],
                player_limit=row["player_limit"],
                current_round_number=row["current_round_number"],
                status=row["status"],
                created_at=row["created_at"],
                round_started_at=row["round_started_at"],

            )
            for row in reader
        ]

    Session.objects.bulk_create(objs)
    stdout.write(f"Inserted {len(objs)} locations")
