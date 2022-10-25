import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import { parseName, parseResourceName, isResourceLinkLocal } from './utils.js';

const RESOURCES_MAP = {
  img: 'src',
  // link: 'href',
  // script: 'src',
};

export default (url, directory = process.cwd()) => {
  const fileName = parseName(url);
  const folderName = `${fileName}_files`;

  const htmlFilePath = `${directory}/${fileName}.html`;
  console.log('🚀 ~ file: index.js ~ line 39 ~ htmlFilePath', htmlFilePath);
  const resourcesFolderPath = `${directory}/${folderName}`;
  console.log('🚀 ~ file: index.js ~ line 41 ~ resourcesFolderPath', resourcesFolderPath);

  const resources = Object.keys(RESOURCES_MAP);

  return fsp.mkdir(resourcesFolderPath)
    .then(() => axios.get(url))
    .then((response) => response.data)
    .then((html) => {
      const $ = cheerio.load(html);

      resources.forEach((tag) => {
        $(tag).each((_, el) => {
          const link = $(el).attr(RESOURCES_MAP[tag]);

          if (!isResourceLinkLocal(link, url)) {
            return;
          }

          const absoluteLink = new URL(link, url).href;
          const resourceName = parseResourceName(absoluteLink);
          axios.get(absoluteLink, { responseType: 'arraybuffer' })
            .then((response) => fsp.writeFile(`${resourcesFolderPath}/${resourceName}`, response.data));

          $(el).attr(RESOURCES_MAP[tag], `${folderName}/${parseResourceName(absoluteLink)}`);
        });
      });

      return $.html();
    })
    .then((data) => fsp.writeFile(htmlFilePath, prettier.format(data, { parser: 'html' })))
    .catch((error) => {
      throw error;
    });
};
