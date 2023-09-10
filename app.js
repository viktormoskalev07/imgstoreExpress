const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const app = express();
const port = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir); // Создать папку, если её нет
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
// Парсинг JSON-тела запроса
app.use(express.json({ limit: "50mb" }));

// Эндпоинт для загрузки файла
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.json({
      status: "error",
      message: "No file provided",
    });
  }
  // Получаем текущую дату и время
  const date = new Date();
  const formattedDate = `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;

  // Добавляем к имени файла
  const newFileName = `${formattedDate}_${req.file.originalname}`;

  // Переименовываем файл
  const oldPath = path.join(__dirname, req.file.path);
  const newPath = path.join(__dirname, "uploads", newFileName);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Could not rename file" });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: "File uploaded and renamed",
        fileName: newFileName,
      });
  });
});

// Эндпоинт для получения списка всех файлов
app.get("/gallery", (req, res) => {
  const dirPath = path.join(__dirname, "uploads");

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
