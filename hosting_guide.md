# Roamify - Full-Stack Free Cloud Hosting Manual

This guide outlines the step-by-step process of deploying the **Roamify Full-Stack Booking Platform** online for free. We utilize three highly reliable cloud hosting solutions:
1. **Database Layer**: **MongoDB Atlas** (Free Shared Cluster) or **Clever Cloud** (Free Sandbox)
2. **Backend API Layer**: **Render** (Free Web Services Tier)
3. **Frontend Client Layer**: **Vercel** (Free Hobby Tier)

---

## Architectural Mapping in Production

```mermaid
graph LR
    subgraph Client [Vercel Deployment]
        A[React SPA] -->|Axios with VITE_API_URL| B[Render API]
    end

    subgraph Server [Render Deployment]
        B -->|pymongo with MONGO_URI| C[MongoDB Atlas / Clever Cloud]
    end

    classDef client fill:#ccfbf1,stroke:#0d9488,stroke-width:2px;
    classDef server fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px;
    classDef db fill:#fef3c7,stroke:#d97706,stroke-width:2px;

    class Client,A client;
    class Server,B server;
    class MongoDB,C db;
```

---

## Phase 1: Deploy a Free Cloud MongoDB Database

You have two excellent, completely free options to host your MongoDB database in the cloud:

### Option A: MongoDB Atlas (Free M0 Shared Tier)
*Note: MongoDB Atlas does have a 100% free tier, but their signup wizard often pushes users toward paid options. Here is how to find the free tier:*

1. **Sign Up**:
   * Navigate to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free developer account.
2. **Access the Creation Panel**:
   * When asked to create your first database, you will see three visual tabs at the top: **Dedicated**, **Serverless**, and **Shared**.
   * Click the **Shared** tab (it contains a green **"M0 FREE"** tag).
3. **Configure the Cluster**:
   * **Provider**: Select **AWS** or **Google Cloud**.
   * **Region**: Choose a region that lists the tag **"Free Tier Available"** (e.g., *N. Virginia (us-east-1)*, *Oregon (us-west-2)*, or *Ireland (eu-west-1)*).
   * **Name**: Keep the default cluster name (e.g., `Cluster0`).
   * Verify the cost at the bottom says **"$0 / Month" (Free Forever)**, then click **"Create"**.
4. **Configure Database Access**:
   * **Database User**: Create a username (e.g., `roamify_admin`) and a secure password.
   * **Network Access**: Add `0.0.0.0/0` (Allow Access from Anywhere) to the IP access list. This is necessary because Render's free tier dynamic IPs change constantly.
5. **Get Your Connection String**:
   * Click **"Connect"** on your dashboard -> Select **"Drivers"** (Python).
   * Copy the connection string, replacing `<password>` with your database user password, and append `tourist_db` right before the `?` query parameters:
     `mongodb+srv://roamify_admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/tourist_db?retryWrites=true&w=majority`

---

### Option B: Clever Cloud (100% Free - No Credit Card Required)
*If MongoDB Atlas is restricted in your region or you want a 1-minute setup that never asks for payment info:*

1. **Create an Account**:
   * Navigate to [clever-cloud.com](https://www.clever-cloud.com/) and register for a free developer account.
2. **Create a MongoDB Add-on**:
   * On your Clever Cloud Console, click **"Create..."** at the top right and select **"An add-on"**.
   * Select **"MongoDB"** from the grid of databases.
   * Select the **"Free Sandbox"** (0.00 €/month) plan.
   * Skip linking it to an application and click **"Create"**.
3. **Get Your Connection String**:
   * Under your new MongoDB add-on dashboard, go to the **"Information"** page.
   * Under the **"Connection URI"** section, copy the connection string. It will look like this:
     `mongodb://uabcde123:p9876543@bcluster-mongodb.services.clever-cloud.com:27017/dbName`
   * That's it! Use this connection URI exactly as is for your `MONGO_URI` variable on Render!

---

## Phase 2: Deploy Flask Backend API to Render (Free Web Service)

Render automatically pulls code from your GitHub repository, configures the environment, and launches the server.

1. **Log in to Render**:
   * Navigate to [render.com](https://render.com/) and sign up using your **GitHub account**.
2. **Create a New Web Service**:
   * Click **"New +"** and choose **"Web Service"**.
   * Link your GitHub account and select your **`Roamify-Tourist-Booking-Platform`** repository.
3. **Configure Build Settings**:
   * **Name**: `roamify-backend-api`
   * **Runtime**: `Python`
   * **Region**: Choose a region closest to your cloud database region.
   * **Branch**: `main`
   * **Root Directory**: `backend` (Important! This points directly to the Flask directory).
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `gunicorn app:app` (Gunicorn is already configured in your requirements file).
4. **Set Up Environment Variables**:
   * Click the **"Environment"** tab on your Render Service configuration panel.
   * Add the following keys:
     * `MONGO_URI`: Your copied MongoDB Atlas or Clever Cloud connection string.
     * `PORT`: `5000`
     * `JWT_SECRET_KEY`: Enter a long random string (e.g., `super-secret-key-prod-987654`).
     * `FLASK_ENV`: `production`
5. **Deploy**:
   * Click **"Create Web Service"**.
   * Render will install dependencies and start serving. Once complete, copy the **live URL** provided at the top of the Render console (e.g., `https://roamify-backend-api.onrender.com`).

> [!WARNING]
> **Render Free Tier Spin-up Delay**: Free Web Services on Render go to sleep after 15 minutes of inactivity. When a new visitor accesses the site, it will take about 50 seconds for the backend service to wake up and respond. This is standard behavior for Render's free tier.

---

## Phase 3: Deploy React Frontend to Vercel (Free Hobby Tier)

Vercel provides blazing-fast global edge hosting for static React builds.

1. **Log in to Vercel**:
   * Navigate to [vercel.com](https://vercel.com/) and sign up using your **GitHub account**.
2. **Import Your Repository**:
   * Click **"Add New"** -> **"Project"**.
   * Select your **`Roamify-Tourist-Booking-Platform`** repository.
3. **Configure Project Settings**:
   * **Framework Preset**: `Vite` (Vercel automatically detects this).
   * **Root Directory**: `frontend` (Important! This points directly to the React codebase).
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. **Set Environment Variables**:
   * Expand the **"Environment Variables"** tab.
   * Add the following key:
     * `VITE_API_URL`: Paste your **Render Live API URL** (including `/api`).
       * **Example**: `https://roamify-backend-api.onrender.com/api`
5. **Deploy**:
   * Click **"Deploy"**.
   * Vercel will bundle your React app and provide you with a production-grade live URL (e.g., `https://roamify-frontend.vercel.app`).

---

## Double-Checking Your Deployments
* Navigate to your Vercel URL.
* Access `/packages` or sign up to verify that Vercel is communicating successfully with your Render Flask API, and that Render is storing transactions safely inside your MongoDB cloud database.
* Enjoy your fully hosted full-stack platform live on the internet!
