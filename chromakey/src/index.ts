import 'dear-image.detect-background-color';
import 'canvas';
import { spawn } from 'child_process';
import DearImage from "dear-image";
import axios from "axios";
import { PassThrough } from 'stream';

const videos = [
  "https://ssai-s3.nyc3.digitaloceanspaces.com/ads/basketball-2.mp4",
  "https://ssai-s3.nyc3.digitaloceanspaces.com/ads/basketball-1.webm",
  "https://ssai-s3.nyc3.digitaloceanspaces.com/ads/3.mp4",
]

const options = (url: string): string[] => [
  '-i',
  url,
  '-vframes',
  '1',
  '-c:v',
  'png',
  '-f',
  'image2pipe',
  '-',
];

const optionsStdIn = [
  '-i',
  '-',
  '-vframes',
  '1',
  '-c:v',
  'png',
  '-f',
  'image2pipe',
  '-',
];

const getMainColor = async (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const buffers: any[] = [];

    const p = spawn('ffmpeg', options(url), { detached: false });

    p.stdout.on('data', (data: any) => {
      buffers.push(...data);
    });

    p.stdout.on('end', async () => {
      const bufferImage = Buffer.from(buffers);

      const image = await DearImage.loadFrom(bufferImage);
      const backgroundColor = await DearImage.detectBackgroundColor(image);

      resolve(backgroundColor);
    });
  })
}

const getMainColorStdIn = async (url: string): Promise<string> => {
  return new Promise(async (resolve) => {
    const contentPipe = new PassThrough();

    const resp = await axios({
      responseType: 'stream',
      url,
      method: 'get',
    });

    resp.data.pipe(contentPipe);

    const buffers: any[] = [];

    const p = spawn('ffmpeg', optionsStdIn, { detached: false });
    p.stdout.on('data', (data: any) => {
      buffers.push(...data);
    });

    p.stdout.on('end', async () => {
      const bufferImage = Buffer.from(buffers);

      const image = await DearImage.loadFrom(bufferImage);
      const backgroundColor = await DearImage.detectBackgroundColor(image);

      resolve(backgroundColor);
    });

    contentPipe.on("data", (data) => {
      p.stdin.write(data);
    })

    contentPipe.on("end", () => {
      p.stdin.end();
    })
  })
}

videos.forEach(async (v) => {
  // console.log(`URL: ${v} COLOR: `, await getMainColor(v));
  console.log(`URL: ${v} COLOR: `, await getMainColorStdIn(v));
})