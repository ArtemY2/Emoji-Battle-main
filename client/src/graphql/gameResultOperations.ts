// src/graphql/gameResultOperations.ts
// Операции для GameResult (добавляем отдельно)

export const createGameResult = /* GraphQL */ `
    mutation CreateGameResult(
        $input: CreateGameResultInput!
        $condition: ModelGameResultConditionInput
    ) {
        createGameResult(input: $input, condition: $condition) {
            id
            gameId
            playerId
            playerName
            score
            correctAnswers
            totalRounds
            createdAt
            updatedAt
            owner
            __typename
        }
    }
`;

export const getGameResult = /* GraphQL */ `
    query GetGameResult($id: ID!) {
        getGameResult(id: $id) {
            id
            gameId
            playerId
            playerName
            score
            correctAnswers
            totalRounds
            createdAt
            updatedAt
            owner
            __typename
        }
    }
`;

export const listGameResults = /* GraphQL */ `
    query ListGameResults(
        $filter: ModelGameResultFilterInput
        $limit: Int
        $nextToken: String
    ) {
        listGameResults(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
                id
                gameId
                playerId
                playerName
                score
                correctAnswers
                totalRounds
                createdAt
                updatedAt
                owner
                __typename
            }
            nextToken
            __typename
        }
    }
`;