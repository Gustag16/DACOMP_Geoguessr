import csv
from Guessing_Game.models import Location
import os

def run(stdout):
    if Location.objects.exists():
        stdout.write("Locations already seeded")
        return

    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, "Location_satellite.csv")
    
    # Aviso para o terminal não parecer travado
    stdout.write("Iniciando download e conversão das imagens para WebP. Isso pode levar alguns minutos...")

    with open(csv_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        objs = []
        seen_ids = set()
        
        for row in reader:
            # Filtra IDs duplicados que possam existir acidentalmente dentro do CSV
            if row["id"] in seen_ids:
                continue
            seen_ids.add(row["id"])
            
            loc = Location(
                id=row["id"],
                image_url=row["image_url"],
                latitude=row["latitude"],
                longitude=row["longitude"],
                place_name=row["place_name"],
                category=row["category"]
            )
            loc.convert_to_webp()
            objs.append(loc)

    # ignore_conflicts=True instrui o PostgreSQL a ignorar silenciosamente linhas 
    # que esbarrem em IDs já existentes, evitando o crash por concorrência
    Location.objects.bulk_create(objs, ignore_conflicts=True)
    stdout.write(f"Inserted {len(objs)} locations (converted to WebP)")