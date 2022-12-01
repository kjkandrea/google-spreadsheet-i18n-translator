import {GoogleSpreadsheet} from 'google-spreadsheet';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import {Locale, LocaleDictionary, LocaleMap} from './types';
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

const PATH = './locales';
const LOCALES: Locale[] = ['ko-kr', 'en-us'];

export function readLocaleMapFromJSON(): LocaleMap {
  return new Map(
    LOCALES.map((locale: Locale) => {
      const JSONPath = `${PATH}/${locale}.json`;

      const localeDictionary: LocaleDictionary = JSON.parse(
        fs.readFileSync(JSONPath).toString()
      );
      if (!localeDictionary) {
        throw new Error(
          `${PATH}/${locale}.json 를 읽어들이는데에 실패하였습니다.`
        );
      }
      return [locale, localeDictionary];
    })
  );
}

export function writeJSONFromLocaleMap(localeMap: LocaleMap) {
  localeMap.forEach((localeDictionary, locale) => {
    const JSONPath = `${PATH}/${locale}.json`;

    fs.writeFileSync(JSONPath, JSON.stringify(localeDictionary, null, 2));
  });
}
