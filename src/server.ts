import { createServer } from 'http';
import express from 'express';
import websocket from "websocket"
import {readFileSync, writeFileSync} from "fs";
import {join} from "path";
import cors from "cors";
import { Parser } from "m3u8-parser";
import {ParsedManifest} from "./types/parser"

const app = express();
const parser = new Parser();

const manifest = readFileSync(`${__dirname}/stream/s.m3u8`);
parser.push(manifest.toString());
parser.end();
const parsed = parser.manifest as ParsedManifest;
console.log(parsed);

app.use(express.json());
app.use(cors());
app.use(express.static(join(__dirname, 'stream')))

const httpServer = createServer(app);



const wsServer = new websocket.server({ httpServer });
wsServer.on('request', (req) => {
  const blobs: BlobData[] = [];
  
  console.log("connected");
  const conn = req.accept(null, req.origin);

  for (let segment of parsed.segments) {
    const segmentBytes = readFileSync(`${__dirname}/stream/${segment.uri}`);
    conn.send(JSON.stringify({ uri: segment.uri, bytes: segmentBytes }));
  }

  conn.on("message", (message) => {
    if (message.type === "utf8") {
      const { url, uri } = JSON.parse(message.utf8Data);
      console.log(`${uri} is hosted on ${url}`);
      blobs.push({uri, url});
      if (blobs.length === parsed.segments.length) {
        writeManifest(blobs);
      }
    }
  })
});


const writeManifest = (blobs: BlobData[]) => {
  let content = '';
  content += '#EXTM3U\n';
  content += '#EXT-X-VERSION:3\n';
  content += '#EXT-X-ALLOW-CACHE:NO\n';
  content += '#EXT-X-TARGETDURATION:5\n';
  content += '#EXT-X-MEDIA-SEQUENCE:0\n';

  for (let segment of parsed.segments) {
    const blobUrl =  blobs.find((b) => b.uri === segment.uri);
    if (blobUrl) {
      content += `#EXTINF:${segment.duration},\n`;
      content += `${blobUrl.url}\n`;
    }
  }

  console.log("written manifest!")
  writeFileSync(`${__dirname}/stream/output.m3u8`, content);
}

httpServer.listen(8080, () => console.log('listening on 8080'));

interface BlobData {
  url: string;
  uri: string;
}