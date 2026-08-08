# HelpDesk — Consumo de API

Aplicación web de mesa de ayuda (help desk) desarrollada con **Angular 17** que consume la API REST de `sla-api.areasoftccyt.com`. Incluye autenticación con tokens (access + refresh), gestión de tickets, comentarios, usuarios y un dashboard según el rol.

## Tecnologías y características

- **Angular 17** (NgModules, sin standalone components)
- **SCSS** con paleta morado `#6B21A8` y verde `#10B981`
- **Reactive Forms** en todos los formularios
- **Lazy Loading** en todos los feature modules
- **Interceptores HTTP**: inyección del Bearer token y renovación automática del access token ante `401 TOKEN_EXPIRED`
- **Guards**: `AuthGuard` y `RoleGuard`
- Diseño sencillo y limpio: layout claro, cards simples, botones planos, badges de estado/prioridad y responsive básico

## Requisitos

- Node.js 18 o superior
- Angular CLI 17

## Instalación y ejecución

```bash
npm install
npm start
```

Abre [http://localhost:4200](http://localhost:4200).

## Build de producción

```bash
npm run build
```

Los artefactos se generan en `dist/helpdesk`.

## Credenciales de prueba

| Rol          | Email                  | Contraseña  |
|--------------|------------------------|-------------|
| Administrador| `admin@helpdesk.dev`   | `Admin123!` |
| Agente       | `agent1@helpdesk.dev`  | `Agent123!` |
| Agente       | `agent2@helpdesk.dev`  | `Agent123!` |
| Cliente      | `client1@helpdesk.dev` | `Client123!` |
| Cliente      | `client2@helpdesk.dev` | `Client123!` |
| Cliente      | `client3@helpdesk.dev` | `Client123!` |

## API

- Base URL: `https://sla-api.areasoftccyt.com/api`
- Documentación (Swagger): `https://sla-api.areasoftccyt.com/api/docs`

### Flujo de autenticación

1. `POST /api/auth/login` devuelve un `accessToken` (válido 15 min) y un `refreshToken` (válido 7 días).
2. El `AuthInterceptor` agrega el access token como `Authorization: Bearer <token>`.
3. Ante un `401 TOKEN_EXPIRED`, el `TokenRefreshInterceptor` llama a `POST /api/auth/refresh` y reintenta la petición original.
4. `POST /api/auth/logout` invalida el refresh token en el servidor.

## Roles y permisos

| Rol    | Permisos |
|--------|----------|
| **admin** | Acceso total: gestiona usuarios y roles, ve todos los tickets, crea, edita, elimina y asigna tickets |
| **agent** | Ve tickets asignados a él o sin asignar; cambia estado y prioridad de sus tickets; comenta |
| **client** | Crea tickets; ve y comenta solo los suyos; no puede actualizar tickets |

## Estructura del proyecto

```
src/app/
├── core/
│   ├── guards/
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   ├── interceptors/
│   │   ├── auth.interceptor.ts
│   │   └── token-refresh.interceptor.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── ticket.service.ts
│   │   └── user.service.ts
│   └── core.module.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── auth.module.ts
│   ├── tickets/
│   │   ├── components/
│   │   │   ├── ticket-list/
│   │   │   ├── ticket-detail/
│   │   │   ├── ticket-form/
│   │   │   ├── ticket-filters/
│   │   │   └── comment-list/
│   │   └── tickets.module.ts
│   ├── users/
│   │   ├── components/
│   │   │   └── user-list/
│   │   └── users.module.ts
│   └── dashboard/
│       ├── components/
│       │   └── dashboard/
│       └── dashboard.module.ts
├── shared/
│   ├── components/
│   │   ├── navbar/
│   │   ├── loading-spinner/
│   │   ├── confirmation-dialog/
│   │   └── status-badge/
│   ├── services/
│   │   └── confirmation.service.ts
│   └── shared.module.ts
├── models/
│   ├── user.model.ts
│   ├── ticket.model.ts
│   ├── comment.model.ts
│   └── api-response.model.ts
├── app.component.ts
├── app.component.html
├── app.component.scss
├── app.module.ts
└── app-routing.module.ts
```

## Funcionalidades

- **Autenticación**: login, registro (siempre como cliente), logout (invalida el refresh token), redirección por rol y sesión persistente con `BehaviorSubject`.
- **Tickets**: listado con filtros (estado + prioridad) y paginación, vista diferente por rol, detalle con comentarios, creación (client y admin), actualización según permisos y asignación a agentes (solo admin).
- **Usuarios** (solo admin): listado y cambio de roles con confirmación.
- **Proxy**: `proxy.conf.json` configurado para redirigir `/api` en modo desarrollo (opcional, la app apunta directo a la API en `environment.ts`).
