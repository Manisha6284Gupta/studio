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

Your application requires a Google Maps API key to function correctly. In production, you should not hardcode this key or commit it to your repository. Firebase App Hosting allows you to manage this securely as a secret.

1.  **Grant Secret Accessor Role:**
    The first time you use secrets, you'll need to grant the Secret Manager Secret Accessor role to the App Hosting service agent. Run this command, replacing `studio-4980755183-3866b` with your Firebase Project ID if it's different:
    ```bash
    gcloud projects add-iam-policy-binding studio-4980755183-3866b --member="serviceAccount:service-$(gcloud projects describe studio-4980755183-3866b --format='value(projectNumber)')@gcp-sa-apphosting.iam.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
    ```

2.  **Create the Secret:**
    Create a secret for your Google Maps API key. Run this command and enter your API key when prompted:
    ```bash
    echo -n "YOUR_API_KEY_HERE" | gcloud secrets create next_public_google_maps_api_key --data-file=-
    ```
    (Replace `YOUR_API_KEY_HERE` with your actual key).

3.  **Confirm `apphosting.yaml`:**
    I have already updated your `apphosting.yaml` to tell App Hosting to make this secret available to your app. It now includes the `secretEnvironmentVariables` section:

    ```yaml
    secretEnvironmentVariables:
      - key: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        secret: next_public_google_maps_api_key
    ```

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

That's it! Your CivicConnect application is now hosted and ready to be used.
