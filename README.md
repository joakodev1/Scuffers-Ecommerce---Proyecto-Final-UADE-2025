🛍️ Scuffers E-Commerce

Proyecto Final – Carrera Ingeniería / Desarrollo Web – Año 2025

Scuffers E-Commerce es una plataforma completa de comercio electrónico desarrollada como trabajo final universitario.
Incluye un frontend moderno en React + Vite, y un backend robusto en Django REST Framework, con autenticación, catálogo, carrito persistente, contacto con envío de emails y base de datos relacional.

🚀 Características principales
🔐 Autenticación

Registro e inicio de sesión con JWT (SimpleJWT)

Protección de rutas del frontend

Integración de tokens persistentes

🛒 Carrito de compras

Carrito persistente por usuario autenticado

Añadir / quitar / eliminar productos

Cálculo automático de subtotales y total general

Popup de compra simulada

🛍️ Catálogo de productos

Productos cargados desde el backend con imágenes

Filtros por categoría

Búsqueda por texto

Vista detallada de cada producto

Cambio de talles

✉️ Formulario de contacto

Envío de emails mediante servidor SMTP

Variables de entorno para proteger credenciales

🗄️ Base de datos

MySQL (modo desarrollo o producción)

Migraciones automatizadas con Django

🔐 Seguridad

Uso completo de .env tanto en frontend como backend

Deshabilitación del DEBUG en producción

CORS configurado correctamente

Secret keys protegidas

🧩 Tecnologías utilizadas
🎨 Frontend

React 18

Vite

Tailwind CSS

Framer Motion (animaciones)

React Router DOM

Lucide Icons

⚙️ Backend

Python 3.13

Django 5

Django REST Framework

SimpleJWT (auth)

MySQL

python-dotenv

SMTP Gmail (contraseña de aplicación)



📂 Estructura del proyecto
ProyectoFinal/
│
├── backend/
│   ├── scuffers_api/
│   ├── shop/
│   ├── media/
│   ├── .env                ← No se sube al repo
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env                ← No se sube al repo
│   └── package.json
│
└── README.md


⚙️ Instalación y configuración

A continuación se muestra el procedimiento general, sin incluir datos sensibles.
Cada desarrollador deberá definir sus propias credenciales.

🖥️ 1. Backend (Django + MySQL)
1.1 Crear entorno virtual

Windows:

cd backend
python -m venv venv
venv\Scripts\activate


Linux/Mac:

cd backend
python3 -m venv venv
source venv/bin/activate

1.2 Instalar dependencias
pip install -r requirements.txt


1.3 Crear base de datos MySQL

Ejemplo genérico:

CREATE DATABASE scuffers_api_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'scuffers_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON scuffers_api_db.* TO 'scuffers_user'@'localhost';
FLUSH PRIVILEGES;

1.4 Crear archivo .env (no se sube al repo)
SECRET_KEY=tu_secret_key
DEBUG=True

DB_NAME=scuffers_api_db
DB_USER=scuffers_user
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=3306

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=tu_email
EMAIL_HOST_PASSWORD=tu_contraseña_app

FRONTEND_ORIGIN=http://localhost:5173

1.5 Migraciones + superusuario
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver


Backend disponible en:

http://127.0.0.1:8000/

🎨 2. Frontend (React + Vite)
2.1 Instalar dependencias
cd frontend
npm install

2.2 Crear archivo .env (Vite)
VITE_API_URL=http://127.0.0.1:8000/api

2.3 Iniciar servidor
npm run dev


Frontend disponible en:

http://localhost:5173


🌐 Deploy en la nube (próximos pasos)

El proyecto está preparado para deployar en:

Vercel / Netlify → Frontend

Railway / Render / PythonAnywhere / DigitalOcean → Backend Django

MySQL en Railway / PlanetScale / Aiven / DigitalOcean

Se recomienda:

Modo producción (DEBUG=False)

SECRET_KEY regenerada

CORS configurado

Certificado SSL

Email SMTP real

.env cargados en el panel de la plataforma

Si querés, te preparo el paso a paso exacto para desplegar en:

Railway

Render

PythonAnywhere

DigitalOcean
Vos elegís.

🤝 Autores

Joaquin Carricondo – Desarrollo completo del proyecto (Frontend + Backend)

📄 Licencia

Proyecto de uso académico. Permitida la revisión y presentación en contextos educativos.