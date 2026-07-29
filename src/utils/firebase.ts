import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, isSupported, MessagePayload, onMessage } from "firebase/messaging";
import { SetStateAction } from "react";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURMENT_ID
};


// Initialize Firebase 
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
    // const analytics = getAnalytics(app);
}
export const getFirebaseMessageToken = async () => {

    let isSupport = await isSupported()
    if (isSupport) {
        const messaging = getMessaging(app);
        try {
            let tokenId = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAP_ID_KEY })
            return { tokenId }
        } catch (error) {
            return { error }
        }
    }
    else {
        return { error: " Notification Not Supported" }
    }
}
export const onMessageListener = (setMessages: React.Dispatch<SetStateAction<Array<MessagePayload>>>) => {
    try {
        if ("serviceWorker" in navigator && typeof window !== "undefined" && "Notification" in window) {
            const fcmmessaging = getMessaging(app);
            const unsubscribe = onMessage(fcmmessaging, (payload) => {
                console.log(payload, 'payload');

                setMessages((messages) => [...messages, payload]);
            });
            return () => unsubscribe();
        }
    } catch (error) {
    }
}

export default app




























// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// import { getMessaging, getToken, isSupported } from "firebase/messaging";

// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional

// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//     measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURMENT_ID
// };

// // Initialize Firebase 
// const app = initializeApp(firebaseConfig);
// if (typeof window !== "undefined") {
//     // const analytics = getAnalytics(app);
// }
// export const getFirebaseMessageToken = async () => {
    
//     let isSupport = await isSupported()
//     if (isSupport) {
//         const messaging = getMessaging(app);
//         try {
//             let tokenId = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAP_ID_KEY })
//             return { tokenId }
//         } catch (error) {
//             return { error }
//         }
//     }
//     else {
//         return { error: " Notification Not Supported" }
//     }
// }
// export default app