import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { getProfile } from '../graphql/queries';
import { createProfile, updateProfile } from '../graphql/mutations';
import type { ExtendedProfile } from '../types/ExtendedProfile';
import SocketManager from '../utils/SocketManager';

const client = generateClient();

function getRandomGuestName() {
    const emojis = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐯', '🐰', '🐨'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    return `게스트 ${emoji}`;
}

const QuickJoin: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthenticator((context) => [context.user]);
    const [roomId, setRoomId] = useState('');
    const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'joining' | 'waiting'>('connecting');
    const [mySocketId, setMySocketId] = useState('');
    const [countdown, setCountdown] = useState(0);
    const hasJoinedRef = useRef(false);
    const socketManager = SocketManager.getInstance();

    useEffect(() => {
        // Очистка при размонтировании компонента
        return () => {
            console.log('🧹 QuickJoin размонтируется, очистка...');
            // НЕ отключаем сокет полностью, так как он нужен для Game
            // socketManager.disconnect();
        };
    }, []);

    useEffect(() => {
        // Отладка аутентификации
        console.log('👤 Текущий пользователь:', user?.userId || 'Гость');
        console.log('🔑 Аутентифицирован:', !!user?.userId);

        // Предотвращаем повторные подключения
        if (hasJoinedRef.current) return;

        const socket = socketManager.getSocket();
        setMySocketId(socket.id || '');

        const fetchNameAndJoin = async () => {
            if (hasJoinedRef.current) return;

            try {
                let playerName = '';

                if (!user?.userId) {
                    playerName = getRandomGuestName();
                } else {
                    try {
                        console.log('👤 Загрузка профиля пользователя из БД...');

                        // Пытаемся получить существующий профиль
                        const result = await client.graphql({
                            query: getProfile,
                            variables: { id: user.userId },
                            authMode: 'userPool'
                        });

                        let profile = result?.data?.getProfile as ExtendedProfile | null;

                        // Если профиля нет, создаем новый с полными данными
                        if (!profile) {
                            console.log('📝 Создание нового профиля...');
                            const randomEmoji = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐯', '🐰', '🐨'][Math.floor(Math.random() * 8)];

                            const newProfileResponse = await client.graphql({
                                query: createProfile,
                                variables: {
                                    input: {
                                        id: user.userId,
                                        username: user.username || `플레이어_${Math.floor(Math.random() * 1000)}`,
                                        emoji: randomEmoji,
                                        // Пока не добавляем новые поля, так как типы еще не обновились
                                    }
                                },
                                authMode: 'userPool'
                            });

                            profile = newProfileResponse.data?.createProfile as ExtendedProfile;
                            console.log('✅ Новый профиль создан:', profile);

                            // Попытаемся обновить профиль с игровыми полями
                            if (profile) {
                                try {
                                    const updateResponse = await client.graphql({
                                        query: updateProfile,
                                        variables: {
                                            input: {
                                                id: profile.id,
                                                username: profile.username,
                                                emoji: profile.emoji,
                                                // Временно отключаем новые поля до генерации типов
                                                // totalGamesPlayed: 0,
                                                // totalScore: 0,
                                                // bestScore: 0,
                                                // averageScore: 0.0
                                            }
                                        },
                                        authMode: 'userPool'
                                    });
                                    profile = updateResponse.data?.updateProfile as ExtendedProfile;
                                    console.log('✅ Профиль инициализирован с игровыми полями:', profile);
                                } catch (updateError) {
                                    console.log('⚠️ Не удалось добавить игровые поля, но базовый профиль создан');
                                }
                            }
                        } else {
                            console.log('✅ Профиль найден:', profile);

                            // Проверяем старый профиль (но не обновляем, так как схема может не поддерживать)
                            console.log('✅ Существующий профиль найден:', profile);
                            // Убираем обновление старого профиля, так как может вызвать ошибки
                        }

                        playerName = profile?.username || user.username || `플레이어_${Math.floor(Math.random() * 1000)}`;

                    } catch (err) {
                        console.error('❌ Ошибка работы с профилем:', err);
                        // Fallback к username или случайному имени
                        playerName = user.username || `플레이어_${Math.floor(Math.random() * 1000)}`;
                    }
                }

                console.log('🎯 참가:', playerName);
                setConnectionStatus('joining');
                socket.emit('quickJoin', { name: playerName });
                hasJoinedRef.current = true;

            } catch (error) {
                console.error('참가 실패');
                setConnectionStatus('connecting');
            }
        };

        // 소켓 이벤트 핸들러
        const handleConnect = () => {
            console.log('✅ 연결 완료');
            setMySocketId(socket.id || '');
            setConnectionStatus('connected');
            setTimeout(fetchNameAndJoin, 300);
        };

        const handleJoinedRoom = (roomId: string) => {
            console.log('🏠 방 참가:', roomId);
            setRoomId(roomId);
            setConnectionStatus('waiting');

            // Запускаем обратный отсчет
            setCountdown(5);
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        console.log('⏰ Принудительный переход к игре через таймер');
                        navigate(`/game/${roomId}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        const handleUpdateLobby = (playerList: { id: string; name: string }[]) => {
            console.log('👥 플레이어 업데이트:', playerList.length, '명');
            setPlayers(playerList);
        };

        const handleGoToGame = (gameRoomId: string) => {
            console.log('🎮 *** ПОЛУЧЕНО СОБЫТИЕ goToGame ***');
            console.log('🚀 Комната для перехода:', gameRoomId);
            console.log('🔍 Текущий URL:', window.location.href);
            console.log('📍 Переходим на:', `/game/${gameRoomId}`);

            // Останавливаем обратный отсчет если он идет
            setCountdown(0);

            try {
                console.log('🚀 Выполняем navigate...');
                navigate(`/game/${gameRoomId}`);
                console.log('✅ navigate() выполнен успешно');

                // Проверяем, изменился ли URL через 500мс
                setTimeout(() => {
                    console.log('🔍 URL через 500мс:', window.location.href);
                    if (!window.location.href.includes('/game/')) {
                        console.log('❌ URL не изменился, пробуем window.location');
                        window.location.href = `/game/${gameRoomId}`;
                    }
                }, 500);

            } catch (error) {
                console.error('❌ Ошибка при navigate():', error);
                // Альтернативный способ - через window.location
                console.log('🔄 Пробуем через window.location...');
                window.location.href = `/game/${gameRoomId}`;
            }
        };

        const handleDisconnect = () => {
            setConnectionStatus('connecting');
        };

        // 이벤트 리스너 등록
        socket.on('connect', handleConnect);
        socket.on('joinedRoom', handleJoinedRoom);
        socket.on('updateLobby', handleUpdateLobby);
        socket.on('goToGame', handleGoToGame);
        socket.on('disconnect', handleDisconnect);

        // Отладка событий сокета (SocketManager уже логирует все события)
        // socket.onAny((eventName, ...args) => {
        //     console.log(`📡 Получено событие: ${eventName}`, args);
        // });

        // Отладка событий сокета
        socket.onAny((eventName, ...args) => {
            console.log(`📡 Получено событие: ${eventName}`, args);
        });

        // 이미 연결되어 있으면 바로 참가 시도
        if (socket.connected) {
            handleConnect();
        }

        return () => {
            console.log('🧹 Очистка QuickJoin...');
            // socket.offAny(); // Убираем так как SocketManager управляет событиями
            socket.off('connect', handleConnect);
            socket.off('joinedRoom', handleJoinedRoom);
            socket.off('updateLobby', handleUpdateLobby);
            socket.off('goToGame', handleGoToGame);
            socket.off('disconnect', handleDisconnect);
        };
    }, [user?.userId, navigate]);

    const getStatusMessage = () => {
        switch (connectionStatus) {
            case 'connecting': return '🔄 연결 중...';
            case 'connected': return '✅ 연결됨';
            case 'joining': return '🎯 참가 중...';
            case 'waiting': return '⏳ 게임 시작 대기...';
            default: return '❓ 알 수 없음';
        }
    };

    const getStatusColor = () => {
        switch (connectionStatus) {
            case 'connecting': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'connected': return 'text-green-600 bg-green-50 border-green-200';
            case 'joining': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'waiting': return 'text-purple-600 bg-purple-50 border-purple-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-purple-100 to-blue-100">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">🎯 매치메이킹</h1>

                <div className="space-y-4">
                    {/* 연결 상태 */}
                    <div className={`border-2 rounded-lg p-4 ${getStatusColor()}`}>
                        <p className="text-sm font-medium mb-1">연결 상태</p>
                        <p className="font-bold text-lg">{getStatusMessage()}</p>
                        {connectionStatus === 'connecting' && (
                            <div className="flex justify-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            </div>
                        )}
                    </div>

                    {/* 방 정보 */}
                    {roomId && (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-purple-600 font-medium mb-1">방 번호</p>
                            <p className="font-mono text-lg font-bold text-purple-800">{roomId}</p>
                        </div>
                    )}

                    {/* 참가자 목록 */}
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h2 className="font-bold mb-3 text-green-800 text-lg">
                            👥 참가자 ({players.length}/5)
                        </h2>

                        {players.length === 0 ? (
                            <div className="text-sm text-green-600 py-4 space-y-2">
                                <div>아직 아무도 없어요...</div>
                                {connectionStatus === 'waiting' && (
                                    <div className="animate-pulse">플레이어를 기다리는 중...</div>
                                )}
                            </div>
                        ) : (
                            <ul className="space-y-2">
                                {players.map((p, index) => (
                                    <li key={p.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                                        <span className="font-medium text-gray-700">
                                            {index + 1}. {p.name}
                                        </span>
                                        {p.id === mySocketId && (
                                            <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-bold">
                                                나
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* 하단 정보 */}
                    <div className="text-xs text-gray-500 space-y-2 bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>개발 모드: 1명이어도 게임 시작</span>
                        </div>
                        {connectionStatus === 'waiting' && players.length >= 1 && (
                            <div className="space-y-2">
                                <div className="text-green-600 font-semibold text-sm">
                                    🎮 게임 시작까지: {countdown}초
                                </div>
                                <button
                                    onClick={() => roomId && navigate(`/game/${roomId}`)}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                                >
                                    지금 시작하기
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickJoin;