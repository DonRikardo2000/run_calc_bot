const { Telegraf, Markup } = require('telegraf');
const bot = new Telegraf('8143294403:AAGkPHa150GzXUrJrENWYfViw_ulcQx08ek'); // Замените на ваш токен

// Сохраняем пользовательские данные
let userData = {};

// Функция для отображения кнопок
function showOptions(ctx) {
    ctx.reply('Что вы хотите рассчитать?', Markup.keyboard([
        ['Раскладка', 'Темп'],
        ['Время', 'Дистанция']
    ]).resize());
}

// Приветственное сообщение с кнопками
bot.start((ctx) => {
    showOptions(ctx);
});

// Обработчик для выбора "Раскладка"
bot.hears('Раскладка', (ctx) => {
    userData[ctx.chat.id] = { choice: 'Раскладка' };
    ctx.reply('Введите дистанцию в километрах:');
});

// Обработчик для выбора "Темп"
bot.hears('Темп', (ctx) => {
    userData[ctx.chat.id] = { choice: 'Темп' };
    ctx.reply('Введите дистанцию в километрах:');
});

// Обработчик для выбора "Время"
bot.hears('Время', (ctx) => {
    userData[ctx.chat.id] = { choice: 'Время' };
    ctx.reply('Введите дистанцию в километрах:');
});

// Обработчик для выбора "Дистанция"
bot.hears('Дистанция', (ctx) => {
    userData[ctx.chat.id] = { choice: 'Дистанция' };
    ctx.reply('Введите время в формате ЧЧ:ММ:СС:');
});

