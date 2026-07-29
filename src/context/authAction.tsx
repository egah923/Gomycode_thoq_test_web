import { AUTH_FEV, LOGIN_SUCCESS, INITIALISE_PROFILE, SIGNUP_SUCCESS, LOGOUT_SUCCESS, SOCIAL_TYPE_PROVIDER } from "./actionTypes"

const authFav = (payload: any) => (dispatch: any) => {
    dispatch({
        type: AUTH_FEV,
        payload: payload
    })
}
const login = (payload: any) => (dispatch: any) => {
    dispatch({
        type: LOGIN_SUCCESS,
        payload: payload
    })
}
const signup = (payload: any) => (dispatch: any) => {
    dispatch({
        type: SIGNUP_SUCCESS,
        payload: payload
    })
}
const initialiseProfile = (payload: any) => (dispatch: any) => {
    dispatch({
        type: INITIALISE_PROFILE,
        payload: payload
    })
}
const logout = (payload: any) => (dispatch: any) => {
    dispatch({
        type: LOGOUT_SUCCESS,
        payload: payload
    })
}
const setProvider = (payload: any) => (dispatch: any) => {
    debugger
    dispatch({
        type: SOCIAL_TYPE_PROVIDER,
        payload: payload
    })
}


export default {
    authFav,
    login,
    signup,
    initialiseProfile,
    logout,
    setProvider,
};
