const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware'); 

// Save message
router.post('/messages', authMiddleware, messageController.saveMessage);

// Get all messages between two users (chat history)
router.get('/messages/:recipientId', authMiddleware, messageController.getChatHistory);

module.exports = router;
