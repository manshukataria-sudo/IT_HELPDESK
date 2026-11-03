# IT Helpdesk Management System

A full-stack IT Helpdesk Management System that allows employees to raise technical support tickets and admins to manage, assign, and resolve them.

## Live Demo

**Frontend:**  
https://users-helpdesk.netlify.app

### Demo Credentials

**Employee**

- Email: `myEmployee@test.com`
- Password: `TestPassword123`

**Admin**

- Email: `admin@helpdesk.com`
- Password: `AdminPassword123`

## Features

- User registration and login
- JWT-based authentication
- Role-based access control
- Create support tickets
- Ticket categories and priorities
- Ticket status workflow
- Admin ticket management
- Assign tickets to admins
- Resolve and close tickets
- Ticket comments
- Ticket statistics dashboard
- File attachments
- Cloudinary for attachments
- Secure attachment downloads

## Tech Stack

### Frontend

- React
- Vite
- React Router
- CSS

### Backend

- Node.js
- Express.js
- REST API
- JWT
- bcrypt
- Multer

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Cloud & Deployment

- Microsoft Azure
- Azure App Service
- Cloudinary
- GitHub Actions

### Security

- JWT Authentication
- Role-Based Authorization
- bcrypt Password Hashing
- Helmet
- CORS

## Project Structure

```text

it-helpdesk/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── server.js
│   │   └── testModels.js
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminPage.css
│   │   │   ├── DashboardPage.css
│   │   │   ├── LoginPage.css
│   │   │   ├── NewTicketPage.css
│   │   │   └── TicketDetailsPage.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── globals.css
│   │   ├── components/
│   │   └── lib/
│   │
│   ├── index.html
│   ├── .env.example
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md

## Architecture

       React Frontend
            ↓
      Express.js REST API
            ↓
        Controllers
            ↓
        Mongoose
            ↓
      MongoDB Atlas

## Ticket Workflow

    Open -> Assigned -> In Progress -> Resolved -> Closed

## Cloudinary Attachment Storage

This keeps file storage separate from application data.

## Local Setup

1. Clone the repository
   git clone <repository-url>
   cd it-helpdesk
2. Backend
   cd backend
   npm install
   npm run dev
3. Frontend

Open another terminal:

    cd frontend
    npm install
    npm run dev

The frontend runs on: http://localhost:5173

The backend runs on: http://localhost:5000

## Environment Variables

### Backend

Create:

backend/.env

Add the required MongoDB, JWT, and Cloudinary environment variables. Create a Cloudinary account and copy its cloud name, API key, and API secret from the Cloudinary dashboard.

Example:

PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret

### Frontend

Create:

frontend/.env.local

Set the API URL used by the React app:

VITE_API_URL=http://localhost:5000/api
