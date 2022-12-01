import {GoogleSpreadsheet, ServiceAccountCredentials} from 'google-spreadsheet';
import * as fs from 'fs';
import {Locale, LocaleDictionary, LocaleMap} from './types';
import {upload} from './upload';
import {download} from './download';

export const COLUMN_NAME = {
  KEY: 'key',
};

export interface GoogleSpreadsheetI18nUpdaterConstructorArgs {
  googleSpreadsheetId: string;
  serviceAccountCredentials: ServiceAccountCredentials;
  jsonDirectoryPath: string;
  locales: Locale[];
}

export class GoogleSpreadsheetI18nUpdater {
  private readonly googleSpreadsheetId: string;
  private readonly serviceAccountCredentials: ServiceAccountCredentials;
  private readonly jsonDirectoryPath: string;
  private readonly locales: Locale[];

  constructor({
    googleSpreadsheetId,
    serviceAccountCredentials,
    jsonDirectoryPath,
    locales,
  }: GoogleSpreadsheetI18nUpdaterConstructorArgs) {
    this.googleSpreadsheetId = googleSpreadsheetId;
    this.serviceAccountCredentials = serviceAccountCredentials;
    this.jsonDirectoryPath = jsonDirectoryPath;
    this.locales = locales;
  }

  public async upload() {
    const localeMap = this.readLocaleMapFromJSON();
    const spreadSheet = await this.readSpreadSheet();

    return upload(localeMap, spreadSheet);
  }

  public async download() {
    const localeMap = this.readLocaleMapFromJSON();
    const spreadSheet = await this.readSpreadSheet();

    return download(
      localeMap,
      spreadSheet,
      this.writeJSONFromLocaleMap.bind(this)
    );
  }

  private async readSpreadSheet(): Promise<GoogleSpreadsheet> {
    const doc = new GoogleSpreadsheet(this.googleSpreadsheetId);

    await doc.useServiceAccountAuth(this.serviceAccountCredentials);
    await doc.loadInfo();

    console.log(`${doc.title} 를 읽어들였습니다.`);

    return doc;
  }

  private readLocaleMapFromJSON(): LocaleMap {
    return new Map(
      this.locales.map((locale: Locale) => {
        const JSONPath = `${this.jsonDirectoryPath}/${locale}.json`;

        const localeDictionary: LocaleDictionary = JSON.parse(
          fs.readFileSync(JSONPath).toString()
        );
        if (!localeDictionary) {
          throw new Error(
            `${this.jsonDirectoryPath}/${locale}.json 를 읽어들이는데에 실패하였습니다.`
          );
        }
        return [locale, localeDictionary];
      })
    );
  }

  private writeJSONFromLocaleMap(localeMap: LocaleMap) {
    localeMap.forEach((localeDictionary, locale) => {
      const JSONPath = `${this.jsonDirectoryPath}/${locale}.json`;

      fs.writeFileSync(JSONPath, JSON.stringify(localeDictionary, null, 2));
    });
  }
}
