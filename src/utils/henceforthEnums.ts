export enum ContestStatus {
  PENDING = "PENDING",
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED"
}





export enum VoteType {
  FREE = "FREE",
  PAID = "PAID"
}

export enum FormFillingType {
  NONE = "NONE",
  SOME = "SOME"
}


export enum AfterFillingFields {
  REVIEW = "REVIEW",
  SUBMIT = "SUBMIT"
}


export enum RoundStatus {
  PENDING = "PENDING",
}
export enum FillingInfo {
  EDIT = "EDIT",
  SUBMIT = "SUBMIT",
  DELETE = "DELETE"
}

export enum ContestPlatform {
  YOUTUBE = "YOUTUBE",
  FACEBOOK = "FACEBOOK",
  THROWTECH = "THROWTECH"
}
enum Notification_type {
  LIKE_GAME = "LIKE_GAME",
  DISLIKE_GAME = "DISLIKE_GAME",
  FOLLOW_USER = "FOLLOW_USER",
  GAME_WINNER = 'GAME_WINNER',
  GAME_TERMINATE = 'GAME_TERMINATE',
  UNFOLLOW_USER = "UNFOLLOW_USER",
  REVIEW_A_GAME = "REVIEW_A_GAME",
  ADD_A_COMMENT = "ADD_A_COMMENT",
  ADD_A_REPLY = "ADD_A_REPLY",
  LIVE_STREAMING = "LIVE_STREAMING",
  SCHEDULE_LIVE_STREAMING = "SCHEDULE_LIVE_STREAMING",
  SCREEN_SHARING = "SCREEN_SHARING"
}

export default {
  ContestStatus,
  VoteType, Notification_type,
  FormFillingType,
  AfterFillingFields,
  RoundStatus
}


// 
export const ERROR_UNAUTHORIZED = "UNAUTHORIZED";