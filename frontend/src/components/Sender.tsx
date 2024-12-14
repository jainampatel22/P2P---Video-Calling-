import { useEffect, useState } from "react";

export function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8080");
        socket.onopen = () => {
            socket.send(JSON.stringify({ type: "sender" }));
        };
        setSocket(socket);

        return () => socket.close(); // Cleanup WebSocket
    }, []);

    async function startVideo() {
        if (!socket) return;

        const pc = new RTCPeerConnection();

        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      pc.addTrack(stream.getVideoTracks()[0])

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.send(JSON.stringify({ type: "createOffer", sdp: offer }));
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "iceCandidate", candidate: event.candidate }));
            }
        };

        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "createAnswer") {
                await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (data.type === "iceCandidate") {
                await pc.addIceCandidate(data.candidate);
            } else if(data.type==="mouseEvent"){
               const event = new MouseEvent('click',{
                clientX:data.x,
                clientY:data.y
            })
            document.dispatchEvent(event)
            }
        };
    }

    return <button onClick={startVideo}> Start Video now </button>;
}
