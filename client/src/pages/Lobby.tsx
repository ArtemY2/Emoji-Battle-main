import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SocketManager from '../utils/SocketManager';

const Lobby: React.FC = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [players, setPlayers] = useState<string[]>([]);
    const socketManager = SocketManager.getInstance();

    useEffect(() => {
        if (!roomId) return;

        const socket = socketManager.getSocket();
        socket.emit('joinRoom', roomId);

        socket.on('updateLobby', (userList: string[]) => {
            setPlayers(userList);
        });

        socket.on('goToGame', () => {
            console.log('👉 goToGame received');
            navigate(`/game/${roomId}`);
        });

        return () => {
            socket.off('updateLobby');
            socket.off('goToGame');
        };
    }, [roomId]);

    const handleStart = () => {
        const socket = socketManager.getSocket();
        socket.emit('startGame', roomId);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-6">
            <h1 className="text-3xl font-bold">🎮 게임 대기실</h1>
            <p className="text-gray-600">Room ID: {roomId}</p>

            <div className="bg-white p-4 rounded shadow w-full max-w-md">
                <h2 className="font-semibold mb-2">👥 참가자 목록</h2>
                {players.length === 0 ? (
                    <p className="text-sm text-gray-400">아직 아무도 없습니다...</p>
                ) : (
                    <ul className="text-sm space-y-1">
                        {players.map((id) => (
                            <li key={id}>• {id}</li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                onClick={handleStart}
                className="bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
            >
                🚀 게임 시작
            </button>
        </div>
    );
};

export default Lobby;