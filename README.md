# Sistema de Registro y Reinscripción Universitaria

## Descripción

Sistema web completo de registro y reinscripción de alumnos con arquitectura **Cliente-Servidor**. Implementa dos patrones de diseño fundamentales: **Proxy** y **Chain of Responsibility**.

---

## Arquitectura Cliente-Servidor

### Frontend (Cliente)
- **HTML5**: Formulario responsive de registro/reinscripción
- **JavaScript ES6+**: Lógica de cliente con patrones de diseño
- **Validaciones en cliente**: Antes de enviar datos al servidor

### Backend (Servidor)
- **Node.js + Express**: API REST para procesar solicitudes
- **Simulación de BD**: Datos en memoria para demostración
- **Endpoints API**: Consultas y registro de solicitudes

---

## Patrones de Diseño Implementados

### **PATRÓN PROXY**

El **Proxy** actúa como intermediario entre el cliente y el servidor, interceptando y procesando las peticiones.

#### Funcionalidades:
- **Validación de sesión**: Verifica que el usuario tenga sesión activa
- **Validación de permisos**: Comprueba que el usuario tenga suficientes permisos
- **Detección de duplicados**: Evita enviar la misma solicitud dos veces
- **Auditoría y logging**: Registra cada operación para seguridad
- **Caché**: Almacena solicitudes anteriores

#### Código:
```javascript
class ProxyClienteServidor {
    async enviarSolicitud(solicitud) {
        // Paso 1: Validar sesión
        this.validarSesion();
        
        // Paso 2: Validar permisos
        this.validarPermisos(solicitud);
        
        // Paso 3: Verificar duplicados
        this.verificarDuplicados(solicitud);
        
        // Paso 4: Delegar al servidor real
        const resultado = await this.clienteReal.enviarSolicitud(solicitud);
        
        // Paso 5: Registrar auditoría
        this.registrarAuditoria(solicitud, resultado);
        
        return resultado;
    }
}
```

#### Ventajas:
Seguridad mejorada  
Control centralizado de acceso  
Auditoría completa  
Reducción de carga del servidor (caché)  

---

### **PATRÓN CHAIN OF RESPONSIBILITY**

La **Cadena de Responsabilidad** procesa la solicitud paso a paso. Cada validador decide si puede resolver el problema o pasarlo al siguiente.

#### Eslabones de la Cadena:

```
┌─────────────────────────────────────────────────────│
│ SOLICITUD                                           │
└──────────┬──────────────────────────────────────────┘
           │
           ▼
    ┌─────────────────────────┐
    │ 1. ¿Alumno existe?      │  (Nuevo o existente)
    │    (VALIDADOR 1)        │
    └──────────┬──────────────┘
               │ ✓ SÍ
               ▼
    ┌─────────────────────────┐
    │ 2. ¿Documentos OK?      │  (Comprobante)
    │    (VALIDADOR 2)        │
    └──────────┬──────────────┘
               │ ✓ SÍ
               ▼
    ┌─────────────────────────┐
    │ 3. ¿Hay cupo?           │  (Carrera/Semestre)
    │    (VALIDADOR 3)        │
    └──────────┬──────────────┘
               │ ✓ SÍ
               ▼
    ┌─────────────────────────┐
    │ 4. ¿Pago verificado?    │  (Comprobante válido)
    │    (VALIDADOR 4)        │
    └──────────┬──────────────┘
               │ ✓ SÍ
               ▼
    ┌─────────────────────────┐
    │ ✓ SOLICITUD APROBADA   │
    └─────────────────────────┘
```

#### Implementación:
```javascript
class ValidadorSolicitud {
    constructor(nombre) {
        this.nombre = nombre;
        this.siguiente = null;
    }

    establecerSiguiente(validador) {
        this.siguiente = validador;
        return validador;
    }

    async procesar(solicitud) {
        const resultado = await this.validar(solicitud);
        
        if (!resultado.valido) {
            return resultado;  // Se detiene aquí
        }

        if (this.siguiente) {
            return this.siguiente.procesar(solicitud);  // Pasa al siguiente
        }

        return { valido: true };  // Completado
    }
}
```

#### Ventajas:
Validación escalonada y clara  
Fácil de agregar/remover eslabones  
Separación de responsabilidades  
Debugging simplificado  

---

## Estructura de Archivos

