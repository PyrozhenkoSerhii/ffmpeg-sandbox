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
      const data = JSON.parse(message.data);
      this.onMessage(data.uri, data.bytes.data)
    }
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

  private onMessage = async (uri: string, chunk: Buffer) => {
    const buffer = this.toArrayBuffer(chunk);
    console.log(`Got ${uri}: `, buffer);
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    // this.downloadURL(url, uri)
    this.websocket.send(JSON.stringify({uri, url}));
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