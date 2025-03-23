// components/ChatScreen.tsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import Constants from 'expo-constants';

// For text-to-speech playback
import { Audio } from 'expo-av';

// LangChain imports
import { z } from 'zod';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createToolCallingAgent, AgentExecutor } from 'langchain/agents';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Our sub-components
import ChatView from './ChatView';
import NotesListView from './NotesListView';

// --- 1) Define notes data and tools ---
interface NotesData {
  [category: string]: string[];
}

const notesData: NotesData = {};

// Tool: Add a note to a category (creates the category if it doesn't exist)
const addNoteTool = new DynamicStructuredTool({
  name: 'add_note',
  description: 'Add a note to a specific category',
  schema: z.object({
    category: z.string().min(1),
    note: z.string().min(1),
  }),
  func: async ({ category, note }) => {
    try {
      console.log(`Adding note to "${category}"`);
      
      // Create the category if it doesn't exist
      if (!notesData[category]) {
        notesData[category] = [];
      }
      
      // Add the note to the category
      notesData[category].push(note);
      
      return `Added note to ${category}`;
    } catch (error) {
      console.error('Error adding note:', error);
      return 'Error adding note';
    }
  },
});

// Tool: Get all notes
const getNotesTool = new DynamicStructuredTool({
  name: 'get_notes',
  description: 'Get all notes or notes from a specific category',
  schema: z.object({
    category: z.string().optional(),
  }),
  func: async ({ category }) => {
    try {
      if (category) {
        if (!notesData[category]) {
          return `No notes found in category: ${category}`;
        }
        return `Notes in ${category}: ${notesData[category].join(' | ')}`;
      } else {
        const categories = Object.keys(notesData);
        if (categories.length === 0) {
          return 'No notes found.';
        }
        
        let result = 'All notes by category:\n';
        categories.forEach(cat => {
          result += `\n${cat}:\n`;
          notesData[cat].forEach(note => {
            result += `- ${note}\n`;
          });
        });
        return result;
      }
    } catch (error) {
      console.error('Error getting notes:', error);
      return 'Error retrieving notes';
    }
  },
});

const tools = [addNoteTool, getNotesTool];

// --- 2) Define system prompt ---
const systemPrompt = `
You are a helpful assistant that organizes study notes. 

When given a block of text:
1. Identify 3-5 logical categories based on the content
2. Break down the text into individual, meaningful notes
3. Add each note to the appropriate category using the add_note tool
4. When finished, tell the user what categories you created and how many notes are in each

For categorizing:
- Use specific subject-based categories (like "Geometry", "Vectors", "Cell Biology")
- Don't use structural categories (like "Definitions" or "Examples")
- Each note should be a single important fact, concept, or idea

Use the get_notes tool when users ask to see their notes.

Always be clear and helpful in your responses.
`;

const prompt = ChatPromptTemplate.fromMessages([
  ['system', systemPrompt],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
]);

// --- 3) Create the model ---
const GOOGLE_API_KEY = Constants.expoConfig?.extra?.googleApiKey || '';
if (!GOOGLE_API_KEY) {
  console.warn('No Google API key found. Please add GOOGLE_API_KEY to your .env file and restart the app.');
}

const model = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API_KEY,
  model: 'gemini-1.5-flash-latest',
  maxOutputTokens: 2048,
  temperature: 0.2,
});

// Get backend URL from app.config
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || 'http://localhost:3000';
console.log('Using backend URL:', BACKEND_URL);

