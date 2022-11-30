const fs = require('fs');

console.log('upload!');

function readLocales(path: string) {
  const JSONFilePaths = fs
    .readdirSync(path)
    .map((filename: string) => path + '/' + filename);
  console.log(JSONFilePaths);
}

readLocales('./locales');
