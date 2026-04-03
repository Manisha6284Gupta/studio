# Deploying Your CivicConnect Application

This guide will walk you through deploying your Next.js application to **Firebase App Hosting**. Firebase App Hosting is a fully-managed, serverless hosting solution for web apps that provides built-in integration with the Firebase ecosystem.

Your project is already configured for Firebase App Hosting via the `apphosting.yaml` file.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js (version 18 or later) installed on your machine.
2.  **Firebase CLI**: You'll need the Firebase Command Line Interface. If you don't have it, install it globally by running:
    ```bash
    npm install -g firebase-tools
    ```

## Step 1: Set Up Environment Variables (Secrets)

Your application requires API keys to function correctly. In production, you should not hardcode these keys or commit them to your repository. Firebase App Hosting allows you to manage these securely as secrets.

### 1a. Grant Secret Accessor Role

The first time you use secrets, you'll need to grant the Secret Manager Secret Accessor role to the App Hosting service agent.

**Part 1: Get Your Project Number**
Run the following command in your terminal to get your project number. You'll need it for the next part.

```bash
gcloud projects describe studio-4980755183-3866b --format='value(projectNumber)'
```
This will output a long number. **Copy this number.**

**Part 2: Grant Permissions**
Now, run the command below, but be sure to **replace `YOUR_PROJECT_NUMBER_HERE`** with the number you just copied.

```bash
gcloud projects add-iam-policy-binding studio-4980755183-3866b --member="serviceAccount:service-YOUR_PROJECT_NUMBER_HERE@gcp-sa-apphosting.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```
If this is your first time, this will grant the permission. If it says the permission already exists, you can safely ignore the message and continue.

### 1b. Create the Google Maps API Key Secret

Run this command to create a secret for your Google Maps API key. Make sure to replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key inside the quotes.

```bash
echo -n "YOUR_GOOGLE_MAPS_API_KEY_HERE" | gcloud secrets create next_public_google_maps_api_key --data-file=-
```

### 1c. Create the Gemini API Key Secret

Your application's AI features are powered by Google's Gemini models. You need to provide an API key for this service.
- First, [get a Gemini API key from Google AI Studio](https://makersuite.google.com/app/apikey).
- Then, run the following command to create the secret, replacing `YOUR_GEMINI_API_KEY_HERE` with your actual key.

```bash
echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets create gemini_api_key --data-file=-
```

### 1d. Confirm `apphosting.yaml`

I have already updated your `apphosting.yaml` to tell App Hosting to make both of these secrets available to your app.

## Step 2: Authenticate with Firebase

Log in to your Firebase account using the Firebase CLI:

```bash
firebase login
```

This will open a browser window for you to sign in.

## Step 3: Deploy Your Application

Now you are ready to deploy.

1.  **Navigate to your project directory** in your terminal.
2.  Run the deploy command:
    ```bash
    firebase deploy
    ```

The Firebase CLI will build your Next.js application and deploy it to Firebase App Hosting. Once the deployment is complete, it will provide you with the URL where your application is live.

## Step 4: (Optional) Add a Custom Domain

After deploying, you can point your own domain name (e.g., `www.your-app.com`) to your hosted application.

1.  **Go to Firebase Console:**
    Navigate to the [Firebase Console](https://console.firebase.google.com/) and select your project (`studio-4980755183-3866b`).

2.  **Navigate to App Hosting:**
    In the left-hand menu, go to **Build > App Hosting**. You will see your deployed backend.

3.  **Add Custom Domain:**
    Click on **"Manage"** for your backend, then go to the **"Custom domains"** tab and click the **"Add custom domain"** button.

4.  **Follow the Wizard:**
    *   **Enter Domain:** Type in the domain name you want to use (e.g., `www.my-civic-app.com`).
    *   **Verify Ownership:** Firebase will provide you with a **TXT record**. You must add this record to the DNS settings on your domain registrar's website (e.g., Google Domains, GoDaddy, Namecheap). This step proves to Google that you own the domain.
    *   **Add DNS Records:** Once verified, Firebase will give you one or more **A records** (IP addresses). You need to add these records to your domain's DNS settings as well. This points your domain to Firebase's servers.

5.  **Wait for Propagation:**
    DNS changes can take some time to update across the internet (anywhere from a few minutes to 24 hours). Once your domain is correctly pointing to Firebase, Firebase will automatically provision a free SSL certificate for it, so your site will be secure (HTTPS).

That's it! Your CivicConnect application is now hosted and ready to be used with your custom URL.
