import _superagent, { search } from "superagent";
const SuperagentPromise = require("superagent-promise");
const superagent = SuperagentPromise(_superagent, global.Promise);
export const STRIPE_ACCESS_KEY = process.env.NEXT_PUBLIC_STRIPE_ACCESS_KEY
// ************** STAGING LINKS **************
// const API_ROOT = process.env.NEXT_PUBLIC_STAGING_API_ROOT;
// const BUCKET_ROOT = process.env.NEXT_PUBLIC_STAGING_BUCKET_ROOT;

// ************** LIVE LINKS **************
const API_ROOT = process.env.NEXT_PUBLIC_LIVE_API_ROOT;
// const API_ROOT = 'http://192.168.0.235:3000/'

const BUCKET_ROOT = process.env.NEXT_PUBLIC_LIVE_BUCKET_ROOT;

const API_FILE_ROOT_MEDIUM = `${BUCKET_ROOT}images/medium/`;
const API_FILE_ROOT_ORIGINAL = `${BUCKET_ROOT}images/original/`;
const API_FILE_ROOT_GIF = `${BUCKET_ROOT}Gif/`;
const API_FILE_ROOT_SMALL = `${BUCKET_ROOT}images/small/`;
const API_FILE_ROOT_AUDIO = `${BUCKET_ROOT}audio/`;
const API_FILE_ROOT_VIDEO = `${BUCKET_ROOT}`;
const API_FILE_ROOT_DOCUMENTS = `${BUCKET_ROOT}documents/`;
const encode = encodeURIComponent;
const responseBody = (res: any) => res.body;
let Language = "";
const language = (req: any) => {
  Language = req;
};
let token: any = null;
const tokenPlugin = (req: any) => {
  if (token) {
    req.set("authorization", `Bearer ${token}`);
    // req.set('token', token);
  }
};
const requests = {
  del: (url: string) =>
    superagent.del(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  get: (url: string) =>
    superagent.get(`${API_ROOT}${url}`).use(tokenPlugin).then(responseBody),
  put: (url: string, body: any) =>
    superagent
      .put(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody),
  patch: (url: string, body: any) =>
    superagent
      .patch(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody),
  post: (url: string, body: any) =>
    superagent
      .post(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .then(responseBody),
  file: (url: string, key: string, file: any) =>
    superagent
      .post(`${API_ROOT}${url}`)
      .attach(key, file)
      .use(tokenPlugin)
      .then(responseBody),
};
const Auth = {
  signUp: (info: any) => requests.post("user/signup", info),
  emailVerification: (info: any) =>
    requests.patch("user/email/verify", info),
  resendOtpEmail: (info: any) => requests.post("user/email/otp/resend", info),
  resendOtpPhone: (info: any) => requests.post("user/phone/otp/resend", info),
  phoneVerification: (info: any) =>
    requests.patch("user/phone/verify", info),
  logout: () => requests.del("user/logout"),
  login: (info: any) => requests.post("user/login", info),
  forgetPassword: (info: any) => requests.patch("user/forgot/password", info),
  verfiyEmailForPassword: (info: any) => requests.patch("user/verify/forgot/password", info),
  resetPassword: (info: any) => requests.patch("user/reset/password", info),
};
const Contest = {
  getreviews: (id: String, q, search, sort) => requests.get(`contest/reviews/listing/${id}?pagination=${q || 0}&limit=10&search=${search ? search : ''}&sort=${sort ? sort : ''}`),
  // getreviews: (id: String, q) => requests.get(`contest/reviews/listing/${id}?pagination=${q || 0}&limit=10`),
  create: (items: any) => requests.post(`contest/create`, items),
  draft: (items: any) => requests.post(`contest/create/draft`, items),
  reviewLike: (id: string) => requests.post(`contest/review/like`, id),
  reviewadd: (q) => requests.post(`contest/reviews`, q),
  edit: (items: any) => requests.patch(`contest/edit`, items),
  listing: (q?: string) => requests.get(`contest/home?${q ? q : ''}`),
  categoryListing: (q?: string) => requests.get(`contest/catagory?${q ? q : ''}`),
  subCategoryListing: (id?: string, q?: any) => requests.get(`contest/sub/catagory/${id}?${q ? q : ''}`),
  getOtherVotingtypes: (q?: any) => requests.get(`contest/vote/type?${q ? q : ''}`),
  details: (_id?: string) => requests.get(`contest/details/${_id}`),
  likeContest: (_id: any) => requests.post(`contest/like`, _id),
  followContest: (_id: any) => requests.post(`contest/follow`, _id),
  shareContest: (_id: any) => requests.post(`contest/share`, _id),
  randomizerContest: (items: any) => requests.patch(`contest/randomizer`, items),
  contestCreatedListing: (q?: string) => requests.get(`contest/created?${q ? q : ''}`),
  contestJoinedListing: (q?: string) => requests.get(`contest/joined?${q ? q : ''}`),
  contestFollowListing: (q?: string) => requests.get(`contest/follows?${q ? q : ''}`),
  contestDraftListing: (q?: string) => requests.get(`contest/draft/listing?${q ? q : ''}`),
  contestDraftDelete: (id?: string) => requests.del(`contest/draft/delete/${id}`),
  contestDraftDetail: (id?: string) => requests.get(`contest/draft/details/${id}`),
  contestRewardListing: (q?: string) => requests.get(`contest/rewards?${q ? q : ''}`),
  contestCreateComment: (items: any) => requests.post(`contest/comment`, items),
  contestCommentListing: (_id: any) => requests.get(`contest/comments/${_id}`),
  contestCommentDelete: (_id: any) => requests.del(`contest/remove/comment/${_id}`),
  editContestComment: (items: any) => requests.patch(`contest/edit/comment`, items),
  likeContestComment: (_id: any) => requests.post(`contest/comment/like`, _id),
  payment: (items: any) => requests.post(`payment/create`, items),
}
const Contestent = {
  contestentFormSubmission: (items: any) => requests.post(`contest/contestent/form`, items),
  listingContestentForm: (q?: string) => requests.get(`contest/creator/review?${q ? q : ''}`),
  contestentFormDetail: (_id: string) => requests.get(`contest/contestent/details/${_id}`),
  reviewcontestentFormDetail: (items: any) => requests.patch(`contest/creator/form/check`, items),
  getContestentDetails: (_id: any) => requests.get(`contest/contestent/form/details/${_id}`),
  editContestentDetails: (items: any) => requests.patch(`contest/contestent/form/edit`, items),
  editContestentByCreator: (items: any) => requests.patch(`contest/creator/contestent/edit`, items)
}
const BankAccount = {
  addBank: (info: any) =>
    requests.post('payment/addbank', info),
  getBankAccount: () =>
    requests.get(`payment/bank`),
  deleteBankaccount: (_id: string) =>
    requests.del(`payment/delete/bank/${_id}`),
  addMoney: (info: any) =>
    requests.post('payment/wallet/recharge', info),
  amountWithdraw: (info: any) =>
    requests.post('payment/payouts', info),
  getFlutterWaveData: (country: any) =>
    requests.get(`payment/flw_banks?country=${country}`),

}
const Common = {
  uploadFile: (key: string, file: any) =>
    requests.file(`uploads/file`, key, file),
  paymentUploadFile: (key: string, file: any) =>
    requests.file(`payment/stripe/file/upload`, key, file),
  earning: (q?: string) =>
    requests.get(`payment/earnings${q ? `?${q}` : ""}`),
  getPayouts: (q?: string) =>
    requests.get(`payment/payouts${q ? `?${q}` : ""}`),
};
const Homepage = {
  listing: () => requests.get("user/home"),
};
const Profile = {
  profile: () => requests.get(`user/profile`),
  editProfile: (info: any) => requests.patch("user/profile/update", info),
};
const Notification = {
  listing: (q?: string) =>
    requests.get(`user/notification/list${q ? `?${q}` : ""}`),
  readById: (id: string) =>
    requests.patch(`user/notification/read/${id}`, {}),
  allRead: () =>
    requests.patch('user/notification/read/all', {}),
  unreadCount: () =>
    requests.get(`notifications/count`)
}
const FILES = {
  audio: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_AUDIO}${filename}`,
  video: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_VIDEO}${filename}`,
  gifOriginal: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_GIF}${filename}`,
  imageOriginal: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_ORIGINAL}${filename}`,
  imageMedium: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_MEDIUM}${filename}`,
  imageSmall: (filename: string) =>
    filename?.startsWith("http")
      ? filename
      : `${API_FILE_ROOT_SMALL}${filename}`,
};
const henceforthApi = {
  token,
  Contest,
  Contestent,
  Homepage,
  Notification,
  Auth,
  Common,
  BankAccount,
  Profile,
  API_ROOT,
  API_FILE_ROOT_SMALL,
  API_FILE_ROOT_MEDIUM,
  API_FILE_ROOT_ORIGINAL,
  API_FILE_ROOT_VIDEO,
  API_FILE_ROOT_DOCUMENTS,
  FILES,
  language,
  encode,
  setToken: (_token?: string) => {
    token = _token;
  },
};
export default henceforthApi;
