const db = require("../config/db");

// Save a message to the database
exports.saveMessage = (req, res) => {
  const { senderId, recipientId, message } = req.body;
  console.log("Received message to save:", req.body);

  if (!senderId || !recipientId || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'INSERT INTO messages (sender_id, recipient_id, message) VALUES (?, ?, ?)';
  db.query(sql, [senderId, recipientId, message], (err, result) => {
    if (err) {
      console.error('Error saving message:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log('Message saved successfully:', {
      id: result.insertId,
      senderId,
      recipientId,
      message
    });

    res.status(201).json({ message: 'Message saved successfully' });
  });
};

//chat history between logged-in user and recipient
exports.getChatHistory = (req, res) => {
  const senderId = req.user.id;
  const recipientId = req.params.recipientId;

  console.log("Fetching chat history between", senderId, "and", recipientId);

  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required' });
  }

  const sql = `
    SELECT * FROM messages
    WHERE (sender_id = ? AND recipient_id = ?) 
       OR (sender_id = ? AND recipient_id = ?)
    ORDER BY created_at ASC
  `;

  db.query(sql, [senderId, recipientId, recipientId, senderId], (err, results) => {
    if (err) {
      console.error("Error fetching chat history:", err);
      return res.status(500).json({ message: 'Database error' });
    }

    console.log("Chat history fetched:", results);
    res.status(200).json(results);
  });
};
