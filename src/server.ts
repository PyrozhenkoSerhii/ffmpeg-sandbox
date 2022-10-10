import { createServer } from 'http';
import express from 'express';
import websocket from "websocket"
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import cors from "cors";
import { Parser } from "m3u8-parser";

import {ParsedManifest} from "./types/parser"
import { ISegment } from './types/segment';

const parser = new Parser();
const manifest = readFileSync(`${__dirname}/stream/s.m3u8`);
parser.push(manifest.toString());
parser.end();
const parsed: ParsedManifest = parser.manifest;

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(join(__dirname, 'stream')))

const httpServer = createServer(app);

const str = "START0.ts0000000101";

const metaTest = Buffer.from(str, "utf-8");
console.log(metaTest);

const wsServer = new websocket.server({ httpServer });
wsServer.on('request', (req) => {
  const segments: ISegment[] = parsed.segments.map((s) => ({uri: s.uri, duration: s.duration}));
  console.log("Client connected. Found segments in input manifest: \n", segments);
  
  const conn = req.accept(null, req.origin);

  for (let segment of parsed.segments) {
    const segmentBytes = readFileSync(`${__dirname}/stream/${segment.uri}`);
    const newBuffer = Buffer.concat([metaTest, segmentBytes]);
    conn.sendBytes(newBuffer);
  }

  conn.on("message", (message) => {
    if (message.type === "utf8") {
      const { url, uri } = JSON.parse(message.utf8Data);
      console.log(`${uri} is hosted on ${url}`);

      const targetSegment = segments.find((s) => s.uri === uri);
      if (targetSegment) {
        targetSegment.url = url;
      }

      writeManifest(segments);
    }
  })
});


const writeManifest = (segments: ISegment[]) => {
  let content = '';
  content += '#EXTM3U\n';
  content += '#EXT-X-VERSION:6\n';
  content += '#EXT-X-ALLOW-CACHE:NO\n';
  content += '#EXT-X-TARGETDURATION:5\n';
  content += '#EXT-X-MEDIA-SEQUENCE:0\n';

  let segmentsAvailable = 0;
  for (let segment of segments) {
    if (!segment.url) break;

    content += `#EXTINF:${segment.duration},\n`;
    content += `${segment.url}\n`;

    segmentsAvailable++;
  }

  console.log(`Updated output manifest. Available ${segmentsAvailable} segments`);
  
  writeFileSync(`${__dirname}/stream/output.m3u8`, content);
}

httpServer.listen(8080, () => console.log('listening on 8080'));
