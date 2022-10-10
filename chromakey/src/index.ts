import 'dear-image.detect-background-color';
import 'canvas';
import { spawn } from 'child_process';
import DearImage from "dear-image";

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


videos.forEach(async (v) => {
  console.log(`URL: ${v} COLOR: `, await getMainColor(v));
})