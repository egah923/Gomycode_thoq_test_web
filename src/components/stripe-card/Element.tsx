// import { GlobleContextProviderProps } from "src/context/actionTypes";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import CheckoutForm from './CheckoutForm';
import { STRIPE_ACCESS_KEY } from '@/utils/henceforthApi';
import { Form, Input } from 'antd';
import henceforthValidations from '@/utils/henceforthValidations';
import { useState } from 'react';

const StripeElement = (props: any) => {

    console.log(props,"props______");
    
    const router = useRouter();
    const stripePromise = loadStripe(STRIPE_ACCESS_KEY as string);
    const clientSecret = router.query.secret_key as string
    // const clientSecret="sk_test_51PVTWGLm6Rm6iAlZHXxItSJN0dOEfKu0W9kA5OHMoFCwGvazLOTsCaQc9eeDwQaaaMieM0cJV4BF3XoR6MvYVUUF00CGosSHA8"

    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const value = e.target.value;
        setName(value);

        if (!value) {
            setError('Please enter the full name');
        } else if (!henceforthValidations.nameValidation(value)) {
            setError('Name should conatins alphabets only. for eg - John Doe');
        } else {
            setError('');
        }
    };
    const [brand,setBrand]=useState<any>()
    const handleCardChange = (event) => {
        if (event.brand) {
            setBrand(event.brand);
        }
    };
    console.log(brand,"brand")

    return (
        <>
            {clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <div className='mb-2 light_theme_form'>
                        <Input
                            type='text'
                            size='large'
                            className='bg-transparent ps-0'
                            placeholder='Name on Card'
                            value={name}
                            onChange={handleChange}
                        />
                        {error && <div style={{ color: 'red' }}>{error}</div>}
                    </div>

                    <CheckoutForm onChange={handleCardChange} showModalSuccess={props?.showModalSuccess} closeAllModal={props?.closeAllModal} {...props} cost_per_vote={props?.cost_per_vote} contest_id={props?.contest_id}/>
                </Elements>
            )}
        </>

    );
};

export default StripeElement