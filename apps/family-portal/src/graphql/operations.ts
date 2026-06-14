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

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      expiresIn
      user {
        id
        name
        email
        phone
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

export const VERIFY = gql`
  mutation Verify($input: VerifyInput!) {
    verify(input: $input) {
      success
      message
    }
  }
`;

export const RESEND_CODE = gql`
  mutation ResendCode($input: ResendCodeInput!) {
    resendCode(input: $input) {
      success
      message
    }
  }
`;

export const GET_HEALTH_RECORDS = gql`
  query GetHealthRecords($input: HealthRecordListInput!) {
    healthRecords(input: $input) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          memberId
          type
          recordedAt
          createdAt
          values {
            systolic
            diastolic
            glucose
            weight
            temperature
            unit
            notes
          }
        }
      }
    }
  }
`;

export const GET_HEALTH_TREND = gql`
  query GetHealthTrend($input: HealthTrendInput!) {
    healthTrend(input: $input) {
      memberId
      type
      period
      count
      minValue
      maxValue
      averageValue
      points {
        label
        value
        recordedAt
        type
        values {
          systolic
          diastolic
          glucose
          weight
          temperature
          unit
          notes
        }
      }
    }
  }
`;

export const CREATE_HEALTH_RECORD = gql`
  mutation CreateHealthRecord($input: CreateHealthRecordInput!) {
    createHealthRecord(input: $input) {
      id
      memberId
      type
      recordedAt
      createdAt
      values {
        systolic
        diastolic
        glucose
        weight
        temperature
        unit
        notes
      }
    }
  }
`;

export const GET_GOALS = gql`
  query GetGoals($memberId: ID, $type: GoalType, $status: GoalStatus, $first: Int, $after: String) {
    goals(memberId: $memberId, type: $type, status: $status, first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          id
          memberId
          title
          type
          targetValue
          currentValue
          unit
          startDate
          endDate
          status
          progress
          createdAt
          updatedAt
        }
      }
    }
  }
`;

export const GET_GOAL = gql`
  query GetGoal($id: ID!) {
    goal(id: $id) {
      id
      memberId
      title
      type
      targetValue
      currentValue
      unit
      startDate
      endDate
      status
      progress
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id
      memberId
      title
      type
      targetValue
      currentValue
      unit
      startDate
      endDate
      status
      progress
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_GOAL_PROGRESS = gql`
  mutation UpdateGoalProgress($id: ID!, $input: UpdateGoalProgressInput!) {
    updateGoalProgress(id: $id, input: $input) {
      id
      memberId
      title
      type
      targetValue
      currentValue
      unit
      startDate
      endDate
      status
      progress
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($id: ID!) {
    deleteGoal(id: $id)
  }
`;
