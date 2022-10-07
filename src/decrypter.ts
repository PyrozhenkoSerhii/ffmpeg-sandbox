import { spawn } from "child_process"
import { PassThrough } from 'stream';
import { mkdirSync, rmSync, createWriteStream } from "fs";

rmSync("/tmp/stream", { recursive: true });

mkdirSync("/tmp/stream");

const options = (duration: number) => [
  '-protocol_whitelist',
  'file,http,https,tcp,tls,crypto,pipe',
  '-i',
  '-',
  // '-c:v',
  '-c',
  'copy',
  // '-c:a',
  // 'aac',
  '-hls_time',
  duration.toString(),
  '-f',
  // 'hls',
  // '/tmp/stream/test.m3u8',
  'mpegts',
  '-', 
]

// let manifest = '';
// manifest += '#EXTM3U\n';
// manifest += `#EXT-X-VERSION:6\n`;
// manifest += `#EXT-X-MEDIA-SEQUENCE:0\n`;
// manifest += `#EXT-X-KEY:METHOD=AES-128,URI="https://content-auso1.uplynk.com/check2?b=f3e9d85f5b0f49f490f92a5321ac762b&v=f3e9d85f5b0f49f490f92a5321ac762b&r=e&pbs=",IV=0x00000000000000000000000000000153,KEYFORMAT="identity",KEYFORMATVERSIONS="1"\n`;
// manifest += `#EXTINF:4.096,\n`
// manifest += `https://x-default-stgec.uplynk.com/zusw2/slices/f3e/23600a62fa3a4296b881199afd1b0414/f3e9d85f5b0f49f490f92a5321ac762b/E00000153.ts?x=0&si=0\n`
// manifest += `#EXT-X-ENDLIST\n`;

// let manifest = `#EXTM3U
// #EXT-X-VERSION:6
// #EXT-X-MEDIA-SEQUENCE:0
// #EXT-X-KEY:METHOD=AES-128,URI="https://content-ause1-up-1.uplynk.com/check2?b=2b154776285e4c37b22b6f724782db41&v=2b154776285e4c37b22b6f724782db41&r=e&pbs=",IV=0x000000000000000000000000000005DE
// #EXTINF:4.096,
// https://x-default-stgec.uplynk.com/ausc/slices/2b1/23600a62fa3a4296b881199afd1b0414/2b154776285e4c37b22b6f724782db41/E000005DE.ts?x=0&si=0
// #EXT-X-ENDLIST`

let manifest = 
`#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:6
#EXT-X-START:TIME-OFFSET=0
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:EVENT
#EXT-X-KEY:METHOD=AES-128,URI="https://test-streams.mux.dev/dai-discontinuity-deltatre/key1.json?f=1041&s=0&p=1822767&m=1506045858",IV=0x000000000000000000000000001BD02F
#EXTINF:10.0000,
https://test-streams.mux.dev/dai-discontinuity-deltatre/1041_6_1822767.ts?m=1506045858`
manifest += `#EXT-X-ENDLIST\n`

const logPipe = new PassThrough();
const contentPipe = new PassThrough();

console.time("decrypt")

const p = spawn("ffmpeg", options(10), { detached: false });

p.stdin.write(manifest);
p.stdin.end();

p.stderr.pipe(logPipe);
// p.stdout.pipe(contentPipe);
p.stdout.pipe(createWriteStream("/tmp/stream/output.ts"))

contentPipe.on("data", (data) => {
  console.log(data);
})

logPipe.on("data", (data) => {
  console.log(data.toString());
})

contentPipe.on("close", () => {
  console.log('done');
  console.timeEnd("decrypt")
})

p.on('exit', () => {
  console.log("exited")
})