# Project Andromeda

Project Andromeda is a browser-based space exploration assistant. You talk to Andromeda, an AI mission control companion, using voice or text to ask questions about astronomy, NASA missions, and the cosmos.

The app combines conversational AI with live NASA data. It can fetch the Astronomy Picture of the Day, surface random NASA imagery, and let you save discoveries to a personal mission log. Chat history and saved missions persist in the browser between sessions.

Built with Vue 3, TypeScript, and Vite on the frontend. Responses are powered by the Gemini API, with NASA and Pipedream integrations for imagery and mission storage.

## Features

- Voice interaction using the browser
- Gemini AI integration
- NASA APOD integration
- Random NASA image discovery
- Mission saving
- English and Spanish support
- Local persistence
- Responsive interface

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Pinia
- Tailwind CSS
- Gemini API
- NASA APOD API
- Web Speech API

## Running locally

1. Clone the repository

```bash
git clone https://github.com/rodrimcab/project-andromeda.git
cd project-andromeda
```

2. Install dependencies

```bash
pnpm install
```

3. Create a `.env` file using `.env.example`

Variables:

- `VITE_GEMINI_API_KEY`
- `VITE_NASA_API_KEY`
- `VITE_REQUESTBIN_URL`

4. Start the development server

```bash
pnpm dev
```

5. Build for production

```bash
pnpm build
```

## Deployment

> https://project-andromeda-theta.vercel.app/

## Notes

- Google Chrome (desktop) is the recommended browser, as Web Speech API support is more consistent than in other browsers.
- Voice recognition and speech synthesis may be limited on Safari, iOS browsers, or in-app browsers due to Web Speech API restrictions.
- A Gemini API key is required for the assistant to respond.
- This project uses the Gemini API free tier. If the daily quota is exceeded, requests may temporarily fail until the quota resets.

## Browser Permissions

Project Andromeda requires microphone access to enable voice interaction. Please allow microphone permissions when prompted by your browser.
