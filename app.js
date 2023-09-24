import express from 'express';
const app = express();
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import {createFolder, renameFilesAndCreateVideo} from "./video.js";
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
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


// Это будет разрешать все домены. В реальном приложении вы, возможно, захотите ограничить это.
app.use(cors());
// Эндпоинт для загрузки файла
app.post("/upload", upload.single("file"), (req, res) => {
  console.log("upload");
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
  const oldPath = path.join( req.file.path);
  const newPath = path.join( "uploads", newFileName);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res
        .status(500)
        .json({ status: "error", message: "Could not rename file" });
    }
    res.status(200).json({
      status: "success",
      message: "File uploaded and renamed",
      fileName: newFileName,
    });
  });
});
app.post("/uploadBase64", (req, res) => {
  const sizeInBytes = JSON.stringify(req.body).length;
  const sizeInMegabytes = (sizeInBytes / (1024 * 1024)).toFixed(2);
  console.log(`Request size: ${sizeInMegabytes} MB`);
  console.log(req.body.base64Image.length);
  const { base64Image } = req.body;
  if (!base64Image) {
    return res
      .status(400)
      .json({ status: "error", message: "No base64 image provided" });
  }

  // Extract image type (e.g., 'png', 'jpeg') from the base64 string
  const imageType = "jpg";

  // Remove the 'data:image/{imageType};base64,' part from the beginning of the base64 string
  const cleanBase64Image = base64Image.replace(/data:image\/.*;base64,/, "");

  // Generate a random filename
  const filename = `${Date.now()}.${imageType}`;

  // Save the image to disk
  fs.writeFile(
    path.join(__dirname, "uploads", filename),
    cleanBase64Image,
    { encoding: "base64" },
    (err) => {
      if (err) {
        return res
          .status(500)
          .json({ status: "error", message: "Could not save image" });
      }
      res.status(200).json({
        status: "success",
        message: "Image uploaded successfully",
        filename,
      });
    }
  );
});

app.get("/create", (req,res)=>{
  try{
    createFolder("video");
    renameFilesAndCreateVideo()
    return    res.status(200).json( "done");
  } catch (e){
    return res
        .status(500)
        .json({ status: "error", message: "Could not save image" });
  }

})


// Эндпоинт для получения списка всех файлов
app.get("/gallery", (req, res) => {
  const dirPath = path.join( "uploads");

  if (!fs.existsSync(dirPath)) {
    return res.status(200).json({ files: [] });
  }

  const files = fs.readdirSync(dirPath);
  res.status(200).json({ files });
});

// Запуск сервера


const uploadsDir = path.join( './video');

app.get('/files', (req, res) => {
  // Чтение содержимого папки
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Возвращение списка файлов
    res.json({ files });
  });
});

app.get('/download/:filename', (req, res) => {
  // Получение имени файла из параметров маршрута
  const filename = req.params.filename;

  // Построение полного пути к файлу
  const filePath = path.join(uploadsDir, filename);

  // Отправка файла
  res.download(filePath, filename, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
  });
});
app.get('/links', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    let fileListHtml = '<ul>';
    files.forEach(file => {
      fileListHtml += `<li><a href="/download/${file}">${file}</a></li>`;
    });
    fileListHtml += '</ul>';

    res.send(fileListHtml);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
