# Secure Online Voting System

A full-stack web application for creating and managing secure online polls with anonymous voting and real-time results analysis.

## Features

- Secure user authentication with JWT
- Create and manage polls
- Anonymous voting with encrypted votes
- Real-time poll results with MongoDB aggregation
- Fake vote generation for realistic data
- Modern UI with React and Tailwind CSS

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Crypto-js for vote encryption

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voting-system
JWT_SECRET=your-super-secret-jwt-key
VOTE_ENCRYPTION_KEY=your-vote-encryption-key
NODE_ENV=development
```

### Running the Application

1. Start the backend server
```bash
cd backend
npm run dev
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user

### Polls
- POST `/api/polls` - Create a new poll
- GET `/api/polls` - Get all active polls
- GET `/api/polls/:id` - Get poll details with results
- POST `/api/polls/:id/vote` - Vote on a poll
- PUT `/api/polls/:id/end` - End a poll

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Encrypted votes using AES encryption
- Anonymous voting system
- Protected routes with middleware

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 