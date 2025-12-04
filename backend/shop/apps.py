from django.apps import AppConfig


class ShopConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shop"

    def ready(self):
        """
        Si la variable CREATE_SUPERUSER_ON_STARTUP=1 está seteada,
        crea un superusuario por defecto si no existe.
        SOLO se usa para producción (Railway) la primera vez.
        """
        import os

        if os.getenv("CREATE_SUPERUSER_ON_STARTUP") != "1":
            return

        try:
            from django.contrib.auth import get_user_model

            User = get_user_model()

            username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
            email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@scuffers.com")
            password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "Scuffers2025!")

            if not User.objects.filter(username=username).exists():
                User.objects.create_superuser(
                    username=username,
                    email=email,
                    password=password,
                )
                print(f"*** DEFAULT SUPERUSER CREATED: {username}")
            else:
                print(f"*** DEFAULT SUPERUSER ALREADY EXISTS: {username}")

        except Exception as e:
            # No rompas el arranque si algo falla, solo logueá
            print("*** ERROR CREATING DEFAULT SUPERUSER:", repr(e))