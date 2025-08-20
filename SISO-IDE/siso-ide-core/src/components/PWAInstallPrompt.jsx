import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    setIsInstalled(window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Don't show prompt if already dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed) : 0;
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (!dismissed || (Date.now() - dismissedTime) > oneDayMs) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      console.log('SISO IDE installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or in standalone mode
  if (isInstalled || isStandalone || !showInstallPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 p-4 max-w-sm bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 shadow-lg z-50">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg 
              className="w-6 h-6 text-indigo-600 dark:text-indigo-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
              Install SISO IDE
            </h3>
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
              Get the full app experience! Install SISO IDE for faster access, offline support, and a native app feel.
            </p>
          </div>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="p-1 h-6 w-6 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
          >
            ×
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            size="sm"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Install App
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-800"
          >
            Maybe Later
          </Button>
        </div>
        
        <div className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1">
          <p className="font-medium">Benefits:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-1">
            <li>Faster loading times</li>
            <li>Works offline</li>
            <li>Native app experience</li>
            <li>No browser UI clutter</li>
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;