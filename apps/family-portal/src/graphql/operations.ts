import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        name
        email
      }
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

export const GET_MEMBERS = gql`
  query GetMembers {
    members {
      id
      name
      birthday
      relation
      avatarUrl
    }
  }
`;

export const GET_MEMBER = gql`
  query GetMember($id: ID!) {
    member(id: $id) {
      id
      name
      birthday
      relation
      avatarUrl
    }
  }
`;

export const CREATE_MEMBER = gql`
  mutation CreateMember($input: CreateMemberInput!) {
    createMember(input: $input) {
      id
      name
      birthday
      relation
      avatarUrl
    }
  }
`;

export const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: ID!, $input: UpdateMemberInput!) {
    updateMember(id: $id, input: $input) {
      id
      name
      birthday
      relation
      avatarUrl
    }
  }
`;

export const DELETE_MEMBER = gql`
  mutation DeleteMember($id: ID!) {
    deleteMember(id: $id)
  }
`;
