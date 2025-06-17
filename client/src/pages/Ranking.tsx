import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Временные данные для примера
const dummyRankings = [
    { id: 1, username: '이모지마스터', avatar: '🦊', level: 12, xp: 1205, score: 9876, gamesPlayed: 45, gamesWon: 28 },
    { id: 2, username: '퍼즐솔버', avatar: '🐼', level: 10, xp: 980, score: 8754, gamesPlayed: 39, gamesWon: 22 },
    { id: 3, username: '이모지닌자', avatar: '🦄', level: 9, xp: 876, score: 7632, gamesPlayed: 36, gamesWon: 19 },
    { id: 4, username: '단어천재', avatar: '🦁', level: 8, xp: 765, score: 6543, gamesPlayed: 30, gamesWon: 15 },
    { id: 5, username: '추측왕', avatar: '🐯', level: 7, xp: 654, score: 5432, gamesPlayed: 28, gamesWon: 12 },
];

const Ranking: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // 'day', 'week', 'all'
    const [searchTerm, setSearchTerm] = useState('');

    // Фильтрация и поиск
    const filteredRankings = dummyRankings.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                >
                    ← 뒤로
                </button>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h1 className="text-3xl font-bold mb-6 text-center">플레이어 랭킹 🏆</h1>

                    <div className="flex justify-between mb-6">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('day')}
                                className={`px-4 py-2 rounded-lg ${filter === 'day' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                            >
                                일일
                            </button>
                            <button
                                onClick={() => setFilter('week')}
                                className={`px-4 py-2 rounded-lg ${filter === 'week' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                            >
                                주간
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100'}`}
                            >
                                전체 시간
                            </button>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="이름으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-2 text-left">순위</th>
                                <th className="px-4 py-2 text-left">플레이어</th>
                                <th className="px-4 py-2 text-left">레벨</th>
                                <th className="px-4 py-2 text-right">점수</th>
                                <th className="px-4 py-2 text-right">플레이 게임</th>
                                <th className="px-4 py-2 text-right">승리</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredRankings.map((player, index) => (
                                <tr key={player.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-2">{player.avatar}</span>
                                            <span>{player.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                          Lvl {player.level}
                        </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold">{player.score}</td>
                                    <td className="px-4 py-3 text-right">{player.gamesPlayed}</td>
                                    <td className="px-4 py-3 text-right">{player.gamesWon}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;