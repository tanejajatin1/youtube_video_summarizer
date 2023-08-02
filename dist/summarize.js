"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeAudio = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("langchain/llms/openai");
const chains_1 = require("langchain/chains");
const text_splitter_1 = require("langchain/text_splitter");
function summarizeAudio() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const textFile = path_1.default.join(__dirname, 'transcription.txt');
            const text = yield fs_1.default.promises.readFile(textFile, 'utf8');
            const model = new openai_1.OpenAI({ temperature: 0 });
            const textSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({ chunkSize: 1000 });
            const docs = yield textSplitter.createDocuments([text]);
            // This convenience function creates a document chain prompted to summarize a set of documents.
            const chain = (0, chains_1.loadSummarizationChain)(model, { type: 'map_reduce' });
            const res = yield chain.call({
                input_documents: docs,
            });
            return res;
        }
        catch (error) {
            console.error('Error summarizing audio:', error);
            throw error;
        }
    });
}
exports.summarizeAudio = summarizeAudio;
