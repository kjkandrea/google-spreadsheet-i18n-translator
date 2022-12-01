import {
  COLUMN_NAME,
  readLocaleMapFromJSON,
  readSpreadSheet,
  writeJSONFromLocaleMap,
} from './index';
import {Locale, LocaleDictionary} from './types';
import {GoogleSpreadsheetRow} from 'google-spreadsheet';

async function main() {
  const localeMap = readLocaleMapFromJSON();
  const spreadSheet = await readSpreadSheet();
  await updateLocaleJSON();

  async function updateLocaleJSON() {
    const sheet = spreadSheet.sheetsByIndex[0];
    if (!sheet) {
      throw new Error(
        `${spreadSheet.title} : 첫번째 시트를 읽어들이는데에 실패하였습니다.`
      );
    }

    const rows = await sheet.getRows();

    const sheetLocaleMap = new Map(
      [...localeMap.keys()].map(locale => [
        locale,
        readSheetLocaleDictionary(locale, rows),
      ])
    );

    await writeJSONFromLocaleMap(sheetLocaleMap);

    function readSheetLocaleDictionary(
      locale: Locale,
      rows: GoogleSpreadsheetRow[]
    ): LocaleDictionary {
      return Object.fromEntries(
        rows.map(row => [row[COLUMN_NAME.KEY], row[locale]])
      );
    }
  }
}

main().then(() => console.log('Download is Done! 🥳'));
