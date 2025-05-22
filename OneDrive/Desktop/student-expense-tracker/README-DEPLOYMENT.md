# Student Expense Tracker - Deployment Guide

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Vercel account

## Frontend Deployment to Vercel

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd student-expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Deploy to Vercel**
   - Install Vercel CLI if you haven't already:
     ```bash
     npm install -g vercel
     ```
   - Login to Vercel:
     ```bash
     vercel login
     ```
   - Deploy the application:
     ```bash
     vercel --prod
     ```

5. **Set up environment variables in Vercel**
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add the following environment variable:
     - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend-api.vercel.app`)

## Backend Deployment (Alternative Options)

### Option 1: Deploy to Vercel (Serverless Functions)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Deploy the backend:
   ```bash
   vercel
   ```
3. Set up the required environment variables in the Vercel project settings.

### Option 2: Deploy to Railway.app (Recommended for databases)
1. Push your code to a GitHub repository
2. Go to [Railway.app](https://railway.app/)
3. Create a new project and select "Deploy from GitHub repo"
4. Select your repository and configure the environment variables
5. Deploy

## Environment Variables

### Frontend
- `REACT_APP_API_URL`: The URL of your backend API (e.g., `https://your-backend-api.vercel.app`)

### Backend
- `PORT`: Port number (default: 5001)
- `JWT_SECRET`: Secret key for JWT authentication
- `DATABASE_URL`: Connection string for your database
- `NODE_ENV`: Environment (development/production)

## Troubleshooting

- If you get CORS errors, make sure your backend CORS settings include your frontend URL
- For database connection issues, verify your database URL and credentials
- Check the Vercel deployment logs for specific error messages

## Support

For any issues during deployment, please open an issue in the repository.
