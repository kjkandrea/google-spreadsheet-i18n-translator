import * as fs from 'fs';
import {readSpreadSheet, COLUMN_NAME} from './index';
import {GoogleSpreadsheet, GoogleSpreadsheetRow} from 'google-spreadsheet';
import type {Locale, LocaleDictionary, RowValues} from './types';

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
    const headerValueSet = new Set(sheet.headerValues);
    const rows = await sheet.getRows();

    const keyRowValues: RowValues = makeNewKeyRowValues(
      headerValueSet,
      rows,
      localeMap
    );

    if (keyRowValues.length) await sheet.addRows(keyRowValues);
    const keyUpdatedRows = await sheet.getRows();
    const translatedRows = await makeTranslatedRows(
      headerValueSet,
      keyUpdatedRows,
      localeMap
    );

    await sheet.clearRows();
    await sheet.addRows(translatedRows);

    function makeNewKeyRowValues(
      headerValueSet: Set<string>,
      rows: GoogleSpreadsheetRow[],
      localeMap: Map<Locale, LocaleDictionary>
    ): RowValues {
      if (!headerValueSet.has(COLUMN_NAME.KEY)) {
        throw new Error(
          ` ${COLUMN_NAME.KEY} 컬럼을 시트 내에서 찾을 수 없습니다.`
        );
      }
      const keySet = new Set(
        [...localeMap.values()]
          .map(localeDictionary => Object.keys(localeDictionary))
          .flat()
      );

      // 이미 sheet 에 key 가 등록되어있다면 keySet 에서 삭제합니다.
      rows.forEach(row => {
        const keyColumn = row[COLUMN_NAME.KEY];
        if (keySet.has(keyColumn)) keySet.delete(keyColumn);
      });

      // sheet 에 없는 key 가 있다면 keySet 을 이용하여 rowValue 를 생성합니다.
      return Array.from([...keySet], key => ({
        [COLUMN_NAME.KEY]: key.toString(),
      }));
    }
  }

  async function makeTranslatedRows(
    headerValueSet: Set<string>,
    keyUpdatedRows: GoogleSpreadsheetRow[],
    localeMap: Map<Locale, LocaleDictionary>
  ) {
    const locales = [...localeMap.keys()];
    const missingLocale = locales.find(locale => !headerValueSet.has(locale));

    if (missingLocale) {
      throw new Error(` ${missingLocale} 컬럼을 시트 내에서 찾을 수 없습니다.`);
    }

    return keyUpdatedRows.map(row => {
      const key = row[COLUMN_NAME.KEY];

      return {
        ...row,
        ...Object.fromEntries(
          locales.map(locale => [locale, localeMap.get(locale)?.[key]])
        ),
      };
    });
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

main().then(() => console.log('Upload is Done! 🥳'));
