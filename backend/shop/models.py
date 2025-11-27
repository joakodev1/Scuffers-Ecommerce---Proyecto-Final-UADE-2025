from django.db import models
from django.contrib.auth.models import User


# ---------------------------
# CLIENTE
# ---------------------------
class Cliente(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cliente"
    )
    direccion = models.CharField(max_length=200, blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    def get_or_create_carrito(self):
        carrito, _ = Carrito.objects.get_or_create(cliente=self)
        return carrito


# ---------------------------
# PRODUCTO
# ---------------------------
class Producto(models.Model):
    CATEGORIAS = [
        ("remeras", "Remeras"),
        ("buzos", "Buzos / Camperas"),
        ("pantalones", "Pantalones"),
        ("accesorios", "Accesorios"),
    ]

    nombre = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS)
    tag = models.CharField(max_length=20, blank=True)

    # 📷 imágenes
    image = models.ImageField(upload_to="productos/", blank=True, null=True)
    image_hover = models.ImageField(upload_to="productos/", blank=True, null=True)
    image_3 = models.ImageField(upload_to="productos/", blank=True, null=True)
    image_4 = models.ImageField(upload_to="productos/", blank=True, null=True)

    activo = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    def all_images(self):
        return [f for f in [self.image, self.image_hover, self.image_3, self.image_4] if f]


# ---------------------------
# CARRITO
# ---------------------------
class Carrito(models.Model):
    cliente = models.OneToOneField(
        Cliente,
        on_delete=models.CASCADE,
        related_name="carrito"
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    def __str__(self):
        try:
            return f"Carrito de {self.cliente.user.username}"
        except:
            return "Carrito sin cliente"

    @property
    def total_items(self):
        return sum(item.cantidad for item in self.items.all())

    @property
    def total_precio(self):
        return sum(item.cantidad * item.producto.precio for item in self.items.all())


# ---------------------------
# ITEM CARRITO (CON TALLES)
# ---------------------------
class ItemCarrito(models.Model):
    TALLE_CHOICES = [
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
    ]

    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name="items")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    talle = models.CharField(
        max_length=3,
        choices=TALLE_CHOICES,
        blank=True,
        null=True,
        help_text="Solo para Remeras / Buzos / Pantalones. Vacío en accesorios."
    )
    cantidad = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("carrito", "producto", "talle")

    def __str__(self):
        if self.talle:
            return f"{self.producto} x{self.cantidad} (talle {self.talle})"
        return f"{self.producto} x{self.cantidad}"


# ---------------------------
# NEWSLETTER SUBSCRIPTIONS
# ---------------------------
class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email