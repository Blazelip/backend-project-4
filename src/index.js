import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import path from 'path';
import prettier from 'prettier';

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
    .then((data) => fsp.writeFile(htmlFilePath, prettier.format(data, { parser: 'html' })))
    .then(() => fsp.mkdir(resoursesFolderPath))
    .then(() => absoluteImgLinks.forEach((imageLink) => axios.get(imageLink, { responseType: 'arraybuffer' }).then((response) => fsp.writeFile(`${folderName}/${parseImageName(imageLink)}`, response.data))))
    .catch((error) => {
      throw error;
    });
};
