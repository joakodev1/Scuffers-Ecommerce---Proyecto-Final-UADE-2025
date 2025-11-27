from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

from .models import Cliente, Carrito


@receiver(post_save, sender=User)
def crear_cliente_y_carrito(sender, instance, created, **kwargs):
    """
    Cada vez que se crea un nuevo usuario, se genera:
      - Cliente vinculado al User
      - Carrito vinculado al Cliente
    """
    if not created:
        return

    # crea cliente solo si no existe
    cliente, _ = Cliente.objects.get_or_create(user=instance)

    # crea carrito solo si no existe
    Carrito.objects.get_or_create(cliente=cliente)