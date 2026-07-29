importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");
// Initialize the Firebase app in the service worker by passing the generated config
const firebaseConfig = {
    apiKey: 'AIzaSyCJObhkTxv6Yl9N_b5TDMvnRbh4f5igQnc',
    authDomain: 'seetv-133f3.firebaseapp.com',
    projectId: 'seetv-133f3',
    storageBucket: 'seetv-133f3.firebasestorage.app',
    messagingSenderId: '493145993894',
    appId: '1:493145993894:web:de8b44912f25fc33b67a67',
    measurementId: 'G-9ETD7R81D1'
};

firebase.initializeApp(firebaseConfig);
// Retrieve firebase messaging
const messaging = firebase.messaging();
// Variable to check if listener has been added
let messagingListenerAdded = false;
// Handle background messages
if (!messagingListenerAdded) {
    messaging.onBackgroundMessage(function (payload) {
        console.log('Received background message', payload);
        // Check if the notification field exists
        if (!payload?.notification && payload?.data) {
            const notificationTitle = payload?.data?.title || 'Default Title';
            const notificationOptions = {
                body: payload?.data?.body || 'Default Body',
                icon: payload?.data?.icon || '/firebase-logo.png', // Fallback to a default icon
            };
            self.registration.showNotification(notificationTitle, notificationOptions);
        }
    });
    messagingListenerAdded = true; // Set to true to prevent multiple listener additions
}
// Handle notification click event
self.addEventListener('notificationclick', function (event) {
    console.log('Notification clicked', event);
    event.notification.close(); // Close the notification
    // Retrieve the click action from notification data
    const clickAction = event?.action || event?.notification?.data?.link || event?.notification?.data?.FCM_MSG?.data?.link || '/'; // Fallback to homepage
    console.log(clickAction, 'clickActionclickAction');
    // Focus an existing window or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === clickAction && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(clickAction);
            }
        })
    );
});