export interface UserInfo {
  access_token?: string;
  _id?: string;
  profile_pic?: string;
  name?: string;
  email?: string;
  is_phone_verified?: string;
  is_email_verified?: boolean;
  phone_number?: string;
  country_code?: string;
  lang: string;

}


// ******************* IconProps *******************
export interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
}
