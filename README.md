````markdown
# Prueba Técnica – Ministerio Público

**Gestor de Casos + Módulo DICRI + API REST + Frontend React**

## Descripción

Aplicación full-stack para el Ministerio Público de Guatemala que incluye:

- **Módulo DICRI** (nueva funcionalidad):
  - Gestión de **expedientes DICRI** con flujo de estados (`Registrado`, `EnRevision`, `Aprobado`, `Rechazado`).
  - Registro de **indicios** asociados a cada expediente (descripción, color, tamaño, peso, ubicación, fecha de levantamiento).
  - Historial de cambios de estado del expediente, con usuario, comentario y fecha.

Todo corre en contenedores Docker:

| Servicio          | Tecnología        | Imagen (lógica)                             |
| ----------------- | ----------------- | ------------------------------------------- |
| **Frontend**      | React + Vite      | `mp-frontend`                               |
| **Backend**       | Node 18 / Express | `mp-backend`                                |
| **Base de Datos** | SQL Server 2019   | `mcr.microsoft.com/mssql/server:2019-latest` |


## Funcionalidades clave

### Módulo de Usuarios

- Registro y login.
- Autenticación con **JWT**.
- Manejo de roles: `fiscal`, `coordinador` (y reutilizable para coordinar accesos del módulo DICRI).
- Interceptor Axios en el frontend que:
- Agrega el token a cada request.
- Detecta respuestas **401** y cierra sesión automáticamente (logout + redirección a login).
                                           |

### Módulo DICRI – Expedientes e Indicios (nuevo)

| Funcionalidad                 | Detalle                                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Expedientes DICRI**        | Tabla `ExpedientesDicri` con campos como `numeroExpediente`, `idTecnico`, `estado`, `descripcionGeneral`, `referenciaMp`, `ubicacion`.   |
| **Estados de expediente**    | Flujo basado en texto: `Registrado` → `EnRevision` → (`Aprobado` o `Rechazado`).                                                         |
| **Cambio de estado**         | Endpoints para enviar a revisión, aprobar y rechazar. La aprobación y el rechazo están pensados para rol coordinador.                   |
| **Rechazo con motivo**       | Al rechazar se exige una **justificación**, que se guarda tanto en el expediente como en el historial.                                  |
| **Indicios**                 | Tabla `Indicios` asociada a cada expediente: descripción, color, tamaño, peso (gramos), ubicación del levantamiento, fecha de levantamiento. |
| **Restricción por estado**   | No se permite registrar nuevos indicios cuando el expediente está en estado `Aprobado` o `Rechazado`.                                  |
| **Historial del expediente** | Endpoint `GET /api/expediente-dicri/:id/historial` devuelve la lista de cambios de estado con: `estado`, `comentario`, `usuarioNombre`, `usuarioEmail`, `fecha`. |

### Principales endpoints del módulo DICRI

> Prefijo general del backend: `/api`

- `GET /expedientes-dicri`  
  Lista todos los expedientes DICRI (con filtros en el frontend por estado y búsqueda).
- `POST /expedientes-dicri`  
  Crea un nuevo expediente (`numero`, `descripcionGeneral`, `idTecnico`, etc.).
- `GET /expedientes-dicri/:id`  
  Obtiene el detalle de un expediente.
- `GET /expedientes-dicri/:id/indicios`  
  Lista los indicios de un expediente.
- `POST /expedientes-dicri/:id/indicios`  
  Crea un indicio asociado al expediente.
- `POST /expedientes-dicri/:id/send-to-review`  
  Cambia estado de `Registrado` → `EnRevision`.
- `POST /expedientes-dicri/:id/approve`  
  Cambia estado de `EnRevision` → `Aprobado`.
- `POST /expedientes-dicri/:id/reject`  
  Cambia estado de `EnRevision` → `Rechazado` con justificación obligatoria.
- `GET /expediente-dicri/:id/historial`  
  Devuelve el historial de estados del expediente.

## Arquitectura

