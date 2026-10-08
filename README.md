# Cancha / Data

Buscador de equipos y jugadores de fútbol hecho con HTML, CSS y JavaScript vanilla. Consulta las plantillas disponibles en TheSportsDB y permite buscar jugadores por nombre para conocer su equipo.

## Funciones

- Buscar la plantilla de un club, como Barcelona.
- Buscar un jugador, como Messi, y ver el equipo que informa la API.
- Añadir a Kendrick Franco como jugador local de Real Benito Camelas.
- Subir o cambiar la foto del jugador local. La imagen se guarda en el almacenamiento del navegador y debe pesar menos de 2 MB.
- Validar que la búsqueda tenga entre 2 y 60 caracteres.
- Interfaz adaptable a computadoras y móviles.

## Uso

1. Abre `index.html` en un navegador o ejecútalo con la extensión Live Server de Visual Studio Code.
2. Elige **Equipo** o **Jugador**.
3. Escribe el nombre que quieres buscar y pulsa **Buscar**.

Se necesita conexión a Internet para consultar TheSportsDB y cargar Outfit y Font Awesome. La foto subida se guarda solo en ese navegador; no se publica ni se sincroniza con GitHub.

## Estructura

```text
.
├── index.html
├── css/
│   └── estilos.css
├── js/
│   └── app.js
└── validaciones/
    └── validaciones.js
```

## API

La aplicación usa TheSportsDB y sus endpoints de búsqueda de equipos, plantillas y jugadores. La clave `123` incluida en la URL es una clave pública de prueba; los resultados dependen de la cobertura y actualización de TheSportsDB.

## Publicar en GitHub Pages

Sube los archivos del proyecto al repositorio y activa GitHub Pages desde **Settings → Pages**, seleccionando la rama y la carpeta donde está `index.html` (normalmente `/(root)`).