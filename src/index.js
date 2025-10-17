import './styles/main.css';
import './app/app.js';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('ServiceWorker registered successfully:', registration);
            
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('New ServiceWorker found:', newWorker);
            });
            
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    });
}

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

console.log('Loading Styling App initialized');