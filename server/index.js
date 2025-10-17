const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const delayMiddleware = require('./middleware/delay');

const app = new Koa();
const router = new Router();

app.use(cors());
app.use(delayMiddleware(3000, 7000)); 

router.get('/api/data', (ctx) => {
    ctx.body = {
        status: 'success',
        timestamp: new Date().toLocaleString('ru-RU'),
        message: 'Данные успешно загружены с сервера',
        data: {
            items: ['Элемент 1', 'Элемент 2', 'Элемент 3', 'Элемент 4', 'Элемент 5'],
            count: 5
        }
    };
});

router.get('/api/health', (ctx) => {
    ctx.body = { 
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (error) {
        ctx.status = error.status || 500;
        ctx.body = {
            status: 'error',
            message: error.message || 'Internal Server Error'
        };
        console.error('Server error:', error);
    }
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});