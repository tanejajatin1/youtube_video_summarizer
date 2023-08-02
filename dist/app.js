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
// Load env variables
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// app.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const downloadAndSummarizeAudio_1 = require("./downloadAndSummarizeAudio");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
// API endpoint to receive the YouTube URL
app.post('/summarize', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const youtubeUrl = req.body.youtubeUrl;
    if (!youtubeUrl) {
        return res.status(400).json({ error: 'Missing YouTube URL in the request body.' });
    }
    try {
        const summarizedText = yield (0, downloadAndSummarizeAudio_1.downloadAndSummarizeAudio)(youtubeUrl);
        return res.status(200).json(summarizedText);
    }
    catch (error) {
        console.error('Error processing the request:', error);
        return res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
}));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
