export class CacheManager {
    constructor() {
        this.cacheName = 'loading-app-cache-v1';
        this.init();
    }

    async init() {
        if (!('caches' in window)) {
            console.warn('Cache API not supported');
            return;
        }

        try {
            this.cache = await caches.open(this.cacheName);
        } catch (error) {
            console.error('Cache initialization failed:', error);
        }
    }

    async set(key, data) {
        try {
            if (!this.cache) await this.init();
            
            const url = `/cache/${key}`;
            const response = new Response(JSON.stringify(data), {
                headers: { 'Content-Type': 'application/json' }
            });
            
            await this.cache.put(url, response);
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    async get(key) {
        try {
            if (!this.cache) await this.init();
            
            const url = `/cache/${key}`;
            const response = await this.cache.match(url);
            
            if (!response) return null;
            
            return await response.json();
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    async delete(key) {
        try {
            if (!this.cache) await this.init();
            
            const url = `/cache/${key}`;
            await this.cache.delete(url);
        } catch (error) {
            console.error('Cache delete error:', error);
        }
    }

    async clear() {
        try {
            if (!this.cache) await this.init();
            
            const keys = await this.cache.keys();
            await Promise.all(keys.map(key => this.cache.delete(key)));
        } catch (error) {
            console.error('Cache clear error:', error);
        }
    }
}