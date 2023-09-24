import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';


export const createFolder = (path)=>{
    if (!fs.existsSync(path)) {
        // Если нет, создаем ее
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) {
                return console.error('Ошибка при создании папки:', err);
            }
            console.log('Папка успешно создана');
        });
    }
}

export const createVideo = (folderName)=>{


    ffmpeg()
        .input(`./video/${folderName}/image%d.jpg`)  // Изображения с паттерном image1.jpg, image2.jpg, и т.д.
        .inputFPS(1)  // Количество кадров в секунду
        .output(`./video/${new Date().getTime()}_output.mp4`)  // Выходной файл
        .outputFPS(30)
        .on('end', () => {
            console.log('Видео создано');
        })
        .on('error', (err) => {
            console.log('Ошибка: ' + err.message);
        })
        .run();
}

export const renameFilesAndCreateVideo = ()=>{
    const dirPath =  "./uploads"
    const newDir ="files"+ new Date().getTime();
    let counter = 0;
    createFolder("./video/"+newDir)
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.log('Ошибка чтения директории:', err);
            return;
        }

        files.forEach(file => {
            const oldPath = path.join(dirPath, file);
            const newPath = path.join("./video/"+newDir, `image${counter}.jpg`);
            fs.rename(oldPath, newPath, err => {
                if (err) {
                    console.log('Ошибка переименования:', err);
                } else {
                    console.log(`Файл ${oldPath} переименован в ${newPath}`);
                }
            });
            counter++;
        });
    });
    createVideo(newDir)
}



