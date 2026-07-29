export interface IconProps {
  width?: number;
  height?: number;
}



export interface VotingCardProps {
  _id: string,
  title: string,
  cover_media_type: string,
  cover_media: string,
  contest_be_watched: string,
  start_date: any,
  start_time: any,
  end_date: any,
  end_time: any,
  status: string,
  total_reviews?: number,
  average_rating?: number,
  total_finalist?: number,
  is_voted?: boolean,
  total_voted?:number,
  number_of_time_vote?:number
}



export interface ContestCardProps {
  _id?: string,
  contest_id?: string,
  title: string,
  status: string,
  cover_media_type: string | null,
  cover_media: string,
  total_likes: number,
  total_comments: number,
  total_share: number,
  is_contest_like: boolean,
  start_date: number,
  start_time: number,
  end_date: number,
  end_time: number,
  created_at?: number,
  isEdit?: boolean,
  href?:string,
  is_detail_filled?:boolean
}

export interface CommentsListProps {
  _id: string,
  contest_id: string,
  comment: string,
  profile_pic: string,
  name: string,
  user_id: string,
  is_like: boolean,
  total_likes: number,
  total_replies: null,
  created_at: number,

}


