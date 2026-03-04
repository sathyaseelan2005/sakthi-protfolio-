require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

const jwt = require('jsonwebtoken');

// Message Schema
const MessageSchema = new mongoose.Schema({
    token: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', MessageSchema);

// Routes
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Create JWT token containing the message data
        const token = jwt.sign(
            { name, email, message },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '365d' } // Token expires in 1 year (or remove entirely for permanent)
        );

        const newMessage = new Message({
            token,
            description: message
        });

        await newMessage.save();

        res.status(201).json({ success: true, message: 'Message saved securely!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
