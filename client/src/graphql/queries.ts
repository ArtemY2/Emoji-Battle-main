/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getProfile = /* GraphQL */ `query GetProfile($id: ID!) {
  getProfile(id: $id) {
    id
    username
    emoji
    owner
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetProfileQueryVariables,
  APITypes.GetProfileQuery
>;
export const listProfiles = /* GraphQL */ `query ListProfiles(
  $filter: ModelProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      username
      emoji
      owner
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListProfilesQueryVariables,
  APITypes.ListProfilesQuery
>;
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