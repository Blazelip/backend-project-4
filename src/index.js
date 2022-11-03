import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import Listr from 'listr';
import axiosDebug from 'axios-debug-log';
import debug from 'debug';
import { parseName, parseResourceName, isResourceLinkLocal } from './utils.js';

const log = debug('page-loader');

const RESOURCES_MAP = {
  img: 'src',
  link: 'href',
  script: 'src',
};

axiosDebug({
  request(httpDebug, config) {
    httpDebug(`Request ${config.url}`);
  },
  response(httpDebug, response) {
    httpDebug(
      `Response from ${response.config.url}`,
    );
  },
});

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
    .then((response) => {
      $ = cheerio.load(response.data);

      const promises = resources.flatMap((tag) => $(tag).toArray().flatMap((el) => {
        const link = $(el).attr(RESOURCES_MAP[tag]);
        log(`Initial resource link ${link}`);

        if (!isResourceLinkLocal(link, url)) {
          log(`Resource is not local or empty - ${link}`);
          return [];
        }

        log(`Resource is local - ${link}`);
        const absoluteLink = new URL(link, url);
        log(`Absolute resource link ${absoluteLink}`);
        const resourceName = parseResourceName(absoluteLink);

        $(el).attr(RESOURCES_MAP[tag], `${folderName}/${parseResourceName(absoluteLink)}`);

        const task = axios.get(absoluteLink.href, { responseType: 'arraybuffer' })
          .then((responseRes) => fsp.writeFile(`${resourcesFolderPath}/${resourceName}`, responseRes.data));

        return {
          title: `Download -- ${absoluteLink}`,
          task: () => task,
        };
      }));

      return new Listr(promises, { concurrent: true }).run();
    })
    .then(() => {
      log(`Html file is here ${htmlFilePath}`);
      fsp.writeFile(htmlFilePath, prettier.format($.html(), { parser: 'html' }));
      return htmlFilePath;
    })
    .catch((error) => {
      console.error(`Sorry, download error: ${error.message} / ${error.code}`);
      throw error;
    });
};