export default function ChatScreen() {
  const [messages, setMessages] = useState<(HumanMessage | AIMessage)[]>([]);
  const [localNotesData, setLocalNotesData] = useState<NotesData>({});
  const [chatHistory, setChatHistory] = useState<(HumanMessage | AIMessage)[]>([]);
  const agentExecutorRef = useRef<any>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState<boolean>(!GOOGLE_API_KEY);

  // Initialize the agent
  React.useEffect(() => {
    (async () => {
      try {
        if (!GOOGLE_API_KEY) {
          setApiKeyMissing(true);
          return;
        }
        
        const agent = await createToolCallingAgent({
          llm: model,
          prompt,
          tools,
        });

        agentExecutorRef.current = new AgentExecutor({
          agent,
          tools,
          maxIterations: 15,
        });
      } catch (err) {
        console.error('Error creating agent:', err);
      }
    })();
  }, []);

  // Text-to-Speech function
  async function textToSpeech(text: any) {
    try {
      // Ensure text is a string
      const textToProcess = typeof text === 'string' ? text : String(text);
      
      console.log('TTS request:', textToProcess.substring(0, 30) + '...');
      
      // Use appropriate endpoint based on text length
      const isShortText = textToProcess.length < 100;
      const endpoint = isShortText ? '/tts' : '/tts/stream';
      
      // Start the request
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({ text: textToProcess }),
      });
      
      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }
      
      // Get audio data
      const audioData = await response.arrayBuffer();
      
      if (!audioData || audioData.byteLength === 0) {
        throw new Error('Received empty audio data');
      }
      
      // Convert and play audio
      const base64Audio = arrayBufferToBase64(audioData);
      const audioURI = `data:audio/mp3;base64,${base64Audio}`;
      
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: audioURI });
      await soundObject.playAsync();
      
      // Clean up when done
      soundObject.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          soundObject.unloadAsync();
        }
      });
    } catch (error) {
      console.error('TTS error:', error);
      // Don't show alert for TTS errors as they're not critical
    }
  }

  // Helper function to convert ArrayBuffer to base64
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Handle sending messages
  async function handleSend(userInput: string) {
    if (apiKeyMissing) {
      Alert.alert(
        "API Key Missing", 
        "Please add your Google API Key to the .env file and restart the app.",
        [{ text: "OK" }]
      );
      return;
    }
    
    // Add user message to chat
    const userMsg = new HumanMessage(userInput);
    setMessages(prev => [...prev, userMsg]);
    setChatHistory(prev => [...prev, userMsg]);

    try {
      if (!agentExecutorRef.current) {
        throw new Error('Agent not initialized yet');
      }

      // Get response from agent
      const result = await agentExecutorRef.current.invoke({
        input: userInput,
        chat_history: chatHistory,
      });

      // Get response text
      let responseText = '';
      if (typeof result.output === 'string') {
        responseText = result.output;
      } else {
        responseText = JSON.stringify(result.output);
      }

      // Add AI response to chat
      const aiMsg = new AIMessage(responseText);
      setMessages(prev => [...prev, aiMsg]);
      setChatHistory(prev => [...prev, aiMsg]);

      // Update notes display with current data
      setLocalNotesData({...notesData});

      // Read response aloud
      await textToSpeech(responseText);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', String(error));
    }
  }

  return (
    <View style={styles.container}>
      {/* Left side: Chat */}
      <View style={styles.chatContainer}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>Class Notes Assistant</Text>
          <Text style={styles.chatHeaderSubtitle}>Share your notes for automatic organization</Text>
        </View>
        
        {apiKeyMissing ? (
          <View style={styles.apiKeyWarning}>
            <Text style={styles.apiKeyWarningTitle}>⚠️ API Key Missing</Text>
            <Text style={styles.apiKeyWarningText}>
              Please add your Google API Key to the .env file:
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>GOOGLE_API_KEY=your-api-key-here</Text>
            </View>
            <Text style={styles.apiKeyWarningText}>
              Then restart the app to continue.
            </Text>
          </View>
        ) : (
          <ChatView messages={messages} onSend={handleSend} />
        )}
      </View>

      {/* Right side: Notes List */}
      <View style={styles.notesContainer}>
        <NotesListView notesData={localNotesData} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  chatContainer: {
    flex: 3,
    backgroundColor: '#f7f9fc',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: 16,
    backgroundColor: '#4285F4',
    borderBottomWidth: 1,
    borderBottomColor: '#3367d6',
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  notesContainer: {
    flex: 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  apiKeyWarning: {
    padding: 16,
    backgroundColor: '#ffd700',
    borderBottomWidth: 1,
    borderBottomColor: '#ffc700',
  },
  apiKeyWarningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  apiKeyWarningText: {
    fontSize: 12,
    color: 'black',
    marginTop: 4,
  },
  codeBlock: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
  },
  codeText: {
    fontSize: 12,
    color: 'black',
  },
});
