import * as fs from 'fs';
import {readSpreadSheet, COLUMN_NAME} from './index';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';

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
    const headerValueSet = new Set(sheet.headerValues);
    const rows = await sheet.getRows();

    await updateKeyColumn(
      headerValueSet,
      rows,
      sheet.addRows.bind(sheet),
      localeMap
    );

    const keyRows = await sheet.getRows();

    await updateTranslationValues(
      headerValueSet,
      keyRows,
      sheet.clearRows.bind(sheet),
      sheet.addRows.bind(sheet),
      localeMap
    );

    async function updateKeyColumn(
      headerValueSet: Set<string>,
      rows: GoogleSpreadsheetRow[],
      addRows: GoogleSpreadsheetWorksheet['addRows'],
      localeMap: Map<Locale, LocaleDictionary>
    ): Promise<void> {
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

      // sheet 에 없는 key 가 있다면 keySet 을 이용하여 row 를 생성합니다.
      const addedRows = Array.from([...keySet], key => ({
        [COLUMN_NAME.KEY]: key.toString(),
      }));

      if (addedRows.length) await addRows(addedRows);
    }
  }

  async function updateTranslationValues(
    headerValueSet: Set<string>,
    rows: GoogleSpreadsheetRow[],
    clearRows: GoogleSpreadsheetWorksheet['clearRows'],
    addRows: GoogleSpreadsheetWorksheet['addRows'],
    localeMap: Map<Locale, LocaleDictionary>
  ) {
    const locales = [...localeMap.keys()];
    const missingLocale = locales.find(locale => !headerValueSet.has(locale));

    if (missingLocale) {
      throw new Error(` ${missingLocale} 컬럼을 시트 내에서 찾을 수 없습니다.`);
    }

    // TODO: locale 모두 cell 생성. 현재는 ko-kr 만 생성됨
    const newRows = rows.map(row => {
      const key = row[COLUMN_NAME.KEY];
      const koLocaleDictionary = localeMap.get('ko-kr')!;
      const translationValue = koLocaleDictionary[key];

      return translationValue
        ? {
            ...row,
            ['ko-kr']: translationValue,
          }
        : row;
    });

    await clearRows();
    await addRows(newRows);
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
