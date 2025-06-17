// ✅ Game.tsx — исправленная версия без ошибок
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SocketManager from '../utils/SocketManager';

interface GuessLog {
    name: string;
    message: string;
}

const Game: React.FC = () => {
    const { roomId } = useParams<{ roomId?: string }>();
    const navigate = useNavigate();
    const socketManager = SocketManager.getInstance();

    console.log('🎮 *** Game компонент монтируется ***');
    console.log('📍 roomId из URL:', roomId);
    console.log('🌐 Текущий URL:', window.location.href);

    const [emoji, setEmoji] = useState<string>('❓');
    const [guess, setGuess] = useState('');
    const [scores, setScores] = useState<{ [socketId: string]: number }>({});
    const [message, setMessage] = useState('게임 준비 중...');
    const [roundEnded, setRoundEnded] = useState(false);
    const [guesses, setGuesses] = useState<GuessLog[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);

    useEffect(() => {
        if (!roomId) {
            navigate('/');
            return;
        }

        const socket = socketManager.getSocket();
        console.log('🎮 게임 시작:', roomId);

        // 자동으로 첫 라운드 시작
        const startTimer = setTimeout(() => {
            socket.emit('startRound', roomId);
        }, 1000);

        // 라운드 타이머
        let roundTimer: NodeJS.Timeout;

        // 이벤트 핸들러들
        const handleRoundStart = ({ emoji }: { emoji: string }) => {
            console.log('🎯 라운드 시작:', emoji);
            setEmoji(emoji);
            setRoundEnded(false);
            setMessage('이모지를 맞춰보세요!');
            setGuesses([]);
            setGameStarted(true);
            setCurrentRound(prev => prev + 1);
            setTimeLeft(20);

            // 20초 카운트다운
            roundTimer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(roundTimer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        const handleCorrectGuess = ({ socketId, playerName }: { socketId: string, playerName?: string }) => {
            const isMe = socket.id === socketId;
            setMessage(isMe ? '🎉 정답! 축하합니다!' : `✨ ${playerName || '다른 플레이어'}가 맞췄어요!`);
            setRoundEnded(true);
            clearInterval(roundTimer);
        };

        const handleRoundEnd = ({ correct }: { correct: string, scores?: { [key: string]: number } }) => {
            setMessage(`정답: "${correct}"`);
            setRoundEnded(true);
            if (scores) {
                setScores(scores);
            }
            clearInterval(roundTimer);
        };

        const handleNewGuess = ({ name, message }: { name: string, message: string }) => {
            setGuesses(prev => [...prev.slice(-10), { name, message }]);
        };

        const handleNextRound = () => {
            console.log('➡️ 다음 라운드...');
            setMessage('다음 라운드 준비 중...');
            setEmoji('❓');
            setGuesses([]);
            setRoundEnded(false);
            setTimeout(() => {
                socket.emit('startRound', roomId);
            }, 1000);
        };

        const handleGameOver = ({ scores, players }: {
            scores: { [key: string]: number },
            players?: { [key: string]: { name: string; avatar?: string } }
        }) => {
            console.log('🏁 게임 종료');
            console.log('📊 Финальные результаты:', scores);
            console.log('👥 Информация об игроках:', players);

            // Сохраняем результаты в localStorage для Results компонента
            const gameData = { scores, players };
            localStorage.setItem(`gameResults_${roomId}`, JSON.stringify(gameData));

            setMessage('🏆 게임 종료!');
            clearInterval(roundTimer);
            setTimeout(() => {
                navigate(`/results/${roomId}`);
            }, 3000);
        };

        // 이벤트 리스너 등록
        socket.on('roundStart', handleRoundStart);
        socket.on('correctGuess', handleCorrectGuess);
        socket.on('roundEnd', handleRoundEnd);
        socket.on('newGuess', handleNewGuess);
        socket.on('nextRound', handleNextRound);
        socket.on('gameOver', handleGameOver);

        return () => {
            clearTimeout(startTimer);
            clearInterval(roundTimer);
            socket.off('roundStart', handleRoundStart);
            socket.off('correctGuess', handleCorrectGuess);
            socket.off('roundEnd', handleRoundEnd);
            socket.off('newGuess', handleNewGuess);
            socket.off('nextRound', handleNextRound);
            socket.off('gameOver', handleGameOver);
        };
    }, [roomId, navigate]);

    const handleSubmit = () => {
        if (!roomId || !guess.trim() || roundEnded) return;

        const socket = socketManager.getSocket();
        socket.emit('sendGuess', { roomId, message: guess });
        setGuess('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100 p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">🎮 이모지 배틀</h1>

            {/* 게임 정보 */}
            <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm text-gray-600">
                    라운드 {currentRound}/3 | 남은 시간: {timeLeft}초
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    방: {roomId}
                </div>
            </div>

            {/* 메인 게임 영역 */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6 max-w-lg w-full">
                <div className="text-9xl mb-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200">
                    {emoji}
                </div>

                <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={roundEnded || !gameStarted}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-purple-500 text-lg disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder={gameStarted ? "답을 입력하세요..." : "게임 시작 대기 중..."}
                />

                <button
                    onClick={handleSubmit}
                    disabled={roundEnded || !guess.trim() || !gameStarted}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-all duration-200"
                >
                    {roundEnded ? '라운드 종료' : '제출하기'}
                </button>

                {/* 상태 메시지 */}
                {message && (
                    <div className={`rounded-lg p-4 border-2 ${
                        message.includes('정답') || message.includes('축하')
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : message.includes('맞췄어요')
                                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                        <p className="font-semibold">{message}</p>
                    </div>
                )}
            </div>

            <div className="flex gap-4 w-full max-w-4xl">
                {/* 점수판 */}
                <div className="flex-1 bg-white shadow-lg rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-3 text-center">📊 점수판</h2>
                    {Object.keys(scores).length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">점수 집계 중...</p>
                    ) : (
                        <ul className="space-y-2">
                            {Object.entries(scores)
                                .sort(([,a], [,b]) => b - a)
                                .map(([id, score], index) => {
                                    const socket = socketManager.getSocket();
                                    const isMe = id === socket.id;
                                    return (
                                        <li key={id} className={`flex justify-between items-center p-3 rounded-lg ${
                                            index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' :
                                                isMe ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'
                                        }`}>
                                            <span className="font-medium flex items-center">
                                                {index === 0 && '👑 '}
                                                {isMe ? '🧍 나' : `👤 플레이어`}
                                            </span>
                                            <span className="font-bold text-purple-600 text-lg">{score}점</span>
                                        </li>
                                    );
                                })}
                        </ul>
                    )}
                </div>

                {/* 채팅 */}
                <div className="flex-1 bg-white shadow-lg rounded-xl p-4">
                    <h2 className="text-xl font-bold mb-3 text-center">💬 채팅</h2>
                    <div className="h-48 overflow-y-auto space-y-1 bg-gray-50 rounded-lg p-3">
                        {guesses.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">아직 메시지가 없어요</p>
                        ) : (
                            guesses.map((g, i) => (
                                <div key={i} className="text-sm p-2 bg-white rounded border">
                                    <span className="font-semibold text-purple-600">{g.name}:</span>
                                    <span className="ml-2">{g.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 로딩 상태 */}
            {!gameStarted && (
                <div className="text-center text-gray-600 bg-white rounded-lg p-4 shadow-sm">
                    <div className="animate-pulse flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <span className="ml-2">게임 시작 중...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;