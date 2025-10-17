const delayMiddleware = (minDelay = 2000, maxDelay = 5000) => {
    return async (ctx, next) => {
        if (ctx.path.startsWith('/api/') && ctx.method === 'GET') {
            const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            console.log(`Delaying response for ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        await next();
    };
};

module.exports = delayMiddleware;