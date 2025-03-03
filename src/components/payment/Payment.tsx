import React from "react";

export const Payment = () => {
  const cardData = [
    {
      title: "Micro",
      price: "$19.99",
      features: ["Limited user support", "1GB storage", "Basic analytics"],
    },
    {
      title: "Small Business",
      price: "$29.99",
      features: ["Enhanced user support", "5GB storage", "Advanced analytics"],
    },
    {
      title: "Professional",
      price: "$39.99",
      features: ["24/7 customer support", "50GB storage", "Custom branding options"],
    },
    {
      title: "Enterprise",
      price: "$49.99",
      features: ["Dedicated account", "Unlimited storage", "API access"],
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-center items-center mt-12">
        <h2 className="text-3xl font-semibold">Pricing</h2>
      </div>

      <div className="flex justify-center items-center mt-6">
        We’re thrilled to have you! Complete your payment to start your
        subscription
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
            className="bg-gray-100 border-grey-200 p-6 w-64 text-center rounded-lg shadow-lg hover:scale-105 transition duration-300 mb-6 sm:mb-0"
          >
            <h2 className="text-xl font-semibold mb-6">{card.title}</h2>
            <p className="text-lg text-black font-bold mt-2">{card.price}</p>
            <p className="text-sm text-gray-600 mb-6">Benefits</p>
            <ul className="text-left mt-4 space-y-2">
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
            <button className="mt-6 w-full py-2 border border-black text-black rounded-md hover:bg-[#8751b1] hover:text-white transition duration-300">
              Proceed to Payment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
