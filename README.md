# Class Notes Assistant

An AI-powered application that automatically organizes class notes into logical categories.

## Features

- Automatically categorizes blocks of text into logical subject categories
- Breaks down long notes into individual, meaningful pieces
- Organizes notes with a clean, user-friendly interface
- Text-to-speech capabilities for hearing explanations

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Google Gemini API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/class-notes-assistant.git
   cd class-notes-assistant
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   # or with yarn
   yarn install
   
   # Install backend dependencies (if separate)
   cd ../backend
   npm install
   # or with yarn
   yarn install
   ```

3. Set up environment variables:
   - Copy the example environment file:
     ```bash
     cd frontend
     cp .env.example .env
     ```
   - Edit `.env` and add your Google API key:
     ```
     GOOGLE_API_KEY=your-google-api-key-here
     BACKEND_URL=http://localhost:3000
     ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   # or with yarn
   yarn start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm start
   # or with yarn
   yarn start
   ```

3. Follow the instructions in the Expo Developer Tools to run on your preferred platform (Web, iOS, or Android).

## How to Use

1. Paste your class notes into the chat input area.
2. Click "Categorize" to process your notes.
3. The AI will automatically:
   - Create logical categories based on the content
   - Break down the notes into individual points
   - Organize them in the sidebar
4. Browse your categorized notes by clicking on categories in the sidebar.

## Getting a Google API Key

To use this application, you need a Google API key with access to the Gemini API:

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" 
4. Copy the key and add it to your `.env` file

## Development Notes

- The frontend is built with React Native and Expo
- The application uses LangChain.js for AI interactions
- Google's Gemini API provides the language model capabilities
- The backend provides text-to-speech functionality

## License

[MIT License](LICENSE) #   t e s t C o n v o A P I  
 #   n o t e s T e s t  
 