import { ReactNode } from "react";
// import { ProductDetails } from "src/interfaces/Products";

export const COOKIES_USER_ACCESS_TOKEN = "COOKIES_USER_ACCESS_TOKEN";
export const COOKIES_USER_RESET_EMAIL = "USER_RESET_EMAIL";
export const COOKIES_LANGUAGE = "COOKIES_LANGUAGE";
export const COOKIES_COUPON_CODE = "COOKIES_COUPON_CODE";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const LOGOUT_SUCCESS = "LOGOUT_SUCCESS";
export const AUTH_AGE_VERIFY = "AUTH_AGE_VERIFY";
export const INITIALISE_PROFILE = "INITIALISE_PROFILE";
export const STATIC_DATA_SUCCESS = "STATIC_DATA_SUCCESS";
export const PAGE_LIMIT_SUCCESS = "PAGE_LIMIT_SUCCESS";
export const FIXED_PRICE = "FIXED_PRICE";
export const TIMED_AUCTION = "TIMED_AUCTION";
export const RIGHT_AFTER_LISTING = "RIGHT_AFTER_LISTING";
export const PICK_SPECIFIC_DATE = "PICK_SPECIFIC_DATE";
export const EXPIRE_1_DAY = "EXPIRE_1_DAY";
export const EXPIRE_3_DAY = "EXPIRE_3_DAY";
export const EXPIRE_5_DAY = "EXPIRE_5_DAY";
export const EXPLORE_ADD = "EXPLORE_ADD";
export const EXPLORE_UPDATE = "EXPLORE_UPDATE";
export const EXPLORE_LIVE_AUCTION = "LIVE_AUCTIONS";
export const EXPLORE_ENDED_AUCTIONS = "ENDED_AUCTIONS";
export const EXPLORE_ENDED_BUY_IT_NOW = "ENDED_BUY_IT_NOW";
export const EXPLORE_TOP_SELLERS = "EXPLORE_TOP_SELLERS";
export const EXPLORE_TRENDING = "EXPLORE_TRENDING";
export const EXPLORE_HOT_COLLECTIONS = "EXPLORE_HOT_COLLECTIONS";

export const AUTH_FEV = "AUTH_FEV";

export const FIXED_PRICE_AUCTION_ID = "0x01";
export const UNLIMITED_PRICE_AUCTION_ID = "0x02";
export const TIMED_AUCTION_AUCTION_ID = "0x03";

export const REVIEW_1 = '1';
export const REVIEW_2 = '2';
export const REVIEW_3 = '3';
export const REVIEW_4 = '4';
export const IN_STOCK = 'IN_STOCK';

export const DISCOUNT_10 = '10';
export const DISCOUNT_20 = '20';
export const DISCOUNT_30 = '30';
export const DISCOUNT_40 = '40';
export const DISCOUNT_50 = '50';
export const DISCOUNT_60 = '60';
export const DISCOUNT_70 = '70';
export const DISCOUNT_80 = '80';

export const WALLET_ADDRESS_SLICE_FROM = 5;

export const REDIRECT_PROFILE = "profile/vault";
export const REDIRECT_CONTENT_CREATE = "content/create";

export const CHAT_STATUS = "CHAT_STATUS";
export const SOCIAL_TYPE_PROVIDER = "PROVIDER";
export const SOCIAL_TYPE_META_MASK = "META_MASK";
export const SOCIAL_TYPE_WALLET_CONNECT = "WALLET_CONNECT";

// NFT TYPES
export const ERROR_UNAUTHORIZED = "UNAUTHORIZED";
// NFT TYPES
export const NFT_OWN = "own";
export const NFT_SOLD = "sold";
export const NFT_RE_SALE = "resale";
// social network
export const NFT_INSTAGRAM = "https://www.instagram.com/yourlink";
export const NFT_TWITTER = "https://www.twitter.com/yourlink";
export const NFT_MEDIUM = "https://medium.com/yourlink";
export const NFT_DISCORD = "https://discord.com/channels/@yourlink";
export const NFT_TIK_TOK = "https://www.tiktok.com/@yourlink";
export const NFT_REDDIT = "https://www.reddit.com/user/yourlink/";

// export const ETHEREUM_NETWORK = "ETHEREUM";
export const BINANCE_NETWORK = "BINANCE";
export const POLYGON_NETWORK = "POLYGON";

export const RECENTLY_ADDED = "RECENTLY_ADDED";
export const PRICE_HIGH_TO_LOW = "PRICE_HIGH_TO_LOW";
export const PRICE_LOW_TO_HIGH = "PRICE_LOW_TO_HIGH";
export const AUCTION_ENDING_SOON = "AUCTION_ENDING_SOON";

export const TAB_ORDERS = "TAB_ORDERS";
export const TAB_PROFILE = "TAB_PROFILE";
export const TAB_ADDRESS = "TAB_ADDRESS";
export const TAB_CARD = "TAB_CARD";
export const TAB_COUPON = "TAB_COUPON";
export const TAB_REVIEW = "TAB_REVIEW";
export const TAB_WISHLIST = "TAB_WISHLIST";
export const TAB_NOTIFICATION = "TAB_NOTIFICATION";
export const TAB_HELP = "TAB_HELP";

export type GlobleContextProviderProps = {
    children: ReactNode;
    tab?: string;
    // data?: ProductDetails
}