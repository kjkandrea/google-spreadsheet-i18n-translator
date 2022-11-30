import * as fs from 'fs';

function readLocaleMap(path: string) {
  return new Map(
    fs
      .readdirSync(path)
      .map((filename: string) => [
        filename.replace('.json', ''),
        JSON.parse(fs.readFileSync(`${path}/${filename}`).toString()),
      ])
  );
}

console.log(readLocaleMap('./locales'));
