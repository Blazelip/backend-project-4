import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import { parseName, parseResourceName, isResourceLinkLocal } from './utils.js';

const RESOURCES_MAP = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const testHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="utf-8">
    <title>Курсы по программированию Хекслет</title>
    <link rel="stylesheet" media="all" href="https://cdn2.hexlet.io/assets/menu.css">
    <link rel="stylesheet" media="all" href="/assets/application.css" />
    <link href="/courses" rel="canonical">
  </head>
  <body>
    <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист" />
    <h3>
      <a href="/professions/nodejs">Node.js-программист</a>
    </h3>
    <script src="https://js.stripe.com/v3/"></script>
    <script src="https://ru.hexlet.io/packs/js/runtime.js"></script>
  </body>
</html>`;

export default (url, directory = process.cwd()) => {
  const fileName = parseName(url);
  const folderName = `${fileName}_files`;
  let $;

  const htmlFilePath = `${directory}/${fileName}.html`;
  const resourcesFolderPath = `${directory}/${folderName}`;

  const resources = Object.keys(RESOURCES_MAP);

  return fsp.mkdir(resourcesFolderPath)
    .then(() => axios.get(url))
    .then((response) => response.data)
    .then((html) => {
      $ = cheerio.load(testHtml);

      const promises = [];

      resources.forEach((tag) => {
        $(tag).each((_, el) => {
          const link = $(el).attr(RESOURCES_MAP[tag]);

          if (!isResourceLinkLocal(link, url)) {
            return;
          }

          const absoluteLink = new URL(link, url).href;
          const resourceName = parseResourceName(absoluteLink);

          $(el).attr(RESOURCES_MAP[tag], `${folderName}/${parseResourceName(absoluteLink)}`);

          promises.push(axios.get(absoluteLink, { responseType: 'arraybuffer' })
            .then((response) => fsp.writeFile(`${resourcesFolderPath}/${resourceName}`, response.data))
            .catch((error) => console.log(`SOMETHING WRONG ${link} ${absoluteLink}`)));
        });
      });
      return Promise.all(promises);
    })
    .then(() => fsp.writeFile(htmlFilePath, prettier.format($.html(), { parser: 'html' })))
    .catch((error) => {
      throw error;
    });
};
