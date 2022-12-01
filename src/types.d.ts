import {GoogleSpreadsheetWorksheet} from 'google-spreadsheet';

export type Locale = 'ko-kr' | 'en-us';
export interface LocaleDictionary {
  [key: string]: string;
}
export type LocaleMap = Map<Locale, LocaleDictionary>;
export type RowValues = Parameters<GoogleSpreadsheetWorksheet['addRows']>[0];
