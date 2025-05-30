// frontend/public/service-worker.js
/* eslint-disable no-restricted-globals */
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';

clientsClaim();

// Precache todos os recursos gerados pelo webpack
precacheAndRoute(self.__WB_MANIFEST);

// Cache de API com estratégia StaleWhileRevalidate
registerRoute(
  ({ url }) => url.origin === 'http://localhost:3001' || url.origin === 'https://sua-api.com',
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 1 dia
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache de imagens
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 dias
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache de fontes
registerRoute(
  ({ url }) => 
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// Cache de recursos estáticos (CSS, JS)
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Cache para navegação offline (SPA)
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Escutar mensagens para atualizações do SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Notificação de atualização disponível
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: '1.0.0' });
  }
});

// Sincronização em background (para quando voltar online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implementar sincronização de dados quando voltar online
  console.log('Sincronização em background executada');
}

// Push notifications (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/logo192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      actions: [
        {
          action: 'view',
          title: 'Visualizar',
        },
        {
          action: 'close',
          title: 'Fechar',
        },
      ],
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'GestCond', options)
    );
  }
});

// Lidar com clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// frontend/src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
}

interface PWAActions {
  installApp: () => Promise<void>;
  refreshApp: () => void;
  dismissInstall: () => void;
}

export const usePWA = (): PWAState & PWAActions => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = isIOS && (navigator as any).standalone;
      
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    checkIfInstalled();

    // Escutar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setInstallPrompt(promptEvent);
      setIsInstallable(true);
    };

    // Escutar quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    // Escutar mudanças de conectividade
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Escutar atualizações do service worker
    const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      setRegistration(registration);
      setHasUpdate(true);
    };

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar se há service worker registrado
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg);
        
        // Verificar se há uma atualização aguardando
        if (reg.waiting) {
          setHasUpdate(true);
        }
        
        // Escutar novas atualizações
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setHasUpdate(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setInstallPrompt(null);
      }
    } catch (error) {
      console.error('Erro ao instalar o app:', error);
    }
  };

  const refreshApp = (): void => {
    if (registration?.waiting) {
      // Enviar mensagem para o service worker para pular a espera
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Recarregar a página
      window.location.reload();
    }
  };

  const dismissInstall = (): void => {
    setIsInstallable(false);
    setInstallPrompt(null);
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    hasUpdate,
    installApp,
    refreshApp,
    dismissInstall,
  };
};