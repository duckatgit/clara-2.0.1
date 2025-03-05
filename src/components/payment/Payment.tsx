import { loadStripe } from "@stripe/stripe-js";
import { api } from '../../lib/supabase';
import { useAuth } from "@/contexts/AuthContext";
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const Payment = () => {
  const { user } = useAuth();

  const cardData = [
    {
      title: "Free Plan",
      price: "$0",
      features: [
        "20 text messages per day",
        "One-time personality test",
        "No voice chat",
      ],
      priceId: "price_free_plan",
    },
    {
      title: "Premium Plan",
      price: "$29/month",
      features: [
        "Unlimited text messages",
        "Unlimited personality tests",
        "60 minutes of voice chat per month",
      ],
      priceId: "premium",
    },
    {
      title: "Pro Plan",
      price: "$49/month",
      features: [
        "Unlimited text messages",
        "Unlimited personality tests",
        "180 minutes of voice chat per month",
        "Priority customer support",
      ],
      priceId: "pro",
    },
  ];

  const handlePayment = async (priceId: string, userId: string | undefined) => {
    try {
      if (!userId) {
        throw new Error("User ID is undefined");
      }
      console.log("User ID", userId);

      const sessionId = await api.createCheckoutSession(priceId, userId);

      const stripe = await stripePromise;
      console.log("Stripe", sessionId);
      if (stripe) {
        console.log("Redirecting to Stripe checkout");
        const { error } = await stripe.redirectToCheckout({
          sessionId,
        });
        console.log("Stripe checkout error", error);
        if (error) {  
          console.error("Stripe checkout error", error);
        } else {
          console.log("Payment successful", userId);
          // Store payment data in Supabase after successful payment
          await api.storePaymentData({
            userId,
            stripePaymentIntentId: sessionId,
            amount: priceId === "premium" ? 2900 : priceId === "pro" ? 4900 : 0,
            status: "completed",
          });
          
        }
      } else {
        console.error("Stripe is not loaded properly");
      }
    } catch (err) {
      console.error("Error initiating payment", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-center items-center mt-12">
        <h2 className="text-3xl font-semibold">Pricing</h2>
      </div>

      <div className="flex justify-center items-center mt-6">
        We’re thrilled to have you! Complete your payment to start your subscription
      </div>

      <div className="flex justify-center items-center space-x-4 mt-6 mb-6">
        <button className="py-3 px-6 bg-gray-200 text-xs font-semibold border border-black text-black rounded-md hover:bg-[#8751b1] hover:text-white transition duration-300">
          MONTHLY
        </button>
        <button className="py-3 px-6 bg-gray-200 text-xs font-semibold border border-black text-black rounded-md hover:bg-[#8751b1] hover:text-white transition duration-300">
          ANNUALLY
        </button>
      </div>

      <div className="flex justify-center items-center space-x-6 mt-8 flex-wrap sm:flex-nowrap">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="bg-gray-100 border-grey-200 p-6 w-64 text-center rounded-lg shadow-lg hover:scale-105 transition duration-300 mb-6 sm:mb-0 flex flex-col justify-between"
            style={{ minHeight: "400px" }}
          >
            <h2 className="text-xl font-semibold mb-6">{card.title}</h2>
            <p className="text-lg text-black font-bold mt-2">{card.price}</p>
            <p className="text-sm text-gray-600 mb-6">Benefits</p>
            <ul className="text-left mt-4 space-y-2 flex-grow">
              {card.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center">
                  <svg
                    className="w-4 h-4 text-green-500 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className="mt-6 w-full py-2 border border-black text-black rounded-md hover:bg-[#8751b1] hover:text-white transition duration-300"
              onClick={() => handlePayment(card.priceId, user?.id)}
            >
              Proceed to Payment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};