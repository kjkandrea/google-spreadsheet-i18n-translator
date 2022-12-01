const commends = ['upload', 'download'] as const;
type Commend = typeof commends[number];
const cmd = process.argv.at(2) ?? '';

const isValidCommand = (cmd: string): cmd is Commend =>
  (commends as readonly string[]).includes(cmd);

if (!isValidCommand(cmd)) {
  throw new Error(`유효한 커맨드가 아닙니다. : ${cmd}`);
}

switch (cmd) {
  case 'upload':
    console.log('upload');
    break;
  case 'download':
    console.log('download');
    break;
}
