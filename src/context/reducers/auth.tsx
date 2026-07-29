import { LOGIN_SUCCESS, LOGOUT_SUCCESS, AUTH_AGE_VERIFY, SIGNUP_SUCCESS, INITIALISE_PROFILE, SOCIAL_TYPE_PROVIDER, CHAT_STATUS } from "../actionTypes";


type Dispatch = {
    type: String,
    payload: any
}

const auth = (state: any, dispatch: Dispatch) => {
    switch (dispatch.type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                ...dispatch.payload,
                isLogin: true,
                isSignUp: false,
            }
        case LOGOUT_SUCCESS:
            return {
                ...state,
                access_token: "",
                email: null,
                email_verified: null,
                user: null,
                user_name: null,
                account_status: null,
                account_type: null,
                device_type: null,
                token_gen_at: null,
                admin_verified: null,
                social_token: null,
                social_type: null,
                fcm_token: null,
                provider: "",
                type: null,
                _id: null,
                isLogin: false,
                isSignUp: false,
            }
        case AUTH_AGE_VERIFY:
            return {
                ...state,
                ...dispatch.payload,
            }
        case INITIALISE_PROFILE:
            return {
                ...state,
                ...dispatch.payload,
            }
        case SIGNUP_SUCCESS:
            return {
                ...state,
                ...dispatch.payload,
                isLogin: false,
                isSignUp: true,
            }
        case SOCIAL_TYPE_PROVIDER:
            debugger
            return {
                ...state,
                provider: dispatch.payload,
            }
        case CHAT_STATUS:
            return {
                ...state,
                ...dispatch.payload,
            }
        default: {
            return {
                ...state,
            }
        }
    }
}

export default auth;