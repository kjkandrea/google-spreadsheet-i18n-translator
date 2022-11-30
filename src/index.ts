import {GoogleSpreadsheet} from 'google-spreadsheet';
const fs = require('fs');
require('dotenv').config();

export async function readSpreadSheet() {
  const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

  const googleSpreadSheetCredit = JSON.parse(
    fs.readFileSync('./google-spread-sheet-credit.json')
  );

  await doc.useServiceAccountAuth(googleSpreadSheetCredit);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];

  console.log(`${doc.title} : ${sheet.title} 를 읽어들였습니다.`);

  return sheet;
}
