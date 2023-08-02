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
exports.downloadAndSummarizeAudio = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const path_1 = __importDefault(require("path"));
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const summarize_1 = require("./summarize");
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const outputFilePath = path_1.default.join(__dirname, 'file.mp3');
function downloadAndSummarizeAudio(videoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const info = yield ytdl_core_1.default.getInfo(videoUrl);
            const audioFormat = ytdl_core_1.default.chooseFormat(info.formats, { quality: 'lowestaudio' });
            if (audioFormat) {
                const writeStream = fs_1.default.createWriteStream(outputFilePath);
                yield new Promise((resolve, reject) => {
                    (0, ytdl_core_1.default)(videoUrl, { format: audioFormat }).pipe(writeStream)
                        .on('finish', () => {
                        console.log(`Audio downloaded to ${outputFilePath}`);
                        resolve();
                    })
                        .on('error', (err) => {
                        reject(err);
                    });
                });
                return yield transcribeAudio();
            }
            else {
                console.error('Could not find audio format');
            }
        }
        catch (err) {
            console.error('Error downloading audio:', err);
        }
    });
}
exports.downloadAndSummarizeAudio = downloadAndSummarizeAudio;
function transcribeAudio() {
    return __awaiter(this, void 0, void 0, function* () {
        const openai = new openai_1.OpenAIApi(configuration);
        try {
            const filePath = path_1.default.join(__dirname, 'file.mp3');
            const audioStream = fs_1.default.createReadStream(filePath);
            const resp = yield openai.createTranscription(audioStream, 'whisper-1', undefined, undefined, undefined, undefined, {
                maxBodyLength: 1024 * 1024 * 50,
            });
            const transcriptionText = resp.data.text;
            const transcriptionFilePath = path_1.default.join(__dirname, 'transcription.txt');
            yield fs_1.default.promises.writeFile(transcriptionFilePath, transcriptionText);
            console.log('Transcription written to file:', transcriptionFilePath);
            const summarizedText = yield (0, summarize_1.summarizeAudio)();
            // Delete the existing audio file
            yield fs_1.default.promises.unlink(filePath);
            console.log('Audio file deleted:', filePath);
            return summarizedText;
        }
        catch (error) {
            console.error('Error transcribing audio:', error);
        }
    });
}
