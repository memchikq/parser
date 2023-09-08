import fs from 'fs'
import { fileURLToPath } from 'url';
import path,{dirname} from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default (articles,savePath) =>{
   let articlesHtml = articles.map(v=>(`<div class="article"><a href="https://diapazon.kz${v.link}">${v.title}</a>
    <time>${v.date}</time></div>`)).join("\n")

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Список статей</title>
        <style>
            body {
                background-color: #333; /* Темный фон */
                color: #fff; /* Белый текст */
                font-family: Arial, sans-serif;
            }
    
        
            .article-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px; 
                padding: 20px; 
                border: 1px solid #444; 
                border-radius: 5px; 
            }
    
            
            .article {
                flex: 0 0 calc(50% - 10px); /* Равное распределение по двум колонкам с отступом между ними */
                background-color: #222; /* Цвет фона статьи */
                padding: 10px; /* Внутренний отступ для статьи */
                border-radius: 5px; /* Скругление углов статьи */
            }
    
      
            .article a {
                color: #fff; /* Белый цвет ссылки */
                text-decoration: none; /* Убираем подчеркивание ссылки */
            }
    
    
            .article time {
                color: #888; /* Серый цвет для времени */
                display: block; /* Отображаем время на новой строке */
                margin-top: 5px; /* Отступ сверху от времени */
            }
        </style>
    </head>
    <body>
        <div class="article-container">
            ${articlesHtml}
        </div>
    </body>
    </html>
    `
    console.log(`Файл сохранён по пути - ${path.join(__dirname,savePath,'articles.html')}`)
    fs.writeFileSync(`${path.join(__dirname,savePath,'articles.html')}`, html, 'utf-8');
}