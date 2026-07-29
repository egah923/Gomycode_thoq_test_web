'use client'
import React, { createContext, ReactNode, SetStateAction, useState } from 'react'
import { useRouter } from 'next/router';
import { destroyCookie } from 'nookies';
import { COOKIES_USER_ACCESS_TOKEN } from './actionTypes';
import { message } from 'antd';
import { UserInfo } from 'src/interfaces';
import AntConfig from '@/lib/AntConfig';
import henceforthApi from '@/utils/henceforthApi';
import { getFirebaseMessageToken } from '@/utils/firebase';
type ToastFunction = (msg: any) => void;

// type Function = () => Promise<void | string>;
// type LoginFunction = (id: string) => void;
// type Languages = "en" | "fr"
// type downloadCsvFunction = (filename: string, data: Array<any>) => void;
// type uploadCsvFunction = (file: any) => Promise<any>;
interface CommonContextType {
    loading: boolean;
    logOutUser: () => void;
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    userInfo: any;
    setUserInfo: React.Dispatch<SetStateAction<any>>;
    Toast: {
        error: ToastFunction,
        success: ToastFunction,
        warn: ToastFunction
    },
    requestNotification: () => any,
}
export const GlobalContext = createContext({} as CommonContextType);
export const downloadFile = (file_path: String) => {
    var a: any = document.createElement('a') as HTMLElement;
    a.href = file_path;
    a.target = "_blank";
    a.download = file_path.substr(file_path.lastIndexOf('/') + 1);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
export const MetamaskResource = {
    icon: 'https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg',
    name: 'Metamask',
    title: 'Connect with metamask'
}
export const WalletConnectResource = {
    icon: 'https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg',
    name: 'WalletConnect',
    title: 'Connect with walletConnect'
}
type GlobleContextProviderProps = {
    children: ReactNode;
    user_info: UserInfo,
}

function GlobalProvider(props: GlobleContextProviderProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [userInfo, setUserInfo] = useState(props?.user_info)
    // const [language, setLanguage] = useState<Languages>("en")

    henceforthApi.setToken(userInfo?.access_token ? userInfo?.access_token : "")


    const [messageApi, contextHolder] = message.useMessage();

    if (userInfo?.access_token || props?.user_info?.access_token) {
        henceforthApi.setToken(userInfo?.access_token || props?.user_info?.access_token)
    }


    const destroyErrorMessage = () => message.destroy('1')
    const destroySuccessMessage = () => message.destroy('2')
    const destroyWarnMessage = () => message.destroy('3')


    const logOutUser = async () => {
        try {
            setLoading(true)
            // const apiRes = await henceforthApi.Auth.logout();
            // Toast.success(apiRes.message)
            
            destroyCookie(null, COOKIES_USER_ACCESS_TOKEN, {
                maxAge: 0,
                path: "/",
            });
            
            setUserInfo(null as any)
            router.replace({
                pathname: '/auth/signin'
            })
        } catch (error) {
            Toast.error(error)
            setLoading(false)
        }
    }
    const requestNotification = async () => {
        
        if (!("Notification" in window)) {
            return ""
        }
        else if (Notification.permission === "granted") {
            
            let { tokenId, error }: any = await getFirebaseMessageToken()
            if (error) {
                return ""
            }
            return tokenId
        }
        else if (Notification.permission !== 'denied') {
            
            Notification.requestPermission(async (permission) => {
                if (permission === "granted") {
                    let { tokenId, error }: any = await getFirebaseMessageToken()
                    if (error) {
                        return ""
                    }
                    return tokenId

                } else {
                    return ""
                }
            });
        } else {
            return ""
        }
    }

    const error = (error: any) => {
        let errorBody = error?.response?.body
        // let error_type = errorBody?.error_type
        // let error_message = errorBody?.error_message
        let message = errorBody?.error_description || errorBody?.message
        if (message == 'Unauthorized') {
            logOutUser()
            // return Toast.warn('ddddddddddddddddddddd')
        }
        destroyErrorMessage()
        messageApi.open({
            type: 'error',
            content: typeof message == "string" ? message : message ? JSON.stringify(message) : JSON.stringify(error),
            key: "1",
            duration: 4
        });
    }

    const success = (success: string) => {
        destroySuccessMessage
        messageApi.open({
            type: 'success',
            content: success,
            key: "2",
            duration: 4
        });
    };

    const warn = (error: any) => {
        destroyWarnMessage()
        messageApi.open({
            type: 'warning',
            content: error,
            key: "3",
            duration: 5
        });
        setTimeout(messageApi.destroy, 3000);
    }

    const Toast = {
        success,
        error,
        warn
    }

    return (
        <GlobalContext.Provider
            value={{ loading, setLoading, ...props, Toast, userInfo, logOutUser, requestNotification, setUserInfo }}>
            <AntConfig>
                {props.children}
                {contextHolder}
            </AntConfig>
        </GlobalContext.Provider>
    )
}

export default GlobalProvider
