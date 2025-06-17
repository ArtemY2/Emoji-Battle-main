// client/src/types/ExtendedProfile.ts
// Расширенные типы для Profile с игровой статистикой

export interface ExtendedProfile {
    id: string;
    username: string | null;
    emoji: string | null;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
    owner?: string | null;
    createdAt: string;
    updatedAt: string;
    __typename?: string;
}

export interface CreateExtendedProfileInput {
    id?: string | null;
    username: string;
    emoji: string;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
}

export interface UpdateExtendedProfileInput {
    id: string;
    username?: string | null;
    emoji?: string | null;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
}

export interface CreateGameResultInput {
    id?: string | null;
    gameId: string;
    playerId: string;
    playerName: string;
    score: number;
    correctAnswers: number;
    totalRounds: number;
}

export interface GameResult {
    id: string;
    gameId: string;
    playerId: string;
    playerName: string;
    score: number;
    correctAnswers: number;
    totalRounds: number;
    createdAt: string;
    updatedAt: string;
    owner?: string | null;
    __typename?: string;
}