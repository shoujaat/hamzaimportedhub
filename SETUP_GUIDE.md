# Hamza Imported Hub — Complete Setup Guide

Everything you need to go from the ZIP file to a live website.
Read each step fully before doing it.

---

## What you'll have when done

- A live website at a free Netlify URL (e.g. `hamzaimportedhub.netlify.app`)
- Products stored in Supabase (PostgreSQL database)
- Product images stored in Cloudinary
- An admin page (`yoursite.com/admin`) where you add new products
- WhatsApp contact button on every product

---

## STEP 1 — Install the tools on your laptop

You need two programs installed. Do this once.

### 1a. Install Node.js
1. Go to **https://nodejs.org**
2. Download the **LTS** version (the green button)
3. Install it (just click Next through the installer)
4. To check it worked: open a terminal (search "cmd" on Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### 1b. Install VS Code
1. Go to **https://code.visualstudio.com**
2. Download and install it

### 1c. Install Git
1. Go to **https://git-scm.com/downloads**
2. Download and install for your OS

---

## STEP 2 — Set up Supabase (your database)

1. Go to **https://supabase.com** and log in with `hamzaimportedhub@gmail.com`
2. Click **New Project**
   - Name: `hamzaimportedhub`
   - Database password: choose something strong and **save it somewhere**
   - Region: pick the closest (e.g. Singapore or South Asia)
3. Wait about 2 minutes for the project to start
4. Once it's ready, go to **SQL Editor** (left sidebar)
5. Click **New query**
6. Open the file `supabase_schema.sql` from your project folder
7. Copy everything in it and paste it into the SQL editor
8. Click **Run** (green button)
9. You should see "Success. No rows returned"

### Get your Supabase keys
1. In your Supabase project, go to **Settings → API** (left sidebar)
2. You need two values — copy and save them:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`

---

## STEP 3 — Set up Cloudinary (image storage)

1. Go to **https://cloudinary.com** and log in with `hamzaimportedhub@gmail.com`
2. From your dashboard, note your **Cloud name** (top left, e.g. `dxxxxxxx`)
3. Now create an **Upload Preset**:
   - Go to **Settings → Upload** (gear icon top right → Upload tab)
   - Scroll to **Upload presets** → click **Add upload preset**
   - Preset name: `hamzaimportedhub_products` (exact spelling matters)
   - Signing mode: **Unsigned**
   - Click **Save**

---

## STEP 4 — Set up the project on your laptop

1. Unzip the project file you downloaded
2. Open VS Code
3. Go to **File → Open Folder** → select the unzipped `hamzaimportedhub` folder
4. Open the terminal in VS Code: go to **Terminal → New Terminal**
5. In the terminal, type and press Enter:
   ```
   npm install
   ```
   Wait for it to finish (downloads all the code libraries)

### Create your environment file
1. In VS Code, find the file `.env.example` in the file list on the left
2. Right-click it → **Rename** → change the name to `.env`
3. Open `.env` and fill in your values:
   ```
   VITE_SUPABASE_URL=paste_your_supabase_project_url_here
   VITE_SUPABASE_ANON_KEY=paste_your_supabase_anon_key_here
   VITE_CLOUDINARY_CLOUD_NAME=paste_your_cloudinary_cloud_name_here
   VITE_WHATSAPP_NUMBER=923142459992
   ```
4. Save the file (Ctrl+S)

### Test that it works locally
In the terminal, type:
```
npm run dev
```
Open your browser and go to **http://localhost:5173**

You should see your website. It will be empty (no products yet — that's normal).

---

## STEP 5 — Push your code to GitHub

1. Go to **https://github.com** and log in (or create an account)
2. Click the **+** icon top right → **New repository**
   - Name: `hamzaimportedhub`
   - Keep it **Public** (required for free Netlify)
   - Do NOT add README or .gitignore (the project already has one)
   - Click **Create repository**
3. GitHub will show you commands. In your VS Code terminal, type these one by one:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOURUSERNAME/hamzaimportedhub.git
   git push -u origin main
   ```
   Replace `YOURUSERNAME` with your actual GitHub username.

---

## STEP 6 — Deploy to Netlify (make it live)

1. Go to **https://netlify.com** and log in with `hamzaimportedhub@gmail.com`
2. Click **Add new site → Import an existing project**
3. Choose **GitHub** → authorize Netlify to access your account
4. Select the `hamzaimportedhub` repository
5. Build settings (these should auto-fill):
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click **Deploy site**

### Add your environment variables to Netlify
This is important — without this, the live site won't connect to Supabase.

1. In Netlify, go to your site → **Site configuration → Environment variables**
2. Click **Add a variable** and add all four:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name
   - `VITE_WHATSAPP_NUMBER` = `923142459992`
3. After adding all four, go to **Deploys → Trigger deploy → Deploy site**

Your site is now live! Netlify gives you a URL like `https://hamzaimportedhub.netlify.app`

---

## STEP 7 — Add your first product

1. Go to your live site and add `/admin` to the URL:
   `https://yoursite.netlify.app/admin`
2. Fill in:
   - Product name
   - Category (e.g. `Shoes`, `Chromebooks`, `Sports Goods`)
   - Price in PKR
   - Condition (e.g. `Brand New`, `Used - Good`)
   - Description
   - Upload a photo from your phone or laptop
3. Click **Add Product**
4. Go to your home page — the product should appear!

---

## HOW TO ADD MORE PRODUCTS IN THE FUTURE

Every time you want to add a new product:
1. Go to `yoursite.netlify.app/admin`
2. Fill the form and submit

That's it. No coding needed for day-to-day use.

---

## HOW TO UPDATE YOUR CODE IN THE FUTURE

If you ever change the code (e.g. change the site name or colors):
1. Make your changes in VS Code
2. Open terminal and type:
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
3. Netlify will automatically rebuild and update the live site within 1-2 minutes.

---

## COMMON PROBLEMS

**"Module not found" error when running npm run dev**
→ Run `npm install` again in the terminal.

**Products not showing on the live site but working locally**
→ You probably forgot to add the environment variables in Netlify (Step 6).

**Image upload fails on the admin page**
→ Double-check the Cloudinary upload preset name is exactly `hamzaimportedhub_products` and it's set to **Unsigned**.

**WhatsApp button opens wrong number**
→ Check that `VITE_WHATSAPP_NUMBER` in your `.env` is `923142459992` (country code 92, no +).

**Site shows blank page after deploying**
→ Check Netlify's deploy logs for errors. Usually it's a missing environment variable.

---

## YOUR FILE STRUCTURE (for reference)

```
hamzaimportedhub/
├── public/
│   ├── favicon.svg          ← site icon
│   └── placeholder.png      ← fallback image
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       ← top navigation bar
│   │   ├── Footer.jsx       ← bottom footer
│   │   └── ProductCard.jsx  ← the product card with WhatsApp button
│   ├── pages/
│   │   ├── Home.jsx         ← home page
│   │   ├── Shop.jsx         ← all products + filter page
│   │   ├── ProductDetail.jsx← single product page
│   │   └── AdminUpload.jsx  ← your private product upload page
│   ├── lib/
│   │   └── supabase.js      ← database connection
│   ├── App.jsx              ← routing
│   ├── main.jsx             ← entry point
│   └── index.css            ← global styles
├── .env                     ← your secret keys (never share this)
├── .env.example             ← template (safe to share)
├── supabase_schema.sql      ← paste this into Supabase SQL editor
├── netlify.toml             ← Netlify build config
├── vite.config.js           ← Vite build config
└── package.json             ← project dependencies
```

---

*Built for Hamza Imported Hub — Karachi, Pakistan*
