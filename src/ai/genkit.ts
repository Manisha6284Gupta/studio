import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

if (process.env.NODE_ENV === 'production' && !process.env.GEMINI_API_KEY) {
  throw new Error(
    'FATAL: The GEMINI_API_KEY environment variable is not set. The application cannot start without it. Please add it as a secret in your hosting environment and redeploy.'
  );
}

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
