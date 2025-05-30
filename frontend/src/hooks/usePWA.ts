// frontend/src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isOffline: boolean;
  hasUpdate: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isOffline: !navigator.onLine,
    hasUpdate: false,
    isInstalled: false,
    installPrompt: null,
  });

  // Detectar se o app já está instalado
  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setState(prev => ({
        ...prev,
        isInstalled: isStandalone || (isIOS && isIOSStandalone),
      }));
    };

    checkIfInstalled();
  }, []);

  // Detectar prompt de instalação
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setState(prev => ({
        ...prev,
        isInstallable: true,
        installPrompt: e,
      }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstallable: false,
        isInstalled: true,
        installPrompt: null,
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detectar status online/offline
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Detectar atualizações do service worker
  useEffect(() => {
    const handleControllerChange = () => {
      setState(prev => ({ ...prev, hasUpdate: true }));
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  // Função para instalar o app
  const installApp = async (): Promise<boolean> => {
    if (!state.installPrompt) return false;

    try {
      await state.installPrompt.prompt();
      const { outcome } = await state.installPrompt.userChoice;
      
      setState(prev => ({
        ...prev,
        isInstallable: false,
        installPrompt: null,
      }));

      return outcome === 'accepted';
    } catch (error) {
      console.error('Erro ao instalar o app:', error);
      return false;
    }
  };

  // Função para recarregar o app (aplicar update)
  const reloadApp = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload();
  };

  // Função para dispensar prompt de instalação
  const dismissInstallPrompt = () => {
    setState(prev => ({
      ...prev,
      isInstallable: false,
      installPrompt: null,
    }));
  };

  // Função para dispensar notificação de update
  const dismissUpdatePrompt = () => {
    setState(prev => ({ ...prev, hasUpdate: false }));
  };

  return {
    ...state,
    installApp,
    reloadApp,
    dismissInstallPrompt,
    dismissUpdatePrompt,
  };
}