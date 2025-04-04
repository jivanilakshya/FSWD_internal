import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const QRScanner = () => {
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [scanMode, setScanMode] = useState('camera');
    const [uploadedImage, setUploadedImage] = useState(null);
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleScan = (data) => {
        if (data) {
            setResult(data);
            setError('');
        }
    };

    const handleError = (err) => {
        setError(err.message);
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/^image\/(jpeg|png|gif|bmp)$/)) {
            setError('Please upload a valid image file (JPEG, PNG, GIF, or BMP)');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size should be less than 5MB');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const formData = new FormData();
            formData.append('image', file);

            console.log('Sending file to server...');
            const response = await api.post(API_ENDPOINTS.QR.SCAN_FILE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log('Server response:', response.data);

            if (response.data.result) {
                setResult(response.data.result);
                setUploadedImage(URL.createObjectURL(file));
            } else {
                setError('No QR code found in the image');
            }
        } catch (error) {
            console.error('Upload error:', error);
            if (error.response) {
                setError(error.response.data.error || 'Failed to scan QR code');
            } else if (error.request) {
                setError('Cannot connect to server. Please make sure the backend is running.');
            } else {
                setError(error.message || 'Failed to scan QR code');
            }
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setScanMode(scanMode === 'camera' ? 'file' : 'camera');
        setResult('');
        setError('');
        setUploadedImage(null);
    };

    return (
        <div className="qr-scanner">
            <h2>QR Code Scanner</h2>
            <button className="mode-switch" onClick={switchMode}>
                Switch to {scanMode === 'camera' ? 'File Upload' : 'Camera'}
            </button>

            {scanMode === 'camera' ? (
                <div className="camera-container">
                    <QrReader
                        onResult={handleScan}
                        onError={handleError}
                        style={{ width: '100%' }}
                    />
                </div>
            ) : (
                <div className="file-upload-container">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                    />
                    <button 
                        className="upload-button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        {loading ? 'Scanning...' : 'Upload QR Code Image'}
                    </button>
                    {uploadedImage && (
                        <img 
                            src={uploadedImage} 
                            alt="Uploaded QR Code" 
                            className="uploaded-image"
                        />
                    )}
                </div>
            )}

            {error && <p className="error">{error}</p>}
            {result && (
                <div className="result">
                    <h3>Scanned Result:</h3>
                    <p>{result}</p>
                </div>
            )}
        </div>
    );
};

export default QRScanner; 