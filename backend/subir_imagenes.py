import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "scuffers_api.settings")
django.setup()

import cloudinary.uploader
from shop.models import Producto

campos_imagen = ["imagen", "imagen_hover", "imagen_3", "imagen_4"]

productos = Producto.objects.all()
print(f"Procesando {productos.count()} productos...\n")

for producto in productos:
    modificado = False
    for campo in campos_imagen:
        imagen_field = getattr(producto, campo)
        if not imagen_field:
            continue

        nombre_archivo = str(imagen_field)
        ruta_local = os.path.join("media", nombre_archivo)

        if not os.path.exists(ruta_local):
            print(f"  ⚠ No existe: {ruta_local}")
            continue

        print(f"  Subiendo {campo} de '{producto.nombre}'...")
        resultado = cloudinary.uploader.upload(
            ruta_local,
            folder="products",
            use_filename=True,
            unique_filename=False,
            overwrite=True,
        )

        setattr(producto, campo, resultado["public_id"])
        modificado = True
        print(f"  ✓ {resultado['secure_url']}")

    if modificado:
        producto.save()

print("\n✅ Listo. Todas las imágenes migradas a Cloudinary.")