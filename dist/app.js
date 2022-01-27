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
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const tesseract_js_1 = require("tesseract.js");
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = __importDefault(require("fs"));
const TOKEN = '5072086110:AAFM5sDdjIDWSjey9t4ZAtmDsLHX03GxNC4';
const langs = 'rus+eng+ukr+bel+chi_sim+chi_tra+jpn+ara+hin+spa+por+ben';
const bot = new node_telegram_bot_api_1.default(TOKEN, { polling: true });
const worker = (0, tesseract_js_1.createWorker)();
bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, `Распознавание текста c фотографии.\n*Может работать некорректно если изображение без текста!*\nПоддерживаемые языки:\nРусский, Украинский, Белорусский, Английский, Китайский, Испанский, Хинди, Арабский, Бенгальский, Португальский, Японский`, { parse_mode: 'Markdown' });
});
bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, `Отправьте боту картинку и через некоторое время он отправит вам текст с фотографии.\n*Может работать некорректно если изображение без текста!*`, { parse_mode: 'Markdown' });
});
bot.on('photo', msg => {
    if (msg.photo && msg.photo[2]) {
        textFormat(msg.photo[2].file_id, msg.chat.id);
    }
    else {
        bot.sendMessage(msg.chat.id, 'Вы должны отправить фотографию');
    }
});
const TesseractScript = (path, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    yield bot.sendMessage(chatId, 'Происходит считывание текста, пожалуйста подождите...');
    yield fs_1.default.readdir(path, (err, files) => __awaiter(void 0, void 0, void 0, function* () {
        yield console.log(files);
        yield worker.load();
        yield worker.loadLanguage(langs);
        yield worker.initialize(langs);
        const { data: { text } } = yield worker.recognize(`./photo/${chatId}/${files[0]}`);
        yield bot.sendMessage(chatId, text);
        if (text) {
            yield fs_extra_1.default.emptyDir(path, (err) => __awaiter(void 0, void 0, void 0, function* () {
                if (err)
                    return console.log(err);
                yield fs_1.default.rmdir(path, err => {
                    if (err)
                        throw err;
                    console.log('Папка успешно удалена');
                });
            }));
        }
    }));
});
const textFormat = (fileId, chatId) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.mkdir(`./photo/${chatId}`, () => console.log('Wow, thats worked!'));
    yield bot.downloadFile(fileId, `./photo/${chatId}`);
    yield TesseractScript(`./photo/${chatId}`, chatId);
});
//# sourceMappingURL=app.js.map