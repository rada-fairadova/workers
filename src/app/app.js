import { CacheManager } from '../utils/cache.js';

class LoadingApp {
    constructor() {
        this.cacheManager = new CacheManager();
        this.retryCount = 0;
        this.maxRetries = 3;
        this.init();
    }

    async init() {
        try {
            this.showLoadingState();

            const cachedData = await this.cacheManager.get('app-data');
            
            if (cachedData && !this.isDataStale(cachedData.timestamp)) {
                await this.delay(1000);
                this.showSuccessState(cachedData.data);
                return;
            }

            await this.loadData();

        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    async loadData() {
        try {
            await this.delay(2000 + Math.random() * 2000);

            const response = await fetch('/api/data', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            await this.cacheManager.set('app-data', {
                data: data,
                timestamp: Date.now()
            });

            this.retryCount = 0;
            this.showSuccessState(data);

        } catch (error) {
            throw error;
        }
    }

    showLoadingState() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="loading-container">
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <div class="spinner-inner"></div>
                </div>
                <h1 class="loading-title">Загрузка приложения</h1>
                <p class="loading-text">Пожалуйста, подождите...</p>
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
            </div>
        `;
    }

    showSuccessState(data) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="content-container">
                <div class="success-icon">🎉</div>
                <h1 class="success-title">Готово!</h1>
                
                <div class="data-card">
                    <div class="data-item">
                        <span class="data-label">Статус:</span>
                        <span class="data-value">${data.status}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Время:</span>
                        <span class="data-value">${data.timestamp}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Сообщение:</span>
                        <span class="data-value">${data.message}</span>
                    </div>
                    <div class="data-item">
                        <span class="data-label">Элементов:</span>
                        <span class="data-value">${data.data.count}</span>
                    </div>
                </div>

                <div class="user-actions">
                    <button class="action-button primary-button" onclick="app.refreshData()">
                        Обновить данные
                    </button>
                    <button class="action-button secondary-button" onclick="app.clearCache()">
                        Очистить кэш
                    </button>
                </div>
            </div>
        `;
    }

    showErrorState(error) {
        const app = document.getElementById('app');
        const isOffline = !navigator.onLine;
        
        app.innerHTML = `
            <div class="error-container">
                <div class="error-icon">${isOffline ? '📶' : '⚠️'}</div>
                <h1 class="error-title">
                    ${isOffline ? 'Отсутствует подключение' : 'Ошибка загрузки'}
                </h1>
                <p class="error-message">
                    ${isOffline 
                        ? 'Проверьте подключение к интернету и попробуйте снова.' 
                        : 'Не удалось загрузить данные. Пожалуйста, попробуйте еще раз.'
                    }
                    ${this.retryCount > 0 ? `<br><small>Попытка ${this.retryCount} из ${this.maxRetries}</small>` : ''}
                </p>
                <button class="retry-button" onclick="app.retry()" 
                        ${this.retryCount >= this.maxRetries ? 'disabled' : ''}>
                    ${this.retryCount >= this.maxRetries ? 'Превышено число попыток' : 'Повторить попытку'}
                </button>
            </div>
        `;
    }

    handleError(error) {
        console.error('Application error:', error);
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            this.showErrorState(error);
        } else {
            this.showErrorState(new Error('Превышено максимальное число попыток'));
        }
    }

    async retry() {
        if (this.retryCount >= this.maxRetries) return;
        
        this.showLoadingState();

        await this.delay(this.retryCount * 1000);
        
        try {
            await this.loadData();
        } catch (error) {
            this.handleError(error);
        }
    }

    async refreshData() {
        this.showLoadingState();
        this.retryCount = 0;

        await this.cacheManager.delete('app-data');
        
        try {
            await this.loadData();
        } catch (error) {
            this.handleError(error);
        }
    }

    async clearCache() {
        await this.cacheManager.clear();
        this.showSuccessState({
            status: 'success',
            timestamp: new Date().toLocaleString('ru-RU'),
            message: 'Кэш успешно очищен',
            data: { count: 0 }
        });
    }

    isDataStale(timestamp) {
        const FIVE_MINUTES = 5 * 60 * 1000;
        return Date.now() - timestamp > FIVE_MINUTES;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const app = new LoadingApp();

window.addEventListener('online', () => {
    if (app.retryCount > 0) {
        app.retry();
    }
});

window.addEventListener('offline', () => {
    app.handleError(new Error('Connection lost'));
});