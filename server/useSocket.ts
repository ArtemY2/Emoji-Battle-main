import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (roomId: string) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🟢 Socket connected:', socket.id);
            socket.emit('joinRoom', roomId);
        });

        return () => {
            socket.disconnect();
            console.log('🔴 Socket disconnected');
        };
    }, [roomId]);

    const sendGuess = (message: string) => {
        if (socketRef.current) {
            socketRef.current.emit('sendGuess', {
                roomId,
                message,
            });
        }
    };

    return { sendGuess };
};
