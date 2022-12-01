import {readLocaleMap, readSpreadSheet} from './index';

async function main() {
  const localeMap = readLocaleMap();
  const spreadSheet = await readSpreadSheet();

  console.log(localeMap, spreadSheet);
}

main().then(() => console.log('Download is Done! 🥳'));
