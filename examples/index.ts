import * as fs from 'fs';
import {GoogleSpreadsheetI18nUpdater} from '..';

const commends = ['upload', 'download'] as const;
type Commend = typeof commends[number];
const cmd = process.argv.at(2) ?? '';

const isValidCommand = (cmd: string): cmd is Commend =>
  (commends as readonly string[]).includes(cmd);

if (!isValidCommand(cmd)) {
  throw new Error(`유효한 커맨드가 아닙니다. : ${cmd}`);
}

const serviceAccountCredentials = JSON.parse(
  fs.readFileSync('./google-spread-sheet-credit.json').toString()
);

const googleSpreadsheetI18nUpdater = new GoogleSpreadsheetI18nUpdater({
  googleSpreadsheetId: '1m8BiP95oYhVUOFToAQKLJQF05AGWKXUSBnSpMadwgi8',
  serviceAccountCredentials,
  jsonDirectoryPath: './locales',
  locales: ['ko-kr', 'en-us'],
});

switch (cmd) {
  case 'upload':
    googleSpreadsheetI18nUpdater
      .upload()
      .then(() => console.log('Upload is Done! 🥳'));
    break;
  case 'download':
    googleSpreadsheetI18nUpdater
      .download()
      .then(() => console.log('Download is Done! 🥳'));
    break;
}
