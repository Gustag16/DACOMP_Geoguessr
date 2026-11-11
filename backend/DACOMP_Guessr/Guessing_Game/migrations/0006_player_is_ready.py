from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("Guessing_Game", "0005_alter_location_image_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="player",
            name="is_ready",
            field=models.BooleanField(default=False),
        ),
    ]
