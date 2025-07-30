import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.NEXT_PUBLIC_SOCKET_URL || "https://consumer-ai-render.onrender.com");

export default socket;
