import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { 
  Bot, ChevronLeft, ChevronRight, Menu, Home, Layers, BarChart2, 
  CreditCard, BookOpen, Settings, User, Users, Play, 
  Pause, Plus, Search, X, Check, ShieldAlert, Zap, MessageSquare, 
  Database, LogOut, CheckCircle2, ChevronDown, Sparkles, ArrowRight, ArrowLeft, Loader2,
  FileText, Clock, Command, LayoutList, Trash2, ShieldCheck, Edit, Save, TrendingUp,
  Fingerprint, Phone, Mail, CreditCard as CardIcon, Upload, MessageCircle, Sliders, Send,
  Lock, MapPin, Link as LinkIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

// ============================================================================
// 📦 МОДУЛЬ 1: ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ ТА MOCK ДАНІ
// ============================================================================

// --- ІНІЦІАЛІЗАЦІЯ БАЗИ ДАНИХ (FIREBASE / GOOGLE) ---
const firebaseConfig = {
  apiKey: "AIzaSyC_4Gbw8jkE-qy87vSL8SpxNLxMvD-QDsk",
  authDomain: "morozovssmbot.firebaseapp.com",
  databaseURL: "https://morozovssmbot-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "morozovssmbot",
  storageBucket: "morozovssmbot.firebasestorage.app",
  messagingSenderId: "561592430954",
  appId: "1:561592430954:web:267a085ef051be622f7513",
  measurementId: "G-Q9P199WKWP"
};

let app, auth, db, appId;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = 'morozov-smm-platform';
} catch (e) { console.error("Помилка ініціалізації БД:", e); }

// --- КОНФІГИ ТА MOCK ДАНІ ---
const DEFAULT_MODULE_CONFIGS = {
  'Лід-магніт': { 
    flows: [{ id: 'flow_1', trigger: 'аудит', name: 'Воронка Аудит', isActive: true, steps: [
      { id: 'step_1', type: 'message', text: 'Привіт! Хочеш отримати відео-аудит?', delayDays: 0, delayHours: 0, delayMinutes: 0, delaySeconds: 0, mediaType: 'none', mediaUrl: '', buttons: [{ id: 1, title: 'Так, хочу', actionType: 'step', url: '', nextStepId: 'step_2' }, { id: 2, title: 'Ні, дякую', actionType: 'step', url: '', nextStepId: 'step_3' }] },
      { id: 'step_2', type: 'message', text: 'Чудово! Ось PDF-інструкция. Як прочитаєш, напиши мені слово "переглянув".', delayDays: 0, delayHours: 0, delayMinutes: 0, delaySeconds: 0, mediaType: 'document', mediaUrl: 'https://example.com/file.pdf', buttons: [] },
      { id: 'step_3', type: 'message', text: 'Добре, якщо передумаєш — пиши "аудит".', delayDays: 0, delayHours: 0, delayMinutes: 0, delaySeconds: 0, mediaType: 'none', mediaUrl: '', buttons: [] },
      { id: 'step_wait_1', type: 'wait_input', expectedText: 'переглянув', fallbackText: 'Напиши слово "переглянув", щоб отримати відео.', successText: 'Молодець! Тримай бонусне відео.', successMediaType: 'video', successMediaUrl: 'https://example.com/video.mp4' },
      { id: 'step_4', type: 'message', text: 'Як тобі відео? Запишись на дзвінок!', delayDays: 0, delayHours: 0, delayMinutes: 1, delaySeconds: 0, mediaType: 'none', mediaUrl: '', buttons: [{ id: 1, title: 'Мій канал', actionType: 'url', url: 'https://t.me/durov', nextStepId: '' }] }
    ]}]
  },
  'Автоворонка': { trigger: '/start', requireSub: false, channelUrl: '', channelId: '', subCheckText: 'Підпишіться на наш Telegram канал, щоб продовжити:', subErrorText: 'Ви не підписались! Перевірте підписку.', steps: [{ id: 1, delay: '0', delayUnit: 'minutes', goal: 'entry', text: 'Привіт! Ласкаво просимо.', keyword: '', mediaType: 'none', mediaUrl: '', links: [] }] }
};

const DEFAULT_PLANS = {
  Starter: { price: 999, maxBots: 1, maxUsers: '1000', maxFlows: 1, maxModules: 5, allowedModules: ['Автоворонка'], paymentUrl: '', description: 'Ідеально для старту та одного невеликого проєкту.', features: [{ text: '1 Активний бот', included: true }, { text: 'До 1,000 юзерів', included: true }, { text: 'Базова автоворонка', included: true }, { text: 'Багатокрокові ланцюжки', included: false }] },
  Pro: { price: 3499, maxBots: 5, maxUsers: '10000', maxFlows: 5, maxModules: 20, allowedModules: ['Лід-магніт', 'Автоворонка'], paymentUrl: '', description: 'Для експертів та малого бізнесу.\nПотужні розгалужені воронки.', features: [{ text: 'До 5 ботів', included: true }, { text: 'До 10,000 юзерів', included: true }, { text: 'Розумний Лід-магніт (Flow)', included: true }, { text: 'До 20 модулів у воронці', included: true }] },
  Agency: { price: 9999, maxBots: 'Безлімит', maxUsers: 'Безлімит', maxFlows: 20, maxModules: 50, allowedModules: ['Лід-магніт', 'Автоворонка'], paymentUrl: '', description: 'Для агенцій.\nСтворюйте ботів для своїх клієнтів без обмежень.', features: [{ text: 'Безліміт ботів', included: true }, { text: 'До 50 модулів у воронці', included: true }, { text: 'Пріоритетна підтримка', included: true }, { text: 'White-label', included: true }] }
};

const DEFAULT_COMPANY_INFO = { fop: '', edrpou: '', address: '', email: '', tgSupport: '' };

const MOCK_USERS = [
  { id: 'ID0', name: 'Іван (Адмін)', email: 'vanaslinavskij@gmail.com', password: 'admin', role: 'founder', status: '👑 Founder', plan: 'Unlimited', autoRenew: true, refundRequested: false },
  { id: 'ID1', name: 'Стас (Founder)', email: 'stasznam44@gmail.com', password: 'admin', role: 'founder', status: '👑 Founder', plan: 'Unlimited', autoRenew: true, refundRequested: false }
];

const MOCK_BOTS = [
  { id: 1, userId: 'ID0', name: 'Smart Flow Bot', username: 'smart_lead_bot', tokenFunnel: '', tokenLm: '1234:ABC', status: 'Пауза', modules: ['Лід-магніт'], moduleConfigs: DEFAULT_MODULE_CONFIGS, menu: [{command: 'start', description: 'Головне меню', message: 'Оберіть потрібний розділ', mediaType: 'none', mediaUrl: '', links: []}], users: 1250, uniqueUserIds: [], interactions: 5430, currentMonth: new Date().toISOString().slice(0, 7) },
];

const ANALYTICS_DATA_WEEK = [
  { name: 'Пн', users: 40, interactions: 240 }, { name: 'Вт', users: 30, interactions: 139 },
  { name: 'Ср', users: 60, interactions: 580 }, { name: 'Чт', users: 27, interactions: 390 },
  { name: 'Пт', users: 78, interactions: 880 }, { name: 'Сб', users: 23, interactions: 380 },
  { name: 'Нд', users: 94, interactions: 1130 },
];

// ============================================================================
// 📦 МОДУЛЬ 2: СПІЛЬНІ КОМПОНЕНТИ (FOOTER, MODALS, ЮРИДИЧНІ ДОКУМЕНТИ)
// ============================================================================

// --- ПЕРЕИСПОЛЬЗУЕМЫЕ КОМПОНЕНТЫ ---
const AppFooter = ({ modals, info }) => (
  <footer className="w-full bg-[#0A0F1D] border-t border-[#1F2937] mt-auto z-10 shrink-0">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col items-start gap-4">
              {[
                { label: 'Terms of Service', action: modals.terms },
                { label: 'Privacy Policy', action: modals.privacy },
                { label: 'Refund Policy', action: modals.refund },
                { label: 'Public Offer', action: modals.offer },
                { label: 'Telegram API Policy', action: modals.tgapi },
                { label: 'Cookie Policy', action: modals.cookie },
                { label: 'Contacts', action: modals.contacts }
              ].map((link, i) => (
                <button key={i} onClick={link.action} className="text-gray-500/60 hover:text-cyan-400 hover:opacity-100 transition-colors uppercase text-[11px] font-bold tracking-widest text-left">
                  {link.label}
                </button>
              ))}
          </div>
          <div className="flex flex-col items-start md:items-end gap-3 text-sm text-gray-500/80 font-medium">
              <div className="flex items-center gap-2.5"><Mail size={16} className="text-cyan-500/50"/> {info?.email || 'support@morozov.com'}</div>
              <div className="flex items-center gap-2.5"><Send size={16} className="text-cyan-500/50"/> {info?.tgSupport || '@morozov_support'}</div>
          </div>
      </div>
      <div className="w-full border-t border-[#1F2937] bg-[#05080f] py-5 flex justify-center">
          <span className="text-gray-600/40 text-xs font-medium tracking-wider">© 2026 Morozov SMM. Всі права захищені.</span>
      </div>
  </footer>
);

const LegalModal = ({ title, icon: Icon, isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#131B2C] rounded-3xl border border-[#1F2937] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-[#1F2937] flex justify-between items-center bg-[#0B1120] rounded-t-3xl shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Icon size={18} className="text-cyan-400"/> {title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"><X size={18}/></button>
        </div>
        <div className="p-6 overflow-y-auto text-sm text-gray-300 space-y-6 flex-grow custom-scrollbar">{children}</div>
        <div className="px-6 py-4 border-t border-[#1F2937] bg-[#0B1120] flex justify-end rounded-b-3xl shrink-0">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 font-medium shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-105 transition-all">Зрозуміло</button>
        </div>
      </div>
    </div>
  );
};

const LegalSection = ({ title, children }) => (
  <div className="mb-6"><h3 className="text-white font-bold text-base mb-2">{title}</h3><div className="text-gray-300 space-y-2 leading-relaxed text-[13px]">{children}</div></div>
);

const TermsContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="1. Предмет Угоди та Загальні положення">
      <p>1.1. Ця Угода користувача (далі – «Угода») є публічним договором приєднання між Вами (далі – «Користувач») та Адміністрацією платформи MOROZOV SMM.</p>
      <p>1.2. Предметом Угоди є надання Користувачеві доступу до програмного забезпечення (SaaS) для конструювання, налаштування та управління чат-ботами у месенджері Telegram.</p>
      <p>1.3. Реєстрація на Платформі або оплата послуг означає беззастережне та повне прийняття (акцепт) умов цієї Угоди.</p>
    </LegalSection>
    <LegalSection title="2. Реквізити Виконавця">
      <ul className="list-disc pl-5 space-y-1 mt-2 bg-[#0B1120] p-4 rounded-xl border border-[#1F2937]">
        <li>Суб'єкт господарювання: <strong className="text-white">{info?.fop || 'Не вказано'}</strong></li>
        <li>РНОКПП / ЄДРПОУ: <strong className="text-white">{info?.edrpou || 'Не вказано'}</strong></li>
        <li>Юридична адреса: <strong className="text-white">{info?.address || 'Не вказано'}</strong></li>
        <li>Офіційний Email: <strong className="text-cyan-400">{info?.email || 'Не вказано'}</strong></li>
        <li>Служба підтримки: <strong className="text-cyan-400">{info?.tgSupport || 'Не вказано'}</strong></li>
      </ul>
    </LegalSection>
    <LegalSection title="3. Права та Обов'язки Сторін">
      <p>3.1. <b>Користувач зобов'язаний:</b> дотримуватись чинного законодавства та правил Telegram; не використовувати Платформу для розсилки спаму, шахрайства, поширення шкідливого ПЗ або незаконного контенту.</p>
      <p>3.2. <b>Адміністрація має право:</b> призупинити або заблокувати доступ до Платформи без повернення коштів у разі порушення Користувачем пункту 3.1., а також проводити технічні роботи, попередньо повідомивши Користувачів.</p>
    </LegalSection>
    <LegalSection title="4. Обмеження Відповідальності">
      <p>4.1. Сервіс надається на умовах «AS IS» (як є). Адміністрація не гарантує, що Платформа відповідатиме всім очікуванням Користувача або працюватиме безперебійно 100% часу.</p>
      <p>4.2. Адміністрація не несе відповідальності за блокування ботів Користувача з боку адміністрації Telegram, оскільки не контролює алгоритми модерації месенджера.</p>
    </LegalSection>
    <LegalSection title="5. Інтелектуальна Власність">
      <p>5.1. Усі права на програмний код, дизайн, логотипи та алгоритми Платформи належать Адміністрації. Користувачу надається невиключна ліцензія на використання функціоналу.</p>
    </LegalSection>
  </div>
);

const PrivacyContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="1. Загальні принципи">
      <p>1.1. Ця Політика конфіденційності розроблена відповідно до вимог Закону України «Про захист персональних даних» та Загального регламенту про захист даних (GDPR) Європейського Союзу.</p>
      <p>1.2. Використовуючи Платформу, Ви надаєте згоду на обробку ваших персональних даних згідно з цією Політикою.</p>
    </LegalSection>
    <LegalSection title="2. Володілець персональних даних">
      <ul className="list-disc pl-5 space-y-1 mt-2 bg-[#0B1120] p-4 rounded-xl border border-[#1F2937]">
        <li>Суб'єкт господарювання: <strong className="text-white">{info?.fop || 'Не вказано'}</strong></li>
        <li>Контактний Email для запитів щодо даних: <strong className="text-cyan-400">{info?.email || 'Не вказано'}</strong></li>
      </ul>
    </LegalSection>
    <LegalSection title="3. Категорії даних, що збираються">
      <p>3.1. <b>Ідентифікаційні дані:</b> ім'я, адреса електронної пошти, зашифровані паролі.</p>
      <p>3.2. <b>Технічні та аналітичні дані:</b> IP-адреса, тип браузера, дані файлів cookie, логи взаємодії з інтерфейсом Платформи (забезпечується інструментами Firebase/Google Analytics).</p>
      <p>3.3. <b>Дані інтеграцій:</b> токени доступу Telegram API (Bot Token), ідентифікатори чатів (Chat ID), необхідні для забезпечення роботи ваших ботів.</p>
    </LegalSection>
    <LegalSection title="4. Мета обробки та Передача третім особам">
      <p>4.1. Дані обробляються виключно для надання доступу до сервісу SaaS, технічної підтримки, обробки платежів та покращення якості продукту.</p>
      <p>4.2. Платформа не продає дані Користувачів. Ваші дані можуть частково передаватись надійним субпідрядникам (Google Firebase для хостингу та БД, WayForPay для еквайрингу) виключно з метою забезпечення роботи Платформи.</p>
    </LegalSection>
    <LegalSection title="5. Права суб'єкта даних">
      <p>5.1. Ви маєте право: запитувати доступ до своїх даних, вимагати їх виправлення або видалення ("право бути забутим"), обмежувати обробку та відкликати згоду, написавши нам на Email.</p>
    </LegalSection>
  </div>
);

const RefundContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="1. Умови надання цифрових послуг">
      <p>1.1. Послуги Платформи класифікуються як надання доступу до цифрового контенту та програмного забезпечення (SaaS), який не постачається на матеріальному носії.</p>
      <p>1.2. Відповідно до законодавства про захист прав споживачів, надання послуги вважається розпочатим у момент активації підписки або першого використання API-токену.</p>
    </LegalSection>
    <LegalSection title="2. Політика повернення коштів (Refund)">
      <p>2.1. Користувач має право вимагати повне повернення коштів протягом <b>14 календарних днів</b> з моменту оплати <b>ТІЛЬКИ за умови</b>, що він не почав фактично використовувати функціонал Платформи (не створював ботів, не підключав Telegram API).</p>
      <p>2.2. Якщо Користувач активував функціонал і скористався послугами, повернення коштів за поточний розрахунковий період (місяць) <b>не здійснюється</b>, оскільки послуга вважається частково або повністю наданою.</p>
    </LegalSection>
    <LegalSection title="3. Виняткові обставини">
      <p>3.1. Повернення можливе у разі доведеної технічної несправності Платформи (Downtime більше 72 годин поспіль), яка унеможливила використання сервісу з вини Адміністрації.</p>
      <p>3.2. Комісії платіжних систем (WayForPay, еквайринг банків) можуть бути утримані із суми повернення.</p>
    </LegalSection>
    <LegalSection title="4. Процедура ініціації повернення">
      <p>Для оформлення запиту на повернення, надішліть лист із темою "Refund" та деталями транзакції на:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2 text-cyan-400">
        <li>{info?.email || 'support@morozov.com'}</li>
      </ul>
    </LegalSection>
  </div>
);

const OfferContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="1. Загальні положення Публічної Оферти">
      <p>1.1. Цей документ є відкритою пропозицією (Офертою) укласти Договір про надання послуг доступу до програмного забезпечення на викладених нижче умовах.</p>
      <p>1.2. Договір вважається укладеним (акцептованим) з моменту успішної реєстрації Користувача на Платформі та/або оплати обраного тарифного плану.</p>
    </LegalSection>
    <LegalSection title="2. Сторони Договору">
      <ul className="list-disc pl-5 space-y-1 mt-2 bg-[#0B1120] p-4 rounded-xl border border-[#1F2937]">
        <li>Виконавець: <strong className="text-white">{info?.fop || 'Не вказано'}</strong> (ЄДРПОУ: <strong className="text-white">{info?.edrpou || 'Не вказано'}</strong>).</li>
        <li>Користувач (Замовник): Будь-яка фізична або юридична особа, що акцептувала Оферту.</li>
      </ul>
    </LegalSection>
    <LegalSection title="3. Вартість та Порядок розрахунків">
      <p>3.1. Вартість послуг визначається обраним Тарифним планом (Starter, Pro, Agency), актуальні ціни розміщені у розділі "Тарифи" на Платформі.</p>
      <p>3.2. Оплата здійснюється на умовах рекурентних (регулярних) платежів (підписка) або разових платежів через інтегровані платіжні системи. Акцептуючи оферту, Користувач погоджується на автоматичне списання коштів за наступний розрахунковий період, доки підписка не буде скасована у налаштуваннях.</p>
    </LegalSection>
    <LegalSection title="4. Форс-Мажор">
      <p>4.1. Сторони звільняються від відповідальності за невиконання зобов'язань у разі виникнення обставин непереборної сили (війна, стихійні лиха, глобальні збої в інтернет-маршрутизації, блокування з боку Telegram API).</p>
    </LegalSection>
  </div>
);

const TgApiContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="1. Статус інтеграції">
      <p>1.1. MOROZOV SMM є незалежним програмним забезпеченням (Third-party software) і жодним чином не афілійоване, не спонсорується та не підтримується офіційно компанією Telegram FZ-LLC.</p>
      <p>1.2. Платформа використовує офіційний відкритий Telegram Bot API для забезпечення функціоналу.</p>
    </LegalSection>
    <LegalSection title="2. Дотримання правил Telegram">
      <p>2.1. Користувач несе одноосібну юридичну відповідальність за контент, що розсилається його ботами, та взаємодію з підписниками.</p>
      <p>2.2. Користувач зобов'язується суворо дотримуватись <a href="https://core.telegram.org/bots/faq" target="_blank" className="text-cyan-400 hover:underline">Правил використання Telegram API</a>.</p>
    </LegalSection>
    <LegalSection title="3. Категоричні заборони (Anti-Spam)">
      <ul className="list-disc pl-5 space-y-2 mt-2 bg-red-500/10 text-red-300 p-4 rounded-xl border border-red-500/20">
        <li>Масова розсилка спаму (небажаних повідомлень) користувачам.</li>
        <li>Збір персональних даних підписників бота без їхньої явної згоди (фішинг).</li>
        <li>Створення ботів для поширення порнографії, пропаганди насильства, продажу заборонених речовин та зброї.</li>
        <li>Спроби обходу технічних лімітів Telegram API (Rate Limits) через механізми Платформи.</li>
      </ul>
      <p className="mt-3 font-bold text-white">Порушення цих правил призводить до негайного довічного блокування акаунту на Платформі без компенсації.</p>
    </LegalSection>
  </div>
);

const CookiePolicyContent = () => (
  <div className="space-y-4">
    <LegalSection title="1. Що таке файли Cookie?">
      <p>1.1. Cookie — це невеликі текстові файли, які зберігаються у вашому браузері або на пристрої під час відвідування Платформи. Вони дозволяють сайту "запам'ятовувати" ваші дії та налаштування (наприклад, логін, мову) протягом певного часу.</p>
    </LegalSection>
    <LegalSection title="2. Які типи Cookie ми використовуємо?">
      <p>2.1. <b>Технічно необхідні (Essential):</b> Критично важливі для функціонування Платформи. Забезпечують збереження вашої сесії авторизації (Firebase Auth), безпеку та захист від CSRF/XSS атак. Їх неможливо вимкнути.</p>
      <p>2.2. <b>Аналітичні (Analytical):</b> Допомагають нам зрозуміти, як користувачі взаємодіють із сайтом (Google Analytics, Firebase Analytics). Збирають анонімізовані дані про перегляди сторінок та помилки інтерфейсу для покращення Платформи.</p>
      <p>2.3. <b>Маркетингові (Marketing):</b> Використовуються для відстеження ефективності рекламних кампаній та надання релевантних пропозицій (наприклад, ретаргетинг).</p>
    </LegalSection>
    <LegalSection title="3. Управління налаштуваннями">
      <p>3.1. Ви маєте повний контроль над Аналітичними та Маркетинговими файлами cookie. Ви можете змінити свої вподобання у будь-який час через панель «Налаштування Cookie» внизу екрану.</p>
    </LegalSection>
  </div>
);

