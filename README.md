# QR Code Generation & Scanning System

A full-stack application for generating and scanning QR codes built with React, Node.js, and MongoDB.

## Features
- Generate QR codes from text, URLs, or other data
- Scan QR codes using device camera
- Store and manage generated QR codes
- User authentication
- Responsive design

## Tech Stack
- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- QR Code Library: qrcode.js
- Scanning Library: react-qr-reader

## Project Structure
```
qr-code-system/
├── frontend/          # React frontend
├── backend/           # Node.js backend
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a .env file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000 