import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

// Helper constants
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const LANGSMITH_TRACING = process.env.LANGSMITH_TRACING === 'true';
const LANGSMITH_ENDPOINT = process.env.LANGSMITH_ENDPOINT || '';
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY || '';
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || '';
const LANGCHAIN_CALLBACKS_BACKGROUND = process.env.LANGCHAIN_CALLBACKS_BACKGROUND === 'true';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

export default ({ config }: ConfigContext): Partial<ExpoConfig> => ({
  ...config,
  extra: {
    googleApiKey: GOOGLE_API_KEY,
    openaiApiKey: OPENAI_API_KEY,
    langsmithApiKey: LANGSMITH_API_KEY,
    langsmithProject: LANGSMITH_PROJECT,
    langsmithEndpoint: LANGSMITH_ENDPOINT,
    langsmithTracing: LANGSMITH_TRACING,
    langchainCallbacksBackground: LANGCHAIN_CALLBACKS_BACKGROUND,
    backendUrl: BACKEND_URL,
    eas: {
      projectId: process.env.EAS_PROJECT_ID || "your-project-id",
    },
  },
});

// Helper functions to get environment variables
export const getGoogleApiKey = () => GOOGLE_API_KEY;
export const getOpenAIApiKey = () => OPENAI_API_KEY;
export const getLangSmithApiKey = () => LANGSMITH_API_KEY;
export const getLangSmithProject = () => LANGSMITH_PROJECT; 