const ContactsContent = ({ info }) => (
  <div className="space-y-4">
    <LegalSection title="Офіційні контакти">
      <div className="bg-[#0B1120] p-6 rounded-2xl border border-[#1F2937] space-y-4">
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><FileText size={18}/></div>
           <div><p className="text-xs text-gray-500 uppercase font-bold">Організація</p><p className="text-white font-medium">{info?.fop || 'ТОВ / ФОП не вказано'}</p></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400"><Fingerprint size={18}/></div>
           <div><p className="text-xs text-gray-500 uppercase font-bold">РНОКПП / ЄДРПОУ</p><p className="text-white font-medium">{info?.edrpou || 'Не вказано'}</p></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><MapPin size={18}/></div>
           <div><p className="text-xs text-gray-500 uppercase font-bold">Юридична адреса</p><p className="text-white font-medium">{info?.address || 'Не вказано'}</p></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-400"><Mail size={18}/></div>
           <div><p className="text-xs text-gray-500 uppercase font-bold">Електронна пошта</p><a href={`mailto:${info?.email}`} className="text-cyan-400 hover:underline">{info?.email || 'support@domain.com'}</a></div>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-full bg-telegram/10 flex items-center justify-center text-[#0088cc]"><Send size={18}/></div>
           <div><p className="text-xs text-gray-500 uppercase font-bold">Telegram Support</p><a href={`https://t.me/${(info?.tgSupport || '').replace('@', '')}`} target="_blank" className="text-cyan-400 hover:underline">{info?.tgSupport || '@support_bot'}</a></div>
        </div>
      </div>
    </LegalSection>
  </div>
);

// ============================================================================
// 📦 МОДУЛЬ 3: ГОЛОВНИЙ КОМПОНЕНТ ДОДАТКУ ТА СТЕЙТИ
// ============================================================================

// --- MAIN APP COMPONENT ---
export default function App() {
  const [fbReady, setFbReady] = useState(false);
  
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('morozov_users_v53')) || MOCK_USERS);
  const [bots, setBots] = useState(() => JSON.parse(localStorage.getItem('morozov_bots_v53')) || MOCK_BOTS);
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('morozov_currentUser_v53')) || null);
  const [plansConfig, setPlansConfig] = useState(() => JSON.parse(localStorage.getItem('morozov_plans_v53')) || DEFAULT_PLANS);
  const [companyInfo, setCompanyInfo] = useState(() => JSON.parse(localStorage.getItem('morozov_company_info_v53')) || DEFAULT_COMPANY_INFO);
  
  // COOKIES STATE
  const [cookieConsent, setCookieConsent] = useState(() => JSON.parse(localStorage.getItem('morozov_cookie_consent_v53')) || null);
  const [isCookieNoticeOpen, setIsCookieNoticeOpen] = useState(cookieConsent === null); 
  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
  const [cookieTempSettings, setCookieTempSettings] = useState({ analytical: true, marketing: false });

  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null); 
  
  // Modals state
  const [modalsOpen, setModalsOpen] = useState({ terms: false, privacy: false, refund: false, offer: false, tgapi: false, cookie: false, contacts: false });

  const [isAuthPageOpen, setIsAuthPageOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', agreed: false });
  const [authError, setAuthError] = useState('');
  const [settingsForm, setSettingsForm] = useState({ name: '', password: '' });
  const [analyticsSelectedBot, setAnalyticsSelectedBot] = useState('all');

  // Admin & Builder State
  const [adminSubTab, setAdminSubTab] = useState('users');
  const [adminEditingUser, setAdminEditingUser] = useState(null);
  const [adminBotSearch, setAdminBotSearch] = useState('');
  const [adminUserSearch, setAdminUserSearch] = useState('');
  
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingBot, setEditingBot] = useState(null);
  const [builderTab, setBuilderTab] = useState('basic');
  const [builderForm, setBuilderForm] = useState({ name: '', tokenFunnel: '', tokenLm: '', modules: [], moduleConfigs: JSON.parse(JSON.stringify(DEFAULT_MODULE_CONFIGS)), menu: [] });
  const [activeConfigModule, setActiveConfigModule] = useState(null); 
  const [activeFlowId, setActiveFlowId] = useState(null); 
  const [tokenStatusFunnel, setTokenStatusFunnel] = useState('idle'); 
  const [tokenStatusLm, setTokenStatusLm] = useState('idle'); 
  const [verifiedBotData, setVerifiedBotData] = useState(null); 
  const [isSaving, setIsSaving] = useState(false);
  
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [checkoutAgreed, setCheckoutAgreed] = useState(false);
  
  const [previewInput, setPreviewInput] = useState('');
  const [previewChat, setPreviewChat] = useState([]);
  const chatEndRef = useRef(null);

  const runnersRef = useRef({});
  const botsRef = useRef(bots);
  const userSessionsRef = useRef({}); 

  const toggleModal = (modalName, state) => setModalsOpen(prev => ({ ...prev, [modalName]: state }));

  const renderModals = () => (
    <>
      <LegalModal title="Користувацька угода" icon={FileText} isOpen={modalsOpen.terms} onClose={() => toggleModal('terms', false)}><TermsContent info={companyInfo} /></LegalModal>
      <LegalModal title="Політика конфіденційності" icon={ShieldCheck} isOpen={modalsOpen.privacy} onClose={() => toggleModal('privacy', false)}><PrivacyContent info={companyInfo} /></LegalModal>
      <LegalModal title="Політика повернення коштів" icon={CardIcon} isOpen={modalsOpen.refund} onClose={() => toggleModal('refund', false)}><RefundContent info={companyInfo} /></LegalModal>
      <LegalModal title="Публічна оферта" icon={BookOpen} isOpen={modalsOpen.offer} onClose={() => toggleModal('offer', false)}><OfferContent info={companyInfo} /></LegalModal>
      <LegalModal title="Політика використання Telegram API" icon={Bot} isOpen={modalsOpen.tgapi} onClose={() => toggleModal('tgapi', false)}><TgApiContent info={companyInfo} /></LegalModal>
      <LegalModal title="Cookie Policy" icon={Settings} isOpen={modalsOpen.cookie} onClose={() => toggleModal('cookie', false)}><CookiePolicyContent /></LegalModal>
      <LegalModal title="Контакти" icon={Phone} isOpen={modalsOpen.contacts} onClose={() => toggleModal('contacts', false)}><ContactsContent info={companyInfo} /></LegalModal>
    </>
  );

  // ============================================================================
  // 📦 МОДУЛЬ 4: FIREBASE ТА ГЛОБАЛЬНІ ФУНКЦІЇ
  // ============================================================================

  // --- FIREBASE INIT ---
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, user => { if (user) setFbReady(true); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!fbReady || !db) return;
    const loadData = async () => {
        try {
            const stateRef = doc(db, 'artifacts', appId, 'public', 'data', 'app_state', 'main');
            const docSnap = await getDoc(stateRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.users) setUsers(data.users);
                if (data.bots) setBots(data.bots);
                if (data.plansConfig) setPlansConfig(data.plansConfig);
                if (data.companyInfo) setCompanyInfo(data.companyInfo);
            }
        } catch (e) {}
    };
    loadData();
  }, [fbReady]);

  const saveStateToDb = (newState) => {
      if (newState.users) { setUsers(newState.users); localStorage.setItem('morozov_users_v53', JSON.stringify(newState.users)); }
      if (newState.bots) { setBots(newState.bots); localStorage.setItem('morozov_bots_v53', JSON.stringify(newState.bots)); }
      if (newState.plansConfig) { setPlansConfig(newState.plansConfig); localStorage.setItem('morozov_plans_v53', JSON.stringify(newState.plansConfig)); }
      if (newState.companyInfo) { setCompanyInfo(newState.companyInfo); localStorage.setItem('morozov_company_info_v53', JSON.stringify(newState.companyInfo)); }
      if (newState.currentUser !== undefined) { setCurrentUser(newState.currentUser); localStorage.setItem('morozov_currentUser_v53', JSON.stringify(newState.currentUser)); }
      
      if (fbReady && db) {
          const pushData = {};
          if (newState.users) pushData.users = newState.users;
          if (newState.bots) pushData.bots = newState.bots;
          if (newState.plansConfig) pushData.plansConfig = newState.plansConfig;
          if (newState.companyInfo) pushData.companyInfo = newState.companyInfo;
          if (Object.keys(pushData).length > 0) setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'app_state', 'main'), pushData, { merge: true }).catch(()=>{});
      }
  };

  useEffect(() => { botsRef.current = bots; }, [bots]);
  useEffect(() => { if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [previewChat, isBuilderOpen, builderTab, activeConfigModule]);
  useEffect(() => {
      if (activeConfigModule === 'Лід-магніт') {
          const flows = builderForm.moduleConfigs['Лід-магніт']?.flows || [];
          if (flows.length > 0 && (!activeFlowId || !flows.find(f => f.id === activeFlowId))) setActiveFlowId(flows[0].id);
      }
  }, [activeConfigModule, builderForm, activeFlowId]);

  useEffect(() => { localStorage.setItem('morozov_cookie_consent_v53', JSON.stringify(cookieConsent)); }, [cookieConsent]);

  const getPlanLimitForUser = (user, limitField) => {
    if (!user) return 0;
    if (user.role === 'founder') return Infinity;
    const val = plansConfig[user.plan]?.[limitField];
    if (val === 'Безліміт' || val === 'Unlimited' || val === '' || val === undefined || String(val).toLowerCase() === 'unlimited') return Infinity;
    return parseInt(String(val).replace(/\D/g, '')) || 0;
  };
  const isModuleAllowed = (planKey, moduleName) => currentUser?.role === 'founder' || (plansConfig[planKey]?.allowedModules?.includes(moduleName) || false);

  const sendAdminNotification = async (user, plan) => {
      const token = '7516617748:AAGdCy8xf2C4xF2UUKMjnRQvskFIcWkfhE8';
      const chatId = '863728460';
      const text = `💰 <b>Нова покупка на платформі!</b>\n\n👤 <b>Користувач:</b> ${user.name}\n📧 <b>Email:</b> ${user.email}\n💳 <b>Придбано тариф:</b> ${plan}`;
      try { await fetch(`https://api.telegram.org/bot${token}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }) }); } catch (e) {}
  };

  // ============================================================================
  // 📦 МОДУЛЬ 5: ДВИЖОК TELEGRAM БОТІВ
  // ============================================================================

  // Вимикаємо локальний браузерний Polling, оскільки тепер працюємо через Webhooks на сервері Vercel
  useEffect(() => { return () => { Object.values(runnersRef.current).forEach(r => r.abortController?.abort()); }; }, []);

  const pollTelegramUpdates = async (botId, runnerId, token) => {
    const runner = runnersRef.current[runnerId];
    if (!runner || !runner.isRunning) return;
    const botData = botsRef.current.find(b => b.id === botId);
    if (!botData) return;
    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=${runner.lastUpdateId + 1}&allowed_updates=["message", "callback_query"]&timeout=20`, { signal: runner.abortController.signal });
        const data = await res.json();
        if (data.ok && data.result.length > 0) {
            for (const update of data.result) {
                runner.lastUpdateId = update.update_id;
                await processTelegramMessage(botId, update, runner.type, token);
            }
        }
    } catch (err) { if (err.name !== 'AbortError') await new Promise(r => setTimeout(r, 2000)); }
    if (runnersRef.current[runnerId] && runnersRef.current[runnerId].isRunning) pollTelegramUpdates(botId, runnerId, token); 
  };

  const sendTelegramAPI = async (token, chatId, payload) => {
      try {
          await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, action: 'typing' }) });
          await new Promise(r => setTimeout(r, 400));
          let endpoint = 'sendMessage';
          const isBlob = (url) => url && url.startsWith('blob:');
          if (payload.photo && !payload.text) { if (isBlob(payload.photo)) { payload.text = (payload.caption || '') + '\n\n[Медіа приховано]'; delete payload.photo; delete payload.caption; } else endpoint = 'sendPhoto'; }
          if (payload.video) { if (isBlob(payload.video)) { payload.text = (payload.caption || '') + '\n\n[Відео приховано]'; delete payload.video; delete payload.caption; endpoint = 'sendMessage'; } else endpoint = 'sendVideo'; }
          if (payload.document) { if (isBlob(payload.document)) { payload.text = (payload.caption || '') + '\n\n[Файл приховано]'; delete payload.document; delete payload.caption; endpoint = 'sendMessage'; } else endpoint = 'sendDocument'; }
          await fetch(`https://api.telegram.org/bot${token}/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } catch (e) {}
  };

  const executeStep = async (botData, chatId, flowId, stepId, tokenStr, isSimulator = false) => {
      const lmConfig = botData.moduleConfigs ? botData.moduleConfigs['Лід-магніт'] : botData.builderFormConfigs['Лід-магніт'];
      if (!lmConfig) return;
      const flow = lmConfig.flows.find(f => f.id === flowId);
      if (!flow) return;
      const steps = flow.steps || [];
      const stepIndex = steps.findIndex(s => s.id === stepId);
      const step = steps[stepIndex];
      if (!step) {
          if (!isSimulator) userSessionsRef.current[botData.id][chatId].activeModule = null;
          else userSessionsRef.current['simulator'].activeModule = null;
          return;
      }
      if (!isSimulator) { userSessionsRef.current[botData.id][chatId].currentLmStepId = step.id; userSessionsRef.current[botData.id][chatId].currentFlowId = flowId; } 
      else { userSessionsRef.current['simulator'].currentLmStepId = step.id; userSessionsRef.current['simulator'].currentFlowId = flowId; }

      const getNextStep = () => steps[stepIndex + 1];
      
      if (step.type === 'message') {
          const ms = isSimulator ? 1500 : ((step.delayDays || 0) * 86400 + (step.delayHours || 0) * 3600 + (step.delayMinutes || 0) * 60 + (step.delaySeconds || 0)) * 1000;
          const executeMsg = async () => {
              let payload = { chat_id: chatId, text: step.text || 'Без тексту' };
              if (step.mediaType && step.mediaType !== 'none' && step.mediaUrl) { payload[step.mediaType] = step.mediaUrl; payload.caption = step.text; delete payload.text; }
              if (step.buttons && step.buttons.length > 0) {
                 payload.reply_markup = { inline_keyboard: step.buttons.map(b => b.actionType === 'url' ? [{ text: b.title, url: b.url }] : [{ text: b.title, callback_data: `goto_${flowId}_${b.nextStepId}` }]) };
              }
              if (isSimulator) { setPreviewChat(prev => [...prev, { sender: 'bot', text: step.text, mediaType: step.mediaType, mediaUrl: step.mediaUrl, buttons: step.buttons, currentFlowId: flowId }]); } 
              else { await sendTelegramAPI(tokenStr, chatId, payload); }

              if (!step.buttons?.some(b => b.actionType === 'step')) {
                  const nextStep = getNextStep();
                  if (nextStep) {
                      if (nextStep.type === 'wait_input') {
                          if (!isSimulator) userSessionsRef.current[botData.id][chatId].currentLmStepId = nextStep.id;
                          else userSessionsRef.current['simulator'].currentLmStepId = nextStep.id;
                      } else { await executeStep(botData, chatId, flowId, nextStep.id, tokenStr, isSimulator); }
                  } else {
                      if (!isSimulator) { 
                          const newBots = bots.map(b => b.id === botData.id ? { ...b, interactions: (b.interactions || 0) + 1 } : b);
                          saveStateToDb({ bots: newBots });
                          userSessionsRef.current[botData.id][chatId].activeModule = null; 
                      } else { userSessionsRef.current['simulator'].activeModule = null; }
                  }
              }
          };
          if (ms > 0) setTimeout(() => { if (isSimulator || (runnersRef.current[`${botData.id}_lm`] && runnersRef.current[`${botData.id}_lm`].isRunning)) executeMsg(); }, ms);
          else await executeMsg();
          return; 
      }
      
      if (step.type === 'check_sub') {
          const ms = isSimulator ? 1500 : ((step.delayDays || 0) * 86400 + (step.delayHours || 0) * 3600 + (step.delayMinutes || 0) * 60 + (step.delaySeconds || 0)) * 1000;
          const executeCheck = async () => {
             let payload = { chat_id: chatId, text: step.text || 'Підпишіться на канал' };
             if (step.mediaType && step.mediaType !== 'none' && step.mediaUrl) { payload[step.mediaType] = step.mediaUrl; payload.caption = step.text; delete payload.text; }
             
             const buttons = [
                 [{ text: '📢 Підписатися', url: step.channelUrl || 'https://t.me/' }],
                 [{ text: '✅ Перевірити підписку', callback_data: `checksub_${flowId}_${step.id}` }]
             ];
             payload.reply_markup = { inline_keyboard: buttons };

             if (isSimulator) {
                 setPreviewChat(prev => [...prev, { sender: 'bot', text: step.text, mediaType: step.mediaType, mediaUrl: step.mediaUrl, buttons: [{id: 'sub', title: '📢 Підписатися', actionType: 'url', url: step.channelUrl}, {id: 'chk', title: '✅ Перевірити підписку', actionType: 'check_sub_sim', nextStepId: step.nextStepId, fallbackText: step.fallbackText}], currentFlowId: flowId }]);
             } else {
                 await sendTelegramAPI(tokenStr, chatId, payload);
             }
          };
          if (ms > 0) setTimeout(() => { if (isSimulator || (runnersRef.current[`${botData.id}_lm`] && runnersRef.current[`${botData.id}_lm`].isRunning)) executeCheck(); }, ms);
          else await executeCheck();
          return;
      }
      
      if (step.type === 'wait_input') return; 
  };

  const processTelegramMessage = async (botId, update, runnerType, tokenStr) => {
    let text = ''; let chatId = '';
    const botData = botsRef.current.find(b => b.id === botId); if (!botData) return;
    if (!userSessionsRef.current[botId]) userSessionsRef.current[botId] = {};
    const botOwner = users.find(u => u.id === botData.userId);
    const maxUsers = getPlanLimitForUser(botOwner, 'maxUsers');
    const isLmAllowed = botOwner && isModuleAllowed(botOwner.plan, 'Лід-магніт');
    const isFunnelAllowed = botOwner && isModuleAllowed(botOwner.plan, 'Автоворонка');

    if (update.callback_query) {
        text = update.callback_query.data || ''; chatId = update.callback_query.message.chat.id;
        try { await fetch(`https://api.telegram.org/bot${tokenStr}/answerCallbackQuery`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({callback_query_id: update.callback_query.id}) }); } catch(e){}
        if (text.startsWith('goto_') && runnerType === 'lm' && isLmAllowed) {
            const parts = text.split('_'); const targetFlowId = parts[1] + '_' + parts[2]; const targetStepId = parts.slice(3).join('_'); 
            if (!userSessionsRef.current[botId][chatId]) userSessionsRef.current[botId][chatId] = {};
            userSessionsRef.current[botId][chatId].activeModule = 'lead_magnet';
            userSessionsRef.current[botId][chatId].currentFlowId = targetFlowId;
            userSessionsRef.current[botId][chatId].currentLmStepId = targetStepId;
            await executeStep(botData, chatId, targetFlowId, targetStepId, tokenStr, false);
            return;
        }
        if (text.startsWith('checksub_') && runnerType === 'lm' && isLmAllowed) {
            const parts = text.split('_'); 
            const targetFlowId = parts[1] + '_' + parts[2]; 
            const targetStepId = parts.slice(3).join('_');
            
            const flow = botData.moduleConfigs['Лід-магніт']?.flows?.find(f => f.id === targetFlowId);
            const step = flow?.steps?.find(s => s.id === targetStepId);
            
            if (step) {
                 let isSubbed = false;
                 if (step.channelId) {
                     try {
                         const subRes = await fetch(`https://api.telegram.org/bot${tokenStr}/getChatMember?chat_id=${step.channelId}&user_id=${chatId}`);
                         const subData = await subRes.json();
                         if (subData.ok && ['member', 'administrator', 'creator'].includes(subData.result.status)) {
                             isSubbed = true;
                         }
                     } catch (e) { console.error("API error", e); }
                 } else {
                     isSubbed = true; 
                 }
                 if (isSubbed && step.nextStepId) {
                     userSessionsRef.current[botId][chatId] = { activeModule: 'lead_magnet', currentFlowId: targetFlowId, currentLmStepId: step.nextStepId };
                     await executeStep(botData, chatId, targetFlowId, step.nextStepId, tokenStr, false);
                 } else {
                     await sendTelegramAPI(tokenStr, chatId, { text: step.fallbackText || 'Ви не підписані!' });
                 }
            }
            return;
        }
        if (text === 'checksub_funnel_main' && runnerType === 'funnel' && isFunnelAllowed) {
             const funnel = botData.moduleConfigs['Автоворонка'];
             if (funnel) {
                 let isSubbed = false;
                 if (funnel.channelId) {
                     try {
                         const subRes = await fetch(`https://api.telegram.org/bot${tokenStr}/getChatMember?chat_id=${funnel.channelId}&user_id=${chatId}`);
                         const subData = await subRes.json();
                         if (subData.ok && ['member', 'administrator', 'creator'].includes(subData.result.status)) {
                             isSubbed = true;
                         }
                     } catch (e) { console.error("API error", e); }
                 } else {
                     isSubbed = true; 
                 }
                 if (isSubbed) {
                     let payload = { chat_id: chatId, text: funnel.steps[0].text };
                     if (funnel.steps[0].links && funnel.steps[0].links.length > 0 && funnel.steps[0].links[0].url) {
                         payload.reply_markup = { inline_keyboard: [[{ text: funnel.steps[0].links[0].title || 'Перейти', url: funnel.steps[0].links[0].url }]] };
                     }
                     await sendTelegramAPI(tokenStr, chatId, payload);
                     saveStateToDb({ bots: bots.map(b => b.id === botId ? { ...b, interactions: (b.interactions || 0) + 1 } : b) });
                 } else {
                     await sendTelegramAPI(tokenStr, chatId, { text: funnel.subErrorText || 'Ви не підписані!' });
                 }
             }
             return;
        }
    } else if (update.message && update.message.text) { text = update.message.text.toLowerCase().trim(); chatId = update.message.chat.id; } 
    else { return; }

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    let needUpdate = false;
    
    if (botData.currentMonth !== currentMonthStr) {
        botData.uniqueUserIds = [];
        botData.currentMonth = currentMonthStr;
        botData.users = 0;
        needUpdate = true;
    }

    if (!botData.uniqueUserIds) botData.uniqueUserIds = [];
    if (!botData.uniqueUserIds.includes(chatId)) {
        if (botData.uniqueUserIds.length >= maxUsers) { 
            await sendTelegramAPI(tokenStr, chatId, { text: "⚠️ Перевищено ліміт нових користувачів для цього бота у поточному місяці. Власнику потрібно оновити тариф." }); 
            return; 
        }
        botData.uniqueUserIds.push(chatId);
        botData.users = botData.uniqueUserIds.length;
        needUpdate = true;
    }
    
    if (needUpdate) {
        saveStateToDb({ bots: botsRef.current.map(b => b.id === botId ? { ...b, users: botData.uniqueUserIds.length, uniqueUserIds: botData.uniqueUserIds, currentMonth: botData.currentMonth } : b) });
    }

    const session = userSessionsRef.current[botId][chatId] || { activeModule: null, currentFlowId: null, currentLmStepId: null };
    let matched = false;

    if (runnerType === 'lm' && isLmAllowed && session.activeModule === 'lead_magnet' && session.currentLmStepId && session.currentFlowId) {
        const flow = botData.moduleConfigs['Лід-магніт']?.flows?.find(f => f.id === session.currentFlowId);
        if (flow) {
            const currentStepIndex = flow.steps.findIndex(s => s.id === session.currentLmStepId);
            const currentStep = flow.steps[currentStepIndex];
            if (currentStep && currentStep.type === 'wait_input') {
                if (text === currentStep.expectedText.toLowerCase().trim()) {
                    if (currentStep.successText || (currentStep.successMediaType && currentStep.successMediaType !== 'none')) {
                        let payload = { chat_id: chatId, text: currentStep.successText || 'Без тексту' };
                        if (currentStep.successMediaType && currentStep.successMediaType !== 'none' && currentStep.successMediaUrl) { payload[currentStep.successMediaType] = currentStep.successMediaUrl; payload.caption = currentStep.successText; delete payload.text; }
                        await sendTelegramAPI(tokenStr, chatId, payload);
                    }
                    const nextStep = flow.steps[currentStepIndex + 1];
                    if (nextStep) { session.currentLmStepId = nextStep.id; userSessionsRef.current[botId][chatId] = session; await executeStep(botData, chatId, flow.id, nextStep.id, tokenStr, false); } 
                    else { 
                        saveStateToDb({ bots: bots.map(b => b.id === botId ? { ...b, interactions: (b.interactions || 0) + 1 } : b) }); 
                        session.activeModule = null; userSessionsRef.current[botId][chatId] = session; 
                    }
                } else { await sendTelegramAPI(tokenStr, chatId, { text: currentStep.fallbackText || 'Будь ласка, введіть правильне слово.' }); }
                return; 
            }
        }
    }

    if (!matched && runnerType === 'lm' && isLmAllowed && botData.modules.includes('Лід-магніт')) {
        const flow = botData.moduleConfigs['Лід-магніт']?.flows?.find(f => f.trigger.toLowerCase() === text && f.isActive !== false);
        if (flow && flow.steps && flow.steps.length > 0) {
            session.activeModule = 'lead_magnet'; session.currentFlowId = flow.id; session.currentLmStepId = flow.steps[0].id;
            userSessionsRef.current[botId][chatId] = session; await executeStep(botData, chatId, flow.id, flow.steps[0].id, tokenStr, false);
            matched = true;
        }
    }
    if (!matched && runnerType === 'funnel' && isFunnelAllowed && botData.modules.includes('Автоворонка')) {
        const funnel = botData.moduleConfigs['Автоворонка'];
        if (funnel && funnel.trigger && text === funnel.trigger.toLowerCase() && funnel.steps && funnel.steps.length > 0) {
            if (funnel.requireSub) {
                 const buttons = [
                     [{ text: '📢 Підписатися', url: funnel.channelUrl || 'https://t.me/' }],
                     [{ text: '✅ Перевірити підписку', callback_data: `checksub_funnel_main` }]
                 ];
                 await sendTelegramAPI(tokenStr, chatId, { text: funnel.subCheckText || 'Підпишіться на канал', reply_markup: { inline_keyboard: buttons } });
            } else {
                 let payload = { chat_id: chatId, text: funnel.steps[0].text };
                 if (funnel.steps[0].links && funnel.steps[0].links.length > 0) {
                     const validLinks = funnel.steps[0].links.filter(l => l.title && l.url);
                     if (validLinks.length > 0) {
                         payload.reply_markup = { inline_keyboard: validLinks.map(l => ([{ text: l.title, url: l.url }])) };
                     }
                 }
                 await sendTelegramAPI(tokenStr, chatId, payload);
                 saveStateToDb({ bots: bots.map(b => b.id === botId ? { ...b, interactions: (b.interactions || 0) + 1 } : b) });
            }
            matched = true;
        }
    }
    if (!matched && botData.menu && botData.menu.length > 0) {
        const cmd = botData.menu.find(m => m.command.toLowerCase() === (text.startsWith('/') ? text.substring(1) : text));
        if (cmd) { 
            let payload = { chat_id: chatId, text: cmd.message && cmd.message.trim() ? cmd.message : `🔹 Ви обрали: *${cmd.description}*` };
            if (cmd.mediaType && cmd.mediaType !== 'none' && cmd.mediaUrl) {
                payload[cmd.mediaType] = cmd.mediaUrl;
                payload.caption = payload.text;
                delete payload.text;
            }
            if (cmd.links && cmd.links.length > 0) {
                const validLinks = cmd.links.filter(l => l.title && l.url);
                if (validLinks.length > 0) {
                    payload.reply_markup = { inline_keyboard: validLinks.map(l => ([{ text: l.title, url: l.url }])) };
                }
            }
            await sendTelegramAPI(tokenStr, chatId, payload); 
            matched = true; 
        }
    }
    if (!matched) await sendTelegramAPI(tokenStr, chatId, { text: "Команду не розпізнано." });
  };

  // ============================================================================
  // 📦 МОДУЛЬ 6: СИМУЛЯТОР ТЕЛЕФОНУ
  // ============================================================================

  const sendPreviewMsg = async (overrideText = null) => {
      const textToProcess = (overrideText || previewInput).trim().toLowerCase(); if(!textToProcess) return;
      setPreviewChat(prev => [...prev, { sender: 'user', text: overrideText || previewInput }]); if(!overrideText) setPreviewInput('');
      if (!userSessionsRef.current['simulator']) userSessionsRef.current['simulator'] = { activeModule: null, currentFlowId: null, currentLmStepId: null };
      const session = userSessionsRef.current['simulator'];

      setTimeout(async () => {
          let matched = false;
          if (session.activeModule === 'lead_magnet' && session.currentLmStepId && session.currentFlowId) {
              const flow = builderForm.moduleConfigs['Лід-магніт']?.flows?.find(f => f.id === session.currentFlowId);
              if (flow) {
                  const currentStepIndex = flow.steps.findIndex(s => s.id === session.currentLmStepId); const currentStep = flow.steps[currentStepIndex];
                  if (currentStep && currentStep.type === 'wait_input') {
                      if (textToProcess === currentStep.expectedText.toLowerCase().trim()) {
                          if (currentStep.successText || (currentStep.successMediaType && currentStep.successMediaType !== 'none')) { setPreviewChat(prev => [...prev, { sender: 'bot', text: currentStep.successText || '', mediaType: currentStep.successMediaType, mediaUrl: currentStep.successMediaUrl }]); }
                          const nextStep = flow.steps[currentStepIndex + 1];
                          if (nextStep) { setTimeout(() => executeStep({id: 'builderForm', builderFormConfigs: builderForm.moduleConfigs}, 'simulator', flow.id, nextStep.id, '', true), 500); } else { session.activeModule = null; }
                      } else { setPreviewChat(prev => [...prev, { sender: 'bot', text: currentStep.fallbackText || 'Будь ласка, введіть правильне слово.' }]); }
                      return;
                  }
              }
          }
          if (!matched && isModuleAllowed(currentUser?.plan || 'Starter', 'Лід-магніт') && builderForm.modules.includes('Лід-магніт')) {
              const flow = builderForm.moduleConfigs['Лід-магніт']?.flows?.find(f => f.trigger.toLowerCase() === textToProcess && f.isActive !== false);
              if (flow && flow.steps && flow.steps.length > 0) { session.activeModule = 'lead_magnet'; await executeStep({id: 'builderForm', builderFormConfigs: builderForm.moduleConfigs}, 'simulator', flow.id, flow.steps[0].id, '', true); matched = true; }
          }
          if (!matched && isModuleAllowed(currentUser?.plan || 'Starter', 'Автоворонка') && builderForm.modules.includes('Автоворонка') && builderForm.moduleConfigs['Автоворонка']?.trigger === textToProcess) {
              const funnel = builderForm.moduleConfigs['Автоворонка'];
              if (funnel.requireSub) {
                   setPreviewChat(prev => [...prev, {
                       sender: 'bot',
                       text: funnel.subCheckText || 'Підпишіться на канал',
                       buttons: [
                           { id: 'sub', title: '📢 Підписатися', actionType: 'url', url: funnel.channelUrl },
                           { id: 'chk', title: '✅ Перевірити підписку', actionType: 'check_sub_funnel_sim', fallbackText: funnel.subErrorText }
                       ]
                   }]);
              } else {
                   let buttons = undefined;
                   if (funnel.steps[0].links && funnel.steps[0].links.length > 0) {
                       buttons = funnel.steps[0].links.filter(l => l.title && l.url).map(l => ({ title: l.title, actionType: 'url', url: l.url }));
                   }
                   setPreviewChat(prev => [...prev, { sender: 'bot', text: funnel.steps[0]?.text || 'Успішно.', buttons: buttons?.length > 0 ? buttons : undefined }]);
              }
              matched = true;
          }
          if (!matched) {
              const cmd = builderForm.menu.find(m => m.command === (textToProcess.startsWith('/') ? textToProcess.substring(1) : textToProcess));
              if (cmd) { 
                  let buttons = undefined;
                  if (cmd.links && cmd.links.length > 0) {
                      buttons = cmd.links.filter(l => l.title && l.url).map(l => ({ title: l.title, actionType: 'url', url: l.url }));
                  }
                  setPreviewChat(prev => [...prev, { 
                      sender: 'bot', 
                      text: cmd.message && cmd.message.trim() ? cmd.message : `🔹 Ви обрали: *${cmd.description}*`,
                      mediaType: cmd.mediaType || 'none',
                      mediaUrl: cmd.mediaUrl || '',
                      buttons: buttons?.length > 0 ? buttons : undefined
                  }]); 
                  matched = true; 
              }
          }
          if (!matched) setPreviewChat(prev => [...prev, { sender: 'bot', text: 'Команду не розпізнано.' }]);
      }, 500);
  };

  const handleSimulatorButton = async (btn, flowId) => {
      if (btn.actionType === 'url') window.open(btn.url, '_blank');
      else if (btn.actionType === 'step') {
          setPreviewChat(prev => [...prev, { sender: 'user', text: `[Натиснув кнопку: ${btn.title}]` }]);
          userSessionsRef.current['simulator'].activeModule = 'lead_magnet';
          setTimeout(() => executeStep({id: 'builderForm', builderFormConfigs: builderForm.moduleConfigs}, 'simulator', flowId, btn.nextStepId, '', true), 500);
      }
      else if (btn.actionType === 'check_sub_sim') {
          setPreviewChat(prev => [...prev, { sender: 'user', text: `[Натиснув: ${btn.title}]` }]);
          setTimeout(() => {
              if (btn.nextStepId) executeStep({id: 'builderForm', builderFormConfigs: builderForm.moduleConfigs}, 'simulator', flowId, btn.nextStepId, '', true);
              else setPreviewChat(prev => [...prev, { sender: 'bot', text: btn.fallbackText || 'Помилка перевірки' }]);
          }, 500);
      }
      else if (btn.actionType === 'check_sub_funnel_sim') {
          setPreviewChat(prev => [...prev, { sender: 'user', text: `[Натиснув: ${btn.title}]` }]);
          setTimeout(() => {
              const funnel = builderForm.moduleConfigs['Автоворонка'];
              let buttons = undefined;
              if (funnel.steps[0].links && funnel.steps[0].links.length > 0) {
                  buttons = funnel.steps[0].links.filter(l => l.title && l.url).map(l => ({ title: l.title, actionType: 'url', url: l.url }));
              }
              setPreviewChat(prev => [...prev, { sender: 'bot', text: funnel.steps[0]?.text || 'Успішно.', buttons: buttons?.length > 0 ? buttons : undefined }]);
          }, 500);
      }
  };

  // ============================================================================
  // 📦 МОДУЛЬ 7: АВТОРИЗАЦІЯ, ОПЛАТА ТА ПРОФІЛЬ
  // ============================================================================

  const showToast = (text, type = 'success') => { setToastMessage({ text, type }); setTimeout(() => setToastMessage(null), 3000); };
  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
        <div className={`flex items-center justify-center md:justify-start gap-3 px-5 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border backdrop-blur-xl w-full md:w-auto ${toastMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : toastMessage.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'}`}>
          {toastMessage.type === 'error' ? <ShieldAlert size={20} className="shrink-0" /> : toastMessage.type === 'info' ? <Loader2 size={20} className="animate-spin shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
          <span className="font-medium text-sm tracking-wide text-center md:text-left">{toastMessage.text}</span>
        </div>
      </div>
    );
  };

  // РЕАЛЬНА FIREBASE АВТОРИЗАЦІЯ
  const handleAuth = async (e) => {
    e.preventDefault(); 
    setAuthError(''); 
    const emailLower = authForm.email.toLowerCase();
    
    if (!isLoginMode && !authForm.agreed) return setAuthError('Ви повинні погодитись з усіма умовами та політиками.');

    try {
        if (isLoginMode) {
            // Реальний логін через Firebase
            const userCredential = await signInWithEmailAndPassword(auth, emailLower, authForm.password);
            
            // Шукаємо юзера в нашій базі (Firestore/Local)
            let user = users.find(u => u.email === emailLower);
            if (!user) {
                const isFounder = ['vanaslinavskij@gmail.com', 'stasznam44@gmail.com'].includes(emailLower);
                user = { id: userCredential.user.uid, name: 'Користувач', email: emailLower, role: isFounder ? 'founder' : 'user', status: isFounder ? '👑 Founder' : '🟢 Starter', plan: isFounder ? 'Unlimited' : 'Starter', autoRenew: true, refundRequested: false };
                saveStateToDb({ users: [...users, user] });
            }
            saveStateToDb({ currentUser: user }); 
            setActiveTab('home'); 
            showToast('Успішний вхід'); 
            setIsAuthPageOpen(false);
        } else {
            // Реальна реєстрація через Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, emailLower, authForm.password);
            const isFounder = ['vanaslinavskij@gmail.com', 'stasznam44@gmail.com'].includes(emailLower);
            
            const newUser = { 
                id: userCredential.user.uid, // Використовуємо реальний Firebase UID
                name: authForm.name, 
                email: emailLower, 
                password: authForm.password, // У продакшені пароль в базі не зберігається, але лишаємо для сумісності з вашою адмінкою
                role: isFounder ? 'founder' : 'user', 
                status: isFounder ? '👑 Founder' : '🟢 Starter', 
                plan: isFounder ? 'Unlimited' : 'Starter', 
                planStartDate: new Date().toISOString().split('T')[0], 
                planExpiry: isFounder ? '2099-12-31' : '', 
                autoRenew: true, 
                refundRequested: false 
            };
            
            saveStateToDb({ users: [...users, newUser], currentUser: newUser }); 
            setActiveTab('home'); 
            showToast('Акаунт створено та підключено до БД!'); 
            setIsAuthPageOpen(false);
        }
    } catch (error) {
        console.error("Auth Error:", error);
        if (error.code === 'auth/email-already-in-use') setAuthError('Цей Email вже зареєстровано.');
        else if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') setAuthError('Невірна email адреса або пароль.');
        else if (error.code === 'auth/weak-password') setAuthError('Пароль має бути не менше 6 символів.');
        else setAuthError('Помилка авторизації. Спробуйте пізніше.');
    }
  };

  const handleNavClick = (tab) => { setActiveTab(tab); setIsSidebarOpen(false); setIsAuthPageOpen(false); setIsBuilderOpen(false); if (window.innerWidth >= 768) setIsSidebarCollapsed(true); };
  
  const handleLogout = async () => { 
      try { await signOut(auth); } catch(e) {} // Реальний вихід з Firebase
      saveStateToDb({ currentUser: null }); 
      setActiveTab('home'); 
  };
  
  const saveSettings = (e) => { 
      e.preventDefault(); 
      const updatedUser = { ...currentUser, name: settingsForm.name };
      if (settingsForm.password) updatedUser.password = settingsForm.password;
      saveStateToDb({ users: users.map(u => u.id === currentUser.id ? updatedUser : u), currentUser: updatedUser }); 
      showToast('Налаштування успішно збережені'); 
  };
  
  const handleWayForPayCheckout = () => { 
      // АРХІТЕКТУРА РЕАЛЬНОЇ ОПЛАТИ:
      // Тут має бути виклик WayForPay Widget або редірект на paymentUrl.
      // Після оплати WayForPay надсилає Webhook на ваш бекенд (наприклад у папку /api/payment), 
      // який підтверджує транзакцію та оновлює статус користувача в базі даних.
      // Оскільки серверної частини для оплат зараз немає, залишаємо симуляцію для демонстрації:
      
      const url = plansConfig[checkoutPlan]?.paymentUrl;
      if (url) window.open(url, '_blank');
      
      setIsProcessingPayment(true); 
      setTimeout(async () => { 
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          const formattedExpiry = expiryDate.toISOString().split('T')[0];
          const startDate = new Date().toISOString().split('T')[0];
          
          const updatedUser = { ...currentUser, plan: checkoutPlan, status: checkoutPlan === 'Agency' ? '🟣 Agency' : '🔵 Pro', planStartDate: startDate, planExpiry: formattedExpiry, autoRenew: true, refundRequested: false }; 
          saveStateToDb({ users: users.map(u => u.id === currentUser.id ? updatedUser : u), currentUser: updatedUser }); 
          
          if (fbReady && db && updatedUser.email) {
              try {
                  await addDoc(collection(db, 'mail'), {
                      to: updatedUser.email,
                      message: {
                          subject: 'Оплата успішна! Ваш тариф активовано 🎉',
                          html: `
                              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; background-color: #0A0F1D; color: #ffffff; padding: 30px; border-radius: 20px; border: 1px solid #1F2937;">
                                  <h2 style="color: #22D3EE;">Привіт, ${updatedUser.name}!</h2>
                                  <p style="color: #9CA3AF; font-size: 16px;">Дякуємо за ваш вибір. Ваш тариф <b>${checkoutPlan}</b> успішно активовано!</p>
                                  <div style="background-color: #0B1120; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #1F2937;">
                                      <p style="margin: 0; color: #fff;">Сума: <b>₴${plansConfig[checkoutPlan]?.price}</b></p>
                                      <p style="margin: 5px 0 0 0; color: #fff;">План: <b>${checkoutPlan}</b></p>
                                      <p style="margin: 5px 0 0 0; color: #fff;">Діє до: <b>${new Date(formattedExpiry).toLocaleDateString('uk-UA')}</b></p>
                                  </div>
                                  <p style="color: #9CA3AF; font-size: 14px;">Тепер ви можете створювати ще більше ефективних воронок.</p>
                                  <br/>
                                  <p style="color: #9CA3AF; font-size: 12px; margin-bottom: 0;">З повагою,<br/>Команда MOROZOV SMM</p>
                              </div>
                          `
                      }
                  });
              } catch (error) { console.error(error); }
          }

          setIsProcessingPayment(false); 
          setCheckoutPlan(null); 
          showToast(`Ви успішно перейшли на тариф ${checkoutPlan}!`, 'success'); 
          sendAdminNotification(updatedUser, checkoutPlan); 
      }, 1500); 
  };
  
  const handleCancelAutoRenew = () => {
    if(window.confirm('Ви впевнені, що хочете вимкнути автосписання коштів? Ваша підписка буде діяти до кінця поточного оплаченого періоду.')) {
        const updatedUser = { ...currentUser, autoRenew: false };
        saveStateToDb({ users: users.map(u => u.id === currentUser.id ? updatedUser : u), currentUser: updatedUser });
        showToast('Автосписання успішно вимкнено', 'info');
    }
  };

  const handleRequestRefund = async () => {
    if(window.confirm('Ви впевнені, що хочете запросити повернення коштів згідно з нашою політикою Refund Policy? Ваш платний тариф буде тимчасово призупинено до з\'ясування обставин.')) {
        const updatedUser = { ...currentUser, refundRequested: true, autoRenew: false };
        saveStateToDb({ users: users.map(u => u.id === currentUser.id ? updatedUser : u), currentUser: updatedUser });
        showToast('Запит на повернення надіслано адміністратору. Очікуйте листа на email.', 'success');
        
        if (fbReady && db) {
            try {
                await addDoc(collection(db, 'mail'), {
                    to: companyInfo.email || 'support@morozov.com',
                    message: {
                        subject: `⚠️ ЗАПИТ НА ПОВЕРНЕННЯ КОШТІВ (REFUND): ${currentUser.name}`,
                        html: `<div style="font-family: sans-serif; padding: 20px;">
                            <h2 style="color: #EF4444;">Запит на Refund</h2>
                            <p>Користувач <b>${currentUser.name}</b> (${currentUser.email}) запросив повернення коштів.</p>
                            <p>Поточний тариф: <b>${currentUser.plan}</b></p>
                            <p>ID: ${currentUser.id}</p>
                            <p>Зв'яжіться з ним для вирішення питання або скасуйте його транзакцію в системі WayForPay.</p>
                        </div>`
                    }
                });
            } catch (error) { console.error(error); }
        }
    }
  };

  // ============================================================================
  // 📦 МОДУЛЬ 8: ПАНЕЛЬ АДМІНІСТРАТОРА ТА КОНСТРУКТОР ВОРОНОК
  // ============================================================================

  const adminDeleteUser = (userId) => { if (userId === 'ID0' || userId === currentUser.id) return showToast('Видалення цього акаунту заборонено', 'error'); const userToDelete = users.find(u => u.id === userId); if (currentUser.role === 'admin' && userToDelete?.role === 'founder') return showToast('У вас немає прав для видалення Founder', 'error'); if(window.confirm(`Точно видалити користувача ${userToDelete?.name}?`)) { saveStateToDb({ users: users.filter(u => u.id !== userId), bots: bots.filter(b => b.userId !== userId) }); showToast('Користувач та його воронки повністю видалені', 'error'); } };
  const adminPauseUserBots = (userId) => { if (window.confirm(`Зупинити повністю всіх ботів цього користувача?`)) { saveStateToDb({ bots: bots.map(b => b.userId === userId ? { ...b, status: 'Пауза' } : b) }); showToast(`Боти користувача переведені у сплячий режим`, 'success'); } };
  const adminSaveUser = (e) => { e.preventDefault(); const updatedUsers = users.map(u => u.id === adminEditingUser.id ? { ...u, name: adminEditingUser.name, role: adminEditingUser.role, plan: adminEditingUser.plan, planStartDate: adminEditingUser.planStartDate, planExpiry: adminEditingUser.planExpiry, status: adminEditingUser.status || u.status } : u); saveStateToDb({ users: updatedUsers }); if (adminEditingUser.id === currentUser.id) saveStateToDb({ currentUser: updatedUsers.find(u => u.id === currentUser.id) }); setAdminEditingUser(null); showToast('Дані збережені'); };
  const adminDeleteBot = (botId) => { if(window.confirm('Ви впевнені?')) { saveStateToDb({ bots: bots.filter(b => b.id !== botId) }); showToast('Воронку видалено', 'error'); } };
  const adminUpdatePlans = (plan, field, value) => saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], [field]: value } } });
  const adminUpdateFeatureText = (plan, index, value) => { const newFeatures = [...plansConfig[plan].features]; newFeatures[index] = { ...newFeatures[index], text: value }; saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], features: newFeatures } } }); };
  const adminUpdateFeatureState = (plan, index, value) => { const newFeatures = [...plansConfig[plan].features]; newFeatures[index] = { ...newFeatures[index], included: value }; saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], features: newFeatures } } }); };
  const adminAddFeature = (plan) => saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], features: [...plansConfig[plan].features, { text: 'Нова опція', included: true }] } } });
  const adminRemoveFeature = (plan, index) => { const newFeatures = [...plansConfig[plan].features]; newFeatures.splice(index, 1); saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], features: newFeatures } } }); };
  const adminTogglePlanModule = (plan, module) => { const currentModules = plansConfig[plan].allowedModules || []; const updated = currentModules.includes(module) ? currentModules.filter(m => m !== module) : [...currentModules, module]; saveStateToDb({ plansConfig: { ...plansConfig, [plan]: { ...plansConfig[plan], allowedModules: updated } } }); };
  const handleSavePlansAndInfo = () => { saveStateToDb({ plansConfig, companyInfo }); showToast('Налаштування платформи збережені!', 'success'); };

  const openBuilder = (bot = null) => {
    if (!bot && currentUser.role !== 'founder' && bots.filter(b => b.userId === currentUser.id).length >= getPlanLimitForUser(currentUser, 'maxBots')) return showToast(`Ліміт тарифу досягнуто.`, 'error');
    setActiveConfigModule(null); setActiveFlowId(null); setPreviewChat([]); setPreviewInput('');
    if (bot) { setEditingBot(bot); const mergedConfigs = JSON.parse(JSON.stringify(DEFAULT_MODULE_CONFIGS)); if (bot.moduleConfigs) Object.keys(bot.moduleConfigs).forEach(key => { if(mergedConfigs[key]) mergedConfigs[key] = { ...mergedConfigs[key], ...bot.moduleConfigs[key] }; }); setBuilderForm({ name: bot.name, tokenFunnel: bot.tokenFunnel || '', tokenLm: bot.tokenLm || '', modules: [...bot.modules], moduleConfigs: mergedConfigs, menu: bot.menu ? [...bot.menu] : [] }); setTokenStatusFunnel(bot.tokenFunnel ? 'success' : 'idle'); setTokenStatusLm(bot.tokenLm ? 'success' : 'idle'); } 
    else { setEditingBot(null); const defaultModules = []; if (isModuleAllowed(currentUser.plan, 'Автоворонка')) defaultModules.push('Автоворонка'); if (isModuleAllowed(currentUser.plan, 'Лід-магніт')) defaultModules.push('Лід-магніт'); setBuilderForm({ name: '', tokenFunnel: '', tokenLm: '', modules: defaultModules, moduleConfigs: JSON.parse(JSON.stringify(DEFAULT_MODULE_CONFIGS)), menu: [] }); setTokenStatusFunnel('idle'); setTokenStatusLm('idle'); }
    setVerifiedBotData(null); setBuilderTab('basic'); setIsBuilderOpen(true);
  };

  const updateModuleConfig = (mod, field, value) => setBuilderForm(p => ({ ...p, moduleConfigs: { ...p.moduleConfigs, [mod]: { ...p.moduleConfigs[mod], [field]: value } } }));
  const addLmFlow = () => { const flows = [...(builderForm.moduleConfigs['Лід-магніт']?.flows || [])]; if (flows.length >= getPlanLimitForUser(currentUser, 'maxFlows')) return showToast(`Ліміт воронок`, 'error'); const newId = `flow_${Date.now()}`; flows.push({ id: newId, trigger: `trigger_${flows.length+1}`, name: `Воронка ${flows.length+1}`, isActive: true, steps: [] }); updateModuleConfig('Лід-магніт', 'flows', flows); setActiveFlowId(newId); };
  const updateLmFlow = (flowId, field, value) => updateModuleConfig('Лід-магніт', 'flows', builderForm.moduleConfigs['Лід-магніт'].flows.map(f => f.id === flowId ? { ...f, [field]: value } : f));
  const deleteLmFlow = (flowId) => { const flows = builderForm.moduleConfigs['Лід-магніт'].flows.filter(f => f.id !== flowId); updateModuleConfig('Лід-магнит', 'flows', flows); setActiveFlowId(flows.length > 0 ? flows[0].id : null); };
  const toggleLmFlow = (flowId) => updateModuleConfig('Лід-магніт', 'flows', builderForm.moduleConfigs['Лід-магніт'].flows.map(f => f.id === flowId ? { ...f, isActive: f.isActive === false ? true : false } : f));
  const addLmStep = (type) => { 
      const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; const flow = flows.find(f => f.id === activeFlowId); if(!flow) return; 
      if (flow.steps.length >= getPlanLimitForUser(currentUser, 'maxModules')) return showToast(`Ліміт блоків`, 'error'); 
      flow.steps.push({ id: `step_${Date.now()}`, type, text: '', mediaType: 'none', mediaUrl: '', buttons: [], expectedText: '', fallbackText: '', successText: '', successMediaType: 'none', successMediaUrl: '', channelUrl: '', channelId: '', nextStepId: '', delayDays: 0, delayHours: 0, delayMinutes: 1, delaySeconds: 0 }); 
      updateModuleConfig('Лід-магніт', 'flows', flows); 
  };
  const updateLmStep = (stepId, field, value) => { const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; flows.find(f => f.id === activeFlowId).steps.find(s => s.id === stepId)[field] = value; updateModuleConfig('Лід-магніт', 'flows', flows); };
  const deleteLmStep = (stepId) => { const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; const flow = flows.find(f => f.id === activeFlowId); flow.steps = flow.steps.filter(s => s.id !== stepId); updateModuleConfig('Лід-магніт', 'flows', flows); };
  const addLmButton = (stepId) => { const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; flows.find(f => f.id === activeFlowId).steps.find(s => s.id === stepId).buttons.push({ id: Date.now(), title: '', actionType: 'url', url: '', nextStepId: '' }); updateModuleConfig('Лід-магніт', 'flows', flows); };
  const updateLmButton = (stepId, btnId, field, value) => { const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; const btn = flows.find(f => f.id === activeFlowId).steps.find(s => s.id === stepId).buttons.find(b => b.id === btnId); if (btn) btn[field] = value; updateModuleConfig('Лід-магніт', 'flows', flows); };
  const deleteLmButton = (stepId, btnId) => { const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; const step = flows.find(f => f.id === activeFlowId).steps.find(s => s.id === stepId); step.buttons = step.buttons.filter(b => b.id !== btnId); updateModuleConfig('Лід-магніт', 'flows', flows); };
  const handleFileUpload = (stepId, isSuccessMedia = false) => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,video/*,application/pdf'; input.onchange = (e) => { const file = e.target.files[0]; if (!file) return; const url = URL.createObjectURL(file); let mediaType = 'document'; if (file.type.startsWith('image/')) mediaType = 'photo'; if (file.type.startsWith('video/')) mediaType = 'video'; const flows = [...builderForm.moduleConfigs['Лід-магніт'].flows]; const step = flows.find(f => f.id === activeFlowId).steps.find(s => s.id === stepId); step[isSuccessMedia ? 'successMediaType' : 'mediaType'] = mediaType; step[isSuccessMedia ? 'successMediaUrl' : 'mediaUrl'] = url; updateModuleConfig('Лід-магніт', 'flows', flows); showToast('Файл прикріплено', 'info'); }; input.click(); };
  
  const updateStarterFunnelLinks = (action, idx, field, value) => {
      const steps = [...(builderForm.moduleConfigs['Автоворонка']?.steps || [])];
      if(steps.length === 0) steps.push({ id: 1, delay: '0', delayUnit: 'minutes', goal: 'entry', text: '', links: [] });
      if (!steps[0].links) steps[0].links = [];
      
      if (action === 'add') {
          steps[0].links.push({ id: Date.now(), title: '', url: '' });
      } else if (action === 'update') {
          steps[0].links[idx][field] = value;
      } else if (action === 'delete') {
          steps[0].links.splice(idx, 1);
      }
      updateModuleConfig('Автоворонка', 'steps', steps);
  };
  
  const addMenuCommand = () => setBuilderForm(p => ({ ...p, menu: [...p.menu, { command: '', description: '', message: '', mediaType: 'none', mediaUrl: '', links: [] }] }));
  const updateMenuCommand = (idx, field, value) => setBuilderForm(p => { const m = [...p.menu]; m[idx][field] = field === 'command' ? value.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 32) : value; return { ...p, menu: m }; });
  const handleMenuLink = (action, menuIdx, linkIdx, field, value) => {
      setBuilderForm(p => {
          const m = [...p.menu];
          if (!m[menuIdx].links) m[menuIdx].links = [];
          if (action === 'add') m[menuIdx].links.push({ id: Date.now(), title: '', url: '' });
          else if (action === 'update') m[menuIdx].links[linkIdx][field] = value;
          else if (action === 'delete') m[menuIdx].links.splice(linkIdx, 1);
          return { ...p, menu: m };
      });
  };
  
  const removeMenuCommand = (idx) => setBuilderForm(p => ({ ...p, menu: p.menu.filter((_, i) => i !== idx) }));
  const loadSmmMenuPreset = () => setBuilderForm(p => ({ ...p, menu: [{ command: 'start', description: 'Головне меню', message: 'Привіт! Я бот-асистент.', mediaType: 'none', mediaUrl: '', links: [] }, { command: 'services', description: 'Послуги', message: 'Ось перелік наших послуг:\n1. SMM', mediaType: 'none', mediaUrl: '', links: [] }, { command: 'contact', description: 'Зв\'язатися', message: 'Напишіть нашому менеджеру', mediaType: 'none', mediaUrl: '', links: [] }]}));
  const verifyTelegramToken = async (type) => { const token = type === 'funnel' ? builderForm.tokenFunnel : builderForm.tokenLm; if (!token) return showToast('Введіть токен', 'error'); type === 'funnel' ? setTokenStatusFunnel('loading') : setTokenStatusLm('loading'); try { const res = await fetch(`https://api.telegram.org/bot${token}/getMe`); const data = await res.json(); if (data.ok) { type === 'funnel' ? setTokenStatusFunnel('success') : setTokenStatusLm('success'); setVerifiedBotData(data.result); if (!builderForm.name) setBuilderForm(p => ({ ...p, name: data.result.first_name })); showToast(`Успішно: @${data.result.username}`); } else { type === 'funnel' ? setTokenStatusFunnel('error') : setTokenStatusLm('error'); showToast('Невірний токен', 'error'); } } catch (err) { type === 'funnel' ? setTokenStatusFunnel('error') : setTokenStatusLm('error'); showToast('Помилка API', 'error'); } };
  const saveBot = () => { if (!builderForm.name) return showToast('Введіть ім\'я бота', 'error'); setIsSaving(true); setTimeout(() => { const cleanMenu = builderForm.menu.filter(m => m.command.trim() && m.description.trim()); const botDataToSave = { ...builderForm, menu: cleanMenu, modules: builderForm.modules }; const pushMenu = async (tokenStr) => { if (tokenStr && cleanMenu.length > 0) { await fetch(`https://api.telegram.org/bot${tokenStr}/setMyCommands`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commands: cleanMenu.map(m => ({command: m.command, description: m.description})) }) }).catch(()=>{}); } else if (tokenStr && cleanMenu.length === 0) { await fetch(`https://api.telegram.org/bot${tokenStr}/deleteMyCommands`).catch(()=>{}); } }; pushMenu(botDataToSave.tokenFunnel); pushMenu(botDataToSave.tokenLm); if (editingBot) { saveStateToDb({ bots: bots.map(b => b.id === editingBot.id ? { ...b, ...botDataToSave, username: verifiedBotData?.username || b.username } : b) }); showToast('Налаштування збережено'); } else { saveStateToDb({ bots: [...bots, { id: Date.now(), userId: currentUser.id, ...botDataToSave, username: verifiedBotData?.username || 'new_bot', status: 'Активний', users: 0, interactions: 0, uniqueUserIds: [] }] }); showToast('Бота створено!'); } setIsSaving(false); setIsBuilderOpen(false); }, 600); };
  const deleteBot = () => { if (editingBot) { saveStateToDb({ bots: bots.filter(b => b.id !== editingBot.id) }); setIsBuilderOpen(false); showToast('Бота видалено', 'error'); } };
  
  const toggleBotStatus = async (id) => { 
      const bot = bots.find(b => b.id === id);
      const newStatus = bot.status === 'Активний' ? 'Пауза' : 'Активний'; 
      
      // АВТОМАТИЧНЕ ПІДКЛЮЧЕННЯ ДО СЕРВЕРА (Vercel Webhooks)
      const serverUrl = window.location.origin; // Отримуємо URL сайту (напр. https://bots.vercel.app)
      
      try {
          if (newStatus === 'Активний') {
              if (bot.tokenFunnel) await fetch(`https://api.telegram.org/bot${bot.tokenFunnel}/setWebhook?url=${serverUrl}/api/webhook?botId=${bot.id}&type=funnel`);
              if (bot.tokenLm) await fetch(`https://api.telegram.org/bot${bot.tokenLm}/setWebhook?url=${serverUrl}/api/webhook?botId=${bot.id}&type=lm`);
              showToast('Бота запущено на сервері (24/7) 🚀', 'success');
          } else {
              if (bot.tokenFunnel) await fetch(`https://api.telegram.org/bot${bot.tokenFunnel}/deleteWebhook`);
              if (bot.tokenLm) await fetch(`https://api.telegram.org/bot${bot.tokenLm}/deleteWebhook`);
              showToast('Бота зупинено', 'info');
          }
      } catch (error) {
          console.error("Webhook Error:", error);
      }
      
      saveStateToDb({ bots: bots.map(b => b.id === id ? { ...b, status: newStatus } : b) }); 
  };

  const getStepPreviewLabel = (step, idx) => { if (!step) return `Блок ${idx + 1}`; if (step.type === 'message') return `[Повідомлення] ${step.text ? step.text.substring(0, 15) + '...' : 'Медіа...'}`; if (step.type === 'wait_input') return `[Очікування] ${step.expectedText || 'тексту'}`; if (step.type === 'check_sub') return `[Підписка]`; if (step.type === 'delay') return `[Таймер]`; return `Блок ${idx + 1}`; };

  const handleAcceptAllCookies = () => { setCookieConsent({ analytical: true, marketing: true }); setIsCookieNoticeOpen(false); };
  const handleRejectCookies = () => { setCookieConsent({ analytical: false, marketing: false }); setIsCookieNoticeOpen(false); };
  const saveCookieSettings = () => { setCookieConsent(cookieTempSettings); setIsCookieSettingsOpen(false); setIsCookieNoticeOpen(false); showToast('Налаштування cookies збережені'); };

  const activeLmFlow = builderForm.moduleConfigs['Лід-магніт']?.flows?.find(f => f.id === activeFlowId) || null;

  // ============================================================================
  // 📦 МОДУЛЬ 9: ВІЗУАЛЬНА ЧАСТИНА (RENDER HTML / ІНТЕРФЕЙС)
  // ============================================================================

 return (
    <div className="h-[100dvh] md:h-screen w-full bg-[#0A0F1D] text-white flex overflow-hidden font-sans selection:bg-cyan-500/30 relative">
      {renderToast()}

      {/* COOKIE NOTICE BANNER */}
      {isCookieNoticeOpen && cookieConsent === null && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 p-4 md:p-5 z-[200] flex flex-col lg:flex-row gap-4 md:gap-5 items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10">
          <div className="text-[11px] md:text-[12px] leading-relaxed text-zinc-400 w-full lg:max-w-4xl flex-grow">
            <p className="mb-1.5"><strong className="text-white">Ваша приватність має значення.</strong> Ми використовуємо файли cookie (Essential) для забезпечення безпеки та авторизації, а також (за вашою згодою) Analytical та Marketing файли для збору анонімної статистики використання Платформи. Обробка даних здійснюється згідно з вимогами GDPR.</p>
            <p>Натискаючи «Прийняти всі», ви погоджуєтесь із нашою <button onClick={() => {toggleModal('privacy', true); setIsCookieNoticeOpen(false);}} className="text-cyan-400 hover:text-cyan-300 transition-colors">Політикою конфіденційності</button> та <button onClick={() => {toggleModal('cookie', true); setIsCookieNoticeOpen(false);}} className="text-cyan-400 hover:text-cyan-300 transition-colors">Політикою Cookie</button>. Виберіть «Налаштування», щоб точно вказати, які дані ми можемо збирати.</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0 w-full lg:w-auto justify-start lg:justify-end">
             <button onClick={() => { setIsCookieNoticeOpen(false); setIsCookieSettingsOpen(true); }} className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-white font-medium transition-colors text-[10px] md:text-[11px] uppercase tracking-wide whitespace-nowrap flex items-center gap-2"><Settings size={14}/> Налаштування</button>
             <button onClick={handleRejectCookies} className="px-4 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-800 text-white font-medium transition-colors text-[10px] md:text-[11px] uppercase tracking-wide whitespace-nowrap">Лише необхідні</button>
             <button onClick={handleAcceptAllCookies} className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold transition-all hover:scale-105 text-[10px] md:text-[11px] uppercase tracking-wide shadow-[0_0_15px_rgba(34,211,238,0.2)] whitespace-nowrap">Прийняти всі</button>
          </div>
        </div>
      )}

      {/* COOKIE SETTINGS MODAL */}
      {isCookieSettingsOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCookieSettingsOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#131B2C] rounded-2xl md:rounded-3xl border border-[#1F2937] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-6 py-4 md:py-5 border-b border-[#1F2937] flex justify-between items-center bg-[#0B1120]">
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2"><ShieldCheck size={20} className="text-cyan-400"/> Центр управління даними</h2>
              <button onClick={() => setIsCookieSettingsOpen(false)} className="text-gray-400 hover:text-white p-2 md:p-1 rounded-md"><X size={18}/></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
              <div className="bg-[#0B1120] p-4 rounded-xl border border-[#1F2937]">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2"><Lock size={16} className="text-gray-400"/> Технічно необхідні (Essential)</h3>
                    <span className="text-[9px] md:text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded uppercase">Завжди активні</span>
                </div>
                <p className="text-[11px] md:text-xs text-gray-400 mt-2 leading-relaxed">Ці файли cookie абсолютно необхідні для роботи Платформи. Вони забезпечують безпеку авторизації (Firebase Auth), захист від атак та збереження сесії. Вони не збирають особисту інформацію для маркетингу.</p>
              </div>
              
              <div className="bg-[#0B1120] p-4 rounded-xl border border-[#1F2937] transition-colors hover:border-cyan-500/30">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2"><BarChart2 size={16} className="text-blue-400"/> Аналітичні (Analytical)</h3>
                        <p className="text-[11px] md:text-xs text-gray-400 mt-2 leading-relaxed pr-4 md:pr-6">Допомагають нам збирати анонімну статистику (Google Analytics) про те, як ви використовуєте конструктор ботів. Це дозволяє нам знаходити помилки в інтерфейсі та робити сервіс зручнішим.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input type="checkbox" checked={cookieTempSettings.analytical} onChange={e => setCookieTempSettings({...cookieTempSettings, analytical: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>
              </div>

              <div className="bg-[#0B1120] p-4 rounded-xl border border-[#1F2937] transition-colors hover:border-cyan-500/30">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-white text-sm md:text-base flex items-center gap-2"><Sparkles size={16} className="text-purple-400"/> Маркетингові (Marketing)</h3>
                        <p className="text-[11px] md:text-xs text-gray-400 mt-2 leading-relaxed pr-4 md:pr-6">Використовуються для персоналізації реклами на інших сайтах (ретаргетинг) та вимірювання ефективності наших рекламних кампаній. Якщо вимкнути, ви будете бачити неперсоналізовану рекламу.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input type="checkbox" checked={cookieTempSettings.marketing} onChange={e => setCookieTempSettings({...cookieTempSettings, marketing: e.target.checked})} className="sr-only peer" />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                    </label>
                </div>
              </div>
            </div>
            <div className="px-5 md:px-6 py-4 border-t border-[#1F2937] bg-[#0B1120] flex justify-between items-center">
              <button onClick={() => { setCookieTempSettings({ analytical: false, marketing: false }); saveCookieSettings(); }} className="text-[11px] md:text-xs text-gray-400 hover:text-white font-medium transition-colors">Відхилити необов'язкові</button>
              <button onClick={saveCookieSettings} className="px-4 md:px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-900 font-bold transition-all transform active:scale-95 text-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]">Зберегти вибір</button>
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER GATES --- */}
      {(!currentUser || activeTab === 'landing') && !isAuthPageOpen && (
        <div className="bg-[#0A0F1D] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative w-full block">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none z-0" />
          
          <div className="min-h-[100dvh] md:min-h-screen flex flex-col relative z-10 w-full">
            <header className="max-w-7xl w-full mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center relative z-10 border-b border-[#1F2937]/50 shrink-0">
              <div className="flex items-center gap-2 md:gap-3 cursor-pointer" onClick={() => currentUser ? setActiveTab('home') : setActiveTab('landing')}>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)]"><Bot size={24} className="text-white md:w-6 md:h-6 w-5 h-5" /></div>
                <span className="font-bold text-xl md:text-2xl tracking-widest">MOROZOV</span>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                {currentUser ? (
                  <button onClick={() => setActiveTab('home')} className="bg-white text-[#0A0F1D] px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base">В кабінет <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" /></button>
                ) : (
                  <>
                    <button onClick={() => { setIsLoginMode(true); setIsAuthPageOpen(true); }} className="text-gray-400 hover:text-white font-medium px-2 py-2 transition-colors hidden md:block text-sm md:text-base">Увійти</button>
                    <button onClick={() => { setIsLoginMode(false); setIsAuthPageOpen(true); }} className="bg-white text-[#0A0F1D] px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base">Почати <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" /></button>
                  </>
                )}
              </div>
            </header>
            <main className="flex-grow flex flex-col items-center justify-center text-center px-4 md:px-6 pt-12 md:pt-16 pb-16 md:pb-20 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs md:text-sm font-medium mb-6 md:mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
                <Sparkles size={14} className="md:w-4 md:h-4" /> Нова ера Telegram автоматизації
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-tight max-w-4xl mx-auto animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
                Візуальний конструктор <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Машина Продаж</span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-12 px-2 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                Платформа для створення ефективних воронок у Telegram без зайвого коду. Розгалуження, таймери, очікування тексту.
              </p>
              <div className="flex justify-center items-center animate-in zoom-in-95 fade-in duration-700 delay-300 w-full px-4 md:px-0">
                <button onClick={() => { if (currentUser) { setActiveTab('home'); } else { setIsLoginMode(false); setIsAuthPageOpen(true); } }} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform flex items-center justify-center gap-3">
                  {currentUser ? 'Відкрити кабінет' : 'Створити бота'} <Zap size={18} className="md:w-5 md:h-5" />
                </button>
              </div>
            </main>
          </div>
          
          <div className="w-full relative z-20 bg-[#0A0F1D]">
            <AppFooter modals={{ terms: () => toggleModal('terms', true), privacy: () => toggleModal('privacy', true), refund: () => toggleModal('refund', true), offer: () => toggleModal('offer', true), tgapi: () => toggleModal('tgapi', true), cookie: () => toggleModal('cookie', true), contacts: () => toggleModal('contacts', true) }} info={companyInfo} />
          </div>
          {renderModals()}
        </div>
      )}

      {!currentUser && isAuthPageOpen && (
        <div className="w-full bg-[#0A0F1D] relative overflow-hidden text-white font-sans block">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/20 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none z-0" />

          <div className="min-h-[100dvh] md:min-h-screen flex flex-col relative z-10 w-full">
            <div className="w-full p-4 md:p-6 shrink-0 relative z-20">
              <button onClick={() => setIsAuthPageOpen(false)} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors font-medium bg-[#131B2C]/80 backdrop-blur-xl px-4 py-2.5 rounded-xl border border-[#1F2937] hover:border-cyan-500/30 w-max shadow-sm text-sm md:text-base">
                <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" /> На головну
              </button>
            </div>

            <div className="flex-grow flex items-center justify-center p-4 relative z-10 w-full pb-10">
              <div className="w-full max-w-md bg-[#131B2C]/80 backdrop-blur-2xl rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-[#1F2937] shadow-[0_0_50px_rgba(34,211,238,0.05)] animate-in zoom-in-95 duration-500 my-4">
                
                <div className="flex flex-col items-center mb-6 md:mb-8 cursor-pointer group" onClick={() => setIsAuthPageOpen(false)} title="На головну">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center mb-3 md:mb-4 shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform">
                    <Bot size={28} className="text-white md:w-8 md:h-8" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white">MOROZOV<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">-SMM</span></h1>
                </div>

                <div className="flex bg-[#0B1120] rounded-xl p-1.5 mb-6 md:mb-8 border border-[#1F2937]">
                    <button type="button" onClick={() => {setIsLoginMode(true); setAuthError('');}} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-300 ${isLoginMode ? 'bg-[#131B2C] text-cyan-400 shadow-md border border-[#1F2937]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>Увійти</button>
                    <button type="button" onClick={() => {setIsLoginMode(false); setAuthError('');}} className={`flex-1 py-2 md:py-2.5 text-xs md:text-sm font-bold rounded-lg transition-all duration-300 ${!isLoginMode ? 'bg-[#131B2C] text-cyan-400 shadow-md border border-[#1F2937]' : 'text-gray-500 hover:text-gray-300 border border-transparent'}`}>Реєстрація</button>
                </div>

                <form onSubmit={handleAuth} className="space-y-3 md:space-y-4">
                  {!isLoginMode && (
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" /></div>
                      <input required type="text" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl pl-11 pr-4 py-3 md:py-3.5 text-white focus:border-cyan-500 transition-all outline-none text-base md:text-sm" placeholder="Ваше ім'я" />
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" /></div>
                    <input required type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl pl-11 pr-4 py-3 md:py-3.5 text-white focus:border-cyan-500 transition-all outline-none text-base md:text-sm" placeholder="Електронна пошта" />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" /></div>
                    <input required type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl pl-11 pr-4 py-3 md:py-3.5 text-white focus:border-cyan-500 transition-all outline-none text-base md:text-sm" placeholder="Пароль" />
                  </div>
                  
                  {!isLoginMode && (
                    <div className="flex items-start gap-3 mt-4 md:mt-5 bg-[#0B1120]/50 p-3 md:p-3.5 rounded-xl border border-[#1F2937]">
                      <input type="checkbox" id="terms" checked={authForm.agreed} onChange={e => setAuthForm({...authForm, agreed: e.target.checked})} className="mt-0.5 md:mt-1 w-4 h-4 accent-cyan-500 flex-shrink-0 cursor-pointer rounded" />
                      <label htmlFor="terms" className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed cursor-pointer select-none">
                        Я погоджуюсь з умовами{' '}
                        <span onClick={(e)=>{e.preventDefault(); e.stopPropagation(); toggleModal('terms', true);}} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Угоди користувача</span>,{' '}
                        <span onClick={(e)=>{e.preventDefault(); e.stopPropagation(); toggleModal('privacy', true);}} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Конфіденційності</span> та{' '}
                        <span onClick={(e)=>{e.preventDefault(); e.stopPropagation(); toggleModal('tgapi', true);}} className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2">Telegram API Policy</span>
                      </label>
                    </div>
                  )}

                  {authError && <div className="text-red-400 text-xs md:text-sm bg-red-500/10 p-3 md:p-3.5 rounded-xl border border-red-500/20 flex items-center gap-2.5 mt-2 shadow-sm"><ShieldAlert size={16} className="shrink-0 md:w-[18px] md:h-[18px]"/> {authError}</div>}
                  
                  <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all transform active:scale-[0.98] mt-4 text-sm md:text-[15px]">{isLoginMode ? 'Увійти до кабінету' : 'Створити акаунт'}</button>
                </form>
                
                <div className="mt-6 md:mt-8 text-center bg-[#0B1120]/50 p-3 md:p-4 rounded-xl border border-[#1F2937]">
                  <button onClick={() => {setIsLoginMode(!isLoginMode); setAuthError('');}} className="text-gray-400 hover:text-white text-xs md:text-sm font-medium transition-colors w-full">{isLoginMode ? 'Ще не з нами? ' : 'Вже є акаунт? '}<span className="text-cyan-400 underline underline-offset-4 decoration-cyan-400/50 hover:decoration-cyan-400">{isLoginMode ? 'Створити зараз' : 'Увійти'}</span></button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full relative z-20 bg-[#0A0F1D]">
            <AppFooter modals={{ terms: () => toggleModal('terms', true), privacy: () => toggleModal('privacy', true), refund: () => toggleModal('refund', true), offer: () => toggleModal('offer', true), tgapi: () => toggleModal('tgapi', true), cookie: () => toggleModal('cookie', true), contacts: () => toggleModal('contacts', true) }} info={companyInfo} />
          </div>

          {renderModals()}
        </div>
      )}

      {currentUser && activeTab !== 'landing' && (
        <>
          <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#131B2C]/90 backdrop-blur-md border-b border-[#1F2937] flex items-center justify-between px-4 z-40 w-full shadow-sm">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveTab('landing')} className="text-gray-500 hover:text-cyan-400 transition-colors p-2 bg-[#0B1120] border border-[#1F2937] rounded-lg shadow-sm" title="На сайт">
                <ArrowLeft size={18} />
              </button>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('home'); setIsBuilderOpen(false); }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-sm"><Bot size={18} className="text-white"/></div>
                <span className="font-bold tracking-wider text-sm text-white">MOROZOV</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 hover:text-white p-2 bg-[#0B1120] border border-[#1F2937] rounded-lg shadow-sm"><Menu size={20} /></button>
          </header>

          {/* Мобільний фон для меню */}
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
          )}

          <aside className={`fixed md:static inset-y-0 left-0 z-50 bg-[#131B2C] border-r border-[#1F2937] transition-transform duration-300 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-72 pt-16 md:pt-0`}>
            <div className="hidden md:flex items-center h-20 px-4 border-b border-[#1F2937] shrink-0 w-full relative">
              {isSidebarCollapsed ? (
                <div className="w-full flex flex-col items-center gap-3">
                    <button onClick={() => setActiveTab('landing')} title="На сайт" className="text-gray-500 hover:text-cyan-400 transition-colors p-1.5 bg-[#0B1120] border border-[#1F2937] rounded-lg">
                        <ArrowLeft size={16} />
                    </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full">
                    <button onClick={() => setActiveTab('landing')} title="На сайт" className="text-gray-500 hover:text-cyan-400 transition-colors p-1.5 bg-[#0B1120] border border-[#1F2937] rounded-lg shrink-0">
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer overflow-hidden" onClick={() => { setActiveTab('home'); setIsBuilderOpen(false); }}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)] shrink-0"><Bot size={16} className="text-white" /></div>
                        <span className="font-bold tracking-wider text-white truncate">MOROZOV</span>
                    </div>
                </div>
              )}
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="hidden md:flex text-gray-500 hover:text-white absolute -right-3 top-7 bg-[#1F2937] rounded-full p-1 border border-[#131B2C] z-10 shadow-sm">{isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}</button>
            </div>
            <div className={`p-4 md:p-6 border-b border-[#1F2937] w-full ${isSidebarCollapsed ? 'md:px-2 md:py-6 flex justify-center' : ''}`}>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="w-10 h-10 rounded-full bg-[#0B1120] border border-[#1F2937] flex items-center justify-center shrink-0 group-hover:border-cyan-500/50 transition-colors"><User size={18} className="text-gray-400 group-hover:text-cyan-400" /></div>
                {!isSidebarCollapsed && (
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${currentUser.role === 'founder' ? 'text-amber-400' : 'text-cyan-400'}`}>{currentUser.status}</p>
                  </div>
                )}
              </div>
            </div>
            <nav className="flex-grow overflow-y-auto py-4 px-3 space-y-2 md:space-y-1 scrollbar-none w-full">
              {[{ id: 'home', icon: Home, label: 'Головна' }, { id: 'bots', icon: Layers, label: 'Мої Воронки' }, { id: 'analytics', icon: TrendingUp, label: 'Аналітика' }, { id: 'pricing', icon: CreditCard, label: 'Тарифи та Оплата' }, { id: 'settings', icon: Settings, label: 'Налаштування' }, ...(currentUser.role === 'founder' || currentUser.role === 'admin' ? [{ id: 'admin', icon: ShieldCheck, label: 'Адмін Панель' }] : [])].map(item => (
                <button key={item.id} onClick={() => handleNavClick(item.id)} title={isSidebarCollapsed ? item.label : ''} className={`w-full flex items-center gap-3 px-4 md:px-3 py-3.5 md:py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white border border-transparent'} ${isSidebarCollapsed ? 'md:justify-center' : ''}`}>
                  <item.icon size={20} className={`shrink-0 ${activeTab === item.id ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`} />
                  {!isSidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-[#1F2937] w-full">
              <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-4 md:px-3 py-3.5 md:py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors ${isSidebarCollapsed ? 'md:justify-center' : ''}`}><LogOut size={20} className="shrink-0" />{!isSidebarCollapsed && <span className="text-sm font-medium">Вийти</span>}</button>
            </div>
          </aside>

          <main className="flex-grow relative flex flex-col h-[100dvh] md:h-screen overflow-y-auto bg-[#0A0F1D] pt-16 md:pt-0 w-full">
            <div className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-10 pb-10">
              
              {activeTab === 'home' && (
                <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                  <div className="bg-gradient-to-r from-[#131B2C] to-[#0B1120] rounded-2xl md:rounded-3xl p-6 md:p-8 border border-[#1F2937] relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-48 md:w-64 h-48 md:h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 relative z-10">Привіт, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{currentUser.name}</span></h1>
                    <p className="text-sm md:text-base text-gray-400 max-w-xl relative z-10">Створюй потужні автоворонки. Автоматизуй залучення лідів, прогрів та продажі без написання коду.</p>
                    <button onClick={() => openBuilder()} className="w-full md:w-auto justify-center mt-6 bg-cyan-500/10 border border-cyan-500/50 hover:bg-cyan-500/20 text-cyan-400 px-6 py-3 md:py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 relative z-10 text-sm md:text-base">
                      <Plus size={18} className="shrink-0" /> Створити Бота
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-[#131B2C] border border-[#1F2937] p-5 md:p-6 rounded-2xl md:rounded-3xl hover:border-cyan-500/30 transition-all group">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#0A0F1D] flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform"><Database size={20} className="md:w-6 md:h-6" /></div>
                      <h3 className="text-base md:text-lg font-semibold text-white mb-2">Розумні Лід-магніти (Flow Builder)</h3>
                      <p className="text-xs md:text-sm text-gray-400 leading-relaxed">Створюйте ланцюжки з умовами, очікуванням вводу та кнопками розгалуження.</p>
                    </div>
                    <div className="bg-[#131B2C] border border-[#1F2937] p-5 md:p-6 rounded-2xl md:rounded-3xl hover:border-cyan-500/30 transition-all group">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-[#0A0F1D] flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform"><Zap size={20} className="md:w-6 md:h-6" /></div>
                      <h3 className="text-base md:text-lg font-semibold text-white mb-2">Базові Автоворонки</h3>
                      <p className="text-xs md:text-sm text-gray-400 leading-relaxed">Швидкі відповіді на слова-тригери для базових тарифів.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bots' && (
                <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                  <div className="flex flex-row justify-between items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Мої Воронки</h2>
                    <button onClick={() => openBuilder()} className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-2.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform"><Plus size={20} /></button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {bots.filter(b => b.userId === currentUser.id).length === 0 ? (
                      <div className="col-span-full bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-[#0A0F1D] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500"><Bot size={32} className="md:w-10 md:h-10" /></div>
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-2">У вас ще немає ботів</h3>
                        <button onClick={() => openBuilder()} className="text-cyan-400 font-medium hover:text-cyan-300 text-sm md:text-base">Створити +</button>
                      </div>
                    ) : (
                      bots.filter(b => b.userId === currentUser.id).map(bot => {
                        const maxUsersForBot = getPlanLimitForUser(currentUser, 'maxUsers');
                        const displayMaxUsers = maxUsersForBot === Infinity ? '∞' : maxUsersForBot.toLocaleString();
                        const currentUsersCount = bot.uniqueUserIds ? bot.uniqueUserIds.length : (bot.users || 0);
                        const isLimitReached = maxUsersForBot !== Infinity && currentUsersCount >= maxUsersForBot;

                        return (
                        <div key={bot.id} className="bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl p-5 md:p-6 hover:border-cyan-500/20 transition-all flex flex-col justify-between group">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#0B1120] to-[#1F2937] border border-[#1F2937] flex items-center justify-center shadow-inner group-hover:border-cyan-500/50 transition-colors shrink-0"><Bot className="text-cyan-400 md:w-6 md:h-6" size={20} /></div>
                                <div className="overflow-hidden">
                                  <h3 className="text-base md:text-lg font-bold text-white truncate">{bot.name}</h3>
                                  <p className="text-[11px] md:text-xs text-gray-500 font-mono mt-0.5 truncate">{bot.username ? `@${bot.username}` : 'Токен не перевірено'}</p>
                                </div>
                              </div>
                              <button onClick={() => toggleBotStatus(bot.id)} className={`p-2 rounded-xl transition-colors shrink-0 ${bot.status === 'Активний' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`} title={bot.status === 'Активний' ? 'Призупинити' : 'Запустити'}>{bot.status === 'Активний' ? <Pause size={18} /> : <Play size={18} />}</button>
                            </div>
                            <div className="flex items-center gap-2 mb-5 md:mb-6">
                              <span className={`inline-flex items-center gap-1.5 text-[10px] md:text-[11px] font-medium px-2 py-1 rounded-md shrink-0 ${bot.status === 'Активний' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'Активний' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />{bot.status === 'Активний' ? 'Працює' : 'Пауза'}
                              </span>
                              <div className="w-px h-4 bg-[#1F2937]"></div>
                              <div className="flex gap-1.5 flex-wrap overflow-hidden h-[22px]">
                                {bot.modules.map((mod, i) => <span key={i} className="text-[9px] md:text-[10px] text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 md:py-1 rounded-md whitespace-nowrap">{mod}</span>)}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-t border-[#1F2937] pt-4 mt-auto gap-4 sm:gap-0">
                            <div className="flex gap-6">
                              <div>
                                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-1">Юзери (Місяць)</p>
                                <p className={`text-white font-mono font-medium text-xs md:text-sm ${isLimitReached ? 'text-red-400' : ''}`}>
                                  {currentUsersCount.toLocaleString()} <span className="text-gray-500 text-[10px] md:text-xs">/ {displayMaxUsers}</span>
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-wider mb-1">Завершено циклів</p>
                                <p className="text-cyan-400 font-mono font-medium text-xs md:text-sm">{(bot.interactions || 0).toLocaleString()}</p>
                              </div>
                            </div>
                            <button onClick={() => openBuilder(bot)} className="w-full sm:w-auto text-sm text-white hover:text-cyan-400 transition-colors bg-[#0B1120] px-4 py-2.5 sm:py-2 rounded-xl border border-[#1F2937] hover:border-cyan-500/30 text-center">Налаштувати</button>
                          </div>
                        </div>
                      )})
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (() => {
                const myBotsList = bots.filter(b => b.userId === currentUser.id);
                const selectedBotData = analyticsSelectedBot === 'all' 
                  ? { name: 'Всі боти', users: myBotsList.reduce((sum, b) => sum + (b.users||0), 0), interactions: myBotsList.reduce((sum, b) => sum + (b.interactions||0), 0) }
                  : myBotsList.find(b => b.id === parseInt(analyticsSelectedBot)) || { users: 0, interactions: 0 };
                  
                return (
                <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">Аналітика</h2>
                      <p className="text-gray-400 text-xs md:text-sm">Зведення по вашій воронці продажів.</p>
                    </div>
                    <div className="w-full md:w-64">
                      <label className="text-[9px] md:text-[10px] uppercase text-gray-500 font-bold tracking-wider mb-1.5 block">Оберіть проєкт</label>
                      <div className="relative">
                        <select value={analyticsSelectedBot} onChange={(e) => setAnalyticsSelectedBot(e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl pl-4 pr-10 py-3 md:py-2.5 text-white text-base md:text-sm focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer">
                          <option value="all">Всі проєкти (Сумарно)</option>
                          {myBotsList.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {[
                      { label: 'Нові користувачі (Унікальні)', value: selectedBotData.users.toLocaleString(), color: 'text-white', icon: Users },
                      { label: 'Взаємодії (Завершені цикли)', value: selectedBotData.interactions.toLocaleString(), color: 'text-cyan-400', icon: MessageSquare }
                    ].map((item, i) => (
                      <div key={i} className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl md:rounded-3xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className={`absolute right-[-10%] top-[-10%] w-24 h-24 rounded-full opacity-10 bg-current ${item.color} blur-2xl group-hover:opacity-20 transition-opacity`} />
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                          <p className="text-[11px] md:text-xs text-gray-400 font-medium">{item.label}</p>
                          <item.icon size={16} className={item.color} />
                        </div>
                        <p className={`text-2xl md:text-3xl font-bold font-mono ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl p-4 md:p-6 h-[300px] md:h-[400px] flex flex-col">
                    <h3 className="text-white font-medium mb-4 md:mb-6 text-sm md:text-base">Динаміка за тиждень</h3>
                    <div className="flex-grow">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ANALYTICS_DATA_WEEK} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                          <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                          <XAxis dataKey="name" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1F2937', borderRadius: '12px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#22D3EE' }} />
                          <Area type="monotone" dataKey="users" stroke="#22D3EE" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Нові Користувачі" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                );
              })()}

              {activeTab === 'pricing' && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
                  <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 md:mb-4">Оберіть ідеальний тариф</h2>
                    <p className="text-xs md:text-sm text-gray-400 px-4">Масштабуйте продажі за допомогою автоворонок. Скасуйте в будь-який момент.</p>
                    <div className="inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-4 md:mt-6 bg-[#131B2C] border border-[#1F2937] px-4 py-2 rounded-xl sm:rounded-full text-xs md:text-sm w-full sm:w-auto">
                      <span className="text-gray-400">Ваш поточний тариф:</span>
                      <span className={`font-bold text-base sm:text-sm ${currentUser.plan === 'Unlimited' ? 'text-amber-400' : currentUser.plan === 'Agency' ? 'text-purple-400' : currentUser.plan === 'Pro' ? 'text-blue-400' : 'text-green-400'}`}>{currentUser.plan}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                    {['Starter', 'Pro', 'Agency'].map(planKey => (
                      <div key={planKey} className={`${planKey === 'Pro' ? 'bg-gradient-to-b from-[#131B2C] to-[#0A0F1D] border-2 border-cyan-500/50 lg:-translate-y-4 shadow-[0_0_30px_rgba(34,211,238,0.15)]' : 'bg-[#131B2C] border border-[#1F2937]'} rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col relative`}>
                        {planKey === 'Pro' && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-[#0A0F1D] px-3 md:px-4 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">Популярный</div>}
                        <h3 className={`text-lg md:text-xl font-bold mb-2 ${planKey === 'Starter' ? 'text-white' : planKey === 'Pro' ? 'text-cyan-400' : 'text-white'}`}>{planKey}</h3>
                        <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-6 whitespace-pre-wrap leading-relaxed">{plansConfig[planKey].description}</p>
                        <div className="mb-4 md:mb-6 mt-auto"><span className="text-3xl md:text-4xl font-bold text-white">₴{plansConfig[planKey].price}</span><span className="text-gray-500 text-sm"> / міс</span></div>
                        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 text-xs md:text-sm text-gray-300">
                          {plansConfig[planKey].features.map((feat, i) => (
                            <li key={i} className={`flex items-center gap-3 ${feat.included ? '' : 'text-gray-600'}`}>
                              {feat.included ? <Check size={16} className={`shrink-0 ${planKey === 'Starter' ? 'text-green-400' : planKey === 'Pro' ? 'text-cyan-400' : 'text-purple-400'}`}/> : <X size={16} className="shrink-0" />}
                              {feat.text}
                            </li>
                          ))}
                        </ul>
                        {currentUser.plan === planKey || (currentUser.plan === 'Unlimited' && planKey === 'Agency') ? (
                          <button disabled className={`w-full py-3.5 md:py-3 font-medium rounded-xl border cursor-not-allowed text-sm md:text-base ${planKey === 'Pro' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : planKey === 'Agency' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>Поточний тариф</button>
                        ) : (
                          <button onClick={() => { setCheckoutPlan(planKey); setCheckoutAgreed(false); }} className={`w-full py-3.5 md:py-3 font-medium rounded-xl transition-all text-sm md:text-base ${planKey === 'Pro' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] transform active:scale-[0.98]' : 'bg-[#1E293B] hover:bg-[#2D3748] text-white border border-transparent ' + (planKey === 'Agency' ? 'hover:border-purple-500' : '')}`}>Обрати {planKey}</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Налаштування профілю</h2>
                  <form onSubmit={saveSettings} className="space-y-6">
                    <div className="bg-[#131B2C] border border-[#1F2937] p-5 md:p-6 rounded-2xl md:rounded-3xl">
                      <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-[#1F2937]">
                        <User size={20} className="text-cyan-400 shrink-0"/>
                        <h3 className="text-base md:text-lg font-semibold text-white">Обліковий запис</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4 md:gap-5">
                        <div className="bg-[#0B1120] border border-[#1F2937] rounded-xl p-4 flex items-center justify-between mb-2">
                          <div className="overflow-hidden pr-2">
                            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Ваш унікальний ID</p>
                            <p className="text-xs md:text-sm font-mono text-cyan-400 truncate">{currentUser.id}</p>
                          </div>
                          <Fingerprint size={24} className="text-gray-600 shrink-0" />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold block">Ім'я</label>
                          <input type="text" value={settingsForm.name} onChange={e=>setSettingsForm({...settingsForm, name: e.target.value})} required className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors shadow-sm text-base md:text-sm" placeholder="Ваше ім'я" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-bold block">Змінити пароль</label>
                          <input type="password" value={settingsForm.password} onChange={e=>setSettingsForm({...settingsForm, password: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors shadow-sm text-base md:text-sm" placeholder="Введіть новий пароль" />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 md:pt-4">
                      <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 md:py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all text-sm md:text-base">Зберегти налаштування</button>
                    </div>
                  </form>

                  {/* Управління підпискою */}
                  <div className="bg-[#131B2C] border border-[#1F2937] p-5 md:p-6 rounded-2xl md:rounded-3xl mt-6">
                    <div className="flex items-center gap-3 mb-4 md:mb-6 pb-4 border-b border-[#1F2937]">
                      <CardIcon size={20} className="text-cyan-400 shrink-0"/>
                      <h3 className="text-base md:text-lg font-semibold text-white">Управління підпискою</h3>
                    </div>
                    
                    <div className="bg-[#0B1120] border border-[#1F2937] rounded-xl p-4 md:p-5 mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                          <span className="text-gray-400 text-xs md:text-sm">Поточний тариф:</span>
                          <span className={`font-bold text-sm md:text-base ${currentUser.plan === 'Unlimited' ? 'text-amber-400' : currentUser.plan === 'Agency' ? 'text-purple-400' : currentUser.plan === 'Pro' ? 'text-blue-400' : 'text-green-400'}`}>{currentUser.plan}</span>
                      </div>
                      {currentUser.plan !== 'Starter' && currentUser.plan !== 'Unlimited' && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-[#1F2937]/50 mt-2">
                              <span className="text-gray-400 text-xs md:text-sm">Автосписання (Автопродовження):</span>
                              {currentUser.autoRenew !== false ? (
                                  <span className="text-green-400 text-[10px] md:text-[11px] uppercase tracking-wider font-bold bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto">Увімкнено</span>
                              ) : (
                                  <span className="text-amber-400 text-[10px] md:text-[11px] uppercase tracking-wider font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md self-start sm:self-auto">Вимкнено</span>
                              )}
                          </div>
                      )}
                      {currentUser.refundRequested && (
                          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                              <Clock size={16} className="text-amber-400 shrink-0 mt-0.5 md:w-[18px] md:h-[18px]"/>
                              <p className="text-[11px] md:text-xs text-amber-400/90 leading-relaxed">Ваш запит на повернення коштів знаходиться на розгляді. Ми зв'яжемося з вами найближчим часом через пошту.</p>
                          </div>
                      )}
                    </div>

                    {currentUser.plan !== 'Starter' && currentUser.plan !== 'Unlimited' && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            {currentUser.autoRenew !== false && (
                                <button onClick={handleCancelAutoRenew} className="flex-1 py-3.5 md:py-3 rounded-xl border border-[#1F2937] text-gray-300 hover:text-white hover:bg-[#1E293B] font-medium transition-colors text-xs md:text-sm">
                                    Вимкнути автопродовження
                                </button>
                            )}
                            {!currentUser.refundRequested && (
                                <button onClick={handleRequestRefund} className="flex-1 py-3.5 md:py-3 rounded-xl border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors text-xs md:text-sm">
                                    Запросити Refund
                                </button>
                            )}
                        </div>
                    )}
                    {(currentUser.plan === 'Starter' || currentUser.plan === 'Unlimited') && (
                        <p className="text-[11px] md:text-xs text-gray-500 text-center mt-2">Для вашого поточного тарифу управління автоматичним списанням не застосовується.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'admin' && ['founder', 'admin'].includes(currentUser.role) && (
                <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border shrink-0 ${currentUser.role === 'founder' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}><ShieldCheck size={20} className="md:w-6 md:h-6"/></div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{currentUser.role === 'founder' ? 'SuperAdmin' : 'Адміністратор'}</h2>
                        <p className="text-xs md:text-sm text-gray-400">Управління платформою</p>
                      </div>
                    </div>
                    
                    <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                      <div className="flex bg-[#131B2C] border border-[#1F2937] rounded-xl p-1 w-max">
                        <button onClick={() => setAdminSubTab('users')} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${adminSubTab === 'users' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Користувачі</button>
                        <button onClick={() => setAdminSubTab('funnels')} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${adminSubTab === 'funnels' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Автоворонки</button>
                        <button onClick={() => setAdminSubTab('leadmagnets')} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${adminSubTab === 'leadmagnets' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Лід-магніти</button>
                        {currentUser.role === 'founder' && (
                          <button onClick={() => setAdminSubTab('settings')} className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${adminSubTab === 'settings' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}>Налаштування</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {adminSubTab === 'users' && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl">
                          <p className="text-[11px] md:text-xs text-gray-400 mb-1">Всього користувачів</p>
                          <p className="text-xl md:text-2xl font-bold font-mono text-white">{users.length}</p>
                        </div>
                        <div className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl border-l-4 border-l-green-500">
                          <p className="text-[11px] md:text-xs text-gray-400 mb-1">Очікуваний MRR (Дохід)</p>
                          <p className="text-xl md:text-2xl font-bold font-mono text-green-400">
                            ₴{users.reduce((acc, u) => acc + (u.plan === 'Agency' ? plansConfig.Agency.price : u.plan === 'Pro' ? plansConfig.Pro.price : u.plan === 'Starter' ? plansConfig.Starter.price : 0), 0)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4 md:mb-6 w-full relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" />
                        </div>
                        <input 
                          type="text" 
                          value={adminUserSearch} 
                          onChange={e => setAdminUserSearch(e.target.value)} 
                          placeholder="Пошук користувачів..." 
                          className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 md:py-3 text-base md:text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                        />
                      </div>

                      <div className="bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
                            <thead className="bg-[#0B1120] text-gray-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-[#1F2937]">
                              <tr>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Користувач</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Роль</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Тариф</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-right">Дії</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                              {users.filter(u => {
                                if (!adminUserSearch) return true;
                                const search = adminUserSearch.toLowerCase();
                                return (
                                  u.id.toString().toLowerCase().includes(search) || u.name.toLowerCase().includes(search) || (u.plan && u.plan.toLowerCase().includes(search))
                                );
                              }).map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 md:px-6 py-3 md:py-4">
                                    <div className="font-medium text-white flex items-center gap-2">
                                        {u.name}
                                        {u.refundRequested && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 uppercase font-bold tracking-wider" title="Запросив повернення коштів">Refund</span>}
                                        {u.status && u.status.includes('Бан') && <span className="bg-red-500/20 text-red-400 text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 uppercase font-bold tracking-wider">{u.status}</span>}
                                        {u.status && !u.status.includes('Бан') && !u.status.includes('Starter') && !u.status.includes('Founder') && <span className="text-cyan-400 text-[9px] md:text-[10px] uppercase font-bold tracking-wider ml-1">{u.status}</span>}
                                    </div>
                                    <div className="text-[9px] md:text-[10px] text-cyan-500 mt-0.5">{u.id}</div>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4">
                                    <span className={`inline-flex px-2 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${u.role === 'founder' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-gray-800 text-gray-300'}`}>
                                      {u.role}
                                    </span>
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4">
                                    <div className="text-gray-300 font-medium text-xs md:text-sm">{u.plan}</div>
                                    {u.planStartDate && <div className="text-[9px] md:text-[10px] text-green-400 mt-1 uppercase tracking-wider font-bold">Оплачено: {new Date(u.planStartDate).toLocaleDateString('uk-UA')}</div>}
                                    {u.planExpiry && <div className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider font-bold">Діє до: {u.planExpiry === '2099-12-31' ? 'Назавжди' : new Date(u.planExpiry).toLocaleDateString('uk-UA')}</div>}
                                  </td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                    <div className="flex justify-end gap-1.5 md:gap-2">
                                      {(currentUser.role === 'founder' || u.role !== 'founder') && (
                                        <button onClick={() => setAdminEditingUser({...u, newPassword: ''})} className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-1.5 md:p-2 rounded-lg transition-colors" title="Редагувати">
                                          <Edit size={14} className="md:w-4 md:h-4" />
                                        </button>
                                      )}
                                      {u.id !== currentUser.id && u.id !== 'ID0' && (currentUser.role === 'founder' || u.role !== 'founder') && (
                                        <>
                                          <button onClick={() => adminPauseUserBots(u.id)} className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 p-1.5 md:p-2 rounded-lg transition-colors" title="Зупинити всіх ботів користувача">
                                            <Pause size={14} className="md:w-4 md:h-4" />
                                          </button>
                                          <button onClick={() => adminDeleteUser(u.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 md:p-2 rounded-lg transition-colors" title="Видалити">
                                            <Trash2 size={14} className="md:w-4 md:h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {adminSubTab === 'funnels' && (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl flex-shrink-0 w-full sm:w-auto">
                          <p className="text-[11px] md:text-xs text-gray-400 mb-1">Всього базових автоворонок</p>
                          <p className="text-xl md:text-2xl font-bold font-mono text-cyan-400">{bots.filter(b => b.modules.includes('Автоворонка')).length}</p>
                        </div>
                        <div className="w-full sm:w-80 md:w-96 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" />
                          </div>
                          <input 
                            type="text" 
                            value={adminBotSearch} 
                            onChange={e => setAdminBotSearch(e.target.value)} 
                            placeholder="Пошук за ID юзера або назвою бота..." 
                            className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 text-base md:text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
                            <thead className="bg-[#0B1120] text-gray-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-[#1F2937]">
                              <tr>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Воронка</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Власник</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Статус</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-right">Дії (God Mode)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                              {bots.filter(b => b.modules.includes('Автоворонка')).filter(b => {
                                if (!adminBotSearch) return true;
                                const search = adminBotSearch.toLowerCase();
                                return (b.name.toLowerCase().includes(search) || b.userId.toString().toLowerCase().includes(search));
                              }).map(b => {
                                const owner = users.find(u => u.id === b.userId);
                                return (
                                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <div className="font-medium text-white flex items-center gap-2">
                                        <Bot size={14} className="text-cyan-400"/> {b.name}
                                      </div>
                                      <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">
                                        Юзерів: {b.uniqueUserIds?.length || 0} / {getPlanLimitForUser(owner, 'maxUsers') === Infinity ? '∞' : getPlanLimitForUser(owner, 'maxUsers')}
                                      </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <div className="text-gray-300">{owner ? owner.name : 'Видалено'}</div>
                                      <div className="text-[9px] md:text-[10px] text-cyan-500 mt-0.5">{b.userId}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <span className={`inline-flex px-2 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${b.status === 'Активний' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                        {b.status}
                                      </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                      <div className="flex justify-end gap-1.5 md:gap-2">
                                        <button onClick={() => openBuilder(b)} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1.5 md:p-2 rounded-lg transition-colors flex items-center gap-1 text-[10px] md:text-xs font-medium" title="Увійти та редагувати чужого бота">
                                          <Settings size={14} /> <span className="hidden sm:inline">Налаштувати</span>
                                        </button>
                                        <button onClick={() => toggleBotStatus(b.id)} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors" title={b.status === 'Активний' ? 'Призупинити' : 'Запустити'}>
                                          {b.status === 'Активний' ? <Pause size={14} className="md:w-4 md:h-4" /> : <Play size={14} className="md:w-4 md:h-4" />}
                                        </button>
                                        <button onClick={() => adminDeleteBot(b.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 md:p-2 rounded-lg transition-colors" title="Видалити">
                                          <Trash2 size={14} className="md:w-4 md:h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {adminSubTab === 'leadmagnets' && (
                    <>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl flex-shrink-0 w-full sm:w-auto">
                          <p className="text-[11px] md:text-xs text-gray-400 mb-1">Всього розумних лід-магнітів</p>
                          <p className="text-xl md:text-2xl font-bold font-mono text-cyan-400">{bots.filter(b => b.modules.includes('Лід-магніт')).length}</p>
                        </div>
                        <div className="w-full sm:w-80 md:w-96 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={16} className="text-gray-500 md:w-[18px] md:h-[18px]" />
                          </div>
                          <input 
                            type="text" 
                            value={adminBotSearch} 
                            onChange={e => setAdminBotSearch(e.target.value)} 
                            placeholder="Пошук за ID юзера або назвою бота..." 
                            className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl pl-10 pr-4 py-3 text-base md:text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="bg-[#131B2C] border border-[#1F2937] rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs md:text-sm whitespace-nowrap">
                            <thead className="bg-[#0B1120] text-gray-400 text-[10px] md:text-xs uppercase tracking-wider border-b border-[#1F2937]">
                              <tr>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Лід-магніт</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Власник</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium">Статус</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 font-medium text-right">Дії (God Mode)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1F2937]">
                              {bots.filter(b => b.modules.includes('Лід-магніт')).filter(b => {
                                if (!adminBotSearch) return true;
                                const search = adminBotSearch.toLowerCase();
                                return (b.name.toLowerCase().includes(search) || b.userId.toString().toLowerCase().includes(search));
                              }).map(b => {
                                const owner = users.find(u => u.id === b.userId);
                                return (
                                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <div className="font-medium text-white flex items-center gap-2">
                                        <Bot size={14} className="text-cyan-400"/> {b.name}
                                      </div>
                                      <div className="text-[9px] md:text-[10px] text-gray-400 mt-1">
                                        Юзерів: {b.uniqueUserIds?.length || 0} / {getPlanLimitForUser(owner, 'maxUsers') === Infinity ? '∞' : getPlanLimitForUser(owner, 'maxUsers')}
                                      </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <div className="text-gray-300">{owner ? owner.name : 'Видалено'}</div>
                                      <div className="text-[9px] md:text-[10px] text-cyan-500 mt-0.5">{b.userId}</div>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4">
                                      <span className={`inline-flex px-2 py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${b.status === 'Активний' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                        {b.status}
                                      </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                      <div className="flex justify-end gap-1.5 md:gap-2">
                                        <button onClick={() => openBuilder(b)} className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1.5 md:p-2 rounded-lg transition-colors flex items-center gap-1 text-[10px] md:text-xs font-medium" title="Увійти та редагувати чужого бота">
                                          <Settings size={14} /> <span className="hidden sm:inline">Налаштувати</span>
                                        </button>
                                        <button onClick={() => toggleBotStatus(b.id)} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 md:p-2 rounded-lg transition-colors" title={b.status === 'Активний' ? 'Призупинити' : 'Запустити'}>
                                          {b.status === 'Активний' ? <Pause size={14} className="md:w-4 md:h-4" /> : <Play size={14} className="md:w-4 md:h-4" />}
                                        </button>
                                        <button onClick={() => adminDeleteBot(b.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 md:p-2 rounded-lg transition-colors" title="Видалити">
                                          <Trash2 size={14} className="md:w-4 md:h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}

                  {adminSubTab === 'settings' && (
                    <div className="space-y-4 md:space-y-6 pb-20">
                      <div className="bg-[#131B2C] border border-[#1F2937] p-4 md:p-6 rounded-2xl md:rounded-3xl mb-4 md:mb-6">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-white mb-1">Юридична інформація (Оферти)</h3>
                                <p className="text-[11px] md:text-sm text-gray-400">Ці дані автоматично підставляться у всі документи.</p>
                            </div>
                            <button onClick={handleSavePlansAndInfo} className="text-cyan-400 hover:text-cyan-300 font-bold transition-all flex items-center gap-2 bg-transparent text-sm">
                              <Save size={18} className="md:w-5 md:h-5" /> <span className="hidden sm:inline">Зберегти</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-2 bg-[#0B1120] p-4 md:p-5 rounded-2xl border border-[#1F2937]">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">ФОП / ТОВ</label>
                                <input type="text" value={companyInfo.fop} onChange={(e) => setCompanyInfo({...companyInfo, fop: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="ФОП Іванов І.І." />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Код ЄДРПОУ / ІПН</label>
                                <input type="text" value={companyInfo.edrpou} onChange={(e) => setCompanyInfo({...companyInfo, edrpou: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="1234567890" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Юридична адреса</label>
                                <input type="text" value={companyInfo.address} onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="м. Київ, вул. Хрещатик, 1" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Email</label>
                                <input type="text" value={companyInfo.email} onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="support@morozov.com" />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Telegram Support</label>
                                <input type="text" value={companyInfo.tgSupport} onChange={(e) => setCompanyInfo({...companyInfo, tgSupport: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="@morozov_support" />
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4 md:mb-6 mt-6 md:mt-8">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-white mb-1">Налаштування Тарифів</h3>
                                <p className="text-[11px] md:text-sm text-gray-400">Зміни відобразяться на лімітах та сторінці "Тарифи".</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 md:gap-6">
                          {['Starter', 'Pro', 'Agency'].map(planKey => (
                            <div key={planKey} className="bg-[#0B1120] border border-[#1F2937] p-4 md:p-5 rounded-2xl flex flex-col lg:flex-row gap-4 md:gap-6">
                              
                              <div className="flex-1 space-y-4">
                                  <h4 className={`text-lg md:text-xl font-bold ${planKey === 'Starter' ? 'text-green-400' : planKey === 'Pro' ? 'text-cyan-400' : 'text-purple-400'}`}>{planKey}</h4>
                                  
                                  <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Короткий опис</label>
                                    <textarea rows="3" value={plansConfig[planKey].description} onChange={(e) => adminUpdatePlans(planKey, 'description', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-xs outline-none focus:border-cyan-500 resize-none whitespace-pre-wrap" />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                                      <div>
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Ціна (₴)</label>
                                          <input type="number" value={plansConfig[planKey].price} onChange={(e) => adminUpdatePlans(planKey, 'price', Number(e.target.value))} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Макс. Ботів</label>
                                          <input type="text" value={plansConfig[planKey].maxBots} onChange={(e) => adminUpdatePlans(planKey, 'maxBots', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Макс. Юзерів</label>
                                          <input type="text" value={plansConfig[planKey].maxUsers} onChange={(e) => adminUpdatePlans(planKey, 'maxUsers', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      </div>
                                      <div>
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Макс. Воронок</label>
                                          <input type="text" value={plansConfig[planKey].maxFlows} onChange={(e) => adminUpdatePlans(planKey, 'maxFlows', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      </div>
                                      <div className="col-span-2">
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1" title="Макс. блоків у воронці Лід-магніту">Модулів (Блоків у воронці)</label>
                                          <input type="text" value={plansConfig[planKey].maxModules} onChange={(e) => adminUpdatePlans(planKey, 'maxModules', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      </div>
                                      <div className="col-span-2">
                                          <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Посилання на оплату (WayForPay)</label>
                                          <input type="url" value={plansConfig[planKey].paymentUrl || ''} onChange={(e) => adminUpdatePlans(planKey, 'paymentUrl', e.target.value)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" placeholder="https://secure.wayforpay.com/button/..." />
                                      </div>
                                  </div>
                                  
                                  <div className="pt-2 border-t border-[#1F2937]">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Доступні модулі конструктора</label>
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                          <input type="checkbox" checked={plansConfig[planKey].allowedModules?.includes('Автоворонка') || false} onChange={() => adminTogglePlanModule(planKey, 'Автоворонка')} className="accent-cyan-500 w-4 h-4 md:w-4 md:h-4" /> Автоворонка
                                      </label>
                                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                          <input type="checkbox" checked={plansConfig[planKey].allowedModules?.includes('Лід-магніт') || false} onChange={() => adminTogglePlanModule(planKey, 'Лід-магніт')} className="accent-cyan-500 w-4 h-4 md:w-4 md:h-4" /> Розумний Лід-магніт
                                      </label>
                                    </div>
                                  </div>
                              </div>

                              <div className="flex-1 bg-[#131B2C] p-4 rounded-xl border border-[#1F2937] flex flex-col">
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Опції (візуальне відображення)</label>
                                <div className="space-y-2 mb-3 flex-grow">
                                  {plansConfig[planKey].features.map((feat, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                      <button onClick={() => adminUpdateFeatureState(planKey, idx, !feat.included)} className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${feat.included ? (planKey === 'Starter' ? 'bg-green-500/20 border-green-500/50 text-green-400' : planKey === 'Pro' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-purple-500/20 border-purple-500/50 text-purple-400') : 'bg-[#0B1120] border-[#1F2937] text-gray-500'}`}>
                                        {feat.included ? <Check size={12}/> : <X size={12}/>}
                                      </button>
                                      <input type="text" value={feat.text} onChange={(e) => adminUpdateFeatureText(planKey, idx, e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-2 py-2 text-white text-base md:text-xs outline-none focus:border-cyan-500" />
                                      <button onClick={() => adminRemoveFeature(planKey, idx)} className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={14} className="md:w-3 md:h-3" /></button>
                                    </div>
                                  ))}
                                </div>
                                <button onClick={() => adminAddFeature(planKey)} className="w-full py-2.5 md:py-2 bg-blue-600/10 text-cyan-400 text-sm md:text-xs rounded-lg border border-cyan-500/20 font-medium hover:bg-blue-600/20 transition-colors mt-auto">+ Додати опцію</button>
                              </div>

                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </>
      )}

      {/* ADMIN EDIT USER MODAL */}
      {adminEditingUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setAdminEditingUser(null)} />
          <div className="relative w-full max-w-md bg-[#131B2C] rounded-2xl md:rounded-3xl border border-[#1F2937] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 md:px-6 py-4 border-b border-[#1F2937] flex justify-between items-center bg-[#0B1120]">
              <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2"><Edit size={18} className="text-cyan-400"/> Редагувати користувача</h2>
              <button onClick={() => setAdminEditingUser(null)} className="text-gray-400 hover:text-white p-2 md:p-1 rounded-md transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={adminSaveUser} className="p-5 md:p-6 space-y-4">
              <div>
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Ім'я</label>
                <input type="text" value={adminEditingUser.name} onChange={e => setAdminEditingUser({...adminEditingUser, name: e.target.value})} required className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" />
              </div>
              <div>
                <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Кастомний статус</label>
                <input type="text" value={adminEditingUser.status || ''} onChange={e => setAdminEditingUser({...adminEditingUser, status: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" placeholder="VIP, Очікує оплати, Заблокований..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Роль</label>
                  <select value={adminEditingUser.role} onChange={e => setAdminEditingUser({...adminEditingUser, role: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none cursor-pointer text-base md:text-sm">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    {currentUser.role === 'founder' && <option value="founder">Founder</option>}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Тариф</label>
                  <select value={adminEditingUser.plan} onChange={e => setAdminEditingUser({...adminEditingUser, plan: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none cursor-pointer text-base md:text-sm">
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Agency">Agency</option>
                    <option value="Unlimited">Unlimited</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Дата оплати (Початок)</label>
                  <input type="date" value={adminEditingUser.planStartDate || ''} onChange={e => setAdminEditingUser({...adminEditingUser, planStartDate: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" />
                </div>
                <div>
                  <label className="text-[10px] md:text-xs font-bold text-gray-400 uppercase block mb-1">Термін дії (Кінець)</label>
                  <input type="date" value={adminEditingUser.planExpiry || ''} onChange={e => setAdminEditingUser({...adminEditingUser, planExpiry: e.target.value})} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" />
                </div>
              </div>
              <div className="pt-2 md:pt-4 flex flex-col sm:flex-row justify-end gap-2">
                <button type="button" onClick={() => setAdminEditingUser(null)} className="w-full sm:w-auto px-4 py-3 md:py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">Скасувати</button>
                <button type="submit" className="w-full sm:w-auto px-6 py-3 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(34,211,238,0.3)] text-sm">Зберегти</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SMART BUILDER MODAL --- */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && setIsBuilderOpen(false)} />
          <div className="relative w-full md:max-w-5xl h-[100dvh] md:h-[90vh] bg-[#0A0F1D] md:bg-[#0B1120] md:rounded-3xl border-0 md:border border-[#1F2937] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200">
            
            {/* BUILDER SIDEBAR / ТАБИ КОНСТРУКТОРА */}
            <div className="w-full md:w-64 bg-[#131B2C] border-b md:border-b-0 md:border-r border-[#1F2937] p-2 md:p-4 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              
              <div className="hidden md:flex items-center gap-3 cursor-pointer mb-6 px-2 hover:opacity-80 transition-opacity" onClick={() => { setIsBuilderOpen(false); setActiveTab('home'); }}>
                 <ArrowLeft size={20} className="text-gray-400" />
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    <Bot size={20} className="text-white" />
                 </div>
                 <span className="font-bold tracking-wider text-base text-white">На головну</span>
              </div>

              <h3 className="hidden md:block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">Конструктор</h3>
              {[ { id: 'basic', label: 'Основні налаштування', icon: Settings }, { id: 'modules', label: 'Розумні модулі', icon: Zap }, { id: 'menu', label: 'Меню та Чат', icon: LayoutList } ].map(tab => (
                <button key={tab.id} onClick={() => { setBuilderTab(tab.id); setActiveConfigModule(null); setActiveFlowId(null); }} className={`px-4 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap flex items-center gap-2 md:gap-3 ${builderTab === tab.id ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner' : 'text-gray-400 hover:bg-[#1E293B] hover:text-white border border-transparent'}`}><tab.icon size={16} />{tab.label}</button>
              ))}
            </div>
            
            <div className="flex-grow flex flex-col h-full overflow-hidden bg-[#0A0F1D]">
              {/* HEADER МОДАЛКИ (МОБІЛЬНИЙ ТА ДЕКСТОП) */}
              <div className="p-4 md:p-6 border-b border-[#1F2937] flex justify-between items-center bg-[#0B1120] shrink-0 sticky top-0 z-20">
                <h2 className="text-base md:text-xl font-bold text-white flex items-center gap-2 md:gap-3 truncate pr-4">
                  {activeConfigModule && <button onClick={() => { setActiveConfigModule(null); setActiveFlowId(null); }} className="text-gray-400 hover:text-white bg-[#131B2C] p-1.5 md:p-2 rounded-lg border border-[#1F2937] shrink-0"><ArrowLeft size={16}/></button>} 
                  <span className="truncate">{activeConfigModule ? `Налаштування: ${activeConfigModule}` : (editingBot ? 'Налаштування бота' : 'Створення нового бота')}</span>
                </h2>
                <button disabled={isSaving} onClick={() => setIsBuilderOpen(false)} className="text-gray-400 hover:text-white bg-[#131B2C] p-2 md:p-2.5 rounded-xl border border-[#1F2937] disabled:opacity-50 shrink-0"><X size={18}/></button>
              </div>

              <div className="p-4 md:p-6 flex-grow overflow-y-auto">
                {builderTab === 'basic' && (
                  <div className="space-y-4 md:space-y-6 max-w-xl animate-in fade-in duration-300 mx-auto md:mx-0">
                    <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex gap-3">
                       <ShieldAlert className="text-blue-400 shrink-0" size={20}/>
                       <p className="text-[11px] md:text-[12px] text-gray-300 leading-relaxed">Підключаючи Telegram-бота, ви підтверджуєте законне право на Token та згоду з Telegram API Policy.</p>
                    </div>

                    {isModuleAllowed(currentUser.plan, 'Автоворонка') && (
                      <div className="space-y-3 p-4 md:p-5 bg-[#131B2C] rounded-2xl border border-[#1F2937]">
                        <label className="text-xs md:text-sm font-bold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          API Токен (Автоворонка)
                          {tokenStatusFunnel === 'success' && <span className="text-xs text-green-400 flex items-center gap-1 self-start sm:self-auto"><CheckCircle2 size={12}/> Перевірено</span>}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="text" value={builderForm.tokenFunnel} onChange={e => {setBuilderForm({...builderForm, tokenFunnel: e.target.value}); setTokenStatusFunnel('idle');}} className={`w-full sm:flex-grow bg-[#0B1120] border rounded-xl px-4 py-3 text-white font-mono focus:outline-none transition-colors text-base md:text-sm ${tokenStatusFunnel === 'error' ? 'border-red-500/50' : tokenStatusFunnel === 'success' ? 'border-green-500/50' : 'border-[#1F2937] focus:border-cyan-500'}`} placeholder="Токен..." />
                          <button onClick={() => verifyTelegramToken('funnel')} disabled={!builderForm.tokenFunnel || tokenStatusFunnel === 'loading'} className="w-full sm:w-auto justify-center bg-[#1E293B] hover:bg-[#2D3748] border border-[#334155] text-white px-4 py-3 sm:py-0 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                            {tokenStatusFunnel === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Перевірити'}
                          </button>
                        </div>
                      </div>
                    )}

                    {isModuleAllowed(currentUser.plan, 'Лід-магніт') && (
                      <div className="space-y-3 p-4 md:p-5 bg-[#131B2C] rounded-2xl border border-[#1F2937]">
                        <label className="text-xs md:text-sm font-bold text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          API Токен (Розумний Лід-магніт)
                          {tokenStatusLm === 'success' && <span className="text-xs text-green-400 flex items-center gap-1 self-start sm:self-auto"><CheckCircle2 size={12}/> Перевірено</span>}
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input type="text" value={builderForm.tokenLm} onChange={e => {setBuilderForm({...builderForm, tokenLm: e.target.value}); setTokenStatusLm('idle');}} className={`w-full sm:flex-grow bg-[#0B1120] border rounded-xl px-4 py-3 text-white font-mono focus:outline-none transition-colors text-base md:text-sm ${tokenStatusLm === 'error' ? 'border-red-500/50' : tokenStatusLm === 'success' ? 'border-green-500/50' : 'border-[#1F2937] focus:border-cyan-500'}`} placeholder="Токен..." />
                          <button onClick={() => verifyTelegramToken('lm')} disabled={!builderForm.tokenLm || tokenStatusLm === 'loading'} className="w-full sm:w-auto justify-center bg-[#1E293B] hover:bg-[#2D3748] border border-[#334155] text-white px-4 py-3 sm:py-0 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0">
                            {tokenStatusLm === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Перевірити'}
                          </button>
                        </div>
                      </div>
                    )}

                    {verifiedBotData && (
                      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-center gap-4 mt-2">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                          <Bot size={20}/>
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm text-white font-bold truncate">{verifiedBotData.first_name}</p>
                          <p className="text-xs text-cyan-400 font-mono truncate">@{verifiedBotData.username}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-white block">Внутрішня назва проєкту</label>
                      <input type="text" value={builderForm.name} onChange={e=>setBuilderForm({...builderForm, name: e.target.value})} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-cyan-500 focus:outline-none text-base md:text-sm" placeholder="Мой бот..." />
                    </div>
                  </div>
                )}

                {builderTab === 'modules' && (
                  <div className="animate-in fade-in duration-300 h-full">
                    {!activeConfigModule ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                        {(() => {
                          const availableMods = [];
                          if (isModuleAllowed(currentUser.plan, 'Лід-магніт')) availableMods.push({ name: 'Лід-магніт', icon: FileText, desc: 'Розумна воронка з розгалуженням, очікуванням тексту та таймерами.' });
                          if (isModuleAllowed(currentUser.plan, 'Автоворонка')) availableMods.push({ name: 'Автоворонка', icon: Clock, desc: 'Базова система відправки повідомлень.' });
                          return availableMods.map(mod => (
                            <div key={mod.name} className="relative flex flex-col p-4 md:p-5 rounded-2xl border-2 transition-all bg-[#131B2C] border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                              <div className="flex justify-between items-start mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 shrink-0"><mod.icon size={20} /></div><span className="font-bold text-base md:text-lg text-white">{mod.name}</span></div></div>
                              <p className="text-xs md:text-sm text-gray-400 mb-5 flex-grow">{mod.desc}</p>
                              <button onClick={() => setActiveConfigModule(mod.name)} className="w-full py-2.5 md:py-2 bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-400 font-medium rounded-xl border border-cyan-500/20 flex items-center justify-center gap-2"><Sliders size={16} /> Налаштувати</button>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="animate-in slide-in-from-right-8 duration-300 w-full max-w-4xl">
                        {activeConfigModule === 'Лід-магніт' && (
                          <div className="space-y-4 md:space-y-6">
                            
                            <div className="flex flex-col sm:flex-row gap-2 sm:items-center bg-[#131B2C] p-3 rounded-2xl border border-[#1F2937]">
                                <span className="text-[11px] md:text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 sm:mb-0 sm:mr-2 pl-1">Воронки:</span>
                                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full">
                                    {(builderForm.moduleConfigs['Лід-магніт']?.flows || []).map(flow => (
                                        <div key={flow.id} className="relative flex items-center shrink-0"><button onClick={() => setActiveFlowId(flow.id)} className={`px-4 py-2 sm:py-1.5 rounded-l-lg text-xs md:text-sm font-medium transition-colors ${activeFlowId === flow.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-[#0B1120] text-gray-400 border border-[#1F2937] hover:bg-zinc-800'}`}>{flow.name || flow.trigger}</button><button onClick={() => toggleLmFlow(flow.id)} className={`px-3 sm:px-2 py-2 sm:py-1.5 rounded-r-lg border-y border-r border-[#1F2937] text-[10px] md:text-xs font-bold transition-colors ${flow.isActive !== false ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`} title={flow.isActive !== false ? 'Воронка увімкнена. Натисніть, щоб вимкнути' : 'Воронка вимкнена. Натисніть, щоб увімкнути'}>{flow.isActive !== false ? 'ВКЛ' : 'ВИКЛ'}</button></div>
                                    ))}
                                    <button onClick={addLmFlow} className="px-4 sm:px-3 py-2 sm:py-1.5 rounded-lg text-xs md:text-sm font-medium bg-blue-600/10 text-cyan-400 border border-cyan-500/20 hover:bg-blue-600/20 transition-colors shrink-0 whitespace-nowrap">+ Додати воронку</button>
                                </div>
                            </div>

                            {activeLmFlow && (
                              <div className="space-y-4 md:space-y-6">
                                <div className="bg-[#131B2C] p-4 md:p-5 rounded-2xl border border-[#1F2937] flex flex-col md:flex-row md:items-end gap-3 md:gap-4 flex-wrap">
                                  <div className="w-full md:flex-1 md:min-w-[200px]"><label className="text-xs md:text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2"><MessageCircle size={16} className="text-cyan-400"/> Назва воронки</label><input type="text" value={activeLmFlow.name} onChange={e => updateLmFlow(activeLmFlow.id, 'name', e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" /></div>
                                  <div className="w-full md:flex-1 md:min-w-[200px]"><label className="text-xs md:text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2"><Zap size={16} className="text-cyan-400"/> Тригерне слово (активация)</label><input type="text" value={activeLmFlow.trigger} onChange={e => updateLmFlow(activeLmFlow.id, 'trigger', e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 md:py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" placeholder="наприклад: аудит" /></div>
                                  <button onClick={() => deleteLmFlow(activeLmFlow.id)} className="w-full md:w-auto h-[46px] px-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 font-medium transition-colors shrink-0 flex items-center justify-center gap-2 mt-2 md:mt-0"><Trash2 size={16} /> Видалити</button>
                                </div>
                                <div className="space-y-4 relative">
                                    <div className="absolute left-[20px] md:left-[27px] top-6 bottom-6 w-0.5 bg-[#1F2937] -z-10"></div>
                                    {(activeLmFlow.steps || []).map((step, index) => (
                                        <div key={step.id} className="bg-[#131B2C] rounded-2xl border border-[#1F2937] overflow-hidden shadow-sm relative z-0">
                                            <div className="bg-[#0B1120] px-3 md:px-4 py-3 border-b border-[#1F2937] flex items-center justify-between">
                                                <div className="flex items-center gap-2 md:gap-3"><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] md:text-xs font-bold flex items-center justify-center border border-cyan-500/30 shrink-0">{index + 1}</div><span className="font-semibold text-xs md:text-sm text-white truncate pr-2">{step.type === 'message' ? 'Повідомлення' : step.type === 'wait_input' ? 'Очікування слова' : step.type === 'check_sub' ? 'Перевірка підписки' : 'Таймер (Затримка)'}</span></div>
                                                <div className="flex items-center gap-2 md:gap-3 shrink-0"><span className="hidden sm:inline text-[10px] text-gray-500 font-mono bg-[#131B2C] px-2 py-1 rounded">ID: {step.id}</span><button onClick={() => deleteLmStep(step.id)} className="text-gray-500 hover:text-red-400 transition-colors p-1"><Trash2 size={16}/></button></div>
                                            </div>
                                            <div className="p-4 md:p-5">
                                                {step.type === 'message' && (
                                                    <div className="space-y-4">
                                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-[#0B1120] border border-[#1F2937] p-3 md:p-4 rounded-xl mb-4"><div className="flex items-center gap-2"><Clock size={16} className="text-amber-400 shrink-0 md:w-5 md:h-5"/><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase md:mb-0">Таймер перед відправкою:</label></div><div className="w-full md:w-auto"><div className="grid grid-cols-4 gap-2"><div className="flex flex-col"><input type="number" min="0" value={step.delayDays || 0} onChange={e => updateLmStep(step.id, 'delayDays', parseInt(e.target.value)||0)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-2 py-2 md:py-1.5 text-white text-base md:text-sm text-center outline-none focus:border-amber-500" /><span className="text-[9px] text-gray-500 mt-1 text-center uppercase font-bold">Дні</span></div><div className="flex flex-col"><input type="number" min="0" max="23" value={step.delayHours || 0} onChange={e => updateLmStep(step.id, 'delayHours', parseInt(e.target.value)||0)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-2 py-2 md:py-1.5 text-white text-base md:text-sm text-center outline-none focus:border-amber-500" /><span className="text-[9px] text-gray-500 mt-1 text-center uppercase font-bold">Год</span></div><div className="flex flex-col"><input type="number" min="0" max="59" value={step.delayMinutes || 0} onChange={e => updateLmStep(step.id, 'delayMinutes', parseInt(e.target.value)||0)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-2 py-2 md:py-1.5 text-white text-base md:text-sm text-center outline-none focus:border-amber-500" /><span className="text-[9px] text-gray-500 mt-1 text-center uppercase font-bold">Хв</span></div><div className="flex flex-col"><input type="number" min="0" max="59" value={step.delaySeconds || 0} onChange={e => updateLmStep(step.id, 'delaySeconds', parseInt(e.target.value)||0)} className="w-full bg-[#131B2C] border border-[#1F2937] rounded-lg px-2 py-2 md:py-1.5 text-white text-base md:text-sm text-center outline-none focus:border-amber-500" /><span className="text-[9px] text-gray-500 mt-1 text-center uppercase font-bold">Сек</span></div></div></div></div>
                                                        <textarea rows="3" value={step.text} onChange={e => updateLmStep(step.id, 'text', e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none text-base md:text-sm" placeholder="Текст повідомлення..." />
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3"><select value={step.mediaType || 'none'} onChange={e => updateLmStep(step.id, 'mediaType', e.target.value)} className="bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500 w-full sm:w-40 shrink-0"><option value="none">Без медіа</option><option value="photo">Фото (URL)</option><option value="video">Відео (URL)</option><option value="document">Файл (URL)</option></select>{step.mediaType !== 'none' && (<div className="flex-grow flex gap-2"><input type="url" value={step.mediaUrl} onChange={e => updateLmStep(step.id, 'mediaUrl', e.target.value)} placeholder="Посилання на файл (https://...)" className="flex-grow bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" /><button onClick={() => handleFileUpload(step.id)} className="shrink-0 w-11 h-11 md:w-10 md:h-10 bg-blue-600/10 text-cyan-400 rounded-xl flex items-center justify-center hover:bg-blue-600/20 transition-colors" title="Завантажити з пристрою (Для Симулятора)"><Upload size={16}/></button></div>)}</div>
                                                        <div className="pt-4 border-t border-[#1F2937] space-y-3"><label className="text-[11px] font-bold text-gray-500 uppercase block">Кнопки під повідомленням</label>{(step.buttons || []).map(btn => (<div key={btn.id} className="flex flex-col sm:flex-row gap-2 items-start bg-[#0B1120] p-3 rounded-xl border border-[#1F2937]"><input type="text" value={btn.title} onChange={e => updateLmButton(step.id, btn.id, 'title', e.target.value)} placeholder="Текст (Мій Instagram, Сайт)" className="w-full sm:w-1/3 bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" /><select value={btn.actionType} onChange={e => updateLmButton(step.id, btn.id, 'actionType', e.target.value)} className="w-full sm:w-1/4 bg-[#131B2C] border border-[#1F2937] rounded-lg px-2 py-2.5 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500"><option value="url">🌐 Веб-посилання (URL)</option><option value="step">➡️ Перейти до блоку</option></select>{btn.actionType === 'url' ? (<input type="url" value={btn.url} onChange={e => updateLmButton(step.id, btn.id, 'url', e.target.value)} placeholder="https://instagram.com/..., сайт..." className="w-full sm:flex-grow bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />) : (<select value={btn.nextStepId} onChange={e => updateLmButton(step.id, btn.id, 'nextStepId', e.target.value)} className="w-full sm:flex-grow bg-[#131B2C] border border-[#1F2937] rounded-lg px-3 py-2.5 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500"><option value="">Оберіть блок...</option>{activeLmFlow.steps.filter(s => s.id !== step.id).map((s, idx) => (<option key={s.id} value={s.id}>{getStepPreviewLabel(s, activeLmFlow.steps.indexOf(s))}</option>))}</select>)}<button onClick={() => deleteLmButton(step.id, btn.id)} className="w-full sm:w-9 h-10 sm:h-9 flex items-center justify-center text-gray-500 hover:text-red-400 bg-zinc-800 sm:bg-transparent rounded-lg mt-1 sm:mt-0 shrink-0"><Trash2 size={16} /></button></div>))}<button onClick={() => addLmButton(step.id)} className="w-full py-3 md:py-2 bg-[#0B1120] hover:bg-zinc-800 text-cyan-400 text-sm rounded-xl border border-[#1F2937] transition-colors flex items-center justify-center gap-2"><LinkIcon size={14}/> Додати кнопку розгалуження / Веб-посилання</button></div>
                                                    </div>
                                                )}
                                                {step.type === 'check_sub' && (
                                                  <div className="space-y-4">
                                                      <div className="bg-blue-500/10 border border-blue-500/20 p-3 md:p-4 rounded-xl flex flex-col md:flex-row gap-3 items-start">
                                                         <ShieldCheck size={18} className="text-blue-400 mt-0.5 shrink-0 hidden md:block"/>
                                                         <div className="flex-grow space-y-3 w-full">
                                                             <div className="flex items-center gap-2 md:hidden mb-2 border-b border-blue-500/20 pb-2">
                                                                <ShieldCheck size={16} className="text-blue-400 shrink-0"/>
                                                                <h4 className="text-sm font-bold text-white">Перевірка підписки</h4>
                                                             </div>
                                                             <p className="text-[10px] md:text-[11px] text-blue-300 font-medium">Щоб бот міг перевіряти підписку, він обов'язково має бути <b>Адміністратором</b> у вашому каналі!</p>
                                                             <div>
                                                                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Посилання на канал (для кнопки):</label>
                                                                 <input type="url" value={step.channelUrl || ''} onChange={e => updateLmStep(step.id, 'channelUrl', e.target.value)} placeholder="https://t.me/..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" />
                                                             </div>
                                                             <div>
                                                                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">ID або Username каналу (для API):</label>
                                                                 <input type="text" value={step.channelId || ''} onChange={e => updateLmStep(step.id, 'channelId', e.target.value)} placeholder="@channel_username або -10012345678" className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" />
                                                             </div>
                                                             <div className="pt-3 mt-3 border-t border-blue-500/20">
                                                                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-2">Повідомлення перед перевіркою:</label>
                                                                 <textarea rows="2" value={step.text || ''} onChange={e => updateLmStep(step.id, 'text', e.target.value)} placeholder="Підпишіться на канал, щоб отримати бонус..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none mb-3 text-base md:text-sm" />
                                                                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3"><select value={step.mediaType || 'none'} onChange={e => updateLmStep(step.id, 'mediaType', e.target.value)} className="bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-blue-500 w-full sm:w-40 shrink-0"><option value="none">Без медіа</option><option value="photo">Фото (URL)</option><option value="video">Відео (URL)</option><option value="document">Файл (URL)</option></select>{step.mediaType && step.mediaType !== 'none' && (<div className="flex-grow flex gap-2"><input type="url" value={step.mediaUrl || ''} onChange={e => updateLmStep(step.id, 'mediaUrl', e.target.value)} placeholder="Посилання на файл..." className="flex-grow bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" /><button onClick={() => handleFileUpload(step.id)} className="shrink-0 w-11 h-11 md:w-10 md:h-10 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-600/30 transition-colors" title="Завантажити з пристрою"><Upload size={16}/></button></div>)}</div>
                                                             </div>
                                                             <div className="pt-3 mt-3 border-t border-blue-500/20">
                                                                 <label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Якщо НЕ підписався (текст помилки):</label>
                                                                 <input type="text" value={step.fallbackText || ''} onChange={e => updateLmStep(step.id, 'fallbackText', e.target.value)} placeholder="Ви не підписались! Спробуйте ще раз." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-red-500" />
                                                             </div>
                                                             <div className="pt-3 mt-3 border-t border-blue-500/20">
                                                                 <label className="text-[10px] md:text-[11px] font-bold text-green-400 uppercase block mb-1">Якщо ПІДПИСАВСЯ (наступний крок):</label>
                                                                 <select value={step.nextStepId || ''} onChange={e => updateLmStep(step.id, 'nextStepId', e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2.5 md:py-2 text-white text-base md:text-sm outline-none focus:border-green-500">
                                                                     <option value="">Оберіть наступний блок...</option>
                                                                     {activeLmFlow.steps.filter(s => s.id !== step.id).map((s, idx) => (
                                                                         <option key={s.id} value={s.id}>{getStepPreviewLabel(s, activeLmFlow.steps.indexOf(s))}</option>
                                                                     ))}
                                                                 </select>
                                                             </div>
                                                         </div>
                                                      </div>
                                                  </div>
                                                )}
                                                {step.type === 'wait_input' && (
                                                    <div className="space-y-4"><div className="bg-purple-500/10 border border-purple-500/20 p-3 md:p-4 rounded-xl flex flex-col md:flex-row gap-3 items-start"><MessageSquare size={18} className="text-purple-400 mt-0.5 shrink-0 hidden md:block"/><div className="flex-grow space-y-3 w-full"><div className="flex items-center gap-2 md:hidden mb-2 border-b border-purple-500/20 pb-2"><Command size={16} className="text-purple-400 shrink-0"/><h4 className="text-sm font-bold text-white">Очікування тексту</h4></div><div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Чекати поки клієнт напише (Кодове слово):</label><input type="text" value={step.expectedText} onChange={e => updateLmStep(step.id, 'expectedText', e.target.value)} placeholder="Наприклад: переглянув" className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-purple-500" /></div><div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Повідомлення про помилку (Якщо написав інше):</label><input type="text" value={step.fallbackText || ''} onChange={e => updateLmStep(step.id, 'fallbackText', e.target.value)} placeholder="Будь ласка, напишіть правильне слово..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-purple-500" /></div><div className="pt-3 mt-3 border-t border-purple-500/20"><label className="text-[10px] md:text-[11px] font-bold text-purple-400 uppercase block mb-2">Відповісти при успішному вводі:</label><textarea rows="2" value={step.successText || ''} onChange={e => updateLmStep(step.id, 'successText', e.target.value)} placeholder="Молодець, ось твоє відео..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none resize-none mb-3 text-base md:text-sm" /><div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3"><select value={step.successMediaType || 'none'} onChange={e => updateLmStep(step.id, 'successMediaType', e.target.value)} className="bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-purple-500 w-full sm:w-40 shrink-0"><option value="none">Без медіа</option><option value="photo">Фото (URL)</option><option value="video">Відео (URL)</option><option value="document">Файл (URL)</option></select>{step.successMediaType && step.successMediaType !== 'none' && (<div className="flex-grow flex gap-2"><input type="url" value={step.successMediaUrl || ''} onChange={e => updateLmStep(step.id, 'successMediaUrl', e.target.value)} placeholder="Посилання на файл..." className="flex-grow bg-[#0B1120] border border-[#1F2937] rounded-xl px-3 py-3 md:py-2 text-white text-base md:text-sm outline-none focus:border-purple-500" /><button onClick={() => handleFileUpload(step.id, true)} className="shrink-0 w-11 h-11 md:w-10 md:h-10 bg-purple-600/20 text-purple-400 rounded-xl flex items-center justify-center hover:bg-purple-600/30 transition-colors" title="Завантажити з пристрою"><Upload size={16}/></button></div>)}</div></div></div></div></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 pt-6 border-t border-[#1F2937]">
                                    <button onClick={() => addLmStep('message')} className="py-3 bg-[#131B2C] hover:bg-[#1E293B] border border-[#1F2937] rounded-xl text-white font-medium text-xs md:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"><MessageSquare size={16} className="text-cyan-400"/> Повідомлення</button>
                                    <button onClick={() => addLmStep('check_sub')} className="py-3 bg-[#131B2C] hover:bg-[#1E293B] border border-[#1F2937] rounded-xl text-white font-medium text-xs md:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"><ShieldCheck size={16} className="text-blue-400"/> Перевірка підписки</button>
                                    <button onClick={() => addLmStep('wait_input')} className="py-3 bg-[#131B2C] hover:bg-[#1E293B] border border-[#1F2937] rounded-xl text-white font-medium text-xs md:text-sm transition-colors shadow-sm flex items-center justify-center gap-2"><Command size={16} className="text-purple-400"/> Очікувати текст</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* --- БАЗОВА АВТОВОРОНКА --- */}
                        {activeConfigModule === 'Автоворонка' && (
                          <div className="space-y-4 md:space-y-5">
                            <div className="bg-[#131B2C] p-4 md:p-5 rounded-2xl border border-[#1F2937]"><label className="text-xs md:text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2"><Zap size={16} className="text-cyan-400"/> Тригер запуску</label><input type="text" value={builderForm.moduleConfigs['Автоворонка'].trigger || ''} onChange={e => updateModuleConfig('Автоворонка', 'trigger', e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 outline-none text-base md:text-sm" placeholder="/start" /></div>
                            
                            {/* НОВИЙ БЛОК: ПЕРЕВІРКА ПІДПИСКИ */}
                            <div className="bg-[#131B2C] p-4 md:p-5 rounded-2xl border border-[#1F2937]">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs md:text-sm font-medium text-white flex items-center gap-2"><ShieldCheck size={16} className="text-blue-400"/> Обов'язкова підписка на канал</label>
                                    <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors shrink-0 ${builderForm.moduleConfigs['Автоворонка'].requireSub ? 'bg-cyan-500' : 'bg-gray-600'}`} onClick={() => updateModuleConfig('Автоворонка', 'requireSub', !builderForm.moduleConfigs['Автоворонка'].requireSub)}>
                                         <div className={`w-4 h-4 bg-white rounded-full transition-transform ${builderForm.moduleConfigs['Автоворонка'].requireSub ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                                {builderForm.moduleConfigs['Автоворонка'].requireSub && (
                                    <div className="space-y-3 pt-3 border-t border-[#1F2937]">
                                        <p className="text-[10px] md:text-[11px] text-blue-300 font-medium mb-2">Бот має бути Адміністратором у вашому каналі!</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Посилання (URL) на канал:</label><input type="url" value={builderForm.moduleConfigs['Автоворонка'].channelUrl || ''} onChange={e => updateModuleConfig('Автоворонка', 'channelUrl', e.target.value)} placeholder="https://t.me/..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" /></div>
                                            <div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">ID каналу (для API):</label><input type="text" value={builderForm.moduleConfigs['Автоворонка'].channelId || ''} onChange={e => updateModuleConfig('Автоворонка', 'channelId', e.target.value)} placeholder="@channel_username" className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" /></div>
                                        </div>
                                        <div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Текст з проханням підписатися:</label><input type="text" value={builderForm.moduleConfigs['Автоворонка'].subCheckText || ''} onChange={e => updateModuleConfig('Автоворонка', 'subCheckText', e.target.value)} placeholder="Підпишіться на канал..." className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-blue-500" /></div>
                                        <div><label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase block mb-1">Помилка (якщо не підписався):</label><input type="text" value={builderForm.moduleConfigs['Автоворонка'].subErrorText || ''} onChange={e => updateModuleConfig('Автоворонка', 'subErrorText', e.target.value)} placeholder="Ви не підписані!" className="w-full bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-sm outline-none focus:border-red-500" /></div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-[#131B2C] p-4 md:p-5 rounded-2xl md:rounded-3xl border border-[#1F2937]">
                                <h3 className="text-white font-medium mb-4 flex items-center gap-2 border-b border-[#1F2937] pb-3 text-sm md:text-base"><MessageSquare size={16} className="text-cyan-400"/> Відповідь бота (Базова)</h3>
                                {(() => { const steps = builderForm.moduleConfigs['Автоворонка'].steps; const step = steps.length > 0 ? steps[0] : { id: 1, text: '', links: [] }; return ( <div className="space-y-4 md:space-y-5"><div><label className="text-[10px] md:text-[11px] uppercase text-gray-500 block mb-2 font-bold">Текст повідомлення</label><textarea rows="4" value={step.text || ''} onChange={e => updateStarterFunnel('text', null, e.target.value)} className="w-full bg-[#0B1120] border border-[#1F2937] rounded-xl px-4 py-3 text-white focus:border-cyan-500 outline-none resize-none text-base md:text-sm" placeholder="Що відповість бот..." /></div><div className="pt-2"><label className="text-[10px] md:text-[11px] uppercase text-gray-500 block mb-2 font-bold">Веб-посилання під повідомленням (Кнопки)</label>{(step.links || []).map((link, idx) => (<div key={link.id || idx} className="flex flex-col sm:flex-row gap-2 mb-3 items-start bg-[#0B1120] sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border sm:border-0 border-[#1F2937]"><input type="text" value={link.title} onChange={e => updateStarterFunnelLinks('update', idx, 'title', e.target.value)} placeholder="Назва (Мій Instagram)" className="w-full sm:w-1/3 bg-[#131B2C] sm:bg-[#0B1120] border border-[#1F2937] rounded-lg sm:rounded-xl px-3 py-2 sm:py-2.5 text-white text-base md:text-sm outline-none focus:border-cyan-500" /><input type="url" value={link.url} onChange={e => updateStarterFunnelLinks('update', idx, 'url', e.target.value)} placeholder="Посилання (https://...)" className="w-full sm:flex-1 bg-[#131B2C] sm:bg-[#0B1120] border border-[#1F2937] rounded-lg sm:rounded-xl px-3 py-2 sm:py-2.5 text-white text-base md:text-sm outline-none focus:border-cyan-500" /><button onClick={() => updateStarterFunnelLinks('delete', idx)} className="w-full sm:w-10 h-10 shrink-0 flex items-center justify-center text-gray-500 hover:text-red-400 bg-zinc-800 sm:bg-[#0B1120] border sm:border border-[#1F2937] rounded-lg sm:rounded-xl mt-1 sm:mt-0"><Trash2 size={16}/></button></div>))}<button onClick={() => updateStarterFunnelLinks('add')} className="w-full py-3 md:py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-cyan-400 text-sm font-medium rounded-xl border border-cyan-500/20 transition-colors flex items-center justify-center gap-2"><LinkIcon size={16}/> Додати веб-посилання</button></div></div> ); })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* MENU BUILDER & PHONE SIMULATOR */}
                {builderTab === 'menu' && (
                  <div className="flex flex-col lg:flex-row gap-6 h-full animate-in fade-in duration-300">
                    <div className="flex-1 bg-[#131B2C] border border-[#1F2937] p-4 md:p-5 rounded-2xl md:rounded-3xl h-full flex flex-col">
                      <div className="mb-4 flex justify-between items-start"><div><h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2"><Command size={18} className="text-cyan-400"/> Меню бота</h3></div><button onClick={loadSmmMenuPreset} className="px-3 py-1.5 bg-[#0B1120] border border-[#1F2937] rounded-lg text-xs text-cyan-400">Шаблон</button></div>
                      <div className="flex-grow space-y-3 overflow-y-auto pb-4 pr-1">
                        {builderForm.menu.map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-2 bg-[#0B1120] p-3 rounded-2xl border border-[#1F2937]">
                              <div className="flex flex-col sm:flex-row gap-2 items-start">
                                  <div className="w-full sm:flex-1 relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">/</span>
                                      <input type="text" value={item.command} onChange={e => updateMenuCommand(idx, 'command', e.target.value)} placeholder="команда" className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl pl-6 pr-2 py-2 text-white font-mono text-base md:text-sm outline-none focus:border-cyan-500" />
                                  </div>
                                  <div className="flex w-full sm:w-auto sm:flex-[2] gap-2">
                                      <input type="text" value={item.description} onChange={e => updateMenuCommand(idx, 'description', e.target.value)} placeholder="Опис (в меню)" className="flex-grow bg-[#131B2C] border border-[#1F2937] rounded-xl px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                      <button onClick={() => removeMenuCommand(idx)} className="w-10 h-10 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center text-gray-500 hover:text-red-400 bg-[#131B2C] border border-[#1F2937] rounded-xl"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                              <div className="pt-2 border-t border-[#1F2937] mt-1">
                                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Відповідь бота (Текст та Медіа)</label>
                                  <textarea rows="2" value={item.message || ''} onChange={e => updateMenuCommand(idx, 'message', e.target.value)} placeholder="Текст повідомлення..." className="w-full bg-[#131B2C] border border-[#1F2937] rounded-xl px-3 py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500 resize-none mb-2" />
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3 mb-3">
                                      <select value={item.mediaType || 'none'} onChange={e => updateMenuCommand(idx, 'mediaType', e.target.value)} className="bg-[#131B2C] border border-[#1F2937] rounded-xl px-3 py-2.5 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500 w-full sm:w-40 shrink-0">
                                          <option value="none">Без медіа</option>
                                          <option value="photo">📷 Фото (URL)</option>
                                          <option value="video">🎥 Відео (URL)</option>
                                          <option value="document">📄 Файл (URL)</option>
                                      </select>
                                      {item.mediaType && item.mediaType !== 'none' && (
                                          <div className="flex-grow flex gap-2">
                                              <input type="url" value={item.mediaUrl || ''} onChange={e => updateMenuCommand(idx, 'mediaUrl', e.target.value)} placeholder="Посилання на файл..." className="flex-grow bg-[#131B2C] border border-[#1F2937] rounded-xl px-3 py-2.5 md:py-2 text-white text-base md:text-sm outline-none focus:border-cyan-500" />
                                          </div>
                                      )}
                                  </div>
                                  <label className="text-[10px] md:text-[11px] font-bold text-gray-500 uppercase mb-1.5 block">Веб-посилання (Кнопки під відповіддю)</label>
                                  {(item.links || []).map((link, lidx) => (
                                      <div key={link.id || lidx} className="flex flex-col sm:flex-row gap-2 mb-2 items-start bg-[#131B2C] p-2 rounded-lg border border-[#1F2937]">
                                          <input type="text" value={link.title} onChange={e => handleMenuLink('update', idx, lidx, 'title', e.target.value)} placeholder="Назва" className="w-full sm:w-1/3 bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-xs outline-none focus:border-cyan-500" />
                                          <div className="flex w-full sm:w-auto sm:flex-1 gap-2">
                                              <input type="url" value={link.url} onChange={e => handleMenuLink('update', idx, lidx, 'url', e.target.value)} placeholder="https://..." className="flex-grow bg-[#0B1120] border border-[#1F2937] rounded-lg px-3 py-2 text-white text-base md:text-xs outline-none focus:border-cyan-500" />
                                              <button onClick={() => handleMenuLink('delete', idx, lidx)} className="w-10 h-10 sm:w-8 sm:h-8 shrink-0 flex items-center justify-center text-gray-500 hover:text-red-400 bg-zinc-800 sm:bg-[#0B1120] border sm:border border-[#1F2937] rounded-lg"><Trash2 size={14}/></button>
                                          </div>
                                      </div>
                                  ))}
                                  <button onClick={() => handleMenuLink('add', idx)} className="w-full py-2.5 md:py-2 bg-[#131B2C] hover:bg-[#1E293B] text-cyan-400 text-sm md:text-xs font-medium rounded-lg border border-[#1F2937] transition-colors flex items-center justify-center gap-1 mt-2 md:mt-1"><LinkIcon size={12}/> Додати посилання</button>
                              </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={addMenuCommand} className="w-full py-3.5 md:py-3 mt-auto bg-blue-600/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-sm font-medium">Додати команду</button>
                    </div>

                    {/* РАБОЧИЙ СИМУЛЯТОР ТЕЛЕФОНА */}
                    <div className="w-full max-w-[340px] mx-auto lg:w-[340px] bg-[#8BA7B6] rounded-[2.5rem] border-[8px] md:border-[10px] border-[#0A0F1D] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col shrink-0 h-[600px] lg:h-[650px] overflow-hidden relative">
                        <div className="bg-[#17212B] px-3 py-2 flex items-center gap-3 shrink-0 mt-5 md:mt-6 shadow-md relative z-20"><ChevronLeft size={24} className="text-[#5288C1]" /><div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-cyan-400 flex justify-center items-center"><Bot size={20} className="text-white"/></div><div><div className="text-white font-medium text-[14px] md:text-[15px] truncate w-28 md:w-32">{builderForm.name || 'Бот'}</div><div className="text-[#5288C1] text-[11px] md:text-[12px]">bot</div></div></div>
                        <div className="flex-grow bg-[#0E1621] relative overflow-y-auto p-3 space-y-3 scrollbar-none pb-[80px]">
                            <div className="text-center text-[#5288C1] text-[10px] md:text-xs my-2 font-medium">Сьогодні</div>
                            {previewChat.map((msg, i) => (
                                <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'bot' ? 'self-start items-start' : 'self-end items-end ml-auto'}`}>
                                    <div className={`p-3 rounded-2xl text-[14px] md:text-[15px] shadow-sm relative ${msg.sender === 'bot' ? 'bg-[#182533] text-white rounded-bl-sm' : 'bg-[#2B5278] text-white rounded-br-sm'}`}>
                                        {msg.mediaType === 'photo' && <div className="w-full h-24 md:h-32 bg-[#0E1621] rounded-lg mb-2 flex items-center justify-center text-[#5288C1] border border-[#1F2937]"><Upload size={24}/></div>}
                                        {msg.mediaType === 'video' && <div className="w-full h-24 md:h-32 bg-[#0E1621] rounded-lg mb-2 flex items-center justify-center text-[#5288C1] border border-[#1F2937] relative"><Play size={24}/><div className="absolute bottom-2 right-2 bg-black/50 text-[10px] px-1 rounded">0:15</div></div>}
                                        {msg.mediaType === 'document' && <div className="w-full bg-[#0E1621] rounded-lg p-2 mb-2 flex items-center gap-2 md:gap-3 border border-[#1F2937]"><div className="w-8 h-8 md:w-10 md:h-10 bg-[#2B5278] rounded-full flex items-center justify-center shrink-0"><FileText size={16} className="text-white md:w-5 md:h-5"/></div><div className="flex-1 overflow-hidden"><p className="text-xs md:text-sm font-medium truncate">file.pdf</p><p className="text-[10px] md:text-xs text-[#5288C1]">2.4 MB</p></div></div>}
                                        <p className="whitespace-pre-wrap leading-tight">{msg.text}</p>
                                        <span className={`text-[9px] md:text-[10px] float-right mt-1 ml-2 ${msg.sender === 'bot' ? 'text-[#5288C1]' : 'text-blue-300'}`}>12:00</span>
                                    </div>
                                    {msg.buttons && msg.buttons.length > 0 && (
                                        <div className="flex flex-col gap-1 w-full mt-1">
                                            {msg.buttons.map((btn, idx) => (
                                                <button key={idx} onClick={() => handleSimulatorButton(btn, msg.currentFlowId)} className="w-full bg-[#182533] text-[#5288C1] hover:bg-[#202E3D] py-2 rounded-xl text-xs md:text-sm font-medium transition-colors border border-[#1F2937]/50 shadow-sm flex justify-center items-center gap-1">
                                                  {btn.actionType === 'url' && <LinkIcon size={12}/>}
                                                  {btn.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-[#17212B] p-2 flex items-center gap-2 border-t border-[#0A0F1D]/50 z-20 pb-6 md:pb-2">
                            <button className="text-[#5288C1] p-2 hover:bg-white/5 rounded-full transition-colors shrink-0"><Upload size={20} className="md:w-6 md:h-6" /></button>
                            <input type="text" value={previewInput} onChange={e => setPreviewInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendPreviewMsg()} placeholder="Повідомлення..." className="flex-grow bg-[#0E1621] text-white rounded-full px-3 md:px-4 py-1.5 md:py-2 outline-none text-[14px] md:text-[15px]" />
                            {previewInput.trim() ? (
                                <button onClick={() => sendPreviewMsg()} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#5288C1] flex items-center justify-center text-white hover:bg-[#6398D1] transition-colors shrink-0"><Send size={14} className="-ml-0.5 md:w-4 md:h-4" /></button>
                            ) : (
                                <button className="text-[#5288C1] p-2 hover:bg-white/5 rounded-full transition-colors shrink-0"><MessageCircle size={20} className="md:w-6 md:h-6" /></button>
                            )}
                        </div>
                    </div>
                  </div>
                )}
              </div>
              
              {isSaving && (
                <div className="absolute inset-0 bg-[#0B1120]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-3xl">
                  <Loader2 size={48} className="text-cyan-400 animate-spin mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Зберігаємо налаштування...</h3>
                  <p className="text-gray-400 text-sm">Синхронізація з Telegram API</p>
                </div>
              )}
              
              <div className="p-4 md:p-6 border-t border-[#1F2937] bg-[#0B1120] flex justify-between items-center shrink-0 rounded-b-none md:rounded-b-3xl">
                {editingBot && !activeConfigModule ? <button onClick={deleteBot} className="text-red-400 hover:text-red-300 font-medium px-3 md:px-4 py-2 md:py-2.5 transition-colors border border-red-500/20 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs md:text-sm">Видалити бота</button> : <div></div>}
                <div className="flex gap-2 md:gap-3">
                  <button onClick={() => setIsBuilderOpen(false)} className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white transition-colors text-xs md:text-sm font-medium hover:bg-[#131B2C]">Скасувати</button>
                  <button onClick={saveBot} disabled={!builderForm.name || isSaving} className="px-6 md:px-8 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold transition-all transform active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2 text-xs md:text-sm">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="md:w-4 md:h-4" /> Зберегти бота</>}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- АВТОМАТИЧНИЙ ЗАПУСК ДЛЯ VERCEL ---
// Цей блок коду дає команду браузеру намалювати інтерфейс на реальному сайті.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  setTimeout(() => {
    const rootElement = document.getElementById('root');
    // Перевіряємо, чи корінь порожній (щоб не малювати двічі)
    if (rootElement && rootElement.childElementCount === 0) {
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(rootElement).render(<App />);
      }).catch(err => console.error("Помилка рендерингу:", err));
    }
  }, 100);
}
