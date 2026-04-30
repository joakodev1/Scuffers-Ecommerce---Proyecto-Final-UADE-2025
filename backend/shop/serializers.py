# shop/serializers.py
from django.contrib.auth.models import User
from django.utils.text import slugify
from rest_framework import serializers
 
from .models import (
    Pedido,
    OrderItem,
    Producto,
    ItemCarrito,
    Carrito,
    Cliente,
)
 
 
# =========================================================
#                     PRODUCTOS
# =========================================================
 
class ProductoSerializer(serializers.ModelSerializer):
    """
    Serializer principal de productos (público y admin).
 
    El modelo tiene campos:
      - imagen
      - imagen_hover
      - imagen_3
      - imagen_4
 
    Además exponemos:
      - image_url, image_hover_url, image_3_url, image_4_url
      - images: lista con todas las URLs (para la galería del ProductDetail)
    """
 
    # URLs individuales cómodas para el front
    image_url = serializers.SerializerMethodField()
    image_hover_url = serializers.SerializerMethodField()
    image_3_url = serializers.SerializerMethodField()
    image_4_url = serializers.SerializerMethodField()
 
    # galería combinada
    images = serializers.SerializerMethodField()
 
    class Meta:
        model = Producto
        fields = [
            "id",
            "nombre",
            "slug",
            "precio",
            "categoria",
            "descripcion",
            "stock",
            "tag",
 
            # campos de archivo TAL CUAL en el modelo
            "imagen",
            "imagen_hover",
            "imagen_3",
            "imagen_4",
 
            # urls derivadas
            "image_url",
            "image_hover_url",
            "image_3_url",
            "image_4_url",
 
            # galería (para ProductDetail / ShopAll)
            "images",
 
            "activo",
        ]
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
        }
 
    def _build_url(self, file_field):
        if not file_field:
            return None
 
        url = file_field.url
 
        if url.startswith("http://") or url.startswith("https://"):
            return url
 
        # Si es relativa, la completamos con el request
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(url)
        return url
 
    # ---------- URLs individuales ----------
    def get_image_url(self, obj):
        return self._build_url(obj.imagen)
 
    def get_image_hover_url(self, obj):
        return self._build_url(obj.imagen_hover)
 
    def get_image_3_url(self, obj):
        return self._build_url(obj.imagen_3)
 
    def get_image_4_url(self, obj):
        return self._build_url(obj.imagen_4)
 
    # ---------- galería ----------
    def get_images(self, obj):
        """
        Devuelve lista de URLs en el orden:
        [imagen, imagen_hover, imagen_3, imagen_4]
        Sólo incluye las que existan.
        """
        files = [obj.imagen, obj.imagen_hover, obj.imagen_3, obj.imagen_4]
        urls = []
 
        for f in files:
            u = self._build_url(f)
            if u:
                urls.append(u)
 
        return urls
 
    # ---------- create/update con slug automático ----------
    def create(self, validated_data):
        if not validated_data.get("slug") and validated_data.get("nombre"):
            validated_data["slug"] = slugify(validated_data["nombre"])
        return super().create(validated_data)
 
    def update(self, instance, validated_data):
        if not validated_data.get("slug") and validated_data.get("nombre"):
            validated_data["slug"] = slugify(validated_data["nombre"])
        return super().update(instance, validated_data)
 
 
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
        fields = [
            "id",
            "direccion",
            "ciudad",
            "provincia",
            "codigo_postal",
            "telefono",
            "fecha_creacion",
        ]
        read_only_fields = ["fecha_creacion"]
 
 
class ClienteAddressSerializer(serializers.ModelSerializer):
    """
    Versión simplificada para /me/address/
    """
    class Meta:
        model = Cliente
        fields = [
            "direccion",
            "ciudad",
            "provincia",
            "codigo_postal",
            "telefono",
        ]
 
 
# =========================================================
#                  PEDIDOS / ORDER
# =========================================================
 
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "producto",
            "nombre_producto",
            "talle",
            "cantidad",
            "precio_unitario",
            "subtotal",
        ]
 
 
class PedidoDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
 
    class Meta:
        model = Pedido
        fields = [
            "id",
            "estado",
            "email",
            "nombre",
            "telefono",
            "direccion",
            "ciudad",
            "provincia",
            "codigo_postal",
            "observaciones",
            "total_productos",
            "costo_envio",
            "total_final",
            "creado",
            "items",
        ]
 