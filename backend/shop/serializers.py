# shop/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Producto, ItemCarrito, Carrito, Cliente


# =========================================================
#                     PRODUCTOS
# =========================================================

class ProductoSerializer(serializers.ModelSerializer):
    # Array automático para galería
    images = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        fields = [
            "id",
            "nombre",
            "slug",
            "precio",
            "categoria",
            "tag",
            # imágenes del modelo
            "image",
            "image_hover",
            "image_3",
            "image_4",
            # galería auto
            "images",
            "activo",
        ]

    def get_images(self, obj):
        """Devuelve URLs absolutas de todas las imágenes."""
        request = self.context.get("request")

        def build_url(f):
            if not f:
                return None
            url = f.url
            if request:
                return request.build_absolute_uri(url)
            return url

        # obj.all_images() lo definimos en el modelo
        return [build_url(f) for f in obj.all_images() if f]


# =========================================================
#                       CARRITO
# =========================================================

class ItemCarritoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)  # Producto completo
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemCarrito
        fields = ["id", "producto", "cantidad", "talle", "subtotal"]

    def get_subtotal(self, obj):
        """Devuelve cantidad x precio."""
        if not obj.producto:
            return 0
        return obj.cantidad * obj.producto.precio


class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_precio = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Carrito
        fields = [
            "id",
            "items",
            "total_items",
            "total_precio",
        ]


# =========================================================
#                     USUARIOS / AUTH
# =========================================================

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]


class RegisterSerializer(serializers.Serializer):
    """
    Registro por email + password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este email.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["email"],  # email como username
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )
        return user


# =========================================================
#                     CLIENTE
# =========================================================

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ["id", "direccion", "telefono", "fecha_creacion"]
        read_only_fields = ["fecha_creacion"]