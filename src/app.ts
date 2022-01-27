import TelegramBot from 'node-telegram-bot-api';
import { createWorker } from 'tesseract.js';
import fsExtra from 'fs-extra';
import fs from 'fs';

const TOKEN = '5072086110:AAFM5sDdjIDWSjey9t4ZAtmDsLHX03GxNC4';
const langs = 'rus+eng+ukr+bel+chi_sim+chi_tra+jpn+ara+hin+spa+por+ben';
const bot = new TelegramBot(TOKEN, {polling: true});
const worker = createWorker();

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, `Распознавание текста c фотографии.\n*Может работать некорректно если изображение без текста!*\nПоддерживаемые языки:\nРусский, Украинский, Белорусский, Английский, Китайский, Испанский, Хинди, Арабский, Бенгальский, Португальский, Японский`, {parse_mode: 'Markdown'});
});

bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, `Отправьте боту картинку и через некоторое время он отправит вам текст с фотографии.\n*Может работать некорректно если изображение без текста!*`, {parse_mode: 'Markdown'});
});

bot.on('photo', msg => {
    if (msg.photo && msg.photo[2]) {
        textFormat(msg.photo[2].file_id, msg.chat.id);
    } else {
        bot.sendMessage(msg.chat.id, 'Вы должны отправить фотографию')
    }
});

const TesseractScript = async (path:string, chatId: number) => {
    await bot.sendMessage(chatId, 'Происходит считывание текста, пожалуйста подождите...');
    await fs.readdir(path, async (err, files) => {
        await console.log(files);
        await worker.load();
        await worker.loadLanguage(langs);
        await worker.initialize(langs);
        const {data: {text}} = await worker.recognize(`./photo/${chatId}/${files[0]}`);
        await bot.sendMessage(chatId, text);
        if (text) {
            await fsExtra.emptyDir(path, async (err) => {
                if (err) return console.log(err);
                await fs.rmdir(path, err => {
                    if(err) throw err;
                    console.log('Папка успешно удалена');
                });
            });
        }
    });
};

const textFormat = async (fileId: string, chatId: number) => {
    await fs.mkdir(`./photo/${chatId}`, () => console.log('Wow, thats worked!'));
    await bot.downloadFile(fileId, `./photo/${chatId}`);
    await TesseractScript(`./photo/${chatId}`, chatId);
};