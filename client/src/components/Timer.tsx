import React, { useState, useEffect } from 'react';

interface TimerProps {
    duration: number; // в секундах
    startTime: number;
}

const Timer: React.FC<TimerProps> = ({ duration, startTime }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, duration - elapsed);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [duration, startTime]);

    // Рассчитываем процент оставшегося времени
    const percentage = (timeLeft / duration) * 100;

    // Определяем цвет (от зеленого к красному)
    let bgColor = 'bg-green-500';
    if (percentage < 60) bgColor = 'bg-yellow-500';
    if (percentage < 30) bgColor = 'bg-red-500';

    return (
        <div className="bg-white rounded-full shadow overflow-hidden w-48">
            <div className="relative h-8 bg-gray-200">
                <div
                    className={`absolute left-0 top-0 h-full ${bgColor} transition-all duration-1000 ease-linear`}
                    style={{ width: `${percentage}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center font-bold">
                    {timeLeft}초
                </div>
            </div>
        </div>
    );
};

export default Timer;