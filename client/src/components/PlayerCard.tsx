import React from 'react';

interface Player {
    id: string;
    username: string;
    avatar: string;
    score: number;
}

interface PlayerCardProps {
    player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mr-3">{player.avatar}</div>
            <div className="flex-1">
                <p className="font-medium">{player.username}</p>
                <p className="text-gray-500">점수: {player.score}</p>
            </div>
        </div>
    );
};

export default PlayerCard;