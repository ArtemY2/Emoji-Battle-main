import React, { useState } from 'react';
import {
    signIn,
    signUp,
    confirmSignUp,
    getCurrentUser,
} from 'aws-amplify/auth';

interface Props {
    onClose: () => void;
}

const CustomAuth: React.FC<Props> = ({ onClose }) => {
    const [mode, setMode] = useState<'login' | 'register' | 'confirm'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const handleLogin = async () => {
        setError('');
        try {
            const current = await getCurrentUser();
            if (current) {
                setError('이미 로그인되어 있습니다.');
                return;
            }
        } catch {
            // not logged in — ок
        }

        try {
            await signIn({ username: email, password });
            window.location.reload(); // ✅ вот сюда
        } catch (err: any) {
            setError(err.message || '로그인 실패');
        }
    };


    const handleRegister = async () => {
        setError('');
        try {
            await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                    },
                },
            });
            setMode('confirm');
            setInfo('가입 완료! 이메일로 받은 코드를 입력하세요.');
        } catch (err: any) {
            setError(err.message || '회원가입 실패');
        }
    };

    const handleConfirm = async () => {
        setError('');
        try {
            await confirmSignUp({ username: email, confirmationCode });
            setMode('login');
            setInfo('이메일 확인 완료! 이제 로그인할 수 있습니다.');
        } catch (err: any) {
            setError(err.message || '코드 확인 실패');
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
            <h2 className="text-2xl font-bold text-center mb-4">
                {mode === 'login' ? '로그인 🔐' : mode === 'register' ? '회원가입 🆕' : '코드 확인 📧'}
            </h2>

            {(mode === 'login' || mode === 'register') && (
                <>
                    <input
                        type="email"
                        placeholder="이메일"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-3 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </>
            )}

            {mode === 'confirm' && (
                <>
                    <input
                        type="text"
                        placeholder="확인 코드 (이메일 확인)"
                        value={confirmationCode}
                        onChange={(e) => setConfirmationCode(e.target.value)}
                        className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                </>
            )}

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            {info && <p className="text-green-600 text-sm mb-2">{info}</p>}

            {mode === 'login' && (
                <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded font-bold hover:opacity-90"
                >
                    로그인
                </button>
            )}

            {mode === 'register' && (
                <button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white py-2 rounded font-bold hover:opacity-90"
                >
                    회원가입
                </button>
            )}

            {mode === 'confirm' && (
                <button
                    onClick={handleConfirm}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded font-bold hover:opacity-90"
                >
                    확인
                </button>
            )}

            <div className="flex justify-between mt-4 text-sm text-gray-600">
                {mode !== 'login' && (
                    <button onClick={() => setMode('login')} className="hover:underline">
                        🔁 로그인
                    </button>
                )}
                {mode !== 'register' && (
                    <button onClick={() => setMode('register')} className="hover:underline">
                        🆕 회원가입
                    </button>
                )}
            </div>

            <button
                onClick={onClose}
                className="mt-4 text-sm text-gray-500 hover:underline w-full text-center"
            >
                닫기
            </button>
        </div>
    );
};

export default CustomAuth;