```text
┌───────────────┐        ┌──────────────┐        ┌────────────────┐
│   React app   │──────▶│  Express API │───────▶│ SQL Server 2019│
│  (Vite HMR)   │  fetch │  (Node 18)   │  mssql │    Docker Vol. │
└───────────────┘        └──────────────┘        └────────────────┘
````

En cada arranque del backend:

1. Espera a SQL Server (reintentos con back-off).
2. Crea la base **ministerio** si no existe.
3. Ejecuta los scripts SQL (`tables.sql`, `procedures.sql`, etc.), diseñados para ser **idempotentes** (no rompen si ya se ejecutaron).

## Requisitos

* **Docker ≥ 24** y **Docker Compose v2**
* ~4 GB de RAM libres (SQL Server + Node + React)

## Inicio rápido

```bash
# Clona el repositorio
git clone git@github.com:danbart/prueba-tecnina-mp-v5.git
cd prueba-tecnina-mp-v5

# Copia el .env de ejemplo y personaliza claves
cp .env.example .env

# Levantar todo (modo desarrollo con hot-reload)
docker compose up --build
```

| Servicio        | URL                                                    |
| --------------- | ------------------------------------------------------ |
| App React       | [http://localhost:5173](http://localhost:5173)         |
| API REST        | [http://localhost:3000/api](http://localhost:3000/api) |
| SQL Server (sa) | `localhost:1433` (host) → contenedor escucha en 1433  |

Durante desarrollo:

* El frontend usa **Vite HMR** (hot module replacement).
* El backend corre con **nodemon**.
* Ambos montan el código vía *bind-mounts*, por lo que los cambios se reflejan al instante.

## Variables de entorno principales

Todas se definen en `.env` y se inyectan a los contenedores desde `docker-compose.yml`.

| Variable                 | Ejemplo              | Descripción                       |
| ------------------------ | -------------------- | --------------------------------- |
| `DB_PASSWORD`            | `ourStrong!Passw0rd` | contraseña del usuario `sa`       |
| `DB_PORT`                | `1433`               | puerto interno de SQL Server      |
| `SECRET_KEY`             | `supersecret`        | clave para firmar y validar JWT   |
| `PORT` / `PORT_FRONTEND` | `3000` / `5173`      | puertos internos de backend/front |

> Para conectarte desde tu máquina a SQL Server, usa `localhost,1433`.
> Desde el backend (en Docker) se conecta a `sqlserver:1433`.

## Estructura de carpetas

```text
backend/
  ├─ src/
  │   ├─ controllers/
  │   │   ├─ authController.js
  │   │   └─ expedientesDicriController.js     
  │   ├─ services/
  │   │   └─ expedientesDicriService.js 
  │   ├─ routes/
  │   │   ├─ authRoutes.js
  │   │   └─ expedientesDicriRoutes.js
  │   └─ database/
  │       └─ connection.js
  ├─ sql/
  │   ├─ tables.sql
  │   ├─ procedures.sql
  │   └─ procedures_dicri.sql                   # SP de expedientes / indicios
  └─ Dockerfile

frontend/
  ├─ src/
  │   ├─ pages/
  │   │   ├─ Login.jsx
  │   │   ├─ Register.jsx
  │   │   ├─ ExpedientesDicriList.jsx           # listado de expedientes DICRI
  │   │   ├─ ExpedienteDicriCreate.jsx          # creación de expediente DICRI
  │   │   └─ ExpedienteDicriDetail.jsx          # detalle, indicios e historial
  │   ├─ components/
  │   │   ├─ Navbar.jsx
  │   │   └─ ProtectedRoute.jsx
  │   ├─ context/
  │   │   └─ AuthContext.jsx                    # login/logout + setup interceptores
  │   └─ api/
  │       └─ api.js                             # instancia Axios con interceptores
  └─ Dockerfile

docker-compose.yml
```

## Scripts útiles

```bash
# Entrar al shell de SQL Server dentro del contenedor
docker compose exec sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$DB_PASSWORD"

# Ver logs del backend
docker compose logs -f backend

# Limpiar todo (incluido volumen de datos)
docker compose down -v
```

## Autor

**Nombre:** Danilo Solórzano
**Email:** [danilo_solorzano06@hotmail.com](mailto:danilo_solorzano06@hotmail.com)

## Licencia

Este repositorio se entrega como parte de la **Prueba Técnica –
Ministerio Público de Guatemala** y puede reutilizarse con fines
educativos o de evaluación técnica. Para usos comerciales, contactar al autor.
