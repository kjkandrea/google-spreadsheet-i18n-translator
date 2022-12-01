import {COLUMN_NAME} from './index';
import {Locale, LocaleDictionary, LocaleMap} from './types';
import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet';

export async function download(
  localeMap: LocaleMap,
  spreadSheet: GoogleSpreadsheet,
  writeJSONFromLocaleMap: (localeMap: LocaleMap) => void
) {
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

    return writeJSONFromLocaleMap(sheetLocaleMap);

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
