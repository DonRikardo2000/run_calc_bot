# Базовый образ для Node.js
FROM node:14

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальную часть приложения в контейнер
COPY . .

# Указываем команду для запуска бота
CMD ["npm", "start"]