```
actividad01/
├── index.html          # Formulario HTML (Frontend)
├── client.js           # Lógica del cliente (Proxy + Chain)
├── server.js           # Servidor Express (Backend)
├── package.json        # Dependencias Node.js
└── README.md          # Este archivo
```

---

## Cómo Usar


## Flujo de Ejecución

### 1. Usuario llena el formulario

```javascript
{
    nombre: "Juan",
    apellido: "Pérez",
    email: "juan@email.com",
    matricula: "2024001",        // Reinscripción
    carrera: "ingenieria_sistemas",
    semestre: "3",
    documentos: ["cedula", "foto", "comprobante"],
    terminos: true
}
```

### 2. Cliente inicia FASE 1: Chain of Responsibility

```
✓ 1️⃣  Validador: Alumno Existente: Validando...
  └─ Alumno encontrado: Juan

✓ 2️⃣  Validador: Documentos: Validando...
  └─ Documentos completos ✓

✓ 3️⃣  Validador: Cupo: Validando...
  └─ Cupo disponible ✓

✓ 4️⃣  Validador: Pago: Validando...
  └─ Pago verificado ✓

✓ Todas las validaciones pasaron
```

### 3. Cliente inicia FASE 2: Proxy

```
Proxy: Validando sesión...
Proxy: Todas las validaciones pasaron

Enviando solicitud al servidor...
Auditoría #1: juan@email.com - EXITOSO
```

### 4. Servidor recibe y guarda

```
SOLICITUD RECIBIDA EN EL SERVIDOR
Alumno: Juan Pérez
Email: juan@email.com
Carrera: ingenieria_sistemas
Tipo: Reinscripción

✓ Solicitud guardada en BD
Número: SOL-A7D9K2F1B
```

### 5. Cliente muestra resultado

```
✓ Éxito

Solicitud registrada exitosamente

Número de solicitud: SOL-A7D9K2F1B
Fecha: 17/2/2026 14:35:22
```

---

## Casos de Uso

### Caso 1: Nuevo Alumno

```javascript
// Sin matrícula → Es nuevo registro
{
    matricula: null,  // ← No existe
    ...
}
```

### Caso 2: Reinscripción

```javascript
// Con matrícula → Es reinscripción
{
    matricula: "2024001",  // ← Existe
    ...
}
```

### Caso 3: Falla en Validación

```javascript
// Falta documentación → Se detiene en eslabón 2
//  Documentos faltantes: comprobante

// Sin cupo disponible → Se detiene en eslabón 3
// No hay cupo disponible en esta carrera/semestre
```

---

## API REST (Servidor)

### Registrar solicitud
```
POST /api/registro
Content-Type: application/json

{
    nombre: "Juan",
    email: "juan@email.com",
    carrera: "ingenieria_sistemas",
    documentos: ["cedula", "foto", "comprobante"]
}

Response: {
    numeroSolicitud: "SOL-A7D9K2F1B",
    timestamp: "2026-02-17T14:35:22Z"
}
```

### Consultar estado
```
GET /api/solicitud/SOL-A7D9K2F1B

Response: {
    numeroSolicitud: "SOL-A7D9K2F1B",
    estado: "PENDIENTE_REVISION",
    alumno: "Juan Pérez",
    carrera: "ingenieria_sistemas"
}
```

---

## Ventajas de esta Arquitectura

| Aspecto | Beneficio |
|--------|-----------|
| **Seguridad** | Proxy valida y audita todas las peticiones |
| **Escalabilidad** | Backend independiente del frontend |
| **Mantenibilidad** | Patrones claros y separados |
| **Rendimiento** | Caché y validaciones locales |
| **Flexibilidad** | Fácil agregar nuevos validadores |
| **Debugging** | Logs detallados en cada etapa |

---

## Notas Importantes

- Las validaciones son **simuladas** con timeouts para demostración
- Los datos se guardan en **memoria** (no en BD real)
- Porcentajes de éxito son aleatorios (simula realidad)

---


## Recursos

- [Patrón Proxy - Wikipedia](https://es.wikipedia.org/wiki/Proxy)
- [Chain of Responsibility - Refactoring Guru](https://refactoring.guru/design-patterns/chain-of-responsibility)
- [Express.js Documentation](https://expressjs.com/)
- [MDN - Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)

---

## Autor

Emmanuel Zuñiga Suarez
