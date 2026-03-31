# 🚀 Real-Time Chat Application
A full-stack real-time chat application built as a final year project.  
The application enables users to communicate instantly with features like authentication, real-time messaging, and typing indicators.
---

## ✨ Features
- 🔐 User Authentication (JWT-based)
- 💬 Real-time messaging using Socket.IO
- 👤 User profile system
- ⌨️ Typing indicator (live)
- 🗂️ MySQL database integration
- 📅 Message timestamps
---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Other
- Socket.IO
- JWT Authentication
---

## 📂 Project Structure
chatapp/
│
├── frontend/
├── backend/
├── database/
│ ├── users.sql
│ └── messages.sql
├── .gitignore
├── package.json
└── README.md
---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
git clone https://github.com/AyushTomar-023/Real-time-ChatApp.git
cd Real-time-ChatApp
---

### 2️⃣ Install dependencies
npm install
---

### 3️⃣ Setup Database
- Create a MySQL database (e.g., `chatapp`)
- Import the SQL files:
  - `database/users.sql`
  - `database/messages.sql`
---

### 4️⃣ Configure Environment Variables
Create a `.env` file in the root:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=chatapp
JWT_SECRET=your_secret_key
---

### 5️⃣ Run the server
npm start  or node server.js
---

## 🔄 How it Works

- REST APIs handle authentication and message storage  
- Socket.IO handles real-time communication between users  
- When a message is sent:
  - It is stored in the database
  - Instantly delivered to the recipient via WebSocket  
---

## 👨‍💻 My Contribution

- Developed backend architecture using Node.js and Express  
- Implemented JWT-based authentication  
- Designed MySQL database schema  
- Integrated Socket.IO for real-time messaging  
- Built typing indicator functionality  
---

## 📄 License
This project is licensed under the MIT License.
