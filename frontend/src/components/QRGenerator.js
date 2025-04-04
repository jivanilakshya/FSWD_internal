import React, { useState } from 'react';
import axios from 'axios';

const QRGenerator = () => {
    const [data, setData] = useState('');
    const [title, setTitle] = useState('');
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateQR = async () => {
        try {
            setLoading(true);
            setError('');
            
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login first');
            }

            const response = await axios.post('http://localhost:5000/api/qr/generate', 
                { data, title },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setQrCode(response.data.qrCode.qrCode);
            setError('');
        } catch (err) {
            console.error('QR Generation Error:', err);
            if (err.response) {
                setError(err.response.data.error || 'Failed to generate QR code');
            } else if (err.request) {
                setError('Could not connect to server. Please make sure the backend is running.');
            } else {
                setError(err.message || 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="qr-generator">
            <h2>Generate QR Code</h2>
            <div className="input-group">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="QR Code Title (optional)"
                />
            </div>
            <div className="input-group">
                <input
                    type="text"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder="Enter text or URL"
                />
                <button onClick={generateQR} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate'}
                </button>
            </div>
            {error && <p className="error">{error}</p>}
            {qrCode && (
                <div className="qr-code">
                    <img src={qrCode} alt="Generated QR Code" />
                    <button onClick={() => setQrCode('')}>Clear</button>
                </div>
            )}
        </div>
    );
};

export default QRGenerator; 