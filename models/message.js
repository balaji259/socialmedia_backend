const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
        },
        media: {
            type: String, // This will store the URL or base64 string of the media
        },
        mediaType: {
            type: String, // Either "image" or "video"
            enum: ['image', 'video', null], // Restrict to specific types
        },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
