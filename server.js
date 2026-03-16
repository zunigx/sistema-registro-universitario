/**
 * Servidor Express - Backend para el Sistema de Registro Universitario
 * Este servidor sirve como ejemplo de cómo el cliente se conectaría a un backend real
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Simulación de base de datos
const baseDatos = {
    alumnos: [],
    solicitudes: [],
    pagos: {}
};

// Ruta: Servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta: Registrar nueva solicitud
app.post('/api/registro', (req, res) => {
    const solicitud = req.body;

    console.log('\n📥 SOLICITUD RECIBIDA EN EL SERVIDOR');
    console.log('─────────────────────────────────────');
    console.log('Alumno:', solicitud.nombre, solicitud.apellido);
    console.log('Email:', solicitud.email);
    console.log('Carrera:', solicitud.carrera);
    console.log('Tipo:', solicitud.matricula ? 'Reinscripción' : 'Nuevo Registro');

    // Simular procesamiento
    setTimeout(() => {
        const numeroSolicitud = 'SOL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const registroGuardado = {
            id: baseDatos.solicitudes.length + 1,
            ...solicitud,
            numeroSolicitud: numeroSolicitud,
            estado: 'PENDIENTE_REVISION',
            fechaRegistro: new Date(),
            iniciadaPor: 'Sistema de Registro Universitario'
        };

        baseDatos.solicitudes.push(registroGuardado);

        console.log('✓ Solicitud guardada en BD');
        console.log('Número:', numeroSolicitud);
        console.log('─────────────────────────────────────\n');

        res.json({
            exito: true,
            mensaje: 'Solicitud registrada en el servidor',
            numeroSolicitud: numeroSolicitud,
            id: registroGuardado.id,
            timestamp: registroGuardado.fechaRegistro
        });
    }, 500);
});

// Ruta: Obtener estado de solicitud
app.get('/api/solicitud/:numeroSolicitud', (req, res) => {
    const { numeroSolicitud } = req.params;
    
    const solicitud = baseDatos.solicitudes.find(s => s.numeroSolicitud === numeroSolicitud);
    
    if (!solicitud) {
        return res.status(404).json({
            error: 'Solicitud no encontrada'
        });
    }

    res.json({
        numeroSolicitud: solicitud.numeroSolicitud,
        estado: solicitud.estado,
        alumno: `${solicitud.nombre} ${solicitud.apellido}`,
        carrera: solicitud.carrera,
        fechaRegistro: solicitud.fechaRegistro
    });
});

// Ruta: Listar todas las solicitudes (solo para demostración)
app.get('/api/solicitudes', (req, res) => {
    res.json({
        total: baseDatos.solicitudes.length,
        solicitudes: baseDatos.solicitudes.map(s => ({
            id: s.id,
            numeroSolicitud: s.numeroSolicitud,
            alumno: `${s.nombre} ${s.apellido}`,
            email: s.email,
            carrera: s.carrera,
            estado: s.estado,
            fechaRegistro: s.fechaRegistro
        }))
    });
});

// Ruta: Verificar si email ya existe
app.get('/api/verificar-email/:email', (req, res) => {
    const { email } = req.params;
    
    const existe = baseDatos.alumnos.some(a => a.email === email);
    
    res.json({
        email: email,
        existe: existe
    });
});

// Ruta: Verificar matrícula
app.get('/api/verificar-matricula/:matricula', (req, res) => {
    const { matricula } = req.params;
    
    const alumno = baseDatos.alumnos.find(a => a.matricula === matricula);
    
    res.json({
        matricula: matricula,
        existe: !!alumno,
        alumno: alumno ? {
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            carrera: alumno.carrera
        } : null
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        mensaje: err.message
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('═════════════════════════════════════════════');
    console.log('SERVIDOR DE REGISTRO UNIVERSITARIO');
    console.log('═════════════════════════════════════════════');
    console.log(`\n✓ Servidor ejecutándose en: http://localhost:${PORT}`);
    console.log('\nEndpoints disponibles:');
    console.log('  GET  /                         → Formulario de registro');
    console.log('  POST /api/registro              → Enviar nueva solicitud');
    console.log('  GET  /api/solicitud/:numero    → Obtener estado de solicitud');
    console.log('  GET  /api/solicitudes          → Listar todas las solicitudes');
    console.log('  GET  /api/verificar-email/:email');
    console.log('  GET  /api/verificar-matricula/:matricula');
    console.log('\n═════════════════════════════════════════════\n');
});
