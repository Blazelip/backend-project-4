import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import { parseName, parseResourceName, isResourceLinkLocal } from './utils.js';
import debug from 'debug';

const log = debug('page-loader');

const RESOURCES_MAP = {
  img: 'src',
  link: 'href',
  script: 'src',
};

export default (url, directory = process.cwd()) => {
  log(`${url} - URL for download`);
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
      $ = cheerio.load(html);

      const promises = [];

      resources.forEach((tag) => {
        $(tag).each((_, el) => {
          const link = $(el).attr(RESOURCES_MAP[tag]);

          if (!isResourceLinkLocal(link, url)) {
            log(`Resource is not local - ${link}`);
            return;
          }

          const absoluteLink = new URL(link, url).href;
          log(`Absolute resource link ${absoluteLink}`);
          const resourceName = parseResourceName(absoluteLink);

          $(el).attr(RESOURCES_MAP[tag], `${folderName}/${parseResourceName(absoluteLink)}`);

          promises.push(axios.get(absoluteLink, { responseType: 'arraybuffer' })
            .then((response) => fsp.writeFile(`${resourcesFolderPath}/${resourceName}`, response.data))
            .catch((error) => log(`Trouble with resource download and record - ${error}`)));
        });
      });
      return Promise.all(promises);
    })
    .then(() => {
      log(`Html file is here ${htmlFilePath}`);
      return fsp.writeFile(htmlFilePath, prettier.format($.html(), { parser: 'html' }));
    })
    .catch((error) => {
      throw error;
    });
};
