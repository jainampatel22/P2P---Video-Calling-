import { useEffect, useState, useRef } from "react";

export function Receiver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPc] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
const toggleFullScreen =()=>{
if(videoRef.current){
    if(!document.fullscreenElement){
        videoRef.current.requestFullscreen()
    }
    else{
        document.exitFullscreen
    }
}
}
    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();

        setSocket(socket);
        setPc(pc);

        // Handle ICE candidate events
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        // Handle receiving tracks
        pc.ontrack = (event) => {
            if (videoRef.current) {
                let stream = videoRef.current.srcObject as MediaStream;

                // If there's no existing stream, create a new one
                if (!stream) {
                    stream = new MediaStream();
                    videoRef.current.srcObject = stream;
                }

                // Add the incoming track to the existing or new stream
                stream.addTrack(event.track);

                // Ensure video plays when track is added
                videoRef.current.play();
                
                console.log("Track received and added:", event.track);
            }
        };

        // WebSocket setup
        socket.onopen = () => {
            console.log("Socket connection established");
            socket.send(JSON.stringify({ type: "receiver" }));
        };

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            console.log("Received message:", message);

            if (message.type === "createOffer") {
                console.log("Setting remote SDP...");
                await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
                const answer = await pc.createAnswer();
                console.log("Created answer:", answer);
                await pc.setLocalDescription(answer);

                socket.send(JSON.stringify({ type: "createAnswer", sdp: pc.localDescription }));
            } else if (message.type === "iceCandidate") {
                if (message.candidate) {
                    console.log("Adding ICE candidate...");
                    await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
            }
        };

        // Cleanup function
        return () => {
            if (pc) pc.close();
            if (socket) socket.close();
        };
    }, []); // Run effect only once on component mount
const mouseEvents=(e: React.MouseEvent<HTMLDivElement>)=>{
if(!socket){
    return
}
socket.send(JSON.stringify({
    type:"mouseEvents",x:e.clientX,y:e.clientY
}))
}
    return (
        <div>
            <h2>Receiver</h2>
            <div  onMouseMove={mouseEvents}>
                
       
            <video 
                ref={videoRef}
                style={{
                    width: "480px",
                    height: "210px",
                 
                    borderRadius: "8px",
            
                }}
                autoPlay
                muted 
            
                onClick={toggleFullScreen}
            ></video>         
            </div>
            
        </div>
    );
}
