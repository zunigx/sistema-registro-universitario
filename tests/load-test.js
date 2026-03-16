import http from 'http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp-up a 50 usuarios en 30 segundos
        { duration: '1m', target: 100 }, // Mantener 100 usuarios durante 1 minuto
        { duration: '30s', target: 50 }, // Ramp-down a 50 usuarios en 30 segundos
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // El 95% de las solicitudes deben ser menores a 500ms
        http_req_failed: ['rate<0.01'], // Menos del 1% de las solicitudes deben fallar
    },
};

export default function () {
    const url = 'https://sistema-registro-universitario.vercel.app';

    check(res, {
        "status es 200": (r) => r.status === 200,
    });

    sleep(1);

}