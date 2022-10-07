import { useEffect, useRef, useState } from "react";
import {WebsocketService} from "./service"

const socketUrl = 'ws://localhost:8080';
const manifestUrl = 'http://localhost:8080/output.m3u8';

function App() {
  const playerRef = useRef<HTMLVideoElement>(null);

  const [service, setService] = useState<WebsocketService|null>(null);

  useEffect(() => {
    if (playerRef.current) {
      setService(new WebsocketService(socketUrl, manifestUrl, playerRef.current));
    }
  }, [playerRef]);


  return (
    <div style={{display: "flex", flexDirection: "column"}}>
      <button onClick={service?.playAction} style={{width: 100}}>Start</button>
      <video ref={playerRef} autoPlay playsInline muted style={{width: 720, height: 480, border: "1px solid gray"}} />
    </div>
  );
}

export default App;
