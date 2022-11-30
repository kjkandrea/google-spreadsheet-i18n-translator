import {GoogleSpreadsheet} from 'google-spreadsheet';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

export const COLUMN_NAME = {
  KEY: 'key',
};

export async function readSpreadSheet(): Promise<GoogleSpreadsheet> {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

  const googleSpreadSheetCredit = JSON.parse(
    fs.readFileSync('./google-spread-sheet-credit.json').toString()
  );

  await doc.useServiceAccountAuth(googleSpreadSheetCredit);
  await doc.loadInfo();

  console.log(`${doc.title} 를 읽어들였습니다.`);

  return doc;
}
