from django.core.management.base import BaseCommand
from Guessing_Game.management.seeders.seeder_location import run as seed_locations

class Command(BaseCommand):
    help = "Seed database with initial data"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING("Seeding database..."))

        seed_locations(self.stdout)

        self.stdout.write(self.style.SUCCESS("Seeding complete"))
