// sw.js - Service Worker for FyreX

// Listen for push notifications from the server
self.addEventListener('push', event => {
  const data = event.data.json(); // Assuming the server sends JSON

  const title = data.title || 'FyreX Notification';
  const options = {
    body: data.body,
    icon: './favicon.ico', // Optional: Add a path to your site's icon
    badge: './favicon.ico' // Optional: Icon for the notification bar
  };

  // Show the notification
  event.waitUntil(self.registration.showNotification(title, options));
});
