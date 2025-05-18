
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

Visit: *https://bus-timing-app.vercel.app/*

## 🛠️ Tech Stack

- HTML, CSS, JavaScript (Vanilla)
- Firebase Firestore (Database)
- Vercel (Hosting)


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
