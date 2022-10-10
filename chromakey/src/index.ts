require('dear-image.detect-background-color');
const DearImage = require('dear-image');
require('canvas');

const { spawn } = require('child_process');

async function main() {
  const options = [
    '-i',
    './assets/3.mp4',
    '-vframes',
    '1',
    '-c:v',
    'png',
    '-f',
    'image2pipe',
    '-',
  ];

  const buffs: any[] = [];

  const p = spawn('ffmpeg', options, { detached: false });

  p.stdout.on('data', (d: any) => {
    buffs.push(...d);
  });

  p.stdout.on('end', async (d) => {
    const bufferImage = Buffer.from(buffs);

    const image = await DearImage.loadFrom(bufferImage);
    const backgroundColor = await DearImage.detectBackgroundColor(image);
    console.log('backgroundColor', backgroundColor);
  });
}
main();
