// src/types/Profile.ts - временные типы пока не сгенерированы автоматически

export interface CreateProfileInput {
    id?: string | null;
    username: string;
    emoji: string;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
}

export interface UpdateProfileInput {
    id: string;
    username?: string | null;
    emoji?: string | null;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
}

export interface Profile {
    id: string;
    username: string;
    emoji: string;
    totalGamesPlayed?: number | null;
    totalScore?: number | null;
    bestScore?: number | null;
    averageScore?: number | null;
    createdAt: string;
    updatedAt: string;
    owner?: string | null;
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
}