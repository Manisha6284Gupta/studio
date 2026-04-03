# Deploying Your CivicConnect Application

This guide will walk you through deploying your Next.js application to **Firebase App Hosting**. This is a more robust, multi-step process to ensure all permissions and secrets are set up correctly.

## Prerequisites

1.  **Node.js**: Make sure you have Node.js (version 18 or later) installed on your machine.
2.  **Firebase CLI**: You'll need the Firebase Command Line Interface. If you don't have it, install it globally by running:
    ```bash
    npm install -g firebase-tools
    ```

## Step 1: Login and Initial Deploy

First, we need to run the deployment process to have Firebase create all the necessary cloud resources for your project, including the special service account we need for secrets.

1.  **Authenticate with Firebase:**
    Log in to your Firebase account using the Firebase CLI:
    ```bash
    firebase login
    ```

2.  **Run the Initial Deploy:**
    Navigate to your project directory and run the deploy command.
    ```bash
    firebase deploy
    ```
    - The CLI will guide you through creating a new "backend". Choose to **create a new backend** and select a region (e.g., `us-central1`).
    - **IMPORTANT:** This first deployment will likely **fail** at the end. This is **expected and perfectly normal!** It will probably show an error about a missing `GEMINI_API_KEY`. The key purpose of this step is to force Firebase to create the service account.

## Step 2: Set Up Environment Variables (Secrets)

Now that the service account exists, we can grant it permission to access secrets and then create those secrets.

1.  **Grant Secret Accessor Role:**
    Run the following command to give the App Hosting service account permission to read the secrets we are about to create. It's best to run these two commands separately.

    **Part 1: Get Your Project Number**
    ```bash
    gcloud projects describe studio-4980755183-3866b --format='value(projectNumber)'
    ```
    Copy the number that it outputs.

    **Part 2: Grant Permissions**
    Now, run the command below, replacing `YOUR_PROJECT_NUMBER_HERE` with the number you just copied.
    ```bash
    gcloud projects add-iam-policy-binding studio-4980755183-3866b --member="serviceAccount:service-YOUR_PROJECT_NUMBER_HERE@gcp-sa-apphosting.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
    ```

2.  **Create the Google Maps API Key Secret:**
    Run this command to create a secret for your Google Maps API key.
    ```bash
    echo -n "YOUR_GOOGLE_MAPS_API_KEY_HERE" | gcloud secrets create next_public_google_maps_api_key --data-file=-
    ```
    (Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual key). If it says the secret already exists, you can ignore the message.

3.  **Create the Gemini API Key Secret:**
    Your application's AI features need a Gemini API key.
    - First, [get a Gemini API key from Google AI Studio](https://makersuite.google.com/app/apikey).
    - Then, run the following command to create the secret:
    ```bash
    echo -n "YOUR_GEMINI_API_KEY_HERE" | gcloud secrets create gemini_api_key --data-file=-
    ```
    (Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini key).

## Step 3: Final Deployment

Now that your backend resources exist, your service account has the right permissions, and your secrets are created, you can run the final deployment.

Run the deploy command again:
```bash
firebase deploy
```

This time, the deployment should complete successfully. The Firebase CLI will provide you with the URL where your application is live.

## Step 4: (Optional) Add a Custom Domain

After deploying, you can point your own domain name (e.g., `www.your-app.com`) to your hosted application.

1.  **Go to Firebase Console:**
    Navigate to the [Firebase Console](https://console.firebase.google.com/) and select your project (`studio-4980755183-3866b`).

2.  **Navigate to App Hosting:**
    In the left-hand menu, go to **Build > App Hosting**. You will see your deployed backend.

3.  **Add Custom Domain:**
    Click on **"Manage"** for your backend, then go to the **"Custom domains"** tab and click the **"Add custom domain"** button.

4.  **Follow the Wizard:**
    *   **Enter Domain:** Type in the domain name you want to use.
    *   **Verify Ownership:** Firebase will provide a **TXT record** to add to your domain's DNS settings. This proves you own the domain.
    *   **Add DNS Records:** Once verified, Firebase will give you one or more **A records** (IP addresses) to add to your domain's DNS settings.

5.  **Wait for Propagation:**
    DNS changes can take some time. Once complete, Firebase will automatically provision a free SSL certificate for your domain.

That's it! Your CivicConnect application is now live.