// ============================================
// PATRÓN: CHAIN OF RESPONSIBILITY
// ============================================
// Este patrón define una cadena de procesadores donde cada uno decide
// si procesa la solicitud o la pasa al siguiente eslabón

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
        console.log(`✓ ${this.nombre}: Validando...`);
        const resultado = await this.validar(solicitud);
        
        if (!resultado.valido) {
            return resultado;
        }

        if (this.siguiente) {
            return this.siguiente.procesar(solicitud);
        }

        return { valido: true, mensaje: 'Todas las validaciones pasaron' };
    }

    async validar(solicitud) {
        // Será implementado por las subclases
        return { valido: true };
    }
}

// Eslabón 1: Verificar si el alumno ya existe
class ValidadorAlumnoExistente extends ValidadorSolicitud {
    async validar(solicitud) {
        // Simular consulta a base de datos
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (solicitud.matricula) {
            // Es una reinscripción
            const existe = Math.random() > 0.2; // 80% de probabilidad de existir
            if (!existe) {
                return {
                    valido: false,
                    mensaje: 'La matrícula no existe en el sistema'
                };
            }
            console.log(`  └─ Alumno encontrado: ${solicitud.nombre}`);
        } else {
            console.log(`  └─ Nuevo alumno: ${solicitud.nombre}`);
        }
        
        return { valido: true };
    }
}

// Eslabón 2: Verificar documentos completos
class ValidadorDocumentos extends ValidadorSolicitud {
    async validar(solicitud) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const documentosRequeridos = ['comprobante'];
        const documentosEnviados = solicitud.documentos || [];
        
        const falta = documentosRequeridos.filter(doc => !documentosEnviados.includes(doc));
        
        if (falta.length > 0) {
            return {
                valido: false,
                mensaje: `Documentos faltantes: ${falta.join(', ')}`
            };
        }
        
        console.log(`  └─ Documentos completos ✓`);
        return { valido: true };
    }
}

// Eslabón 3: Verificar disponibilidad de cupo
class ValidadorCupo extends ValidadorSolicitud {
    async validar(solicitud) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simular verificación de cupo disponible
        const cupDisponible = Math.random() > 0.1; // 90% de probabilidad de tener cupo
        
        if (!cupDisponible) {
            return {
                valido: false,
                mensaje: 'No hay cupo disponible en esta carrera/semestre'
            };
        }
        
        console.log(`  └─ Cupo disponible ✓`);
        return { valido: true };
    }
}

// Eslabón 4: Verificar estatus de pago
class ValidadorPago extends ValidadorSolicitud {
    async validar(solicitud) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simular verificación de pago
        const pagoProcesado = Math.random() > 0.15; // 85% de probabilidad de pago procesado
        
        if (!pagoProcesado) {
            return {
                valido: false,
                mensaje: 'El comprobante de pago no ha sido verificado o no es válido'
            };
        }
        
        console.log(`  └─ Pago verificado ✓`);
        return { valido: true };
    }
}

// ============================================
// PATRÓN: PROXY
// ============================================
// Este patrón intercepta las peticiones al servidor para agregar
// funcionalidad adicional (autenticación, logging, caché, etc.)

class ClienteServidor {
    async enviarSolicitud(solicitud) {
        // Simular envío al servidor
        console.log('Enviando solicitud al servidor...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            exito: true,
            mensaje: '✓ Solicitud registrada exitosamente',
            numeroSolicitud: 'SOL-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            timestamp: new Date().toLocaleString('es-ES')
        };
    }
}

class ProxyClienteServidor {
    constructor(clienteReal) {
        this.clienteReal = clienteReal;
        this.solicitudesEnCache = new Map();
        this.sesionActiva = true;
        this.contador = 0;
    }

    // Proxy: Validar sesión antes de enviar
    validarSesion() {
        if (!this.sesionActiva) {
            throw new Error('Sesión expirada. Por favor inicia sesión nuevamente');
        }
    }

    // Proxy: Validar permisos
    validarPermisos(solicitud) {
        if (!solicitud.email || !solicitud.carrera) {
            throw new Error('Permisos insuficientes o datos incompletos');
        }
    }

    // Proxy: Implementar caché para evitar duplicados
    verificarDuplicados(solicitud) {
        const clave = `${solicitud.email}_${solicitud.carrera}`;
        
        if (this.solicitudesEnCache.has(clave)) {
            const solicitudAnterior = this.solicitudesEnCache.get(clave);
            console.log(`Proxy: Solicitud duplicada detectada. Última: ${solicitudAnterior.timestamp}`);
        }
    }

    // Proxy: Logging de auditoría
    registrarAuditoria(solicitud, resultado) {
        this.contador++;
        const log = {
            id: this.contador,
            fecha: new Date(),
            email: solicitud.email,
            accion: 'ENVIO_SOLICITUD',
            estado: resultado.exito ? 'EXITOSO' : 'FALLIDO',
            numeroSolicitud: resultado.numeroSolicitud
        };
        
        console.log(`Auditoría #${log.id}: ${log.email} - ${log.estado}`);
        return log;
    }

