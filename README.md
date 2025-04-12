# Twitter Clone

A full-stack Twitter clone built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete tweets
- Like and comment on tweets
- Follow/unfollow users
- User profiles with Cloudinary image uploads
- Timeline feed of tweets from followed users
- Advanced user search functionality
- Real-time notifications system
- Responsive design with Bootstrap

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Context API for state management
- React Bootstrap for UI components
- Axios for API requests

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Cloudinary for image storage

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/twitter-clone.git
cd twitter-clone
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Install frontend dependencies
```
cd ../frontend
npm install
```

4. Create a .env file in the backend directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/twitter-clone
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

5. Start the development servers
```
# In the backend directory
npm run server

# In the frontend directory
npm run dev
```

## API Endpoints

### Auth
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login a user
- GET /api/auth/me - Get current user
- GET /api/auth/logout - Logout user

### Users
- GET /api/users - Get all users
- GET /api/users/:id - Get user by ID
- PUT /api/users/profile - Update user profile
- PUT /api/users/:id/follow - Follow a user
- PUT /api/users/:id/unfollow - Unfollow a user
- GET /api/users/search - Search users
- GET /api/users/:id/followers - Get user's followers
- GET /api/users/:id/following - Get user's following

### Tweets
- POST /api/tweets - Create a tweet
- GET /api/tweets - Get all tweets
- GET /api/tweets/timeline - Get timeline tweets
- GET /api/tweets/user/:id - Get tweets by user ID
- GET /api/tweets/:id - Get tweet by ID
- DELETE /api/tweets/:id - Delete a tweet
- PUT /api/tweets/:id/like - Like a tweet
- PUT /api/tweets/:id/unlike - Unlike a tweet
- POST /api/tweets/:id/comment - Comment on a tweet
- DELETE /api/tweets/:id/comment/:comment_id - Delete a comment

### Notifications
- GET /api/notifications - Get user notifications
- GET /api/notifications/unread-count - Get unread notification count
- PUT /api/notifications/:id/read - Mark notification as read
- PUT /api/notifications/read-all - Mark all notifications as read
- DELETE /api/notifications/:id - Delete a notification
