# 🚀 EchoMarket Deployment Guide

## **Option 1: Deploy Frontend Only (Netlify)**

Since you're a collaborator, you can deploy the frontend to Netlify while keeping the backend running locally for testing.

### Step 1: Deploy to Netlify

1. Go to [Netlify](https://www.netlify.com/) and sign up/login with GitHub
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your `ECHOMARKET` repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `frontend`
6. Click "Deploy site"

### Step 2: Update API Redirects

After deployment, get your Netlify URL (e.g., `your-site.netlify.app`)

For now, keep using `localhost:5000` for the backend during development.

---

## **Option 2: Full Deployment (Backend + Frontend)**

### **Backend Deployment (Render)**

**Note**: Since you're a collaborator, ask your teammate (repo owner) to deploy the backend OR fork the repo.

#### If Your Teammate Deploys:

1. Go to [Render.com](https://render.com/) and sign up/login
2. Click "New +" → "Web Service"
3. Connect GitHub and select `ECHOMARKET` repository
4. Configure:
   - **Name**: `echomarket-backend`
   - **Region**: Singapore (closest to India)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free

5. Add Environment Variables:
   - Click "Environment" tab
   - Add: `MONGODB_URI` = `mongodb+srv://sahlasalamak:wHwRwv3Cf8S4gE4V@cluster0.5kena9z.mongodb.net/EchoMarket`
   - Add: `NODE_ENV` = `production`

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL (e.g., `https://echomarket-backend.onrender.com`)

#### Update Frontend API Calls:

After backend is deployed, update `frontend/_redirects`:

```
/api/*  https://YOUR-RENDER-URL.onrender.com/api/:splat  200
```

Replace `YOUR-RENDER-URL` with your actual Render URL.

### **Frontend Deployment (Netlify)**

Follow Option 1 steps above.

---

## **Option 3: Alternative - Fork and Deploy**

If you want full control:

1. Fork the `ECHOMARKET` repository to your GitHub account
2. Follow Option 2 steps (you'll be able to deploy to Render yourself)
3. Update the repository link in your fork's settings

---

## **Testing After Deployment**

1. **Test Backend**: Visit `https://your-render-url.onrender.com/` - should see HTML
2. **Test Frontend**: Visit your Netlify URL
3. **Test Login**: Try logging in with existing credentials
4. **Test Features**:
   - Create a listing
   - View listings
   - Send exchange requests
   - Check notifications

---

## **Troubleshooting**

### Images Not Loading
- Make sure your backend is serving static files
- Check image URLs in the database

### API Errors
- Verify `_redirects` file has correct backend URL
- Check backend logs in Render dashboard
- Ensure CORS is enabled in `server.js`

### Database Connection Issues
- Verify MongoDB connection string in Render environment variables
- Check MongoDB Atlas whitelist (allow all IPs: `0.0.0.0/0`)

---

## **Local Development (After Deployment)**

To continue developing locally:

```bash
# Terminal 1: Run backend
cd backend
npm start

# Terminal 2: Open frontend
# Just open http://localhost:5000/search.html in your browser
```

Your local setup will still work with `localhost:5000`!

---

## **Important Notes**

- ⚠️ Free tier on Render: Backend sleeps after 15 min of inactivity
- ⚠️ First request after sleep takes 30-60 seconds
- ✅ Netlify is always fast (CDN-based)
- ✅ Keep your local dev environment intact

---

**Need help?** Check Render/Netlify documentation or ask your teammate!

