import Link from 'next/link';
import logo from '@/assets/logo/logo.png'
import ProfileAvatar from '../Icons/ProfileAvatar';
import { Button, Dropdown, Grid, Space } from 'antd';
import profile from "@/assets/images/profile.png"
import notifications from "@/assets/images/Icon.png"
import { useContext, useState } from 'react';
import { GlobalContext } from '@/context/Provider';
import henceforthApi from '@/utils/henceforthApi';
import { MenuProps } from 'antd/lib';
import { destroyCookie } from 'nookies';
import { useRouter } from 'next/router';
import { COOKIES_USER_ACCESS_TOKEN } from '@/context/actionTypes';
import EyeIcon from '../Icons/EyeIcon';
const TheHeader = () => {
    const router = useRouter();
    const screens = Grid.useBreakpoint();
    const { Toast, userInfo, setUserInfo } = useContext(GlobalContext);
    const logOut = async () => {
        try {
            // setLoading(true)
            const apiRes = await henceforthApi.Auth.logout();
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
            // setLoading(false)
        }
    }
    const items: MenuProps['items'] = [
        {
            label: <Link href={'/profile/edit'} className='fw-medium'>My Profile</Link>,
            key: '0',
        },
        {
            label: <Link href={'/earning/page/1?type=balances'} className='fw-medium'>Wallet</Link>,
            key: '1',
        },
        // {
        //     label: <Link href={'/contest/create'} className='fw-medium'>Create Contest</Link>,
        //     key: '2',
        // },
        // {
        //     label: <Link href={'/profile/drafts/page/1'} className='fw-medium'>Drafts</Link>,
        //     key: '3',
        // },
        {
            label: <Link href={`${userInfo?.is_bank_added ? '/bank-acount' : '/bank-acount/add'}`} className='fw-medium'>Bank Acount</Link>,
            key: '5',
        },
        {
            label: <button onClick={logOut} className='bg-transparent border-0 shadow-none text-danger ps-0 py-0 fw-medium'>Logout</button>,
            key: '4',
        },
    ];
    return (
        <header>
            <div className="container">
                <nav className="navbar navbar-expand-lg navbar rounded-4 px-3 px-md-5">
                    <Link href={'/?status=ONGOING&pagination=1&limit=9'}>
                        <img className='img-fluid' src={logo.src} width={141} alt="Logo" />
                    </Link>
                    {/* <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button> */}
                    <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                        {/* <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="#">Home</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Features</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#">Pricing</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                            </li>
                        </ul> */}
                    </div>
                    {/* <div className="me-3">
                        <Link href="/profile/" className='text-white'>
                            <Button className='btn-icon'>
                                Facebook
                            </Button>
                        </Link>
                    </div> */}
                    <div className="ms-3 d-flex gap-3 align-items-center ">
                        <Link href={'/contest/type/participants-form'}><Button ghost className='text-black bg-white border-0' type="primary">Contest</Button></Link>
                        <Link href={'/notification/page/1?limit=10&filter=ALL'} className='text-white h-unset'>
                            <img src={notifications.src}
                                width={48} height={48} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />
                        </Link>
                        {userInfo?.access_token ?
                            <Dropdown menu={{ items }} trigger={['click']} arrow placement='bottomRight'>
                                <a onClick={(e) => e.preventDefault()}>
                                    <Space>
                                        <img src={userInfo?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${userInfo?.profile_pic}` : profile.src}
                                            width={48} height={48} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />
                                    </Space>
                                </a>
                            </Dropdown>
                            :
                            <Link href={"/auth/signin"} className='text-white h-unset'>
                                <img src={profile.src}
                                    width={48} height={48} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />
                            </Link>}
                    </div>
                    {/* <div className="ms-3 ">
                        <Link href={userInfo?.access_token ? "/profile/participants-form" : "/auth/signin"} className='text-white h-unset'>
                            <img src={userInfo?.profile_pic ? `${henceforthApi.API_FILE_ROOT_ORIGINAL}${userInfo?.profile_pic}` : profile.src}
                                width={48} height={48} className='rounded-circle object-fit-cover border bg-light' alt="profile img" onError={(e) => { e.currentTarget.src = profile.src }} />
                        </Link>
                    </div> */}
                </nav>
            </div>
        </header>
    )
};
export default TheHeader;