import fs from 'fs';
import path from 'path';
import { OpenAI } from 'langchain/llms/openai';
import { loadSummarizationChain } from 'langchain/chains';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export async function summarizeAudio(): Promise<any> {
    try {
        const textFile = path.join(__dirname, 'transcription.txt');
        const text = await fs.promises.readFile(textFile, 'utf8');
        const model = new OpenAI({ temperature: 0 });
        const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
        const docs = await textSplitter.createDocuments([text]);
        // This convenience function creates a document chain prompted to summarize a set of documents.
        const chain = loadSummarizationChain(model, { type: 'map_reduce' });
        const res = await chain.call({
            input_documents: docs,
        });
        return res;
    } catch (error) {
        console.error('Error summarizing audio:', error);
        throw error;
    }
}
