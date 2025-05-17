
// Initialize Firebase using your config
const firebaseConfig = {
  apiKey: "AIzaSyCRa1qLfVfRvxl2KOvNpocNj7Z2xnuDt9Q",
  authDomain: "bustimingsapp.firebaseapp.com",
  projectId: "bustimingsapp",
  storageBucket: "bustimingsapp.firebasestorage.app",
  messagingSenderId: "201532782611",
  appId: "1:201532782611:web:a57dc47f2613c4afdfa7e6"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    console.log("Firebase persistence error:", err);
  });

// Export database methods
export { db, firebase };
