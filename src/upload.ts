const fs = require('fs');

console.log('upload!');

function readLocaleMap(path: string) {
  return new Map(
    fs
      .readdirSync(path)
      .map((filename: string) => [
        filename.replace('.json', ''),
        JSON.parse(fs.readFileSync(`${path}/${filename}`)),
      ])
  );
}

console.log(readLocaleMap('./locales'));
