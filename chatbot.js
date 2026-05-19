/* ═══════════════════════════════════════════════
   CyberBuddy — AI-помощник по кибербезопасности
   Локальная версия с базой знаний (без API)
   ═══════════════════════════════════════════════ */
(function(){

const style=document.createElement('style');
style.textContent=`
#cb-fab{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#00D4AA,#00A882);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.6rem;box-shadow:0 4px 24px rgba(0,212,170,0.35);z-index:9990;transition:all .25s ease;animation:cb-pulse 2s infinite}
#cb-fab:hover{transform:scale(1.1);box-shadow:0 6px 32px rgba(0,212,170,0.5)}
#cb-fab.open{animation:none}
@keyframes cb-pulse{0%,100%{box-shadow:0 4px 24px rgba(0,212,170,0.35)}50%{box-shadow:0 4px 32px rgba(0,212,170,0.55)}}
#cb-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;border-radius:50%;background:#E74C3C;color:#fff;font-size:.65rem;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #0f1117}

#cb-panel{position:fixed;bottom:96px;right:24px;width:380px;max-height:520px;background:#171b26;border:1px solid #2a2f40;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,0.4);z-index:9991;display:flex;flex-direction:column;overflow:hidden;opacity:0;transform:translateY(20px) scale(0.95);pointer-events:none;transition:all .3s cubic-bezier(.4,0,.2,1)}
#cb-panel.open{opacity:1;transform:translateY(0) scale(1);pointer-events:all}

#cb-header{display:flex;align-items:center;gap:10px;padding:16px 18px;background:linear-gradient(135deg,#0F1C2E,#1A2E48);border-bottom:1px solid #2a2f40;flex-shrink:0}
#cb-header-icon{width:36px;height:36px;border-radius:50%;background:rgba(0,212,170,0.15);display:flex;align-items:center;justify-content:center;font-size:1.1rem}
#cb-header-info{flex:1}
#cb-header-name{font-family:'Syne',sans-serif;font-weight:800;font-size:.9rem;color:#eef0f6}
#cb-header-status{font-size:.72rem;color:#00D4AA;display:flex;align-items:center;gap:4px}
#cb-header-status::before{content:'';width:6px;height:6px;border-radius:50%;background:#00D4AA;display:inline-block}
#cb-close{background:none;border:none;color:#5c6480;font-size:1.2rem;cursor:pointer;padding:4px}#cb-close:hover{color:#eef0f6}

#cb-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-height:200px;max-height:340px}
.cb-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-size:.85rem;line-height:1.6;word-wrap:break-word;animation:cb-fadeIn .3s ease}
@keyframes cb-fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.cb-msg.bot{background:#1e2333;color:#eef0f6;border-bottom-left-radius:4px;align-self:flex-start;border:1px solid #2a2f40}
.cb-msg.user{background:linear-gradient(135deg,#00D4AA,#00A882);color:#0a0f1a;border-bottom-right-radius:4px;align-self:flex-end;font-weight:500}
.cb-msg.bot strong{color:#00D4AA}
.cb-typing{display:flex;gap:4px;padding:12px 16px;align-self:flex-start}
.cb-typing span{width:7px;height:7px;border-radius:50%;background:#5c6480;animation:cb-dot 1.2s infinite}
.cb-typing span:nth-child(2){animation-delay:.2s}
.cb-typing span:nth-child(3){animation-delay:.4s}
@keyframes cb-dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}

#cb-suggestions{display:flex;gap:6px;padding:0 16px 10px;flex-wrap:wrap;flex-shrink:0}
.cb-sug{padding:6px 12px;border:1px solid #2a2f40;border-radius:20px;background:transparent;color:#9ba3bb;font-size:.75rem;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.cb-sug:hover{border-color:#00D4AA;color:#00D4AA;background:rgba(0,212,170,0.08)}

#cb-input-wrap{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #2a2f40;background:#171b26;flex-shrink:0}
#cb-input{flex:1;background:#1e2333;border:1px solid #2a2f40;border-radius:12px;padding:10px 14px;color:#eef0f6;font-size:.85rem;font-family:'DM Sans',sans-serif;outline:none;resize:none;height:40px;transition:border-color .2s}
#cb-input:focus{border-color:#00D4AA}
#cb-input::placeholder{color:#5c6480}
#cb-send{width:40px;height:40px;border-radius:12px;background:#00D4AA;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
#cb-send:hover{background:#00f0c0}
#cb-send:disabled{opacity:.4;cursor:not-allowed}
#cb-send svg{width:18px;height:18px}

@media(max-width:480px){
  #cb-panel{right:8px;left:8px;bottom:88px;width:auto;max-height:70vh}
}
`;
document.head.appendChild(style);

const fab=document.createElement('button');
fab.id='cb-fab';
fab.innerHTML='🤖<span id="cb-badge">1</span>';
document.body.appendChild(fab);

const panel=document.createElement('div');
panel.id='cb-panel';
panel.innerHTML=`
<div id="cb-header">
  <div id="cb-header-icon">🛡️</div>
  <div id="cb-header-info">
    <div id="cb-header-name">CyberBuddy AI</div>
    <div id="cb-header-status">Онлайн</div>
  </div>
  <button id="cb-close">✕</button>
</div>
<div id="cb-messages"></div>
<div id="cb-suggestions"></div>
<div id="cb-input-wrap">
  <input id="cb-input" placeholder="Спроси про кибербезопасность..." autocomplete="off">
  <button id="cb-send"><svg viewBox="0 0 24 24" fill="none" stroke="#0a0f1a" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg></button>
</div>`;
document.body.appendChild(panel);

// ══════════════ KNOWLEDGE BASE ══════════════
const KB = [
  {
    keys:['фишинг','phishing','фишинговое','фишинговый'],
    answer:'🎣 <strong>Фишинг</strong> — это когда мошенники создают поддельные письма, сайты или сообщения, чтобы украсть твои данные. Например, тебе приходит SMS «Ваш Kaspi заблокирован, перейдите по ссылке» — это классический фишинг! Настоящий Kaspi никогда не попросит пароль через SMS.',
    suggestions:['Как распознать фишинг?','Примеры фишинга в KZ','Что такое спуфинг?']
  },
  {
    keys:['распознать фишинг','признаки фишинг','определить фишинг','как понять фишинг'],
    answer:'🔍 Вот <strong>5 главных признаков</strong> фишинга:<br>1. Срочность — «Ваш аккаунт будет удалён через 24 часа!»<br>2. Странный адрес отправителя — kaspi-security@mail.ru вместо @kaspi.kz<br>3. Ошибки в тексте и дизайне<br>4. Просьба перейти по ссылке и ввести данные<br>5. Слишком хорошие предложения — «Вы выиграли iPhone!»',
    suggestions:['Что делать если нажал ссылку?','Фишинг в WhatsApp','Примеры фишинга в KZ']
  },
  {
    keys:['примеры фишинг','фишинг казахстан','фишинг kz','kaspi фишинг'],
    answer:'🇰🇿 В Казахстане самые частые виды фишинга:<br>• SMS «Ваш Kaspi заблокирован» со ссылкой на kaspi-bank.xyz<br>• WhatsApp сообщения «Вы выиграли приз от Sulpak/Technodom»<br>• Фейковые страницы входа в eGov<br>• Instagram DM «Проголосуй за меня» со ссылкой, которая крадёт аккаунт<br><br>Помни: настоящие компании <strong>никогда</strong> не просят пароль через мессенджеры!',
    suggestions:['Как проверить ссылку?','Защита Kaspi аккаунта','Безопасность WhatsApp']
  },
  {
    keys:['нажал ссылку','перешёл по ссылке','кликнул ссылку','открыл ссылку'],
    answer:'⚡ Если ты случайно <strong>перешёл по подозрительной ссылке</strong>:<br>1. Не вводи никакие данные — сразу закрой страницу<br>2. Если ввёл пароль — срочно смени его везде<br>3. Включи двухфакторную аутентификацию (2FA)<br>4. Проверь историю входов в аккаунт<br>5. Если банковский аккаунт — позвони в банк',
    suggestions:['Что такое 2FA?','Как сменить пароль?','Менеджер паролей']
  },
  {
    keys:['проверить ссылку','безопасная ссылка','как проверить url','подозрительная ссылка'],
    answer:'🔗 Как <strong>проверить ссылку</strong> перед переходом:<br>1. Наведи курсор — внизу экрана появится реальный URL<br>2. Проверь домен: <strong>kaspi.kz</strong> ✅ vs kaspi-security.xyz ❌<br>3. Ищи HTTPS (замочек 🔒) — но это не гарантия!<br>4. Используй VirusTotal.com — вставь ссылку и проверь<br>5. Если сомневаешься — зайди на сайт напрямую через браузер',
    suggestions:['Что такое HTTPS?','Поддельные сайты','Типы кибератак']
  },
  {
    keys:['пароль','password','надёжный пароль','создать пароль','придумать пароль'],
    answer:'🔑 Правила <strong>надёжного пароля</strong>:<br>• Минимум 12 символов (лучше 16+)<br>• Заглавные + строчные + цифры + спецсимволы<br>• Никаких дат рождения, имён, «qwerty123»<br>• Уникальный пароль для каждого сервиса!<br><br>💡 Лайфхак: придумай фразу «МойКотЛюбит3Рыбки!» — длинный, надёжный и легко запомнить.',
    suggestions:['Менеджер паролей','Что такое 2FA?','Как часто менять пароль?']
  },
  {
    keys:['менеджер парол','password manager','хранить парол'],
    answer:'🔐 <strong>Менеджер паролей</strong> — программа, которая хранит все пароли в зашифрованном виде. Запомни только один мастер-пароль!<br><br>Популярные варианты:<br>• <strong>Bitwarden</strong> — бесплатный и открытый<br>• <strong>Google Password Manager</strong> — встроен в Chrome<br>• <strong>Apple Keychain</strong> — для iOS/Mac<br><br>Гораздо безопаснее, чем записывать пароли в заметках!',
    suggestions:['Что такое 2FA?','Надёжный пароль','Проверить утечку']
  },
  {
    keys:['2fa','двухфакторн','двух факторн','аутентификац','верификац'],
    answer:'📱 <strong>Двухфакторная аутентификация (2FA)</strong> — дополнительный уровень защиты. Даже если хакер узнает пароль, без второго фактора не войдёт!<br><br>Виды 2FA:<br>• 📲 SMS-код (простой, но не самый безопасный)<br>• 📱 Приложение-аутентификатор (Google Authenticator) — <strong>лучший вариант</strong><br>• 🔑 Аппаратный ключ (YubiKey)<br><br>Включи 2FA в Kaspi, Google, Instagram и Telegram!',
    suggestions:['Как включить 2FA?','Защита аккаунта','Надёжный пароль']
  },
  {
    keys:['менять пароль','как часто менять','обновить пароль','сменить пароль'],
    answer:'🔄 Современная рекомендация: <strong>не нужно менять пароль каждый месяц</strong>! Меняй только если:<br>• Сервис сообщил об утечке<br>• Подозреваешь, что кто-то получил доступ<br>• Использовал этот пароль на взломанном сайте<br><br>Лучше один <strong>очень надёжный</strong> пароль + 2FA, чем частая смена слабых.',
    suggestions:['Надёжный пароль','Менеджер паролей','Проверить утечку']
  },
  {
    keys:['социальная инженерия','social engineering','манипуляц'],
    answer:'🎭 <strong>Социальная инженерия</strong> — когда мошенник манипулирует тобой, чтобы ты сам выдал информацию. Играют на эмоциях: страх, жадность, любопытство.<br><br>Примеры:<br>• «Я из техподдержки Kaspi, назовите код из SMS»<br>• «Помоги, срочно нужны деньги!» — от взломанного друга<br>• «Проголосуй за меня» в Instagram — крадёт аккаунт',
    suggestions:['Как распознать манипуляцию?','Мошенники в WhatsApp','Защита аккаунта']
  },
  {
    keys:['распознать манипуляц','распознать мошенни','как понять мошенник','признаки мошен','мошенник'],
    answer:'🧠 <strong>Красные флаги мошенников:</strong><br>• ⏰ Создают срочность — «Только сейчас!»<br>• 😰 Давят на эмоции — страх, жадность<br>• 🤫 Просят секретность — «Никому не говори»<br>• 💰 Просят деньги/данные вперёд<br>• 👤 Не могут подтвердить личность<br><br>Правило: если кто-то торопит — это повод <strong>остановиться и подумать</strong>.',
    suggestions:['Мошенники в WhatsApp','Фишинг в KZ','Защита аккаунта']
  },
  {
    keys:['whatsapp','ватсап','вацап','мессенджер мошенни'],
    answer:'💬 <strong>Мошенничество в WhatsApp</strong> в Казахстане:<br>• «Привет, поменял номер» — проверь, позвони на старый<br>• Розыгрыши от «Magnum/Sulpak» — компании не раздают подарки так<br>• Ссылки в группах — не кликай на незнакомые<br>• «Проверь эту фотку» со ссылкой — ловушка<br><br>📌 В настройках включи <strong>двухшаговую проверку</strong>!',
    suggestions:['Защита WhatsApp','Фишинг в Instagram','Безопасность Telegram']
  },
  {
    keys:['instagram','инстаграм','инста'],
    answer:'📸 <strong>Защита аккаунта Instagram:</strong><br>• Включи 2FA (Настройки → Безопасность)<br>• Не переходи по ссылкам «Проголосуй за меня» — фишинг!<br>• Закрой аккаунт если ты школьник<br>• Не принимай заявки от незнакомцев<br>• Проверяй «Действия входа»<br><br>⚠️ Если украли — пиши в поддержку через Facebook!',
    suggestions:['Что такое 2FA?','Мой аккаунт украли','Соцсети безопасность']
  },
  {
    keys:['telegram','телеграм'],
    answer:'✈️ <strong>Безопасность в Telegram:</strong><br>• Включи облачный пароль (двухэтапная аутентификация)<br>• Не вводи код из SMS на сторонних сайтах!<br>• Остерегайся ботов, просящих номер телефона<br>• «Бонус от Kaspi» в Telegram — 100% мошенничество<br>• Проверяй @username каналов',
    suggestions:['Мой Telegram взломали','Мошенники в мессенджерах','Защита аккаунта']
  },
  {
    keys:['вирус','вредонос','malware','троян','антивирус'],
    answer:'💀 <strong>Вредоносное ПО (malware):</strong><br>• 🦠 Вирусы — заражают файлы<br>• 🐴 Трояны — маскируются под полезные программы<br>• 🔒 Вымогатели — шифруют файлы и требуют выкуп<br>• 👁️ Шпионы — следят и крадут данные<br><br>Защита: не скачивай из непроверенных источников, обновляй систему, используй антивирус.',
    suggestions:['Какой антивирус?','Безопасность телефона','VPN нужен?']
  },
  {
    keys:['vpn','впн'],
    answer:'🔒 <strong>VPN</strong> шифрует интернет-соединение.<br><br>Когда нужен:<br>• В публичном Wi-Fi (кафе, ТРЦ)<br>• Для защиты данных от провайдера<br><br>Когда НЕ поможет:<br>• Не защитит от фишинга<br>• Бесплатные VPN часто собирают данные!<br><br>Хорошие: ProtonVPN (бесплатный тариф), Mullvad.',
    suggestions:['Безопасный Wi-Fi','Защита данных','Антивирус']
  },
  {
    keys:['wi-fi','wifi','вай-фай','вайфай','публичный wi'],
    answer:'📶 <strong>Опасность публичного Wi-Fi:</strong><br>Бесплатный Wi-Fi может быть ловушкой! Хакер может:<br>• Перехватить пароли и сообщения<br>• Создать фейковую точку «Free WiFi»<br><br>Правила:<br>✅ Используй VPN<br>✅ Не входи в банковские приложения<br>✅ Проверяй HTTPS<br>❌ Не подключайся к сетям без пароля',
    suggestions:['Что такое VPN?','HTTPS это что?','Безопасность телефона']
  },
  {
    keys:['взлом','хак','hack','взломали','украли аккаунт','мой аккаунт украли'],
    answer:'🚨 <strong>Что делать если взломали:</strong><br>1. Спокойствие!<br>2. «Забыл пароль» → восстанови доступ<br>3. Смени пароли ВЕЗДЕ с этим же паролем<br>4. Включи 2FA<br>5. Проверь привязанные почты и телефоны<br>6. Предупреди друзей — от твоего имени могут писать<br>7. Банк — звони на горячую линию',
    suggestions:['Защита аккаунта','Надёжный пароль','2FA']
  },
  {
    keys:['защитить аккаунт','защита аккаунт','безопасность аккаунт','обезопасить'],
    answer:'🛡️ <strong>Как защитить аккаунты:</strong><br>1. Уникальный надёжный пароль для каждого сервиса<br>2. Включи 2FA<br>3. Менеджер паролей<br>4. Проверяй историю входов<br>5. Не входи на чужих устройствах<br>6. Обновляй приложения<br><br>Формула: <strong>2FA + надёжный пароль = 99% защиты</strong>.',
    suggestions:['Менеджер паролей','Что такое 2FA?','Проверить утечку']
  },
  {
    keys:['утечк','утёк','слив данных','проверить взлом','haveibeenpwned'],
    answer:'🔎 <strong>Проверить утечку данных:</strong><br>• Зайди на <strong>haveibeenpwned.com</strong> и введи email<br>• Покажет, в каких утечках участвовал твой email<br><br>Если нашёл:<br>1. Срочно смени пароль на этом сервисе<br>2. Смени везде, где использовал тот же пароль<br>3. Включи 2FA',
    suggestions:['Надёжный пароль','Менеджер паролей','Защита аккаунта']
  },
  {
    keys:['поддельн','фейков','фальшив','фейк сайт','fake','подделка'],
    answer:'🌐 <strong>Как распознать поддельный сайт:</strong><br>1. Проверь URL: <strong>kaspi.kz</strong> ✅ vs kaspii.kz ❌<br>2. HTTPS и замочек 🔒 (но не гарантия!)<br>3. Ошибки в тексте и дизайне<br>4. Нет «О компании» и контактов<br>5. Слишком низкие цены<br>6. Проверь возраст домена на whois.net<br><br>Вводи адрес <strong>вручную</strong>, не по ссылке!',
    suggestions:['Как проверить ссылку?','Безопасные покупки','Фишинг']
  },
  {
    keys:['https','http','ssl','замочек','сертификат'],
    answer:'🔒 <strong>HTTPS</strong> — шифрование между браузером и сайтом. Замочек = данные зашифрованы.<br><br>Но <strong>внимание</strong>: HTTPS ≠ безопасный сайт! Мошенники тоже получают сертификаты. HTTPS защищает канал, но не гарантирует, что сайт настоящий.<br><br>Всегда проверяй <strong>домен</strong>, а не только замочек!',
    suggestions:['Поддельные сайты','Проверить ссылку','Фишинг']
  },
  {
    keys:['qr','кюар','qr-код','кьюар'],
    answer:'📱 <strong>QR-мошенничество:</strong><br>• Мошенники наклеивают свои QR поверх настоящих<br>• QR может вести на фишинговый сайт<br><br>Правила:<br>✅ Проверяй URL после сканирования, ДО перехода<br>✅ Используй встроенный сканер камеры<br>❌ Не сканируй случайные QR на улице<br>❌ Не вводи данные карты через QR-ссылки',
    suggestions:['Проверить ссылку','Фишинг','Безопасные покупки']
  },
  {
    keys:['покупк','онлайн шоп','интернет магаз','безопасн покуп','olx','колёса'],
    answer:'🛒 <strong>Безопасные покупки онлайн:</strong><br>• Покупай на проверенных площадках (Kaspi, Wildberries)<br>• На OLX — встречайся лично, проверяй до оплаты<br>• Не переходи по ссылкам «для оплаты» в мессенджерах<br>• Используй виртуальную карту<br>• Проверяй отзывы<br><br>🚩 Слишком хорошая цена = скорее всего обман.',
    suggestions:['Фейковый сайт','Защита карты','Мошенники в WhatsApp']
  },
  {
    keys:['securemind','что это','что ты','кто ты','что умеешь','о платформ','как работает'],
    answer:'🛡️ <strong>SecureMind</strong> — интерактивная платформа обучения цифровой безопасности. Я, CyberBuddy — твой AI-помощник!<br><br>В SecureMind:<br>• 📋 Диагностика уровня<br>• 📚 Модули по кибер-угрозам<br>• 🎮 Интерактивные сценарии<br>• 📊 Прогресс и аналитика<br>• 🏆 Достижения и уровни<br>• 🤖 Я отвечу на любой вопрос!',
    suggestions:['Что такое фишинг?','Защита аккаунта','Типы кибератак']
  },
  {
    keys:['тип кибератак','виды атак','виды угроз','кибератак','киберугроз'],
    answer:'⚔️ <strong>Основные типы кибератак:</strong><br>1. 🎣 <strong>Фишинг</strong> — поддельные письма и сайты<br>2. 🎭 <strong>Соц. инженерия</strong> — манипуляция людьми<br>3. 💀 <strong>Malware</strong> — вирусы, трояны<br>4. 🔓 <strong>Брутфорс</strong> — подбор паролей<br>5. 📡 <strong>Man-in-the-Middle</strong> — перехват данных<br><br>Для школьников самые опасные: фишинг и соц. инженерия.',
    suggestions:['Фишинг','Социальная инженерия','Защита аккаунта']
  },
  {
    keys:['брутфорс','brute force','подбор парол'],
    answer:'🔓 <strong>Брутфорс</strong> — метод взлома перебором всех комбинаций.<br><br>Скорость подбора:<br>• «123456» — <strong>мгновенно</strong><br>• «qwerty2024» — <strong>несколько секунд</strong><br>• «Kot1kLubit$Rybku» — <strong>тысячи лет</strong><br><br>Каждый дополнительный символ увеличивает время в десятки раз!',
    suggestions:['Надёжный пароль','Менеджер паролей','2FA']
  },
  {
    keys:['данные','приватност','конфиденциальн','персональн','личные данные','защита данных'],
    answer:'🔐 <strong>Защита личных данных:</strong><br>• Не публикуй телефон, адрес, школу в открытых профилях<br>• Закрой аккаунты в соцсетях<br>• Не заполняй онлайн-анкеты «Какой ты герой» — собирают данные<br>• Читай разрешения приложений<br>• Используй разные email<br><br>В интернете <strong>всё опубликованное остаётся навсегда</strong>.',
    suggestions:['Безопасность соцсетей','Настройки приватности','Защита аккаунта']
  },
  {
    keys:['соцсет','социальн сет','тикток','tiktok','facebook'],
    answer:'📱 <strong>Безопасность в соцсетях:</strong><br>• Закрытый профиль = базовая защита<br>• Не принимай заявки от незнакомцев<br>• Не публикуй геолокацию<br>• Не делись личной информацией<br>• Не используй «Войти через Facebook» на подозрительных сайтах<br><br>Правило: представь, что всё увидит <strong>вся школа и родители</strong>.',
    suggestions:['Защита Instagram','Безопасность Telegram','Приватность']
  },
  {
    keys:['kaspi','каспи','безопасность kaspi'],
    answer:'🏦 <strong>Безопасность Kaspi:</strong><br>• Включи биометрию для входа<br>• Никому не сообщай SMS-код — даже «сотрудникам банка»!<br>• Kaspi НИКОГДА не звонит с просьбой назвать код<br>• Заходи только через официальное приложение<br>• Установи лимит на переводы<br><br>При мошенничестве: <strong>8-800-080-7777</strong>',
    suggestions:['Мошенники в WhatsApp','Фишинг в KZ','2FA']
  },
  {
    keys:['спуфинг','spoofing','подмена'],
    answer:'🎭 <strong>Спуфинг</strong> — подмена данных, чтобы выдать себя за другого:<br>• <strong>Email-спуфинг</strong> — письмо выглядит как от kaspi.kz<br>• <strong>Caller ID</strong> — звонок показывает номер банка<br>• <strong>IP-спуфинг</strong> — подмена сетевого адреса<br><br>Нельзя доверять только имени отправителя — проверяй полный адрес и домен!',
    suggestions:['Распознать фишинг','Признаки мошенника','Проверить ссылку']
  },
  // Казахский язык
  {
    keys:['фишинг деген','фишинг дегеніміз','фишинг не','фишинг туралы'],
    answer:'🎣 <strong>Фишинг</strong> — бұл алаяқтардың сіздің деректеріңізді ұрлау үшін жалған хаттар, сайттар немесе хабарламалар жасауы. Мысалы, «Kaspi аккаунтыңыз бұғатталды» деген SMS — бұл фишинг! Нағыз Kaspi ешқашан SMS арқылы құпия сөзді сұрамайды.',
    suggestions:['Фишингті қалай тануға болады?','KZ-дағы фишинг мысалдары','Құпия сөз қауіпсіздігі']
  },
  {
    keys:['құпия сөз','пароль қалай','сенімді пароль','парольді қалай'],
    answer:'🔑 <strong>Сенімді құпия сөз</strong> ережелері:<br>• Кем дегенде 12 символ<br>• Бас + кіші әріптер + сандар + арнайы символдар<br>• Туған күн, есім қолданба<br>• Әр сервисте бірегей пароль!<br><br>💡 Кеңес: сөйлем ойлап тап, мысалы «МенінМысығым3Балық!» — ұзын, сенімді және есте сақтау оңай.',
    suggestions:['Пароль менеджері','2FA дегеніміз не?','Аккаунтты қорғау']
  },
  {
    keys:['салем','сәлем','привет','здравствуй','хай','hello','hi'],
    answer:'👋 Салем! Мен <strong>CyberBuddy</strong> — кибер-қауіпсіздік бойынша AI-көмекшіңмін! Интернеттегі қауіпсіздік туралы не білгің келеді?',
    suggestions:['Фишинг дегеніміз не?','Құпия сөз қауіпсіздігі','Аккаунтты қорғау','Типы кибератак']
  },
  {
    keys:['рахмет','спасибо','thanks','thank'],
    answer:'😊 Қуаныштымын! Егер тағы сұрақтарың болса — кез келген уақытта сұра. Интернетте қауіпсіз бол! 🛡️',
    suggestions:['Что такое фишинг?','Надёжный пароль','Типы кибератак','Мошенники в WhatsApp']
  }
];

const fallbacks=[
  'Жақсы сұрақ! 🤔 Мен кибер-қауіпсіздік маманымын. Фишинг, парольдер, аккаунт қорғау немесе мессенджердегі қауіпсіздік туралы сұра — міндетті түрде көмектесемін!',
  'Қызықты! Бұл менің сарапшылығымнан сәл тыс. Мен фишинг, алаяқтардан қорғану, сенімді парольдер туралы жақсы білемін — осылар туралы сөйлесейік! 🛡️',
  'Мен <strong>CyberBuddy</strong> және менің суперскилім — кибер-қауіпсіздік! 🦸 Фишинг, бұзу, деректерді қорғау немесе әлеуметтік желілердегі қауіпсіздік туралы сұра!'
];

const defaultSuggestions=['Что такое фишинг?','Надёжный пароль','Аккаунт взломали','Мошенники WhatsApp'];

// ── State ──
const msgsEl=document.getElementById('cb-messages');
const inputEl=document.getElementById('cb-input');
const sendBtnEl=document.getElementById('cb-send');
const sugBoxEl=document.getElementById('cb-suggestions');
const badgeEl=document.getElementById('cb-badge');
let isOpen=false,isTyping=false,msgCount=0;

function toggle(){
  isOpen=!isOpen;
  panel.classList.toggle('open',isOpen);
  fab.classList.toggle('open',isOpen);
  if(isOpen){
    badgeEl.style.display='none';
    inputEl.focus();
    if(!msgsEl.children.length) showWelcome();
  }
}

function showWelcome(){
  const lang=localStorage.getItem('securemind_lang')||'ru';
  const greeting = lang==='kz'
    ? 'Салем! 👋 Мен <strong>CyberBuddy</strong> — кибер-қауіпсіздік бойынша AI-көмекшіңмін. Интернеттегі қауіпсіздік туралы кез келген сұрақ қой!'
    : 'Привет! 👋 Я <strong>CyberBuddy</strong> — твой AI-помощник по кибербезопасности. Задай мне любой вопрос о безопасности в интернете!';
  addMsg('bot',greeting);
  showSuggestions(defaultSuggestions);
}

function addMsg(role,html){
  const d=document.createElement('div');
  d.className='cb-msg '+role;
  d.innerHTML=html;
  msgsEl.appendChild(d);
  msgsEl.scrollTop=msgsEl.scrollHeight;
  msgCount++;
}

function showTyping(){
  const d=document.createElement('div');
  d.className='cb-typing';d.id='cb-typing';
  d.innerHTML='<span></span><span></span><span></span>';
  msgsEl.appendChild(d);
  msgsEl.scrollTop=msgsEl.scrollHeight;
}
function hideTyping(){const t=document.getElementById('cb-typing');if(t)t.remove()}

function showSuggestions(list){
  sugBoxEl.innerHTML='';
  list.forEach(s=>{
    const b=document.createElement('button');
    b.className='cb-sug';b.textContent=s;
    b.onclick=()=>sendMessage(s);
    sugBoxEl.appendChild(b);
  });
}

function findAnswer(text){
  const lower=text.toLowerCase().replace(/[?!.,]/g,'');
  let bestMatch=null,bestScore=0;
  for(const entry of KB){
    let score=0;
    for(const key of entry.keys){
      if(lower.includes(key.toLowerCase())) score+=key.length;
    }
    if(score>bestScore){bestScore=score;bestMatch=entry}
  }
  if(bestMatch&&bestScore>0) return{answer:bestMatch.answer,suggestions:bestMatch.suggestions};
  return{answer:fallbacks[msgCount%fallbacks.length],suggestions:defaultSuggestions};
}

function sendMessage(text){
  if(isTyping||!text.trim())return;
  addMsg('user',escHtml(text));
  sugBoxEl.innerHTML='';
  inputEl.value='';
  isTyping=true;
  sendBtnEl.disabled=true;
  showTyping();
  const result=findAnswer(text);
  const delay=400+Math.random()*500;
  setTimeout(()=>{
    hideTyping();
    addMsg('bot',result.answer);
    showSuggestions(result.suggestions);
    isTyping=false;
    sendBtnEl.disabled=false;
  },delay);
}

function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

// ── Events ──
fab.onclick=toggle;
document.getElementById('cb-close').onclick=toggle;
sendBtnEl.onclick=()=>sendMessage(inputEl.value);
inputEl.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage(inputEl.value)}});

})();
