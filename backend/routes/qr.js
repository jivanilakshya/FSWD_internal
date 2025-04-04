const express = require('express');
const router = express.Router();
const qrcode = require('qrcode');
const QRCode = require('../models/QRCode');
const auth = require('../middleware/auth');
const multer = require('multer');
const jsQR = require('jsqr');
const Jimp = require('jimp');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|bmp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Generate QR code
router.post('/generate', auth, async (req, res) => {
    try {
        const { data, title } = req.body;
        if (!data) {
            return res.status(400).json({ error: 'Data is required' });
        }

        // Generate QR code image
        const qrCodeData = await qrcode.toDataURL(data);

        // Save QR code to database
        const newQRCode = new QRCode({
            user: req.user._id,
            data: data,
            qrCode: qrCodeData,
            title: title || 'Generated QR Code',
            type: 'generated'
        });
        await newQRCode.save();

        res.json({ 
            qrCode: {
                id: newQRCode._id,
                title: newQRCode.title,
                data: newQRCode.data,
                qrCode: newQRCode.qrCode,
                type: newQRCode.type,
                createdAt: newQRCode.createdAt
            }
        });
    } catch (error) {
        console.error('QR Code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Scan QR code from file
router.post('/scan-file', auth, upload.single('image'), async (req, res) => {
    try {
        // Debug logging
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Validate file buffer
        if (!req.file.buffer) {
            return res.status(400).json({ error: 'Invalid file format' });
        }

        // Read the image using Jimp
        console.log('Reading image with Jimp...');
        const image = await Jimp.read(req.file.buffer);
        console.log('Image read successfully');
        
        // Convert to grayscale for better QR code detection
        image.grayscale();
        
        // Get image data in the format jsQR expects
        const imageWidth = image.getWidth();
        const imageHeight = image.getHeight();
        const imageData = new Uint8ClampedArray(4 * imageWidth * imageHeight);
        
        // Convert Jimp image data to format jsQR expects
        let i = 0;
        image.scan(0, 0, imageWidth, imageHeight, function (x, y, idx) {
            imageData[i++] = this.bitmap.data[idx + 0]; // red
            imageData[i++] = this.bitmap.data[idx + 1]; // green
            imageData[i++] = this.bitmap.data[idx + 2]; // blue
            imageData[i++] = this.bitmap.data[idx + 3]; // alpha
        });

        console.log('Attempting to decode QR code...');
        // Decode QR code
        const code = jsQR(imageData, imageWidth, imageHeight);
        
        if (!code) {
            return res.status(400).json({ error: 'No QR code found in image. Please ensure the image contains a clear QR code.' });
        }

        console.log('QR code decoded successfully:', code.data);

        // Save scanned QR code to history
        const newQRCode = new QRCode({
            user: req.user._id,
            data: code.data,
            type: 'scanned',
            title: 'Scanned QR Code'
        });
        await newQRCode.save();

        res.json({ 
            result: code.data,
            qrCode: {
                id: newQRCode._id,
                title: newQRCode.title,
                data: newQRCode.data,
                type: newQRCode.type,
                createdAt: newQRCode.createdAt
            }
        });
    } catch (error) {
        console.error('QR Code scanning error:', error);
        if (error.message.includes('Could not find MIME for Buffer')) {
            return res.status(400).json({ error: 'Invalid image format. Please upload a valid image file.' });
        }
        res.status(500).json({ error: 'Failed to scan QR code. Please try again with a clearer image.' });
    }
});

// Get user's QR codes
router.get('/history', auth, async (req, res) => {
    try {
        const qrCodes = await QRCode.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(qrCodes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch QR codes' });
    }
});

// Delete QR code
router.delete('/:id', auth, async (req, res) => {
    try {
        const qrCode = await QRCode.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!qrCode) {
            return res.status(404).json({ error: 'QR code not found' });
        }

        res.json({ message: 'QR code deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete QR code' });
    }
});

module.exports = router; 