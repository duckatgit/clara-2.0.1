import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const PaymentSuccess = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login page');
      router.push('/login');
    } else {
      console.log('User found:', user);
      // Handle successful payment logic here
    }
  }, [user, router]);

  return (
    <div>
      <h1>Payment Successful</h1>
      {user && <p>Thank you for your payment, {user.email}!</p>}
    </div>
  );
};

export default PaymentSuccess;