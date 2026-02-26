"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

interface Props {
  publicKey: string;
  uti: string;
  sessionId: string;
  checkoutOption: string;
  lang: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
  };
}

export default function StripeWrapper({
  publicKey,
  uti,
  sessionId,
  checkoutOption,
  lang,
  customer,
}: Props) {
  const stripePromise = loadStripe(publicKey);

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        uti={uti}
        sessionId={sessionId}
        checkoutOption={checkoutOption}
        lang={lang}
        customer={customer}
      />
    </Elements>
  );
}