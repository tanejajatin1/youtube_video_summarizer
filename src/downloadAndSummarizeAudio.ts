import ytdl from 'ytdl-core';
import path from 'path';
import { Configuration, OpenAIApi } from 'openai';
import fs from 'fs';
import { summarizeAudio } from './summarize';

interface VideoInfo {
    formats: any[];
}

interface TranscriptionResponse {
    data: {
        text: string;
    };
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const outputFilePath = path.join(__dirname, 'file.mp3');

export async function downloadAndSummarizeAudio(videoUrl: string) {
    try {
        const info: VideoInfo = await ytdl.getInfo(videoUrl);
        const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'lowestaudio' });
        if (audioFormat) {
            const writeStream = fs.createWriteStream(outputFilePath);
            await new Promise<void>((resolve, reject) => {
                ytdl(videoUrl, { format: audioFormat }).pipe(writeStream)
                    .on('finish', () => {
                        console.log(`Audio downloaded to ${outputFilePath}`);
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            });
            return await transcribeAudio();
        } else {
            console.error('Could not find audio format');
        }
    } catch (err) {
        console.error('Error downloading audio:', err);
    }
}

async function transcribeAudio() {
    const openai = new OpenAIApi(configuration);
    try {
        const filePath = path.join(__dirname, 'file.mp3');
        const audioStream: any = fs.createReadStream(filePath);
        const resp: TranscriptionResponse = await openai.createTranscription(
            audioStream,
            'whisper-1',
            undefined,
            undefined,
            undefined,
            undefined,
            {
                maxBodyLength: 1024 * 1024 * 50,
            }
        );
        const transcriptionText = resp.data.text;
        const transcriptionFilePath = path.join(__dirname, 'transcription.txt');
        await fs.promises.writeFile(transcriptionFilePath, transcriptionText);
        console.log('Transcription written to file:', transcriptionFilePath);
        const summarizedText = await summarizeAudio();
        // Delete the existing audio file
        await fs.promises.unlink(filePath);
        console.log('Audio file deleted:', filePath);
        return summarizedText;
    } catch (error) {
        console.error('Error transcribing audio:', error);
    }
}
