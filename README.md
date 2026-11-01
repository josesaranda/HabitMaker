# HabitMaker

Aplicación web de HabitMaker organizada como un workspace Nx. Actualmente incluye las vistas de inicio de sesión y registro, además de una librería interna de componentes reutilizables.

## Tecnologías

- **Angular 22** y **TypeScript 6** para la aplicación.
- **Nx 24** para gestionar el workspace, proyectos y tareas.
- **Tailwind CSS 4** y CSS para los estilos.
- **RxJS 7** para programación reactiva.
- **Vitest 4** para las pruebas.
- **npm workspaces** para la gestión de dependencias.

## Estructura del proyecto

```text
.
├── apps/
│   └── habit-maker-app/          # Aplicación web Angular
│       └── src/
│           ├── app/
│           │   ├── login/        # Vista y pruebas de inicio de sesión
│           │   ├── signup/       # Vista y pruebas de registro
│           │   ├── app.routes.ts # Rutas de la aplicación
│           │   └── ...
│           ├── main.ts           # Punto de entrada
│           └── styles.css        # Estilos globales y Tailwind
├── packages/
│   └── habit-maker-ui/            # Librería de componentes reutilizables
│       └── src/lib/               # Botón, checkbox, input y link
├── nx.json                       # Configuración de Nx
├── package.json                  # Dependencias y scripts npm
└── tsconfig.base.json            # Configuración base de TypeScript
```

## Requisitos

- Node.js
- npm

## Instalación y ejecución

Desde la raíz del repositorio, instala las dependencias:

```bash
npm install
```

Inicia la aplicación en modo desarrollo:

```bash
npm run start:app
```

Después, abre [http://localhost:4200](http://localhost:4200). La ruta inicial redirige a `/login`; también puedes visitar `/signup` para ver el registro.

También puedes iniciar la app directamente con Nx:

```bash
npm exec nx serve HabitMakerApp
```

## Comandos útiles

Ejecuta las pruebas de la aplicación o de la librería de UI:

```bash
npm exec nx test HabitMakerApp
npm exec nx test HabitMakerUI
```

Genera una compilación de producción de la aplicación:

```bash
npm exec nx build HabitMakerApp
```

Los artefactos de compilación se generan en `dist/apps/habit-maker-app`.
