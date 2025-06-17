import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadData } from 'aws-amplify/storage';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { createProfile, updateProfile } from '../graphql/mutations';
import { getProfile } from '../graphql/queries';

const client = generateClient();

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const [selectedEmoji, setSelectedEmoji] = useState('😎');
    const [name, setName] = useState(user?.username || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAuthSession().then(session => {
            const token = session.tokens?.idToken?.toString();
            console.log('Cognito JWT:', token);
        });
    }, []);

    const uploadEmoji = async (emoji: string) => {
        try {
            setLoading(true);
            const blob = new Blob([emoji], { type: 'text/plain' });
            const filename = `avatars/${Date.now()}.txt`;

            await uploadData({
                key: filename,
                data: blob,
                options: { contentType: 'text/plain' }
            }).result;

            setSelectedEmoji(emoji);
        } catch (err) {
            console.error('Upload error:', err);
            alert('❌ Ошибка загрузки эмодзи в S3');
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        if (!user?.userId) return;
        const input = {
            id: user.userId,
            username: name,
            emoji: selectedEmoji
        };

        setLoading(true);
        try {
            const getResult = await client.graphql({
                query: getProfile,
                variables: { id: user.userId },
                authMode: 'userPool'
            });

            const existing = getResult?.data?.getProfile;

            if (existing) {
                await client.graphql({
                    query: updateProfile,
                    variables: { input },
                    authMode: 'userPool'
                });
                alert('✅ Профиль обновлён!');
            } else {
                await client.graphql({
                    query: createProfile,
                    variables: { input },
                    authMode: 'userPool'
                });
                alert('✅ Профиль создан!');
            }
        } catch (err) {
            console.error('GraphQL Save Error:', JSON.stringify(err, null, 2));
            alert('❌ Ошибка при сохранении профиля');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.userId) return;
            try {
                setLoading(true);
                const result = await client.graphql({
                    query: getProfile,
                    variables: { id: user.userId },
                    authMode: 'userPool'
                });
                const data = result?.data?.getProfile;
                if (data) {
                    setName(data.username ?? '');
                    setSelectedEmoji(data.emoji ?? '😎');
                }
            } catch (err) {
                console.error('Fetch profile error:', JSON.stringify(err, null, 2));
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user?.userId]);

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-pink-100 p-6">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 px-4 py-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
                >
                    ← 뒤로
                </button>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-5 mb-8 shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="text-4xl">{selectedEmoji}</div>
                            <div>
                                <p className="text-xl font-semibold">{name || user?.username || '익명 유저'}</p>
                                <p className="text-sm text-gray-500">ID: {user?.userId?.slice(0, 8)}...</p>
                                <p className="text-xs text-purple-500 mt-1">AWS Cognito 인증됨</p>
                            </div>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="text-sm px-3 py-1 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="flex items-center mb-6">
                        <div className="text-7xl mr-6">{selectedEmoji}</div>
                        <div>
                            <h1 className="text-3xl font-bold">플레이어 프로필</h1>
                            <p className="text-gray-600">레벨: 1 • XP: 0/100</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-purple-50 p-4 rounded-xl shadow-inner">
                            <h2 className="text-xl font-bold mb-3">📊 통계</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>플레이 게임:</span><span>0</span></div>
                                <div className="flex justify-between"><span>승리:</span><span>0</span></div>
                                <div className="flex justify-between"><span>승률:</span><span>0%</span></div>
                                <div className="flex justify-between"><span>평균 점수:</span><span>0</span></div>
                            </div>
                        </div>

                        <div className="bg-pink-50 p-4 rounded-xl shadow-inner">
                            <h2 className="text-xl font-bold mb-3">🎨 설정</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">이름</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg bg-white shadow-sm text-sm"
                                        disabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">아바타 선택</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {['😎', '🦊', '🐼', '🦁', '🐶', '🐱', '🐰', '🦄', '🐯', '🐻'].map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => uploadEmoji(emoji)}
                                                disabled={loading}
                                                className={`text-2xl p-2 rounded-lg border transition ${
                                                    selectedEmoji === emoji
                                                        ? 'bg-gradient-to-r from-purple-200 to-pink-200 border-purple-400'
                                                        : 'bg-gray-100 hover:bg-purple-100 border-transparent'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveProfile}
                        disabled={loading}
                        className={`w-full py-3 text-white font-semibold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow transition ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                    >
                        {loading ? '저장 중...' : '변경사항 저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;