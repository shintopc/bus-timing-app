
# 🚌 Kannur Bus Timing App

**Kannur Bus Timing App** is a simple, Firebase-powered web application to search and manage bus timings across Kannur district. It includes both a **user interface** for searching bus routes and an **admin interface** to manage data like buses, places, and timings.

## 🔍 Features

- 🚏 Search buses by source and destination
- 🕓 View bus departure and arrival timings
- 🔧 Admin panel to add, update, or delete:
  - Bus routes
  - Places
  - Timings
- ☁️ Firebase Firestore for real-time data storage
- 🖥️ No authentication required for admin (for simplicity)

## 🌐 Live Demo

Visit: *(Add Vercel link here if deployed)*

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (Vanilla)
- Firebase Firestore (Database)
- Vercel (Hosting)

## 🔐 Firebase Config

```js
const firebaseConfig = {
  apiKey: "AIzaSyB0culEMPT0hgjdseF_UZFPjY6TXNo82OA",
  authDomain: "kannur-bus-app.firebaseapp.com",
  projectId: "kannur-bus-app",
  storageBucket: "kannur-bus-app.firebasestorage.app",
  messagingSenderId: "460426110636",
  appId: "1:460426110636:web:8ad8d9d1881ffb61dde109"
};
```

> **Note:** You can update this config in `firebase-config.js`.

## 📁 Folder Structure

```
📦 bus-timing-app
 ┣ 📁 admin         # Admin interface to manage data
 ┣ 📁 user          # User interface for bus search
 ┣ 📄 firebase-config.js  # Firebase setup
 ┣ 📄 index.html    # Entry point
 ┣ 📄 README.md     # Project documentation
```

## 🚀 Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/shintopc/bus-timing-app.git
cd bus-timing-app
```

2. **Open in browser** or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

3. **Deploy to Vercel** or your preferred hosting platform.

## ✅ Admin Panel Usage

- Visit `/admin` in the deployed app.
- Add new bus entries, places, and timings using simple forms.
- Data is stored in Firestore in real time.

## 📦 Future Improvements

- Add user authentication to secure admin panel
- Implement filters by bus type or fare
- Improve mobile responsiveness

## 📄 License

This project is licensed under the [MIT License](LICENSE).
