import fs from 'fs'
import { fileURLToPath } from 'url';
import path,{dirname} from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default (articles,savePath)=>{
    const articlesJson = JSON.stringify(articles, null, 2);
    console.log(`Файл сохранён по пути - ${path.join(__dirname,savePath,'articles.json')}`)
    fs.writeFileSync(`${path.join(__dirname,savePath,'articles.json')}`, articlesJson, 'utf-8');
}