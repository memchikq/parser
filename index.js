#!/usr/bin/env node
import fetch from "node-fetch"
import cheerio from "cheerio"
import buffer from "buffer"
import fs from "fs"
import saveAsHtml from "./saveAsHtml.js"
import { Command } from "commander"
import saveAsJson from "./saveAsJson.js"
import logArticles from "./logArticles.js"
const program = new Command()

// Код для commander чтобы можно было использовать CLI и ввести аргументы в консоль
program
  .name("parser")
  .description("Парсер для сайта https://diapazon.kz/category/sport/aktobe")
  .version("1.0.0")

program.option(
  "-p <Путь сохранения>",
  "Где будет сохранен файл, (по умолчанию текущая директория)",
  "./"
)
program.option(
  "-t <Тип данных>",
  "json - данные сохранятся в виде json, html -данные сохранятся в виде html , log - данные будут выведены в консоль",
  "json"
)
program.option(
  "-n <Количество>",
  "Количество указывается от 1 до ... где число 1 = 30, 2 = 60 3=90 и так далее",
  -1
)

program.parse(process.argv)

let options = program.opts()

async function delayedLoopWithGenerator(limit) {
    let count = 0;
    const listData = { list: "" }
  
    async function fetchData(offset) {
      const response = await fetch(
        `https://diapazon.kz/article/more-list?category=3&region=1&count=30&offset=${offset}&viewType=main`
      );
      if (response.ok) {
        const json = await response.json();
        return json
      } else {
        console.error("Ошибка при запросе данных:", response.status);
      }
    }
    // использую генераторы для удобного получения данных частями, и задержка чтобы не DDOS'ить api 
    async function* generator() {
      while (count < limit) {
        const data = await fetchData(count)
        count += 30;
        yield data.list
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  
    for await (const data of generator()) {
      listData.list += data
    }
  
    return listData;
  }

// функция для получения данных по указанному количеству
async function getDataByNumber(number) {
    try {
        const limit = number < 0 ? 30 : number * 30
        
        const {list} = await delayedLoopWithGenerator(limit)
        fs.writeFileSync('test.json', JSON.stringify(list));

    return list
  } catch (e) {
    throw new Error(e)
  }
}
// получение стандартное количество статей
async function getDefaulData() {
  try {
    const response = await fetch("https://diapazon.kz/category/sport/aktobe")
    const bufferResponse = await response.arrayBuffer()
    const bf = buffer.Buffer.from(bufferResponse)
    const decoder = new TextDecoder("utf-8")
    const decodedHtml = decoder.decode(bf)

    return decodedHtml
  } catch (e) {
    throw new Error(e.message)
  }
}

async function parseHtml(numberOfArticles, saveType, pathToSave) {
  let loadData =
    numberOfArticles < 0
      ? await getDefaulData()
      : await getDataByNumber(numberOfArticles)

  const $ = cheerio.load(loadData)
  const articles = []
  $("li.news-box__item.news-cart").each((index, element) => {
    const article = {}

    const linkElement = $(element).find("a.news-cart__link")
    const timeElement = $(element).find(".news-cart__pub-time")
    const titleElement = $(element).find("span.news-cart__name").text()
    article.number = index
    article.link = linkElement.attr("href")
    article.title = titleElement
    article.date = timeElement.attr("datetime")
    articles.push(article)
  })

  switch (saveType) {
    case "json":
      saveAsJson(articles, pathToSave)
      break
    case "html":
      saveAsHtml(articles, pathToSave)
      break
    case "log":
      logArticles(articles)
      break
    default:
      loadData(articles)
  }
}

parseHtml(Math.floor(parseInt(options.n)), options.t, options.p)
