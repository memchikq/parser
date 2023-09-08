#!/usr/bin/env node
import fetch from 'node-fetch'
import cheerio from 'cheerio'
import buffer from 'buffer'
import saveAsHtml from './saveAsHtml.js'
import {Command} from 'commander'
import saveAsJson from './saveAsJson.js'
import logArticles from './logArticles.js'
const program = new Command();

// Код для commander чтобы можно было использовать CLI и ввести аргументы в консоль
program
  .name('parser')
  .description('Парсер для сайта https://diapazon.kz/category/sport/aktobe')
  .version('1.0.0');

  program.option("-p <Путь сохранения>","Где будет сохранен файл, (по умолчанию текущая директория)","./")
  program.option("-t <Тип данных>","json - данные сохранятся в виде json, html -данные сохранятся в виде html , log - данные будут выведены в консоль","json")
  program.option("-n <Количество>","Как много статей получить, (если не указать будет по стандарту)",-1)

  program.parse(process.argv)

  let options = program.opts()


// функция для получения данных по указанному количеству 
async function getDataByNumber(number){
    try{

        const response = await fetch(`https://diapazon.kz/article/more-list?category=3&region=1&count=${number}&offset=-1&viewType=main`)
        const json = await response.json()
        
        return json.list
    }
    catch(e){
        throw new Error("Ошибка")
    }
}
// получение стандартное количество статей
async function getDefaulData(){
    try{

        const response = await fetch("https://diapazon.kz/category/sport/aktobe")
        const bufferResponse = await response.arrayBuffer()
        const bf = buffer.Buffer.from(bufferResponse)
        const decoder = new TextDecoder("utf-8")
        const decodedHtml = decoder.decode(bf)
        
        return decodedHtml
    }
    catch(e){
        throw new Error("Ошибка")
    }
}


async function parseHtml(numberOfArticles,saveType,pathToSave){
    
    let loadData = numberOfArticles < 0 ? await getDefaulData() : await getDataByNumber(numberOfArticles)

    const $ = cheerio.load(loadData)
    const articles =[]
    $("li.news-box__item.news-cart").each((v,e)=>{
        const article = {}

        const linkElement = $(e).find('a.news-cart__link')
        const timeElement = $(e).find('.news-cart__pub-time')
        const titleElement = $(e).find('span.news-cart__name').text()
        
        article.link = linkElement.attr('href');
        article.title = titleElement
        article.date = timeElement.attr('datetime');
        articles.push(article);
    })

    switch(saveType){
        case "json": 
            saveAsJson(articles,pathToSave)
            break
        case "html":
            saveAsHtml(articles,pathToSave)
            break
        case "log":
            logArticles(articles)
            break
        default: loadData(articles)
    }
}

parseHtml(Math.floor(parseInt(options.n)),options.t,options.p)









