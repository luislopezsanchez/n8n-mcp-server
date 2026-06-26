# n8n-MCP (Fork de Producción)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![n8n version](https://img.shields.io/badge/n8n-2.26.5-orange.svg)](https://github.com/n8n-io/n8n)
[![Docker](https://img.shields.io/badge/docker-compose-blue.svg)](https://docs.docker.com/compose/)

Servidor MCP (Model Context Protocol) para n8n — fork de [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) con modificaciones para despliegue en producción sobre Contabo VPS.

Este servidor actúa como puente entre n8n y asistentes de IA (Claude, Hermes Agent, etc.), proporcionando acceso estructurado a la documentación de nodos, propiedades, operaciones y plantillas de n8n.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Despliegue con Docker Compose](#despliegue-con-docker-compose)
- [Variables de Entorno](#variables-de-entorno)
- [Conexión a la Instancia n8n](#conexión-a-la-instancia-n8n)
- [Conexión a Hermes Agent Gateway](#conexión-a-hermes-agent-gateway)
- [Actualizar desde Upstream](#actualizar-desde-upstream)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad](#seguridad)
- [Licencia](#licencia)

---

## Características

- 🔌 **Servidor MCP completo** — expone herramientas para buscar, validar y gestionar workflows de n8n
- 📚 **Documentación de nodos** — acceso a 1,845+ nodos (816 core + 1,029 community)
- 🐳 **Dockerizado** — despliegue con un solo comando usando Docker Compose
- 🔐 **Autenticación por token** — protegido con AUTH_TOKEN
- 🌐 **Modo HTTP** — compatible con cualquier cliente MCP que soporte SSE (Server-Sent Events)
- 🏗️ **Multi-tenant opcional** — soporte para múltiples instancias n8n
- 📊 **Telemetría anónima desactivada por defecto** en este fork

---

## Requisitos

- **Docker** y **Docker Compose** instalados
- Una instancia de **n8n** corriendo (local o remota)
- (Opcional) **API Key de n8n** para herramientas de gestión de workflows

---

## Despliegue con Docker Compose

### 1. Clonar el repositorio

```bash
git clone <url-de-este-repo> n8n-mcp
cd n8n-mcp
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y edita las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores reales. Las variables mínimas requeridas son:

```env
AUTH_TOKEN=*** 3. Construir y levantar

```bash
docker compose up -d --build
```

El servidor estará disponible en `http://localhost:3001` (mapeado a `127.0.0.1:3001` por seguridad).

### 4. Verificar el despliegue

```bash
curl http://localhost:3001/health
# Respuesta esperada: {"status":"ok"}
```

### Red Docker

El servicio se conecta a la red `baota_net` (externa), que debe existir previamente. Esta es la misma red donde corre n8n, permitiendo comunicación interna via `http://n8n:5678`.

Si tu configuración de red es diferente, edita la sección `networks` en `docker-compose.yml`.

---

## Variables de Entorno

### Configuración General

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `MCP_MODE` | Modo del servidor (`stdio` o `http`) | `http` |
| `PORT` | Puerto HTTP | `3001` |
| `HOST` | Host de escucha | `0.0.0.0` |
| `NODE_ENV` | Entorno (`development` / `production`) | `production` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `NODE_DB_PATH` | Ruta a la base de datos SQLite | `/app/data/nodes.db` |
| `REBUILD_ON_START` | Reconstruir BD al iniciar | `false` |

### Autenticación y Seguridad

| Variable | Descripción | Requerido |
|---|---|---|
| `AUTH_TOKEN` | Token de autenticación para HTTP | **Sí** |
| `BASE_URL` | URL pública del servidor | No |
| `WEBHOOK_SECURITY_MODE` | Modo de protección SSRF (`strict` / `moderate` / `permissive`) | `permissive` |
| `TRUST_PROXY` | Confiar en proxy inverso (0 o 1) | `0` |

### Conexión a n8n

| Variable | Descripción | Requerido |
|---|---|---|
| `N8N_API_URL` | URL de la instancia n8n (sin `/api/v1`) | **Sí** |
| `N8N_API_KEY` | API Key de n8n | **Sí** |
| `N8N_API_TIMEOUT` | Timeout de requests (ms) | `30000` |
| `N8N_API_MAX_RETRIES` | Reintentos máximos | `3` |

### Telemetría

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `N8N_MCP_TELEMETRY_DISABLED` | Desactivar telemetría | `true` |

### Multi-Tenant (Opcional)

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `ENABLE_MULTI_TENANT` | Activar modo multi-tenant | `false` |
| `MULTI_TENANT_SESSION_STRATEGY` | Estrategia de sesiones (`instance` / `shared`) | `instance` |

---

## Conexión a la Instancia n8n

### 1. Obtener API Key de n8n

1. Ve a tu instancia n8n → **Settings** → **API**
2. Crea una nueva API Key
3. Copia la key generada

### 2. Configurar en `.env`

```env
N8N_API_URL=http://n8n:5678
N8N_API_KEY=*** **Nota:** Si n8n corre en el mismo Docker network (`baota_net`), usa el nombre del contenedor (`n8n`) como hostname. Si está en otro servidor, usa la URL completa.

### 3. Verificar conectividad

```bash
curl -H "Authorization: Bearer *** http://localhost:3001/health
```

---

## Conexión a Hermes Agent Gateway

Para conectar este servidor MCP a **Hermes Agent** (by Nous Research):

### 1. Asegurar que el servidor está corriendo

```bash
docker compose ps
# n8n-mcp debe estar "Up"
```

### 2. Configurar en Hermes Agent

En la configuración de Hermes Agent, agrega un nuevo servidor MCP:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "type": "http",
      "url": "https://tu-dominio.com/mcp",
      "headers": {
        "Authorization": "Bearer <AUTH_TOKEN>"
      }
    }
  }
}
```

O si estás en la misma red local:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "type": "http",
      "url": "http://localhost:3001/mcp",
      "headers": {
        "Authorization": "Bearer <AUTH_TOKEN>"
      }
    }
  }
}
```

### 3. Verificar la conexión

Hermes Agent debería detectar automáticamente las herramientas disponibles. Puedes verificar preguntando:

> "¿Qué herramientas de n8n tienes disponibles?"

---

## Actualizar desde Upstream

Este repositorio es un fork de [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp). Para actualizar con los últimos cambios:

### 1. Agregar el remote upstream (solo la primera vez)

```bash
git remote add upstream https://github.com/czlonkowski/n8n-mcp.git
```

### 2. Fetch y merge

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 3. Resolver conflictos

Si hay conflictos (especialmente en `docker-compose.yml`, `.env.example`, o `.gitignore`), resuélvelos manualmente preservando las configuraciones locales de producción.

### 4. Reconstruir y desplegar

```bash
docker compose down
docker compose up -d --build
```

### 5. Verificar

```bash
docker compose logs -f n8n-mcp
curl http://localhost:3001/health
```

---

## Estructura del Proyecto

```
n8n-mcp/
├── src/
│   ├── mcp/              # Servidor MCP y herramientas
│   ├── services/         # Validación, templates, ejemplos
│   ├── database/         # Capa de acceso a datos (SQLite)
│   ├── telemetry/        # Sistema de telemetría (desactivado)
│   └── utils/            # Utilidades
├── data/
│   ├── skills/           # Documentación de habilidades para IA
│   └── nodes.db          # Base de datos de nodos (generada)
├── scripts/              # Scripts de utilidad y testing
├── tests/                # Tests unitarios e integración
├── docker/               # Archivos de configuración Docker
├── docker-compose.yml    # Configuración de despliegue
├── Dockerfile            # Build multi-etapa optimizado
├── .env.example          # Plantilla de variables de entorno
└── package.json          # Dependencias y scripts
```

---

## Seguridad

### Buenas prácticas

1. **NUNCA** subas el archivo `.env` al repositorio — está en `.gitignore`
2. Usa `AUTH_TOKEN` fuerte (generar con: `openssl rand -base64 32`)
3. El puerto está mapeado a `127.0.0.1:3001` — solo accesible localmente
4. Usa un proxy inverso (Nginx/Traefik) con HTTPS para exponerlo públicamente
5. La telemetría está desactivada por defecto (`N8N_MCP_TELEMETRY_DISABLED=true`)
6. El modo SSRF está en `permissive` para comunicación interna — ajustar según necesidades

### Verificación de secretos

Este repositorio ha sido auditado para garantizar que no contiene:
- API keys reales
- Tokens JWT completos
- Credenciales de Supabase
- Contraseñas o secrets de producción

Todos los valores en archivos de test son placeholders truncados (ej: `eyJhbG...nkCk`, `test123...890`).

---

## Licencia

MIT — ver archivo [LICENSE](LICENSE).

Basado en [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) por Romuald Czlonkowski.
