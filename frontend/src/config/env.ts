// frontend/src/config/env.ts
// Variáveis de ambiente do frontend
export const env = {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1',
    APP_NAME: process.env.REACT_APP_NAME || 'GestCond',
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Configurações PWA
    VAPID_PUBLIC_KEY: process.env.REACT_APP_VAPID_PUBLIC_KEY || '',
    
    // Configurações de cache
    CACHE_TIME: 5 * 60 * 1000, // 5 minutos
    STALE_TIME: 2 * 60 * 1000, // 2 minutos
  };
  