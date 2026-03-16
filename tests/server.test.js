const request = require('supertest');

// Importar la app sin iniciar el servidor
let app;

beforeAll(() => {
    // Suprimir logs del servidor durante tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    app = require('../server');
});

afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
});

// ─────────────────────────────────────────
// GET /
// ─────────────────────────────────────────
describe('GET /', () => {
    it('debe devolver 200 y HTML', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/html/);
    });
});

// ─────────────────────────────────────────
// POST /api/registro
// ─────────────────────────────────────────
describe('POST /api/registro', () => {
    it('debe registrar una solicitud válida', async () => {
        const solicitud = {
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@test.com',
            carrera: 'Ingenieria',
            semestre: '1',
            documentos: ['comprobante'],
            terminos: true
        };

        const res = await request(app)
            .post('/api/registro')
            .send(solicitud);

        expect(res.status).toBe(200);
        expect(res.body.exito).toBe(true);
        expect(res.body.numeroSolicitud).toMatch(/^SOL-/);
        expect(res.body.id).toBeDefined();
    });

    it('debe registrar una reinscripción con matrícula', async () => {
        const solicitud = {
            nombre: 'María',
            apellido: 'García',
            email: 'maria@test.com',
            matricula: 'MAT-001',
            carrera: 'Sistemas',
            semestre: '3',
            documentos: ['comprobante'],
            terminos: true
        };

        const res = await request(app)
            .post('/api/registro')
            .send(solicitud);

        expect(res.status).toBe(200);
        expect(res.body.exito).toBe(true);
    });
});

// ─────────────────────────────────────────
// GET /api/solicitudes
// ─────────────────────────────────────────
describe('GET /api/solicitudes', () => {
    it('debe devolver listado de solicitudes', async () => {
        const res = await request(app).get('/api/solicitudes');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('solicitudes');
        expect(Array.isArray(res.body.solicitudes)).toBe(true);
    });
});

// ─────────────────────────────────────────
// GET /api/solicitud/:numero
// ─────────────────────────────────────────
describe('GET /api/solicitud/:numero', () => {
    it('debe devolver 404 para número inexistente', async () => {
        const res = await request(app).get('/api/solicitud/SOL-NOEXISTE');
        expect(res.status).toBe(404);
        expect(res.body.error).toBeDefined();
    });

    it('debe devolver la solicitud si existe', async () => {
        // Primero crear una solicitud
        const solicitud = {
            nombre: 'Carlos',
            apellido: 'López',
            email: 'carlos@test.com',
            carrera: 'Civil',
            semestre: '2',
            documentos: ['comprobante'],
            terminos: true
        };

        const registro = await request(app)
            .post('/api/registro')
            .send(solicitud);

        const numero = registro.body.numeroSolicitud;
        const res = await request(app).get(`/api/solicitud/${numero}`);

        expect(res.status).toBe(200);
        expect(res.body.numeroSolicitud).toBe(numero);
        expect(res.body.estado).toBe('PENDIENTE_REVISION');
    });
});

// ─────────────────────────────────────────
// GET /api/verificar-email/:email
// ─────────────────────────────────────────
describe('GET /api/verificar-email/:email', () => {
    it('debe devolver false para email no registrado', async () => {
        const res = await request(app).get('/api/verificar-email/noexiste@test.com');
        expect(res.status).toBe(200);
        expect(res.body.existe).toBe(false);
    });
});

// ─────────────────────────────────────────
// GET /api/verificar-matricula/:matricula
// ─────────────────────────────────────────
describe('GET /api/verificar-matricula/:matricula', () => {
    it('debe devolver false para matrícula no registrada', async () => {
        const res = await request(app).get('/api/verificar-matricula/MAT-999');
        expect(res.status).toBe(200);
        expect(res.body.existe).toBe(false);
    });
});