// Обработка данных для "Раскладка" и "Темп"
bot.on('text', async (ctx) => {
    const chatId = ctx.chat.id;
    const choice = userData[chatId]?.choice;

    // Функция для парсинга дистанции
    const parseDistance = (input) => {
        return parseFloat(input.replace(',', '.'));
    };

    // Для "Раскладка" вводится дистанция, затем время
    if (choice === 'Раскладка' && !userData[chatId].distance) {
        const distanceKm = parseDistance(ctx.message.text);
        if (isNaN(distanceKm)) {
            return ctx.reply('Пожалуйста, введите число (километры).');
        }
        userData[chatId].distance = distanceKm;
        return ctx.reply('Введите время в формате ЧЧ:ММ:СС:');
    }

    if (choice === 'Раскладка' && userData[chatId].distance && !userData[chatId].time) {
        const time = ctx.message.text;
        const [hours, minutes, seconds] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return ctx.reply('Пожалуйста, введите корректное время в формате ЧЧ:ММ:СС.');
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const paceSeconds = totalSeconds / userData[chatId].distance;

        // Генерация таблицы с темпом на каждый километр
        let paceTable = 'Км   Время\n'; // Заголовки

        for (let km = 1; km <= Math.floor(userData[chatId].distance); km++) {
            const kmTime = paceSeconds * km;
            const hours = Math.floor(kmTime / 3600);
            const minutes = Math.floor((kmTime % 3600) / 60);
            const seconds = Math.floor(kmTime % 60);
            const timeStr = `${hours > 0 ? hours + ':' : ''}${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            // Форматирование с фиксированной шириной для двух столбцов
            paceTable += `${km.toString().padEnd(4, ' ')} ${timeStr.padStart(5, ' ')}\n`; // Убедимся, что "Время" начинается с правильного места
        }

        // Итоговое время на финише
        const finishTimeHours = Math.floor(totalSeconds / 3600);
        const finishTimeMinutes = Math.floor((totalSeconds % 3600) / 60);
        const finishTimeSeconds = Math.floor(totalSeconds % 60);
        const finishTimeStr = `${finishTimeHours > 0 ? finishTimeHours + ':' : ''}${finishTimeMinutes < 10 ? '0' : ''}${finishTimeMinutes}:${finishTimeSeconds < 10 ? '0' : ''}${finishTimeSeconds}`;

        // Добавляем строку "Финиш"
        paceTable += `Финиш ${finishTimeStr.padStart(8, ' ')}\n`;

        // Отправляем таблицу в формате кода
        await ctx.reply(`\`\`\`\n${paceTable}\`\`\``, { parse_mode: 'MarkdownV2' });
        delete userData[chatId];  // Очистка данных после расчета

        // Задержка перед отправкой следующего сообщения
        setTimeout(() => {
            showOptions(ctx); // Показать кнопки снова после расчета
        }, 500); // Задержка 0.5 секунды
    }

    // Для "Темп" вводится дистанция, затем время
    if (choice === 'Темп' && !userData[chatId].distance) {
        const distanceKm = parseDistance(ctx.message.text);
        if (isNaN(distanceKm)) {
            return ctx.reply('Пожалуйста, введите число (километры).');
        }
        userData[chatId].distance = distanceKm;
        return ctx.reply('Введите время в формате ЧЧ:ММ:СС:');
    }

    if (choice === 'Темп' && userData[chatId].distance && !userData[chatId].time) {
        const time = ctx.message.text;
        const [hours, minutes, seconds] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return ctx.reply('Пожалуйста, введите корректное время в формате ЧЧ:ММ:СС.');
        }

        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        const paceSeconds = totalSeconds / userData[chatId].distance;

        // Вычисляем средний темп
        const paceMinutes = Math.floor(paceSeconds / 60);
        const paceRemainingSeconds = Math.round(paceSeconds % 60);
        const averagePace = `${paceMinutes}:${paceRemainingSeconds < 10 ? '0' : ''}${paceRemainingSeconds}`;

        delete userData[chatId];  // Очистка данных после расчета
        await ctx.reply(`Средний темп: ${averagePace}`);

        // Задержка перед отправкой следующего сообщения
        setTimeout(() => {
            showOptions(ctx); // Показать кнопки снова после расчета
        }, 500); // Задержка 0.5 секунды
    }

    // Для "Время" вводится дистанция, затем темп
    if (choice === 'Время' && !userData[chatId].distance) {
        const distanceKm = parseDistance(ctx.message.text);
        if (isNaN(distanceKm)) {
            return ctx.reply('Пожалуйста, введите число (километры).');
        }
        userData[chatId].distance = distanceKm;
        return ctx.reply('Введите темп в формате ММ:СС:');
    }

    if (choice === 'Время' && userData[chatId].distance && !userData[chatId].pace) {
        const [minutes, seconds] = ctx.message.text.split(':').map(Number);
        if (isNaN(minutes) || isNaN(seconds)) {
            return ctx.reply('Пожалуйста, введите корректный темп в формате ММ:СС.');
        }
        const paceSeconds = minutes * 60 + seconds;
        const totalTimeSeconds = paceSeconds * userData[chatId].distance;

        const hours = Math.floor(totalTimeSeconds / 3600);
        const mins = Math.floor((totalTimeSeconds % 3600) / 60);
        const secs = Math.floor(totalTimeSeconds % 60);

        let timeStr = '';
        if (hours > 0) timeStr += `${hours} ч `;
        if (mins > 0) timeStr += `${mins} мин `;
        timeStr += `${secs} с`;

        delete userData[chatId];  // Очистка данных после расчета
        await ctx.reply(`Время на всю дистанцию: ${timeStr}`);

        // Задержка перед отправкой следующего сообщения
        setTimeout(() => {
            showOptions(ctx); // Показать кнопки снова после расчета
        }, 500); // Задержка 0.5 секунды
    }

    // Для "Дистанция" вводится время, затем темп
    if (choice === 'Дистанция' && !userData[chatId].time) {
        const time = ctx.message.text;
        const [hours, minutes, seconds] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return ctx.reply('Пожалуйста, введите корректное время в формате ЧЧ:ММ:СС.');
        }
        userData[chatId].time = { hours, minutes, seconds }; // Сохраняем время
        return ctx.reply('Введите темп в формате ММ:СС:');
    }

    if (choice === 'Дистанция' && userData[chatId].time) {
        const [paceMinutes, paceSeconds] = ctx.message.text.split(':').map(Number);
        if (isNaN(paceMinutes) || isNaN(paceSeconds)) {
            return ctx.reply('Пожалуйста, введите корректный темп в формате ММ:СС.');
        }

        // Вычисление дистанции на основе времени и темпа
        const totalTimeInSeconds = (userData[chatId].time.hours * 3600) + (userData[chatId].time.minutes * 60) + userData[chatId].time.seconds;
        const paceInSeconds = (paceMinutes * 60) + paceSeconds;

        const distanceInKm = totalTimeInSeconds / paceInSeconds; // Дистанция в километрах
        const kilometers = Math.floor(distanceInKm);
        const meters = Math.round((distanceInKm - kilometers) * 1000);

        let distanceStr = '';
        if (kilometers > 0) {
            distanceStr += `${kilometers} км `;
        }
        if (meters > 0) {
            distanceStr += `${meters} м`;
        } else if (kilometers === 0) {
            distanceStr += `${meters} метров`;
        }

        await ctx.reply(`Вы пробежите: ${distanceStr.trim()}`);

        delete userData[chatId];  // Очистка данных после расчета

        // Задержка перед отправкой следующего сообщения
        setTimeout(() => {
            showOptions(ctx); // Показать кнопки снова после расчета
        }, 500); // Задержка 0.5 секунды
    }
});

// Запуск бота
bot.launch();
