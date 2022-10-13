import os from 'os';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';

import pageLoader from '../src/index.js';

let tempDir;
let expected;

const URL = 'https://ru.hexlet.io/courses';
const wrongUrl = 'https://ru.hexlet.io/curses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.resolve(__dirname, '..', '__fixtures__', filename);

nock.disableNetConnect();

beforeAll(async () => {
  expected = await fsp.readFile(getFixturePath('expected.html'), 'utf-8');
  console.log('EXPECTED IN TEST', expected);
});

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('correct dataFetch', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, expected);

  const filePath = await pageLoader(URL, tempDir);
  const fileContent = await fsp.readFile(filePath, 'utf-8');
  expect(fileContent).toEqual(expected);
});

test('incorrect URL', async () => {
  const result = pageLoader(wrongUrl, tempDir);
  expect(result).toThrow();
});
