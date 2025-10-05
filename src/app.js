class LoadingApp {
    constructor() {
        this.loadingContainer = document.getElementById('loading-container');
        this.content = document.getElementById('content');
        this.errorContainer = document.getElementById('error-container');
        this.retryBtn = document.getElementById('retry-btn-error');
        
        this.init();
    }

    init() {
        this.retryBtn.addEventListener('click', () => this.loadData());
        this.loadData();
    }

    async loadData() {
        this.showLoading();
        
        try {
            await this.delay(2000);
            
            const response = await fetch('/api/data', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            this.showContent(data);
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError();
        }
    }

    showLoading() {
        this.loadingContainer.classList.remove('hidden');
        this.content.classList.add('hidden');
        this.errorContainer.classList.add('hidden');
    }

    showContent(data) {
        this.loadingContainer.classList.add('hidden');
        this.content.classList.remove('hidden');
        this.errorContainer.classList.add('hidden');

        const contentElement = this.content.querySelector('p');
        contentElement.textContent = data.message || 'Данные успешно загружены.';
    }

    showError() {
        this.loadingContainer.classList.add('hidden');
        this.content.classList.add('hidden');
        this.errorContainer.classList.remove('hidden');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LoadingApp();
});