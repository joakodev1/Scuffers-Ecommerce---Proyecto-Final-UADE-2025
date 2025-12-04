from decimal import Decimal

from django.db import models
from django.contrib.auth.models import User


# ---------------------------
# CLIENTE (perfil + dirección por defecto)
# ---------------------------
class Cliente(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="cliente",
    )

    # Dirección principal de envío / facturación
    direccion = models.CharField("Calle y número", max_length=200, blank=True)
    ciudad = models.CharField("Ciudad", max_length=100, blank=True)
    provincia = models.CharField("Provincia", max_length=100, blank=True)
    codigo_postal = models.CharField("Código postal", max_length=20, blank=True)

    telefono = models.CharField("Teléfono", max_length=20, blank=True)

    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

    def get_or_create_carrito(self):
        carrito, _ = Carrito.objects.get_or_create(cliente=self)
        return carrito

    @property
    def direccion_completa(self):
        partes = [
            self.direccion,
            self.ciudad,
            self.provincia,
            self.codigo_postal,
        ]
        return ", ".join([p for p in partes if p])


# ---------------------------
# PRODUCTO
# ---------------------------
class Producto(models.Model):
    CATEGORIES = [
        ("hoodies", "Buzos / Camperas"),
        ("pants", "Pantalones"),
        ("tees", "Remeras"),
        ("accessories", "Accesorios"),
    ]

    nombre = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    descripcion = models.TextField(blank=True)
    stock = models.PositiveIntegerField(default=0)

    categoria = models.CharField(max_length=50, choices=CATEGORIES)
    tag = models.CharField(max_length=30, blank=True)

    # Imágenes
    imagen = models.ImageField(upload_to="products/", blank=True, null=True)
    imagen_hover = models.ImageField(upload_to="products/", blank=True, null=True)
    imagen_3 = models.ImageField(upload_to="products/", blank=True, null=True)
    imagen_4 = models.ImageField(upload_to="products/", blank=True, null=True)

    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

    def all_images(self):
        return [self.imagen, self.imagen_hover, self.imagen_3, self.imagen_4]


# ---------------------------
# CARRITO
# ---------------------------
class Carrito(models.Model):
    cliente = models.OneToOneField(
        Cliente,
        on_delete=models.CASCADE,
        related_name="carrito",
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    def __str__(self):
        try:
            return f"Carrito de {self.cliente.user.username}"
        except Exception:
            return "Carrito sin cliente"

    @property
    def total_items(self):
        return sum(item.cantidad for item in self.items.all())

    @property
    def total_precio(self):
        return sum(
            item.cantidad * item.producto.precio
            for item in self.items.all()
        )


# ---------------------------
# ITEM CARRITO
# ---------------------------
class ItemCarrito(models.Model):
    TALLE_CHOICES = [
        ("S", "S"),
        ("M", "M"),
        ("L", "L"),
        ("XL", "XL"),
    ]

    carrito = models.ForeignKey(
        Carrito,
        on_delete=models.CASCADE,
        related_name="items",
    )
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    talle = models.CharField(
        max_length=3,
        choices=TALLE_CHOICES,
        blank=True,
        null=True,
        help_text="Solo para Remeras / Buzos / Pantalones. Vacío en accesorios.",
    )
    cantidad = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("carrito", "producto", "talle")

    def __str__(self):
        if self.talle:
            return f"{self.producto} x{self.cantidad} (talle {self.talle})"
        return f"{self.producto} x{self.cantidad}"


# ---------------------------
# NEWSLETTER
# ---------------------------
class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


# ---------------------------
# PEDIDO / ORDER
# ---------------------------
class Pedido(models.Model):
    ESTADO_PENDIENTE = "pending"
    ESTADO_PAGADO = "paid"
    ESTADO_CANCELADO = "cancelled"
    ESTADO_ENVIADO = "shipped"

    ESTADO_CHOICES = [
        (ESTADO_PENDIENTE, "Pendiente"),
        (ESTADO_PAGADO, "Pagado"),
        (ESTADO_CANCELADO, "Cancelado"),
        (ESTADO_ENVIADO, "Enviado"),
    ]

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="pedidos",
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default=ESTADO_PENDIENTE,
    )

    # snapshot de datos del cliente
    email = models.EmailField(blank=True)
    nombre = models.CharField(max_length=150, blank=True)
    telefono = models.CharField(max_length=50, blank=True)

    # envío
    direccion = models.CharField(max_length=255, blank=True)
    ciudad = models.CharField(max_length=100, blank=True)
    provincia = models.CharField(max_length=100, blank=True)
    codigo_postal = models.CharField(max_length=20, blank=True)
    observaciones = models.TextField(blank=True)

    # totales
    total_productos = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    costo_envio = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    total_final = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )

    # Mercadopago (info de pago básica)
    mp_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="ID de pago en Mercado Pago",
    )
    mp_status = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Estado del pago (approved, rejected, etc.)",
    )
    mp_merchant_order_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Merchant order id (opcional)",
    )

    # Andreani (futuro)
    andreani_codigo_envio = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-creado"]

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente}"

    @property
    def es_pagado(self):
        return self.estado == self.ESTADO_PAGADO

    def recalcular_totales_desde_items(self):
        total_prod = Decimal("0.00")
        for item in self.items.all():
            total_prod += item.subtotal
        self.total_productos = total_prod
        self.total_final = self.total_productos + self.costo_envio
        self.save(update_fields=["total_productos", "total_final"])


# ---------------------------
# ITEMS DEL PEDIDO
# ---------------------------
class OrderItem(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name="items",
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="order_items",
    )
    nombre_producto = models.CharField(max_length=200)
    talle = models.CharField(max_length=3, blank=True, null=True)
    cantidad = models.PositiveIntegerField(default=1)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.nombre_producto} x{self.cantidad}"


# ---------------------------
# PAGO
# ---------------------------
class Payment(models.Model):
    STATUS_PENDING = "pending"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_IN_PROCESS = "in_process"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pendiente"),
        (STATUS_APPROVED, "Aprobado"),
        (STATUS_REJECTED, "Rechazado"),
        (STATUS_IN_PROCESS, "En proceso"),
    ]

    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name="pago",
    )
    proveedor = models.CharField(
        max_length=30,
        default="MERCADO_PAGO",
    )
    mp_preference_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    mp_payment_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )
    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    raw_response = models.JSONField(blank=True, null=True)

    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-creado"]

    def __str__(self):
        return f"Pago {self.proveedor} - Pedido #{self.pedido_id}"