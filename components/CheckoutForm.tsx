"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

interface Props {
  uti: string;
  sessionId: string;
  checkoutOption: string;
  lang: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export default function CheckoutForm({
  uti,
  sessionId,
  checkoutOption,
  lang,
  customer,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!accepted) return;
    if (!stripe || !elements) return;

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setLoading(false);
      return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error || !paymentMethod) {
      console.error(error);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        customer,
        checkoutOption,
        paymentToken: paymentMethod.id,
        lang,
      }),
    });

    const data = await res.json();

    if (data.success) {
      window.location.href = `/${lang}/checkout/success`;
    } else {
      console.error(data.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />

      <label className="checkout-terms">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        I accept the Terms and Conditions
      </label>

      <button
        className="btn-primary"
        disabled={loading || !accepted}
      >
        {loading ? "Processing..." : "Pay now"}
      </button>
    </form>
  );
}