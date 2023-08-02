// Load env variables
import dotenv from 'dotenv';
dotenv.config();

// app.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { downloadAndSummarizeAudio } from './downloadAndSummarizeAudio';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// API endpoint to receive the YouTube URL
app.post('/summarize', async (req: Request, res: Response) => {
    const youtubeUrl = req.body.youtubeUrl;
    if (!youtubeUrl) {
        return res.status(400).json({ error: 'Missing YouTube URL in the request body.' });
    }

    try {
        const summarizedText = await downloadAndSummarizeAudio(youtubeUrl);
        return res.status(200).json(summarizedText);
    } catch (error) {
        console.error('Error processing the request:', error);
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

