# LMS Platform - Sistema de Gestión de Aprendizaje

Una plataforma de gestión educativa (Learning Management System) desarrollada con una arquitectura cliente-servidor. Este proyecto implementa un sistema robusto de control de acceso basado en roles (RBAC), gestión de cursos, inscripciones y registro de calificaciones, respaldado por una base de datos relacional.

## 🚀 Características Principales

- **Seguridad y Autenticación:** Sistema de login protegido con JSON Web Tokens (JWT) y contraseñas encriptadas con `bcrypt`.
- **Control de Roles (RBAC):**
  - **Administrador:** Acceso total. Puede crear cursos, registrar usuarios, visualizar todos los catálogos, y administrar matriculas y evaluaciones.
  - **Profesor:** Vista enfocada a la docencia. Puede ver los estudiantes inscritos en sus cursos, crear evaluaciones y asignar calificaciones mediante una interfaz integrada.
  - **Estudiante:** Acceso al catálogo general para matricularse y un panel personalizado ("Mis Cursos") para dar retroalimentación a sus inscripciones y notas finales.
- **Gestión de Base de Datos:** Interacciones seguras y modelado relacional utilizando Sequelize (ORM) garantizando la integridad de los datos.

## 💻 Stack Tecnológico

**Frontend:**

- [React 19](https://reactjs.org/) (Configurado con [Vite 8](https://vitejs.dev/))
- [Tailwind CSS 3](https://tailwindcss.com/) para diseño responsivo y moderno.
- `react-router-dom` para el enrutamiento de vistas.
- `axios` para las peticiones HTTP.

**Backend:**

- [Node.js](https://nodejs.org/) y [Express 5](https://expressjs.com/) para la creación de la API REST.
- [Sequelize (ORM)](https://sequelize.org/) para la manipulación orientada a objetos de la base de datos.
- [Microsoft SQL Server](https://www.microsoft.com/es-es/sql-server) como motor de base de datos relacional (paquete `mssql`).
- Autenticación con `jsonwebtoken` y `bcrypt`.

## 📁 Estructura del Proyecto

El repositorio está dividido en dos partes principales:

- **`/lms-project/backend`**: Servidor Node.js, conexión a la base de datos y endpoints del API REST.
- **`/lms-project/frontend`**: Aplicación web desarrollada en React + Vite + TailwindCSS.

## ⚙️ Requisitos Previos

Asegúrate de tener instalado lo siguiente antes de levantar el entorno local:

- Node.js (v16 o superior)
- Microsoft SQL Server y SQL Server Management Studio (SSMS) u otro cliente.
- Git

## 🛠️ Instalación y Configuración Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd lms-project
```

### 2. Configuración de la Base de Datos (SQL Server)

1. Abre SSMS y crea una base de datos vacía (por ejemplo: `lms_db`).
2. La plataforma creará las tablas automáticamente mediante Sequelize al iniciar.
3. Puedes ejecutar la siguiente consulta opcional si requieres un ajuste en las matrículas (ejemplo para aceptar notas de texto):

```sql
ALTER TABLE Matriculas ADD nota VARCHAR(255) NULL;
```

### 3. Configuración del Backend

Abre una terminal y navega a la carpeta del backend:

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend` con las siguientes variables:

```env
PORT=3000
DB_USER=tu_usuario_sql
DB_PASSWORD=tu_contraseña_sql
DB_NAME=lms_db
DB_SERVER=localhost
JWT_SECRET=tu_clave_secreta_super_segura
```

Inicia el servidor (Sequelize sincronizará las tablas automáticamente):

```bash
npm run dev
# o usando node: node server.js
```

### 4. Configuración del Frontend

Abre una nueva terminal y navega a la carpeta del frontend:

```bash
cd frontend
npm install
```

Inicia el servidor de desarrollo de Vite:

```bash
npm run dev
```

Visita `http://localhost:5173` en tu navegador. Puedes acceder al registro de usuario para crear tu primer administrador.

## 🔌 API Endpoints Principales

### Auth (`/api/auth`)

- `POST /registro` - Registrar usuario.
- `POST /login` - Iniciar sesión.

### Usuarios (`/api/usuarios` - _Administrador_)

- `GET /` - Listar todos los usuarios.
- `PUT /:id` - Editar usuario existente.
- `DELETE /:id` - Eliminar un usuario.

### Cursos (`/api/cursos`)

- `GET /` - Listar todos los cursos (Autenticado).
- `POST /` - Crear un curso (_Admin_).
- `PUT /:id` - Editar un curso (_Admin_).
- `DELETE /:id` - Eliminar un curso (_Admin_).

### Matrículas (`/api/matriculas`)

- `POST /` - Matricular estudiante (_Admin, Estudiante_).
- `GET /curso/:cursoId` - Ver estudiantes por curso (_Admin, Profesor_).
- `GET /mis-cursos` - Ver cursos de un estudiante (_Estudiante_).
- `PUT /:id/nota` - Asignar calificación (_Admin, Profesor_).

### Evaluaciones (`/api/evaluaciones`)

- `POST /`, `GET /`, `PUT /:id`, `DELETE /:id` (_Admin, Profesor_).

---

