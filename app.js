const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Парсинг JSON-тела запроса
app.use(express.json({ limit: '50mb' }));

// Эндпоинт для загрузки файла
app.post('/upload', (req, res) => {
  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ message: 'File is missing' });
  }

  const buffer = Buffer.from(file, 'base64');
  const filePath = path.join(__dirname, 'uploads', `${Date.now()}.jpg`);
  const dirPath = path.join(__dirname, 'uploads');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
  fs.writeFile(filePath, buffer, (err) => {
    console.log(err)
    if (err) {
      return res.status(500).json({ message: 'Failed to write file' });
    }

    res.status(200).json({ message: 'File uploaded successfully' });
  });
});

// Эндпоинт для получения списка всех файлов
app.get('/gallery', (req, res) => {
  const dirPath = path.join(__dirname, 'uploads');

  if (!fs.existsSync(dirPath)) {
    return res.status(200).json({ files: [] });
  }

  const files = fs.readdirSync(dirPath);
  res.status(200).json({ files });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