    // Método principal: Proxy intercepta la petición
    async enviarSolicitud(solicitud) {
        try {
            // Interceptación 1: Validar sesión
            console.log('\n Proxy: Validando sesión...');
            this.validarSesion();

            // Interceptación 2: Validar permisos
            console.log('Proxy: Validando permisos...');
            this.validarPermisos(solicitud);

            // Interceptación 3: Verificar duplicados
            console.log('Proxy: Verificando duplicados...');
            this.verificarDuplicados(solicitud);

            // Si todo está bien, delegar al servidor real
            console.log('✓ Proxy: Todas las validaciones pasaron\n');
            const resultado = await this.clienteReal.enviarSolicitud(solicitud);

            // Interceptación 4: Registrar auditoría
            this.registrarAuditoria(solicitud, resultado);

            // Cachear la solicitud
            const clave = `${solicitud.email}_${solicitud.carrera}`;
            this.solicitudesEnCache.set(clave, {
                timestamp: new Date(),
                numeroSolicitud: resultado.numeroSolicitud
            });

            return resultado;

        } catch (error) {
            console.error('Proxy - Error:', error.message);
            throw error;
        }
    }
}

// ============================================
// INTERFAZ DE USUARIO
// ============================================

class GestorRegistro {
    constructor() {
        this.formulario = document.getElementById('registroForm');
        this.alertDiv = document.getElementById('alert');
        this.loadingDiv = document.getElementById('loading');

        // Configurar Chain of Responsibility
        this.cadenaValidadores = new ValidadorAlumnoExistente('Validador: Alumno Existente');
        this.cadenaValidadores
            .establecerSiguiente(new ValidadorDocumentos('Validador: Documentos'))
            .establecerSiguiente(new ValidadorCupo('Validador: Cupo'))
            .establecerSiguiente(new ValidadorPago('Validador: Pago'));

        // Configurar Proxy
        const clienteReal = new ClienteServidor();
        this.proxy = new ProxyClienteServidor(clienteReal);

        this.formulario.addEventListener('submit', (e) => this.manejarEnvio(e));
    }

    mostrarAlerta(mensaje, tipo = 'info') {
        this.alertDiv.textContent = '';
        this.alertDiv.className = `alert ${tipo}`;
        
        if (tipo === 'success') {
            this.alertDiv.innerHTML = `<strong>✓ Éxito</strong><div>${mensaje}</div>`;
        } else if (tipo === 'error') {
            this.alertDiv.innerHTML = `<strong> Error</strong><div>${mensaje}</div>`;
        } else if (tipo === 'warning') {
            this.alertDiv.innerHTML = `<strong> Advertencia</strong><div>${mensaje}</div>`;
        } else {
            this.alertDiv.innerHTML = `<strong> Información</strong><div>${mensaje}</div>`;
        }
        
        this.alertDiv.style.display = 'block';
    }

    mostrarCarga(mostrar = true) {
        this.loadingDiv.style.display = mostrar ? 'block' : 'none';
    }

    obtenerDatosFormulario() {
        const formData = new FormData(this.formulario);
        const documentos = formData.getAll('documentos');
        
        return {
            nombre: formData.get('nombre'),
            apellido: formData.get('apellido'),
            email: formData.get('email'),
            matricula: formData.get('matricula') || null,
            carrera: formData.get('carrera'),
            semestre: formData.get('semestre'),
            documentos: documentos,
            terminos: formData.get('terminos') === 'on'
        };
    }

    async manejarEnvio(evento) {
        evento.preventDefault();

        try {
            this.alertDiv.style.display = 'none';
            this.mostrarCarga(true);

            const solicitud = this.obtenerDatosFormulario();

            console.log('═════════════════════════════════════════════');
            console.log(' INICIANDO PROCESO DE REGISTRO');
            console.log('═════════════════════════════════════════════\n');

            // Fase 1: Chain of Responsibility
            console.log('FASE 1: CADENA DE VALIDADORES');
            console.log('─────────────────────────────────────────────');
            const resultadoValidacion = await this.cadenaValidadores.procesar(solicitud);

            if (!resultadoValidacion.valido) {
                this.mostrarCarga(false);
                this.mostrarAlerta(resultadoValidacion.mensaje, 'error');
                console.log(' PROCESO INTERRUMPIDO EN LA CADENA DE VALIDADORES\n');
                return;
            }

            console.log(`\n✓ ${resultadoValidacion.mensaje}\n`);

            // Fase 2: Proxy y envío al servidor
            console.log('FASE 2: ENVÍO AL SERVIDOR CON PROXY');
            console.log('─────────────────────────────────────────────');
            const resultado = await this.proxy.enviarSolicitud(solicitud);

            this.mostrarCarga(false);

            if (resultado.exito) {
                this.mostrarAlerta(
                    `${resultado.mensaje}\n\nNúmero de solicitud: ${resultado.numeroSolicitud}\nFecha: ${resultado.timestamp}`,
                    'success'
                );
                this.formulario.reset();
                console.log('✓ SOLICITUD REGISTRADA EXITOSAMENTE\n');
            } else {
                this.mostrarAlerta('Error al procesar la solicitud', 'error');
            }

            console.log('═════════════════════════════════════════════\n');

        } catch (error) {
            this.mostrarCarga(false);
            this.mostrarAlerta(error.message, 'error');
            console.log(` ERROR: ${error.message}\n`);
        }
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema de Registro Universitario - Inicializado');
    console.log('Patrones implementados:');
    console.log('  • Proxy: Interceptación de peticiones al servidor');
    console.log('  • Chain of Responsibility: Cadena de validadores\n');
    
    new GestorRegistro();
});
