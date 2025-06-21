# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Setting up your Google AI API Key

To use the AI-powered features of this application, you need to provide a Google AI API key.

1.  **Get an API key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to create your free API key.
2.  **Set the environment variable:** Open the `.env` file in the root of this project and replace `"YOUR_API_KEY_HERE"` with the key you just created. Your `.env` file should look like this:

```
GOOGLE_API_KEY="abc...xyz"
```
3. The app will automatically reload with your new key.
