import express from 'express';
import OpenAI from 'openai';
import { Readable } from 'stream';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// True streaming implementation using stream_to_file
app.post('/tts/stream', async (req, res) => {
    console.log('TTS streaming request received:', req.body);
    
    try {
        const { text } = req.body;
        
        if (!text) {
            console.log('Missing text parameter');
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`Processing streaming TTS for text: "${text.substring(0, 50)}..."`);

        try {
            // Create a unique temporary file path
            const tempFileName = `temp_audio_${Date.now()}.mp3`;
            const tempFilePath = path.join(__dirname, tempFileName);
            
            // Set headers for streaming
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Transfer-Encoding', 'chunked');
            
            // Create a pass-through stream that will receive data and pass it to both the file and response
            const passThrough = new PassThrough();
            
            // Pipe the pass-through stream to the response
            passThrough.pipe(res);
            
            // Create streaming response from OpenAI
            const response = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text,
                response_format: "mp3",
            });
            
            console.log('OpenAI TTS response received, streaming to client...');
            
            // Create a write stream to the temporary file
            const fileStream = createWriteStream(tempFilePath);
            
            // Get the audio buffer
            const buffer = Buffer.from(await response.arrayBuffer());
            
            // Write the buffer to the pass-through stream in chunks to simulate streaming
            const chunkSize = 2 * 1024; // 2KB chunks (smaller chunks)
            let offset = 0;
            
            function writeNextChunk() {
                if (offset >= buffer.length) {
                    // End the streams when done
                    passThrough.end();
                    fileStream.end();
                    console.log('Audio streaming completed successfully');
                    
                    // Clean up the temporary file after a delay
                    setTimeout(() => {
                        fs.unlink(tempFilePath, (err) => {
                            if (err) console.error('Error deleting temp file:', err);
                            else console.log('Temp file deleted:', tempFilePath);
                        });
                    }, 5000);
                    
                    return;
                }
                
                const chunk = buffer.slice(offset, Math.min(offset + chunkSize, buffer.length));
                passThrough.write(chunk);
                fileStream.write(chunk);
                
                offset += chunkSize;
                
                // Add a smaller delay between chunks for faster streaming
                setTimeout(writeNextChunk, 10); // Reduced from 50ms to 10ms
            }
            
            // Start writing chunks
            writeNextChunk();
            
        } catch (openaiError) {
            console.error("OpenAI API Error:", openaiError);
            return res.status(500).json({ 
                error: 'OpenAI API Error', 
                message: openaiError.message,
                details: openaiError.toString()
            });
        }
    } catch (error) {
        console.error("Error during TTS streaming:", error);
        res.status(500).json({ 
            error: 'Error generating speech', 
            message: error.message,
            stack: error.stack
        });
    }
});

// Regular non-streaming response
app.post('/tts', async (req, res) => {
    console.log('TTS request received:', req.body);
    
    try {
        const { text } = req.body;
        
        if (!text) {
            console.log('Missing text parameter');
            return res.status(400).json({ error: 'Text is required' });
        }

        console.log(`Processing TTS for text: "${text.substring(0, 50)}..."`);

        try {
            // Create response from OpenAI
            const response = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text,
                response_format: "mp3",
            });

            console.log('OpenAI TTS response received');

            // Set headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            res.setHeader('Content-Type', 'audio/mpeg');
            
            // Get the audio buffer
            const buffer = Buffer.from(await response.arrayBuffer());
            
            // Send the buffer directly to the client
            res.send(buffer);
            
            console.log('Audio sent to client successfully');
            
        } catch (openaiError) {
            console.error("OpenAI API Error:", openaiError);
            return res.status(500).json({ 
                error: 'OpenAI API Error', 
                message: openaiError.message,
                details: openaiError.toString()
            });
        }
    } catch (error) {
        console.error("Error during TTS:", error);
        res.status(500).json({ 
            error: 'Error generating speech', 
            message: error.message,
            stack: error.stack
        });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});