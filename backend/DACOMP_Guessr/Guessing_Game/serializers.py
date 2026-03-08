from rest_framework import serializers
from .models import Location, Round, Session, Player


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        # '__all__' pega todos os campos do model automaticamente.
        fields = '__all__'


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        # '__all__' pega todos os campos do model automaticamente.
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        # '__all__' pega todos os campos do model automaticamente.
        fields = '__all__'

class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        # '__all__' pega todos os campos do model automaticamente.
        fields = '__all__'