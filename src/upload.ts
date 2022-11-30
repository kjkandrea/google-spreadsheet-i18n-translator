import * as fs from 'fs';
import {readSpreadSheet, COLUMN_NAME} from './index';
import {GoogleSpreadsheet} from 'google-spreadsheet';

type Locale = 'ko-kr' | 'en-us';
interface LocaleDictionary {
  [key: string]: string;
}

async function main() {
  const localeMap = readLocaleMap('./locales', ['ko-kr', 'en-us']);
  const spreadSheet = await readSpreadSheet();
  await updateSheet(spreadSheet, localeMap);

  async function updateSheet(
    spreadSheet: GoogleSpreadsheet,
    localeMap: Map<Locale, LocaleDictionary>
  ) {
    const sheet = spreadSheet.sheetsByIndex[0];
    if (!sheet) {
      throw new Error(
        `${spreadSheet.title} : 첫번째 시트를 읽어들이는데에 실패하였습니다.`
      );
    }

    await sheet.loadHeaderRow();
    const headerValues = sheet.headerValues;

    const keyColumnIndex = headerValues.findIndex(
      value => value === COLUMN_NAME.KEY
    );

    if (keyColumnIndex === -1) {
      throw new Error(
        `${spreadSheet.title} 내에서 ${COLUMN_NAME.KEY} 컬럼을 찾을 수 없습니다.`
      );
    }

    console.log(keyColumnIndex);
  }

  function readLocaleMap(
    path: string,
    locales: Locale[]
  ): Map<Locale, LocaleDictionary> {
    return new Map(
      locales.map((locale: Locale) => {
        const localeDictionary: LocaleDictionary = JSON.parse(
          fs.readFileSync(`${path}/${locale}.json`).toString()
        );
        if (!localeDictionary) {
          throw new Error(
            `${path}/${locale}.json 를 읽어들이는데에 실패하였습니다.`
          );
        }
        return [locale, localeDictionary];
      })
    );
  }
}

main();
