import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_4Gbw8jkE-qy87vSL8SpxNLxMvD-QDsk",
  authDomain: "morozovssmbot.firebaseapp.com",
  databaseURL: "https://morozovssmbot-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "morozovssmbot",
  storageBucket: "morozovssmbot.firebasestorage.app",
  messagingSenderId: "561592430954",
  appId: "1:561592430954:web:267a085ef051be622f7513"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('Бот-сервер работает 24/7!');

    try {
        const botId = req.query.botId;
        const type = req.query.type;
        const update = req.body;

        // Если это не текстовое сообщение, игнорируем
        if (!update.message || !botId) return res.status(200).json({ ok: true });

        const chatId = update.message.chat.id;
        const text = update.message.text ? update.message.text.toLowerCase().trim() : '';

        // Скачиваем настройки бота из вашей базы Firebase
        const stateRef = doc(db, 'artifacts', 'morozov-smm-platform', 'public', 'data', 'app_state', 'main');
        const docSnap = await getDoc(stateRef);

        if (!docSnap.exists()) return res.status(200).json({ ok: true });

        const data = docSnap.data();
        const botData = data.bots?.find(b => String(b.id) === String(botId));

        // Если бот удален или на паузе — ничего не делаем
        if (!botData || botData.status !== 'Активний') return res.status(200).json({ ok: true });

        const token = type === 'funnel' ? botData.tokenFunnel : botData.tokenLm;
        if (!token) return res.status(200).json({ ok: true });

        let matched = false;

        // --- ЛОГИКА 1: Проверка Базовой Автоворонки ---
        if (type === 'funnel' && botData.modules?.includes('Автоворонка')) {
            const funnel = botData.moduleConfigs?.['Автоворонка'];
            if (funnel && funnel.trigger && text === funnel.trigger.toLowerCase()) {
                let payload = { chat_id: chatId, text: funnel.steps[0].text || "Успешно" };
                
                // Добавляем веб-ссылки (если есть)
                if (funnel.steps[0].links && funnel.steps[0].links.length > 0) {
                    const validLinks = funnel.steps[0].links.filter(l => l.title && l.url);
                    if (validLinks.length > 0) {
                        payload.reply_markup = { inline_keyboard: validLinks.map(l => ([{ text: l.title, url: l.url }])) };
                    }
                }
                
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                matched = true;
            }
        }

        // --- ЛОГИКА 2: Проверка команд Меню ---
        if (!matched && botData.menu && botData.menu.length > 0) {
            const cmd = botData.menu.find(m => m.command.toLowerCase() === (text.startsWith('/') ? text.substring(1) : text));
            if (cmd) {
                let payload = { chat_id: chatId, text: cmd.message || `Вы выбрали: ${cmd.description}` };
                let endpoint = 'sendMessage';

                // Прикрепляем медиафайлы
                if (cmd.mediaType === 'photo') { endpoint = 'sendPhoto'; payload.photo = cmd.mediaUrl; payload.caption = payload.text; delete payload.text; }
                else if (cmd.mediaType === 'video') { endpoint = 'sendVideo'; payload.video = cmd.mediaUrl; payload.caption = payload.text; delete payload.text; }
                else if (cmd.mediaType === 'document') { endpoint = 'sendDocument'; payload.document = cmd.mediaUrl; payload.caption = payload.text; delete payload.text; }

                // Прикрепляем кнопки-ссылки
                if (cmd.links && cmd.links.length > 0) {
                    const validLinks = cmd.links.filter(l => l.title && l.url);
                    if (validLinks.length > 0) {
                        payload.reply_markup = { inline_keyboard: validLinks.map(l => ([{ text: l.title, url: l.url }])) };
                    }
                }

                await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                matched = true;
            }
        }

        // --- ЛОГИКА 3: Если команда не найдена ---
        if (!matched) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: chatId, text: "Команда не распознана. Воспользуйтесь меню." })
            });
        }

    } catch (error) {
        console.error("Webhook Server Error:", error);
    }

    // Обязательно отдаем Telegram статус 200, иначе он заблокирует бота
    res.status(200).json({ ok: true });
}
