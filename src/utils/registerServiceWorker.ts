export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Unregister any existing service workers to prevent issues
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      console.log('Service Worker disabled for debugging');
    } catch (error) {
      console.error('Service Worker cleanup failed:', error);
    }
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}