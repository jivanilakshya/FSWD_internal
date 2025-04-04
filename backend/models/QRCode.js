const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    data: {
        type: String,
        required: true
    },
    qrCode: {
        type: String,
        required: function() {
            return this.type === 'generated';
        }
    },
    type: {
        type: String,
        enum: ['generated', 'scanned'],
        default: 'generated'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('QRCode', qrCodeSchema); 