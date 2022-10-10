import Hls from "hls.js";

export class WebsocketService {
  private readonly player: HTMLVideoElement;

  private readonly websocket: WebSocket;

  private readonly manifestUrl: string;
  
  constructor(url: string, manifestUrl: string, player: HTMLVideoElement) {
    this.player = player;
    this.websocket = new WebSocket(url);
    this.manifestUrl = manifestUrl;

    this.websocket.onopen = () => {
      console.log("opened");
    }
    
    this.websocket.binaryType = "arraybuffer";
    
    this.websocket.onmessage = (message) => {
      console.log(message.data);
      const uint8array = new Uint8Array(message.data);

      const meta = uint8array.slice(0, 19);
      const segment = uint8array.slice(19);

      this.parseMeta(meta);

      // const data = JSON.parse(message.data);
      // this.onSegment(segment)
    }
  }

  private parseMeta = (meta: Uint8Array) => {
    const startFlagBytes = meta.slice(0, 5);
    const nameBytes = meta.slice(5, 15);
    const lengthBytes = meta.slice(15);

    const decoder = new TextDecoder();
    
    const startFlag = decoder.decode(startFlagBytes);
    const name = decoder.decode(nameBytes);
    const length = decoder.decode(lengthBytes);

    console.log(`[Decoded] is START: ${startFlag}. Name: ${name}. Length: ${length}`);

  }

  private initHls = () => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.attachMedia(this.player);

      hls.loadSource(this.manifestUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.player.play();
      });
    } else if (this.player.canPlayType('application/vnd.apple.mpegurl')) {
      this.player.src = this.manifestUrl;

      this.player.addEventListener('loadedmetadata', () => {
        this.player.play();
      });
    }
  }

  private toArrayBuffer = (buf: Buffer): ArrayBuffer => {
    const ab = new ArrayBuffer(buf.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buf.length; ++i) {
        view[i] = buf[i];
    }
    return ab;
}

  private onSegment = async (chunk: ArrayBuffer) => {
    // console.log(chunk);
    // const buffer = this.toArrayBuffer(chunk);
    // console.log(`Got ${uri}: `, chunk);
    const blob = new Blob([chunk]);
    const url = URL.createObjectURL(blob);
    this.downloadURL(url, 'test.ts')
    // this.websocket.send(JSON.stringify({uri, url}));
  }

  public playAction = () => {
    this.initHls();
  }

  private downloadURL = (url: string, fileName: string): void => {
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    // @ts-ignore
    a.style = "display: none";
    a.click();
    a.remove();
  };
}