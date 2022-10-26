import os from 'os';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nock from 'nock';

import pageLoader from '../src/index.js';

let tempDir;
let expectedHtml;
let expectedModifiedHtml;
let expectedImg;
let expectedCss;
let expectedScript;

const URL = 'https://ru.hexlet.io/courses';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getFixturePath = (filename) => path.resolve(__dirname, '..', '__fixtures__', filename);

nock.disableNetConnect();

beforeAll(async () => {
  expectedHtml = await fsp.readFile(getFixturePath('expected.html'), 'utf-8');
  expectedModifiedHtml = await fsp.readFile(getFixturePath('expectedModified.html'), 'utf-8');
  expectedImg = await fsp.readFile(getFixturePath('expected.png'), 'utf-8');
  expectedCss = await fsp.readFile(getFixturePath('expected.css'), 'utf-8');
  expectedScript = await fsp.readFile(getFixturePath('expected.js'), 'utf-8');
});

beforeEach(async () => {
  tempDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  console.log("🚀 ~ file: pageloader.tests.js ~ line 31 ~ beforeEach ~ tempDir", tempDir)
});

test('correct dataFetch', async () => {
  const scope = nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, expectedHtml)
    .get(/\/assets\/professions\/nodejs\.png/)
    .reply(200, expectedImg)
    .get(/\/assets\/application\.css/)
    .reply(200, expectedCss)
    .get(/\/packs\/js\/runtime\.js/)
    .reply(200, expectedScript);

  await pageLoader(URL, tempDir);
  const downloadedHtml = await fsp.readFile(path.join(tempDir, 'ru-hexlet-io-courses.html'), 'utf-8');
  const downloadedImg = await fsp.readFile(path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png'), 'utf-8');
  const downloadedCss = await fsp.readFile(path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css'), 'utf-8');
  const downloadedScript = await fsp.readFile(path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js'), 'utf-8');
  expect(downloadedHtml).toEqual(expectedModifiedHtml);
  expect(downloadedImg).toEqual(expectedImg);
  expect(downloadedCss).toEqual(expectedCss);
  expect(downloadedScript).toEqual(expectedScript);
  expect(scope.isDone()).toBe(true);
});

// test('wrong URL', async () => {
//   nock('https://abc.xyz')
//     .get('/a')
//     .reply(404);

//   await expect(pageLoader('https://abc.xyz/a', tempDir)).rejects.toThrow();
// });
