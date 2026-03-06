from django.contrib import admin
from .models import *

admin.site.register(Session)
admin.site.register(Player)
admin.site.register(Round)
admin.site.register(Location)
admin.site.register(Guess)

# Register your models here.
