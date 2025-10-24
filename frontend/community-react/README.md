# 🌐 Join Community - React Integration

This directory contains the React-based "Join Community" page for EchoMarket.

## 📁 Structure

```
community-react/
├── src/
│   ├── App.jsx          ← **REPLACE THIS with your teammate's component**
│   ├── App.css          ← Component styles
│   ├── main.jsx         ← React entry point (don't modify)
│   └── index.css        ← Global styles
├── public/              ← Static assets (images, etc.)
├── index.html           ← HTML entry point
├── vite.config.js       ← Build configuration
└── package.json         ← Dependencies

```

## 🚀 Getting Started

### 1. Development Mode (Local Testing)

```bash
cd frontend/community-react
npm run dev
```

This will start the React dev server at `http://localhost:3000`

### 2. Build for Production

```bash
cd frontend/community-react
npm run build
```

This creates a production build in `frontend/community-build/`

---

## 🔗 Integration with Main App

### Shared Data
- **User Authentication**: User data is shared via `localStorage`:
  - `localStorage.getItem('username')` - Get logged-in user's name
  - `localStorage.getItem('userId')` - Get user ID

### API Calls
- Use `/api/...` for backend calls (proxy configured)
- Example: `fetch('/api/items')` will route to `http://localhost:5000/api/items`

### Navigation
- **Go to Dashboard**: `window.location.href = '../search.html'`
- **Go to My Listings**: `window.location.href = '../mylisting.html'`

---

## 📝 Merging Your Teammate's Code

### Step 1: Get Their Code
Ask your teammate to share their React components (usually the `src/` folder)

### Step 2: Replace Files
1. **Replace `src/App.jsx`** with their main component
2. **Copy all their components** into `src/` folder
3. **Copy any assets** (images, icons) into `public/` folder
4. **Update styles** if needed

### Step 3: Install Additional Dependencies
If they used extra packages (like Axios, React Router, etc.):

```bash
npm install package-name
```

### Step 4: Test It
```bash
npm run dev
```

---

## 🎯 Example: Using EchoMarket API

```jsx
import { useState, useEffect } from 'react'

function CommunityPage() {
  const [communities, setCommunities] = useState([])
  const userId = localStorage.getItem('userId')

  useEffect(() => {
    // Fetch communities from backend
    fetch('/api/communities')  // Proxied to localhost:5000
      .then(res => res.json())
      .then(data => setCommunities(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div>
      <h1>Join Community</h1>
      {communities.map(community => (
        <div key={community._id}>
          <h3>{community.name}</h3>
          <button>Join</button>
        </div>
      ))}
    </div>
  )
}

export default CommunityPage
```

---

## 🛠️ Troubleshooting

### Issue: Module not found
**Solution**: Make sure all dependencies are installed:
```bash
npm install
```

### Issue: API calls not working
**Solution**: Ensure backend server is running on port 5000:
```bash
cd ../../backend
npm start
```

### Issue: Authentication not working
**Solution**: Make sure you're logged in via the main app first (`index.html`)

---

## 📦 Deployment

When deploying, build the React app first:
```bash
npm run build
```

The built files will be in `frontend/community-build/` - serve these along with your main frontend.

---

## 💡 Tips

1. **Keep it simple**: Don't overcomplicate - it's just one page!
2. **Test locally first**: Always test with `npm run dev` before building
3. **Use the proxy**: For API calls, use `/api/...` paths
4. **Share state via localStorage**: Perfect for this hybrid approach
5. **Match the design**: Try to match the EchoMarket color scheme (#04183a, #2563eb)

---

Need help? Check the placeholder code in `src/App.jsx` for examples!

