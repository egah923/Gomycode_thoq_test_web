import {
    CardElement,
    useStripe,
    useElements,
    Elements,
    PaymentElement
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import React, { use, useContext, useEffect, useRef, useState } from "react";
import dayjs from 'dayjs'
import { GlobalContext } from "@/context/Provider";
import henceforthApi from "@/utils/henceforthApi";
import { Button, Col, Form, Row } from "antd";
// import WhiteSmoolLock from "@/assets/images/whitelock.png";
// import HenceforthIcon from "@/components/HenceforthIcon";
import Link from "next/link";


const baseStripeElementOptions = {
    style: {
        base: {
            fontFamily: 'Oxanium',
            fontSize: '16px',
            color: '#000000',
            '::placeholder': {
                color: '#000000',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    }
}
const CheckoutForm = (props: any) => {
    const [message, setMessage] = useState(null) as any;
    const router = useRouter();
    const stripe = useStripe();
    const { Toast } = useContext(GlobalContext)
    const elements: any = useElements();
    const [form] = Form.useForm();
    const amountRef = useRef<any>()
    const [stripeLoading, setStripeLoading] = useState(false);
    console.log(props, "props__________");


    const handleSubmit = async (values: any) => {
        debugger
        try {
            setStripeLoading(true)
            if (!stripe || !elements) {
                console.log('not loaded');
                return;
            }
            const { error } = await stripe?.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href,
                },
            });
            if (error) {
                Toast.error(error?.message)
                props.closeAllModal()
                setStripeLoading(false);
                return router.replace({
                    pathname: `/contest/${props?.contest_id}/details`
                })

            }


        } catch (error) {
            // handleError(error)
            setStripeLoading(false)
            router.replace({
                pathname: `/contest/${props?.contest_id}/details`
            })

        }
        // finally {
        //     setStripeLoading(false);

        // }
    }

    const onFinishFailed = (values: any) => {
        console.log('onFinishFailed:', values);
    }

    useEffect(() => {
        if (!stripe) {
            return;
        }
        const clientSecret = new URLSearchParams(window.location.search).get(
            'payment_intent_client_secret'
        );
        if (!clientSecret) {
            return;
        }
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case 'succeeded':
                    setMessage('Payment succeeded!');

                    break;
                case 'processing':
                    setMessage('Your payment is processing.');
                    break;
                case 'requires_payment_method':
                    setMessage('Your payment was not successful, please try again.');
                    break;
                default:
                    setMessage('Something went wrong.');
                    break;
            }
        });
    }, [stripe]);
    useEffect(() => {

    })


    function CancelPayment() {
        router.replace({
            pathname: `/contest/${props?.contest_id}/details`
        }, undefined, { shallow: true, scroll: false })
        props.closeAllModal()
    }
    return (
        <>
            <Form form={form} onFinish={handleSubmit} onFinishFailed={onFinishFailed} size='large' layout='vertical'>
                <Row gutter={[15, 10]} className='mt-4'>
                    <Col span={24}>
                        <PaymentElement id="payment-element" />
                    </Col>
                    <Col span={24}>
                        <div className='pt-4 '>
                            <Button loading={stripeLoading} className="px-4 d-flex align-items-center justify-content-center" block type='primary' size="large" htmlType="submit" >
                                Pay ${Number(props?.cost_per_vote)}</Button>


                        </div>
                        <div className="mt-3">
                            <Button type="primary" danger className="text-white fw-semibold" onClick={CancelPayment} block>Cancel</Button>
                        </div>
                    </Col>
                </Row>
            </Form>

        </>
    );
};

export default CheckoutForm;