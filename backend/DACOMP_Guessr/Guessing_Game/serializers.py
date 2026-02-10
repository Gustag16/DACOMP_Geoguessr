from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        # '__all__' pega todos os campos do model automaticamente.
        fields = '__all__'