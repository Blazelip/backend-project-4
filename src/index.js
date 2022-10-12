import fsp from 'fs/promises';
import { URL } from 'url';
import axios from 'axios';

const parseFileName = (url) => {
  const { protocol } = new URL(url);

  const linkWithoutProtocol = url.replace(`${protocol}//`, '');
  const fileName = linkWithoutProtocol.replace(/\.|\//g, '-');
  return `${fileName}.html`;
};

export default (url, directory = process.cwd()) => {
  const fileName = parseFileName(url);
  const writePath = `${directory}/${fileName}`;

  return axios.get(url)
    .then((response) => response.data)
    .then((data) => fsp.writeFile(writePath, data))
    .then(() => writePath)
    .catch((error) => {
      throw error;
    });
};
