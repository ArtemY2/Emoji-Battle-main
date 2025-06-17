// ✅ Results.tsx — исправленная версия с реальными данными
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { getProfile } from '../graphql/queries';
import { updateProfile } from '../graphql/mutations';
import type { ExtendedProfile } from '../types/ExtendedProfile';
import SocketManager from '../utils/SocketManager';

const client = generateClient();

interface Player {
    id: string;
    username: string;
    avatar: string;
    score: number;
    position: number;
    correctAnswers: number;
    isCurrentUser?: boolean;
}

interface ProfileData {
    id: string;
    username: string;
    emoji: string;
    totalGamesPlayed?: number;
    totalScore?: number;
    bestScore?: number;
    averageScore?: number;
}

const Results: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthenticator((context) => [context.user]);
    const socketManager = SocketManager.getInstance();

    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [myProfile, setMyProfile] = useState<ExtendedProfile | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Получаем аватар из имени гостя
    const extractAvatarFromGuestName = (name: string): string => {
        const emojiMatch = name.match(/[🐶🐱🦊🐻🐼🐯🐰🐨]/);
        return emojiMatch ? emojiMatch[0] : '👤';
    };

    // Загрузка результатов игры
    useEffect(() => {
        const loadGameResults = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('🎮 Загрузка результатов игры для:', gameId);

                // Сначала загружаем профиль пользователя
                if (user?.userId) {
                    try {
                        console.log('👤 Загрузка профиля пользователя...');
                        const profileResponse = await client.graphql({
                            query: getProfile,
                            variables: { id: user.userId },
                            authMode: 'apiKey' // ИСПРАВЛЕНО: изменено с 'userPool' на 'apiKey'
                        });
                        const userProfile = profileResponse.data?.getProfile as ExtendedProfile | null;
                        setMyProfile(userProfile);
                        console.log('✅ Профиль пользователя загружен:', userProfile);
                    } catch (profileError) {
                        console.error('⚠️ Ошибка загрузки профиля:', profileError);
                        // Продолжаем без профиля
                    }
                }

                // Получаем данные из localStorage
                const savedResults = localStorage.getItem(`gameResults_${gameId}`);
                if (savedResults) {
                    try {
                        const gameData = JSON.parse(savedResults);
                        console.log('📊 Найдены сохраненные результаты игры:', gameData);

                        // Проверяем что данные корректные
                        if (gameData.scores && typeof gameData.scores === 'object') {
                            await processGameResults(gameData.scores, gameData.players);
                            return;
                        } else {
                            console.log('⚠️ Некорректные данные в localStorage');
                        }
                    } catch (parseError) {
                        console.error('❌ Ошибка парсинга данных из localStorage:', parseError);
                    }
                }

                // Если нет сохраненных результатов, показываем ошибку
                console.log('❌ Результаты игры не найдены');
                setError('Результаты игры не найдены. Возможно игра не была завершена корректно.');

                // Создаем демо-данные с реалистичными результатами
                const demoResults: Player[] = [
                    {
                        id: 'demo1',
                        username: '게임 완료!',
                        avatar: '🎉',
                        score: 3,
                        position: 1,
                        correctAnswers: 3,
                        isCurrentUser: true
                    }
                ];
                setPlayers(demoResults);

            } catch (error) {
                console.error('❌ Ошибка загрузки результатов:', error);
                setError('Ошибка загрузки результатов игры');

                // Показываем хотя бы базовые результаты
                const fallbackResults: Player[] = [
                    {
                        id: 'error1',
                        username: 'Ошибка загрузки',
                        avatar: '⚠️',
                        score: 0,
                        position: 1,
                        correctAnswers: 0
                    }
                ];
                setPlayers(fallbackResults);
            } finally {
                setLoading(false);
            }
        };

        if (gameId) {
            // Небольшая задержка для завершения сохранения данных из Game компонента
            setTimeout(loadGameResults, 500);
        }
    }, [gameId, user?.userId]);

    // Обработка результатов игры
    const processGameResults = async (
        scores: { [socketId: string]: number },
        playersInfo?: { [socketId: string]: { name: string; avatar?: string } }
    ) => {
        try {
            const socket = socketManager.getSocket();
            const mySocketId = socket.id;

            console.log('🎮 Обработка результатов:');
            console.log('📊 Очки:', scores);
            console.log('👥 Игроки:', playersInfo);

            // Проверяем что данные не пустые
            if (!scores || Object.keys(scores).length === 0) {
                console.log('⚠️ Пустые данные очков');
                throw new Error('Данные игры отсутствуют');
            }

            // Конвертируем результаты в формат Player
            const gameResults: Player[] = Object.entries(scores)
                .map(([socketId, score]) => {
                    const isMe = socketId === mySocketId;
                    const playerInfo = playersInfo?.[socketId];

                    let username: string;
                    let avatar: string;

                    if (isMe && myProfile) {
                        // Для авторизованного пользователя - используем данные из профиля
                        username = myProfile.username || user?.username || playerInfo?.name || '나';
                        avatar = myProfile.emoji || playerInfo?.avatar || extractAvatarFromGuestName(playerInfo?.name || '') || '😎';
                    } else if (isMe) {
                        // Для неавторизованного текущего пользователя
                        username = user?.username || playerInfo?.name || '나';
                        avatar = playerInfo?.avatar || extractAvatarFromGuestName(playerInfo?.name || '') || '😎';
                    } else {
                        // Для других игроков - используем их реальные данные
                        username = playerInfo?.name || `플레이어${socketId.slice(-4)}`;
                        avatar = playerInfo?.avatar || extractAvatarFromGuestName(playerInfo?.name || '') || '👤';
                    }

                    return {
                        id: socketId,
                        username: username,
                        avatar: avatar,
                        score: score,
                        correctAnswers: score, // В нашей игре балл = правильный ответ
                        position: 0, // Будет установлено после сортировки
                        isCurrentUser: isMe
                    };
                })
                .sort((a, b) => b.score - a.score) // Сортируем по убыванию
                .map((player, index) => ({ ...player, position: index + 1 })); // Устанавливаем позицию

            console.log('🏆 Финальные результаты для отображения:', gameResults);
            setPlayers(gameResults);

            // Сохраняем результат в БД для авторизованного пользователя
            if (user?.userId) {
                const userResult = gameResults.find(p => p.isCurrentUser);
                if (userResult) {
                    await saveUserGameResult(userResult);
                }
            }

        } catch (error) {
            console.error('❌ Ошибка обработки результатов:', error);
            setError('Ошибка обработки результатов');
            throw error;
        }
    };

    // Сохранение результата пользователя в БД
    const saveUserGameResult = async (userResult: Player) => {
        if (!user?.userId || !gameId) {
            console.log('⚠️ Пропуск сохранения: нет пользователя или gameId');
            return;
        }

        try {
            setSaving(true);
            console.log('💾 Сохранение результата в БД:', userResult);

            // Обновляем профиль пользователя
            await updateUserProfile(userResult.score);

        } catch (error) {
            console.error('❌ Ошибка сохранения в БД:', error);
            setError('Ошибка сохранения результатов (но игра завершена успешно)');
        } finally {
            setSaving(false);
        }
    };

    // Обновление статистики профиля
    const updateUserProfile = async (newScore: number) => {
        if (!user?.userId) return;

        try {
            console.log('📈 Обновление профиля пользователя...');

            // Получаем текущий профиль
            const profileResponse = await client.graphql({
                query: getProfile,
                variables: { id: user.userId },
                authMode: 'apiKey' // ИСПРАВЛЕНО: изменено с 'userPool' на 'apiKey'
            });

            const currentProfile = profileResponse.data?.getProfile as ExtendedProfile | null;

            if (currentProfile) {
                // Безопасно получаем значения или используем 0 по умолчанию
                const currentGames = (currentProfile.totalGamesPlayed as number) || 0;
                const currentScore = (currentProfile.totalScore as number) || 0;
                const currentBest = (currentProfile.bestScore as number) || 0;

                const newTotalGames = currentGames + 1;
                const newTotalScore = currentScore + newScore;
                const newBestScore = Math.max(currentBest, newScore);
                const newAverageScore = Math.round((newTotalScore / newTotalGames) * 10) / 10;

                console.log('📊 Новая статистика:', {
                    totalGames: newTotalGames,
                    totalScore: newTotalScore,
                    bestScore: newBestScore,
                    averageScore: newAverageScore
                });

                // Показываем локальную статистику (так как схема БД еще не обновлена)
                setProfile({
                    id: currentProfile.id,
                    username: currentProfile.username || '',
                    emoji: currentProfile.emoji || '',
                    totalGamesPlayed: newTotalGames,
                    totalScore: newTotalScore,
                    bestScore: newBestScore,
                    averageScore: newAverageScore,
                });

                // Пока что только базовое обновление профиля
                try {
                    await client.graphql({
                        query: updateProfile,
                        variables: {
                            input: {
                                id: currentProfile.id,
                                username: currentProfile.username,
                                emoji: currentProfile.emoji,
                                // Новые поля будут добавлены после обновления схемы
                            }
                        },
                        authMode: 'apiKey' // ИСПРАВЛЕНО: изменено с 'userPool' на 'apiKey'
                    });

                    console.log('✅ Базовый профиль обновлен');
                } catch (updateError) {
                    console.error('❌ Ошибка обновления профиля в БД:', updateError);
                }

            } else {
                console.log('⚠️ Профиль не найден');
            }

        } catch (error) {
            console.error('❌ Ошибка обновления профиля:', error);
            // Не выбрасываем ошибку, так как основная игра должна продолжаться
        }
    };

    // Очистка данных при размонтировании
    useEffect(() => {
        return () => {
            // НЕ очищаем результаты сразу, даем время их прочитать
            setTimeout(() => {
                if (gameId) {
                    localStorage.removeItem(`gameResults_${gameId}`);
                    console.log('🧹 Очищены результаты игры из localStorage');
                }
            }, 30000); // Очищаем через 30 секунд
        };
    }, [gameId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-pink-100">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-lg font-semibold">게임 결과 로딩 중...</p>
                    <p className="text-sm text-gray-500 mt-2">실제 게임 데이터를 처리하고 있습니다</p>
                    {saving && <p className="text-sm text-gray-500 mt-2">데이터베이스에 저장 중...</p>}
                </div>
            </div>
        );
    }

    // Определяем MVP (Most Valuable Player)
    const mvp = players[0];
    const hasRealData = players.length > 0 && players[0].id !== 'demo1' && players[0].id !== 'error1';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-2 text-center">🎮 게임 결과</h1>
                    <p className="text-center text-gray-600 mb-2">게임 #{gameId}</p>

                    {/* Индикатор типа данных */}
                    <div className="text-center mb-4">
                        {hasRealData ? (
                            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                                ✅ 실제 게임 결과 데이터
                            </div>
                        ) : (
                            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                                ⚠️ 데모 데이터 (게임 결과를 찾을 수 없음)
                            </div>
                        )}
                    </div>

                    {/* Статус сохранения */}
                    {saving && (
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                프로필 업데이트 중...
                            </div>
                        </div>
                    )}

                    {/* Ошибка */}
                    {error && (
                        <div className="text-center mb-4">
                            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                                ⚠️ {error}
                            </div>
                        </div>
                    )}

                    {/* MVP секция */}
                    {mvp && (
                        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-8 shadow-inner">
                            <div className="text-center mb-2">🏆 MVP 🏆</div>
                            <div className="flex items-center justify-center mb-3">
                                <div className="text-6xl mr-4">{mvp.avatar}</div>
                                <div>
                                    <h2 className="text-2xl font-bold">{mvp.username}</h2>
                                    <p className="text-gray-700">정답 수: {mvp.correctAnswers}/3</p>
                                    <p className="text-gray-700">최종 점수: {mvp.score}점</p>
                                    {mvp.isCurrentUser && (
                                        <p className="text-sm text-blue-600 font-semibold">🎉 축하합니다!</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Таблица результатов */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-4">📊 최종 순위</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left">순위</th>
                                    <th className="px-4 py-2 text-left">플레이어</th>
                                    <th className="px-4 py-2 text-right">점수</th>
                                    <th className="px-4 py-2 text-right">정답 수</th>
                                    <th className="px-4 py-2 text-right">정답률</th>
                                </tr>
                                </thead>
                                <tbody>
                                {players.map(player => (
                                    <tr key={player.id} className={`border-b hover:bg-gray-50 ${
                                        player.position === 1 ? 'bg-yellow-50' :
                                            player.isCurrentUser ? 'bg-blue-50' : ''
                                    }`}>
                                        <td className="px-4 py-3">
                                            {player.position === 1 ? '🥇' :
                                                player.position === 2 ? '🥈' :
                                                    player.position === 3 ? '🥉' : `${player.position}위`}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">{player.avatar}</span>
                                                <div>
                                                    <span className="font-medium">{player.username}</span>
                                                    {player.isCurrentUser && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">나</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-lg">{player.score}점</td>
                                        <td className="px-4 py-3 text-right">{player.correctAnswers}/3</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                player.correctAnswers === 3 ? 'bg-green-100 text-green-800' :
                                                    player.correctAnswers >= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }`}>
                                                {Math.round((player.correctAnswers / 3) * 100)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Статистика профиля */}
                    {profile && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4">📈 개인 통계 (업데이트됨)</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-purple-600">{profile.totalGamesPlayed || 0}</div>
                                    <div className="text-sm text-gray-600">총 게임 수</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">{profile.bestScore || 0}</div>
                                    <div className="text-sm text-gray-600">최고 점수</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">{profile.totalScore || 0}</div>
                                    <div className="text-sm text-gray-600">총 점수</div>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                                    <div className="text-2xl font-bold text-orange-600">{(profile.averageScore || 0).toFixed(1)}</div>
                                    <div className="text-sm text-gray-600">평균 점수</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => navigate('/quick-join')}
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            🎮 다시 플레이
                        </button>

                        <button
                            onClick={() => navigate('/ranking')}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                        >
                            🏆 랭킹 보기
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
                        >
                            🏠 메인으로
                        </button>
                    </div>

                    {/* Отладочная информация */}
                    {hasRealData && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                            <p className="text-sm text-gray-600 text-center">
                                ✅ 이 결과는 실제 게임에서 얻은 데이터입니다
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Results;