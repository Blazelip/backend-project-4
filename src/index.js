import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import path from 'path';

const testHtml = `<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Курсы по программированию Хекслет</title>
</head>
<body>
  <img src="/assets/professions/nodejs.png" alt="Иконка профессии Node.js-программист">
  <img src="https://cdn2.hexlet.io/derivations/image/original/eyJpZCI6ImQ2OWY2MDJlZTNjMDgyNGJkNjU3MjdkNDhlNGIzZjY0LnBuZyIsInN0b3JhZ2UiOiJjYWNoZSJ9?signature=62e5ec9ec980180796f627ea0a33b9ffa80b9428f5efc231e788e253f671a8dd">
  <h3>
    <a href="/professions/nodejs">Node.js-программист</a>
  </h3>
</body>
</html>`;

const parseName = (url) => {
  const { protocol, href } = new URL(url);

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const fileName = linkWithoutProtocol.replace(/\.|\//g, '-');
  return fileName;
};

const parseImageName = (url) => {
  const { protocol, href } = new URL(url);
  const fileExt = path.extname(url);

  const linkWithoutProtocol = href.replace(`${protocol}//`, '');
  const linkWithoutExt = linkWithoutProtocol.replace(fileExt, '');
  const transformedPath = linkWithoutExt.replace(/\.|\//g, '-');
  return `${transformedPath}${fileExt}`;
};

const getAbsoluteImageLink = (imageLink, url) => {
  const { origin } = new URL(url);
  const newLinkInst = new URL(imageLink, origin);
  return newLinkInst.href;
};

export default (url, directory = process.cwd()) => {
  
  const fileName = parseName(url);
  const folderName = `${fileName}_files`;

  const htmlFilePath = `${directory}/${fileName}.html`;
  const resoursesFolderPath = `${directory}/${folderName}`;
  console.log("🚀 ~ file: index.js ~ line 52 ~ resoursesFolderPath", resoursesFolderPath);

  let markup;
  const absoluteImgLinks = [];

  return axios.get(url)
    .then((response) => response.data)
    .then((html) => {
      markup = html;

      const $ = cheerio.load(html);
      $('img').each((_, el) => {
        const imgLink = $(el).attr('src');
        const absoluteImgLink = getAbsoluteImageLink(imgLink, url);
        $(el).attr('src', `${folderName}/${parseImageName(absoluteImgLink)}`);
        absoluteImgLinks.push(absoluteImgLink);
      });

      return $.html();
    })
    .then((data) => fsp.writeFile(htmlFilePath, data))
    .then(() => fsp.mkdir(resoursesFolderPath))
    .then(() => absoluteImgLinks.forEach((imageLink) => {
      console.log("🚀 ~ file: index.js ~ line 76 ~ .then ~ imageLink", imageLink);

      return axios.get({
        method: 'get',
        url: imageLink,
        responseType: 'arraybuffer',
      })
        .then((response) => {
          console.log('SUCCESS');
          return fsp.writeFile(`${folderName}/${parseImageName(imageLink)}`, response.data);
        })
        .catch((error) => {
          throw new Error('YAAAAAAAAA');
        });
    }))
    .catch((error) => {
      throw error;
    });
};
