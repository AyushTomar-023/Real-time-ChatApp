const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");
const path = require("path");
const io = socketIO(server, {
  cors: {
    origin: "http://127.0.0.1:5500", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
});
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

// Routes 
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const userRoutes = require("./routes/user");
app.use("/api/users", userRoutes);

const messageRoutes = require("./routes/messages");
app.use("/api", messageRoutes);

// Socket.IO: User-Socket Mapping 
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register user
  socket.on("registerUser", (userId) => {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    const { senderId, recipientId, message, token } = data;

    try {
      const response = await fetch("http://localhost:5000/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ senderId, recipientId, message })
      });

      const resData = await response.json();

      if (response.ok) {
        const recipientSocketId = userSocketMap[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveMessage", {
            senderId,
            recipientId,
            message,
            created_at: new Date().toISOString()
          });
        }
      } else {
        console.error("Failed to save message:", resData);
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Typing indicator
  socket.on("typing", ({ senderId, recipientId }) => {
    const recipientSocketId = userSocketMap[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("showTyping", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, recipientId }) => {
    const recipientSocketId = userSocketMap[recipientId];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("hideTyping", { senderId });
    }
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

//Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
