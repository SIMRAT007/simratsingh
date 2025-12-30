# Admin Panel Setup Guide

This guide will help you set up the Firebase backend for your portfolio admin panel.

## Prerequisites

- A Google account
- Firebase CLI (optional, for deploying rules)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "simrat-portfolio")
4. Disable or enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Go to **Users** tab and click **Add user**
4. Add your admin email and password:
   - Email: `simratadmin@gmail.com` (or your preferred admin email)
   - Password: Your secure password

## Step 3: Create Firestore Database

1. Go to **Firestore Database** in Firebase Console
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred location (closest to your users)
5. Click **Enable**

## Step 4: Set Up Firestore Security Rules

Go to **Firestore Database** → **Rules** and paste the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Admin email - change this to your admin email
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email == 'simratadmin@gmail.com';
    }
    
    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // ==========================================
    // SETTINGS - Site configuration
    // ==========================================
    match /settings/{settingId} {
      // Anyone can read settings (for portfolio display)
      allow read: if true;
      // Only admin can write
      allow write: if isAdmin();
    }
    
    // ==========================================
    // PROJECTS - Portfolio projects
    // ==========================================
    match /projects/{projectId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // BLOGS - Blog posts
    // ==========================================
    match /blogs/{blogId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // SKILLS - Skills and expertise
    // ==========================================
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // EXPERIENCE - Work experience
    // ==========================================
    match /experience/{experienceId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // EDUCATION - Education history
    // ==========================================
    match /education/{educationId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // TESTIMONIALS - Client testimonials
    // ==========================================
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // ACHIEVEMENTS - Certifications & awards
    // ==========================================
    match /achievements/{achievementId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // SERVICES - Freelance services
    // ==========================================
    match /services/{serviceId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // QUOTES - Inspirational quotes
    // ==========================================
    match /quotes/{quoteId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // HOBBIES - Personal hobbies
    // ==========================================
    match /hobbies/{hobbyId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // MUSIC - Music playlist
    // ==========================================
    match /music/{trackId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // ==========================================
    // CONTACT_SUBMISSIONS - Contact form entries
    // ==========================================
    match /contact_submissions/{submissionId} {
      // Anyone can create (submit contact form)
      allow create: if true;
      // Only admin can read and manage
      allow read, update, delete: if isAdmin();
    }
    
    // ==========================================
    // ANALYTICS - Site analytics (optional)
    // ==========================================
    match /analytics/{docId} {
      allow read: if isAdmin();
      allow write: if true; // Allow tracking
    }
    
    // ==========================================
    // DEFAULT - Deny all other access
    // ==========================================
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Click **Publish** to deploy the rules.

## Step 5: Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the configuration object

## Step 6: Set Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin Email (must match the email in Firestore rules)
VITE_ADMIN_EMAIL=simratadmin@gmail.com

# Web3Forms (for contact form)
WEB3FORMS_ACCESS_KEY=your_web3forms_key
WEB3FORMS_API_URL=https://api.web3forms.com/submit
```

### For Vercel Deployment

Add the same environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable with the same values

## Step 7: Initialize Firestore Data

### Option A: Using Firebase Console

Create the initial documents manually:

1. Go to **Firestore Database** → **Data**
2. Create `settings` collection
3. Add `site` document with initial data:

```json
{
  "brandName": "Simrat Singh",
  "tagline": "think. build. grow.",
  "copyrightYear": "2024",
  "copyrightText": "All rights reserved.",
  "email": "simrat@example.com",
  "phone": "+91 9876543210",
  "location": "India",
  "linkedin": "https://linkedin.com/in/simrat",
  "github": "https://github.com/simrat",
  "twitter": "https://twitter.com/simrat",
  "sections": {
    "hero": true,
    "about": true,
    "stats": true,
    "skills": true,
    "projects": true,
    "experience": true,
    "achievements": true,
    "education": true,
    "hobbies": true,
    "testimonials": true,
    "blogs": true,
    "socialMedia": true,
    "services": true,
    "quotes": true,
    "games": true,
    "music": true,
    "weather": true,
    "contact": true
  },
  "tipOfDayEnabled": true,
  "tips": [
    { "id": 1, "text": "Explore my projects section!", "icon": "💡" }
  ],
  "notificationsEnabled": true,
  "notifications": [
    { "id": 1, "title": "Welcome!", "message": "Thanks for visiting.", "icon": "👋", "type": "info", "link": "" }
  ]
}
```

4. Add `about` document:

```json
{
  "title": "Passionate developer crafting",
  "subtitle": "digital experiences",
  "description": "Your about description here...",
  "aboutImage": "",
  "yearsExperience": "5+",
  "projectsCompleted": "50+",
  "happyClients": "30+",
  "highlights": "When I'm not coding..."
}
```

### Option B: Using Admin Panel

1. Run your project locally: `npm run dev`
2. Go to `/admin` and log in
3. Use the admin interface to configure settings

## Firestore Data Structure

```
firestore/
├── settings/
│   ├── site/          # Site-wide settings
│   │   ├── brandName
│   │   ├── tagline
│   │   ├── copyrightYear
│   │   ├── copyrightText
│   │   ├── email
│   │   ├── phone
│   │   ├── location
│   │   ├── linkedin
│   │   ├── github
│   │   ├── twitter
│   │   ├── instagram
│   │   ├── youtube
│   │   ├── sections { hero, about, ... }
│   │   ├── tipOfDayEnabled
│   │   ├── tips []
│   │   ├── notificationsEnabled
│   │   └── notifications []
│   │
│   ├── about/         # About section
│   │   ├── title
│   │   ├── subtitle
│   │   ├── description
│   │   ├── aboutImage
│   │   ├── yearsExperience
│   │   ├── projectsCompleted
│   │   └── happyClients
│   │
│   └── hero/          # Hero section
│       ├── greeting
│       ├── name
│       ├── titles
│       ├── description
│       └── heroImage
│
├── projects/          # Portfolio projects
│   └── {projectId}/
│       ├── title
│       ├── description
│       ├── image
│       ├── technologies []
│       ├── liveUrl
│       └── githubUrl
│
├── blogs/             # Blog posts
│   └── {blogId}/
│       ├── title
│       ├── content
│       ├── excerpt
│       ├── image
│       ├── tags []
│       └── publishedAt
│
├── experience/        # Work experience
│   └── {experienceId}/
│       ├── company
│       ├── position
│       ├── duration
│       ├── description
│       └── logo
│
├── education/         # Education
│   └── {educationId}/
│       ├── institution
│       ├── degree
│       ├── year
│       └── description
│
├── testimonials/      # Client testimonials
│   └── {testimonialId}/
│       ├── name
│       ├── role
│       ├── company
│       ├── content
│       └── image
│
├── skills/            # Skills
│   └── {skillId}/
│       ├── name
│       ├── category
│       └── level
│
├── achievements/      # Certifications
│   └── {achievementId}/
│       ├── title
│       ├── issuer
│       ├── date
│       └── image
│
├── services/          # Services offered
│   └── {serviceId}/
│       ├── title
│       ├── description
│       ├── icon
│       └── price
│
├── quotes/            # Inspirational quotes
│   └── {quoteId}/
│       ├── quote
│       ├── author
│       └── role
│
├── music/             # Music tracks
│   └── {trackId}/
│       ├── title
│       ├── artist
│       ├── cover
│       └── audioUrl
│
└── contact_submissions/   # Contact form submissions
    └── {submissionId}/
        ├── name
        ├── email
        ├── phone
        ├── subject
        ├── message
        └── submittedAt
```

## Security Best Practices

1. **Admin Email Protection**
   - Only the email specified in Firestore rules can access admin features
   - Rate limiting is implemented on login attempts

2. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different Firebase projects for development and production

3. **Security Headers**
   - Added in `vercel.json`:
     - X-Content-Type-Options: nosniff
     - X-Frame-Options: DENY
     - X-XSS-Protection: 1; mode=block
     - Cache-Control: no-store (for admin routes)

4. **Firestore Rules**
   - Public read for portfolio data
   - Write access restricted to admin only
   - Contact form submissions: create by anyone, read by admin only

## Troubleshooting

### White Screen on Admin Page
- Check if all Firebase environment variables are set
- Verify the `.env.local` file is in the project root
- Check browser console for errors

### Cannot Login
- Verify the user exists in Firebase Authentication
- Ensure the email matches `VITE_ADMIN_EMAIL`
- Check if Firebase project is correctly configured

### Settings Not Saving
- Verify Firestore rules are published
- Check if the admin email matches the rules
- Check browser console for permission errors

### Environment Variables Not Loading
- Restart the development server after changing `.env.local`
- Make sure variable names start with `VITE_` for client-side access
- For Vercel, redeploy after adding/changing variables

## Useful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy Firestore rules (requires Firebase CLI)
firebase deploy --only firestore:rules
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Check Firestore rules are correctly published
4. Ensure Firebase Authentication is enabled
