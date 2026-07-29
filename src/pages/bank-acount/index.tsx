import ContestLayout from "@/layouts/ContestLayout";
import { Button, Col, Form, Grid, Input, Popconfirm, Row } from "antd";
import { ReactNode, useContext, useEffect, useState } from "react";
import papalImage from '@/assets/images/Paypal_2014_logo 1.png'
import stripeImage from '@/assets/images/stripe.png'
import flutterwaveImage from '@/assets/images/flutter.png'
import henceforthApi from "@/utils/henceforthApi";
import henceforthValidations from "@/utils/henceforthValidations";
import { GlobalContext } from "@/context/Provider";
import { useRouter } from "next/router";
const BankAccount = () => {
    const [bankData, setBankData] = useState({} as any)
    const screens = Grid.useBreakpoint()
    const router = useRouter()
    const { userInfo, setUserInfo, Toast } = useContext(GlobalContext)
    const getBankAcount = async () => {
        try {
            const apiRes = await henceforthApi.BankAccount.getBankAccount()
            console.log(apiRes)
            setBankData(apiRes?.data)
        } catch (error) {

        }
    }
    const deleteBanckAccount = async () => {
        try {
            const apiRes = await henceforthApi.BankAccount.deleteBankaccount(bankData?._id)
            setUserInfo({ ...userInfo, is_bank_added: false })
            router.replace(`/bank-acount/add`)
            Toast.success(apiRes.message)
        } catch (error) {
            Toast.error(error)
        }
    }
    useEffect(() => {
        getBankAcount()
    }, [])
    return (
        <>
            <Row className="py-4 py-md-5">
                <Col span={24}>
                    {/* <WrapperElement noPadding> */}
                    <div className=''>
                        <h3 className='fw-bold  text-black'>Bank Acount</h3>
                        {/* <Typography.Text className="fs-18 fw-normal text-black"></Typography.Text> */}
                    </div>
                    <div className="mt-3">
                        <Row gutter={[24, 12]}>
                            <Col span={24} className="" >
                               {!userInfo?.is_bank_added &&  <label className='fw-semibold text-black primary-font-size'>Enter the account where you would like to receive your money</label>}
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="radio-bank">
                                        {bankData?.account_type == 'PAYPAL' && <img className="mr-3" src={papalImage.src} alt="" />}
                                        {bankData?.account_type == 'STRIPE' && <img className="mr-3" src={stripeImage.src} alt="" />}
                                        {bankData?.account_type == 'FLUTTER_WAVE' && <img className="mr-3" src={flutterwaveImage.src} alt="" />}
                                    </div>
                                    <div>
                                        <Popconfirm
                                            title="Delete"
                                            description="Are you sure you want to delete this account ?"
                                            onConfirm={() => deleteBanckAccount()}
                                            okButtonProps={{ danger: true }}
                                            okText="yes"
                                        >
                                            <Button type="primary" danger ghost >Delete Account</Button>
                                        </Popconfirm>
                                    </div>
                                </div>
                            </Col>
                            <Col span={24} className="" >
                                {/* <label className='fw-semibold text-black primary-font-size'>Enter your email</label> */}
                                <div className="radio-bank mt-2">
                                    <div className="d-flex justify-content-between mb-2">
                                        {bankData?.account_type == 'STRIPE' &&
                                            <ul className="list-unstyled mb-0 w-100">
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Account Holder Name'}</p>
                                                    <p className="fw-bold text-black w-50">{bankData?.stripe_data?.account_holder_name || 'N/A'}</p>
                                                </li>
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Account Type'}</p>
                                                    <p className="fw-bold text-black w-50">{bankData?.account_type}</p>
                                                </li>
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Bank Account Number'}</p>
                                                    <p className="fw-bold text-black w-50">{`********` + bankData?.bank_account_no}</p>
                                                </li>
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Routing Number'}</p>
                                                    <p className="fw-bold text-black w-50">{bankData?.routing_number}</p>
                                                </li>
                                                {/* <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Bank Account'}</p>
                                                    <p className="fw-bold text-black w-50">{bankAccounts?.account_id}</p>
                                                </li> */}
                                            </ul>}
                                        {bankData?.account_type == 'PAYPAL' && <ul className="list-unstyled mb-0 w-100">
                                            <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Account Type'}</p>
                                                <p className="fw-bold text-black w-50">{bankData?.account_type}</p>
                                            </li>
                                            <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Paypal Email'}</p>
                                                <p className="fw-bold text-black w-50">{bankData?.paypal_email}</p>
                                            </li>
                                        </ul>}
                                        {bankData?.account_type == 'FLUTTER_WAVE' &&
                                            <ul className="list-unstyled mb-0 w-100">
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Account Type'}</p>
                                                    <p className="fw-bold text-black w-50">{henceforthValidations.remUndrscore(bankData?.account_type).toUpperCase()}</p>
                                                </li>
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Bank Code'}</p>
                                                    <p className="fw-bold text-black w-50">{bankData?.account_bank}</p>
                                                </li>
                                                <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Bank Account Number'}</p>
                                                    <p className="fw-bold text-black w-50">{bankData?.account_number}</p>
                                                </li>

                                                {/* <li className="fs-14 mb-3 w-100 fw-400 d-flex align-items-center gap-4">
                                                    <p className={screens.sm ? "w-25 text-secondary text-nowrap" : "w-50 text-secondary text-nowrap"}>{'Bank Account'}</p>
                                                    <p className="fw-bold text-black w-50">{bankAccounts?.account_id}</p>
                                                </li> */}
                                            </ul>}

                                        {/* {<Button type="link" className="p-0 h-100"><Icons.DeleteBg /></Button>} */}
                                    </div>
                                </div>
                            </Col>

                        </Row>
                    </div>
                </Col>
            </Row>
        </>
    )
}
BankAccount.getLayout = (page: ReactNode) => (
    <ContestLayout>
        {page}
    </ContestLayout>
);

export default BankAccount;