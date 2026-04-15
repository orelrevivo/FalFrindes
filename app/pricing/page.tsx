"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";

const plans = [
  {
    name: "Free",
    price: "0",
    credits: "0.20",
    balanceAmount: 20,
    period: "forever",
    description: "Try it out",
    features: ["20 messages", "Basic AI chat", "View creators"],
    cta: "Current Plan",
    popular: false,
  },
  {
    name: "Standard",
    price: "20",
    credits: "2000",
    balanceAmount: 2000,
    period: "one-time",
    description: "For active fans",
    features: ["2000 credits", "Unlimited AI chat", "Analytics"],
    cta: "Upgrade",
    popular: true,
  },
  {
    name: "Pro",
    price: "50",
    credits: "5000",
    balanceAmount: 5000,
    period: "one-time",
    description: "Super fan",
    features: ["5000 credits", "Priority support", "Early features"],
    cta: "Upgrade",
    popular: false,
  },
];

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

function PricingContent() {
  const [subscriptionTier, setSubscriptionTier] = useState("free");
  const [credits, setCredits] = useState("0.20");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits || "0.20");
        setSubscriptionTier((data.subscriptionTier || "free").toLowerCase());
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const onApprove = async (data: any, actions: any, amount: number, plan: string) => {
    const details = await actions.order.capture();

    await fetch("/api/user/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: details.id,
        amount,
        tier: plan.toLowerCase(),
      }),
    });

    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

return (
    <div 
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* TITLE */}
      <div className="text-center mt-10 mb-6">
        <h1 className="text-2xl font-semibold">Pricing</h1>
        <p className="text-sm text-gray-500">
          Start for free. Upgrade as you go.
        </p>
      </div>

      {/* CARDS */}
      <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4 px-4">
        {plans.map((plan) => {
          const isCurrent =
            (subscriptionTier === "free" && plan.name === "Free") ||
            subscriptionTier === plan.name.toLowerCase();

          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-xl border p-4 text-sm ${plan.popular ? "border-blue-500 shadow-sm" : "border-gray-200"
                }`}
            >
              {/* POPULAR */}
              {plan.popular && (
                <span className="absolute top-2 right-2 text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                  POPULAR
                </span>
              )}

              <h2 className="font-medium">{plan.name}</h2>
              <p className="text-xs text-gray-500 mb-2">
                {plan.description}
              </p>

              <div className="mb-2">
                <span className="text-2xl font-semibold">${plan.price}</span>
                <span className="text-xs text-gray-500">
                  {" "}
                  / {plan.period}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-3">
                {plan.credits} credits
              </p>

              <ul className="space-y-1 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-xs text-gray-600">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <button className="w-full text-xs py-1.5 rounded-md bg-gray-100 text-gray-400">
                  {plan.cta}
                </button>
              ) : plan.name === "Free" ? (
                <button className="w-full text-xs py-1.5 rounded-md bg-gray-100 text-gray-400">
                  Free
                </button>
              ) : (
                <div className="">
                  <PayPalButtons
                    style={{ layout: "vertical", height: 35 }}
                    createOrder={(_, actions) =>
                      actions.order.create({
                        intent: "CAPTURE",
                        purchase_units: [
                          {
                            amount: {
                              value: plan.price,
                              currency_code: "USD",
                            },
                          },
                        ],
                      })
                    }
                    onApprove={(data, actions) =>
                      onApprove(data, actions, plan.balanceAmount, plan.name)
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FOOTER */}
      <div className="text-center mt-8 text-xs text-gray-500">
        Each message costs ~0.01 credits
      </div>
    </div>
  );
}

export default function PricingPage() {
  if (!clientId) {
    return <div className="p-10 text-center">PayPal not configured</div>;
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
      }}
    >
      <PricingContent />
    </PayPalScriptProvider>
  );
}