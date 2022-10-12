import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';

import testFunc from '../src/index.js';

let tempDir;
let expected;

const URL = 'https://ru.hexlet.io/courses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.resolve(__dirname, '..', '__fixtures__', filename);

nock.disableNetConnect();

beforeAll(async () => {
  expected = await fs.readFile(getFixturePath('expected.html'), 'utf-8');
});

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

test('correct dataFetch', async () => {
  nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, expected);

  const filePath = await testFunc(URL, tempDir);
  const fileContent = await fs.readFile(filePath);
  expect(fileContent).toEqual(expected);
});
