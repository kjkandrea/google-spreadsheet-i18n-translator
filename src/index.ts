import {GoogleSpreadsheet} from 'google-spreadsheet';
const fs = require('fs');

export async function readSpreadSheet() {
  const spreadSheet = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);

  const googleSpreadSheetCredit = JSON.parse(
    fs.readFileSync('./google-spread-sheet-credit.json')
  );

  await spreadSheet.useServiceAccountAuth(googleSpreadSheetCredit);
  await spreadSheet.loadInfo();

  return spreadSheet;
}
