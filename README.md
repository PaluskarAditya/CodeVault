---

# 🚀 CodeVault – Secure Snippet Locker

**CodeVault** is a modern, secure, and privacy-focused code snippet locker built with the **MERN stack**.
Create and store code snippets with optional password protection and expiry settings. Share them using unique magic links or QR codes — all without needing an account.

---

## 🔗 Live Demo

👉 [https://codevault.vercel.app](https://codevault.vercel.app)

---

## ✨ Features

* 🧾 Create and store code snippets in multiple languages
* 🔒 Optional password protection
* ⏳ Expiry support – snippets self-destruct after set time
* 🔗 Magic share links with QR code generation
* 🖥️ Syntax highlighting with Monaco Editor
* 📱 Mobile-responsive UI
* 🚫 No account required – anonymous and temporary
* ✅ Fully browser-based, fast, and secure

---

## 🛠 Tech Stack

| Layer    | Tech Used                               |
| -------- | --------------------------------------- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Editor   | Monaco Editor                           |
| Backend  | Node.js, Express.js                     |
| Database | MongoDB (Mongoose)                      |
| Security | bcrypt for password hashing             |
| Extras   | NanoID, QRServer API                    |

---

## 📂 Folder Structure

```txt
CodeVault/
├── backend/
│   ├── server.js
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── View.jsx
│   │   ├── components/
│   │   └── main.jsx
│   ├── public/
│   └── vite.config.js
├── vercel.json
├── README.md
└── package.json
```

---

## ⚙️ Setup Instructions

### 🔧 Backend

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file:

   ```env
   MONGO_URI=your_mongo_connection_string
   NODE_PORT=8000
   ```

4. Start the server:

   ```bash
   node server.js
   ```

---

### 🎨 Frontend

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Add `.env`:

   ```env
   VITE_BACKEND_URL=http://localhost:8000
   ```

4. Start the frontend app:

   ```bash
   npm run dev
   ```

---

## ⚙️ Vercel Configuration (Optional)

Add this `vercel.json` in your root if using React Router:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🧠 How It Works

1. User creates a snippet with code + optional passcode + expiry.
2. A magic link and QR code are generated for sharing.
3. Recipient opens the link → unlocks snippet (if protected).
4. Expired snippets automatically return a `410 Gone` status.

---

## 📦 API Endpoints

| Method | Route                  | Description                           |
| ------ | ---------------------- | ------------------------------------- |
| POST   | `/api/create`          | Create or update a snippet            |
| GET    | `/api/snipp`           | Retrieve snippet by UUID (via header) |
| POST   | `/api/verify-password` | Verify password and fetch snippet     |

---

## 🖼️ Screenshots

### 🔐 Protected Snippet Unlock

![Password Modal](https://via.placeholder.com/800x400?text=CodeVault+Password+Unlock)

### 💻 Code Viewer

![Code Viewer](https://via.placeholder.com/800x400?text=CodeVault+Code+Editor)

---

## 💡 Future Ideas

* 💾 Download snippets as `.txt` or `.js`
* 🌓 Dark mode theme
* 🔄 Live countdown to expiry
* 🧪 Auto-delete on first open (burn after read)
* 🧠 Logged-in mode for history (optional)

---

## 🌟 Author

* **Developer:** [@aid3n](https://github.com/PaluskarAditya)
* **GitHub Repo:** [CodeVault](https://github.com/PaluskarAditya)

---

## 💼 License

This project is licensed under the **MIT License** — free to use and modify.

---

> 🔒 Built for privacy. Powered by code. Made with ❤️ by **aid3n**

---
