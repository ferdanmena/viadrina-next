"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { translations } from "@/lib/translations";
import StripeWrapper from "@/components/StripeWrapper";

type BookingData = {
  activityId: string;
  rateId: number;
  date: string;
  startTimeId: number;
  duration?: string;
  timeLabel?: string;
  passengers: {
    pricingCategoryId: number;
    quantity: number;
    price?: number;
  }[];
  title?: string;
  image?: string;
  city?: string;
  currency?: string;
};

export default function CheckoutPage() {
  const params = useParams();
  const langParam = params.lang as string;

  const safeLang: "en" | "es" =
    langParam === "es" ? "es" : "en";

  const t = translations[safeLang];

  const [activeStep, setActiveStep] = useState<number>(1);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionsData, setQuestionsData] = useState<any | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [cartSessionId, setCartSessionId] = useState<string | null>(null);
  const [contact, setContact] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });


  const [stripeData, setStripeData] = useState<{
    sessionId: string;
    uti: string;
    publicKey: string;
    checkoutOption: string;
  } | null>(null);


  async function handlePay() {
    if (
      !contact.firstName ||
      !contact.lastName ||
      !contact.email ||
      !contact.phone
    ) {
      alert("Complete all required fields");
      return;
    }

    setLoading(true);

    const sessionId = crypto.randomUUID();
    setCartSessionId(sessionId);

    // 1 Add to cart
    const addRes = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        booking,
        lang: safeLang,
      }),
    });

    if (!addRes.ok) {
      alert("Cart error");
      setLoading(false);
      return;
    }

    // 2 Fetch questions
    const questionsRes = await fetch("/api/cart/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });

    if (!questionsRes.ok) {
      alert("Failed to fetch questions");
      setLoading(false);
      return;
    }

    const questions = await questionsRes.json();

    const hasRequired =
      questions?.activityBookings?.some((b: any) =>
        b.questions?.some((q: any) => q.required)
      );

    const hasPassengerRequired =
      questions?.activityBookings?.some((b: any) =>
        b.passengers?.some((p: any) =>
          p.passengerDetails?.some((d: any) => d.required)
        )
      );

    const hasQuestions = hasRequired || hasPassengerRequired;

    if (hasQuestions) {
      setQuestionsData(questions);
      setActiveStep(2);
      setLoading(false);
      return;
    }

    // 3 Continue to payment
    await continueToPayment(sessionId);
    setActiveStep(2);
  }

  async function continueToPayment(sessionId: string) {

    const optionsRes = await fetch("/api/cart/checkout-options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, lang: safeLang }),
    });

    if (!optionsRes.ok) {
      alert("Checkout options error");
      setLoading(false);
      return;
    }

    const optionsData = await optionsRes.json();
    const selectedOption = optionsData.options?.[0];

    if (!selectedOption) {
      alert("No checkout option available");
      setLoading(false);
      return;
    }

    const uti = selectedOption.paymentMethods?.cardProvider?.uti;
    const publicKey =
      selectedOption.paymentMethods?.cardProvider?.clientPaymentParameters
        ?.publicKey;

    if (!uti || !publicKey) {
      alert("Stripe configuration error");
      setLoading(false);
      return;
    }

    setStripeData({
      sessionId,
      uti,
      publicKey,
      checkoutOption: selectedOption.type,
    });

    setLoading(false);
  }

  async function submitAnswers() {
    if (!cartSessionId) {
      alert("Session expired. Please restart checkout.");
      return;
    }

    const res = await fetch("/api/cart/answers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: cartSessionId,
        answers: questionAnswers,
        contact,
      }),
    });

    if (!res.ok) {
      alert("Failed to submit answers");
      return;
    }

    await continueToPayment(cartSessionId);
    setActiveStep(3);
  }

  useEffect(() => {
    const stored = sessionStorage.getItem("pendingBooking");

    if (stored) {
      setBooking(JSON.parse(stored));
    }
  }, []);

  if (!booking) return <p>Loading...</p>;

  const total = booking.passengers.reduce((sum, p) => {
    return sum + (p.price ?? 0) * p.quantity;
  }, 0);

  const totalPassengers = booking.passengers.reduce(
    (sum, p) => sum + p.quantity,
    0
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      safeLang === "es" ? "es-ES" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  }

  function validateQuestions() {
    const booking = questionsData?.activityBookings?.[0];
    if (!booking) return true;

    // Validate activity questions
    for (const q of booking.questions || []) {
      if (q.required && !questionAnswers[q.questionId]) {
        alert("Please complete all required fields");
        return false;
      }
    }

    // Validate passenger details
    for (const p of booking.passengers || []) {
      for (const detail of p.passengerDetails || []) {
        const key = `${p.bookingId}_${detail.questionId}`;
        if (detail.required && !questionAnswers[key]) {
          alert("Please complete all passenger details");
          return false;
        }
      }
    }

    return true;
  }

  const hasQuestions =
  questionsData?.activityBookings?.some((b: any) =>
    (b.questions && b.questions.length > 0) ||
    (b.passengers &&
      b.passengers.some((p: any) =>
        p.passengerDetails && p.passengerDetails.length > 0
      ))
  ) ?? false;

  console.log("BOOKING SIDEBAR:", booking);

  const activityTitle =
  booking.title ||
  questionsData?.activityBookings?.[0]?.activityTitle ||
  "";

  return (
    <main className="checkout-container">
      {/* LEFT COLUMN */}
      <div>

        {/* mainContact */}
        <div className={`checkout-step ${activeStep === 1 ? "active" : "completed collapsed"}`}>
          <div
            className="step-header"
            onClick={() => setActiveStep(1)}
            style={{ cursor: "pointer" }}
          >
            <span>1</span>
            <h2>{t.contactDetails}</h2>
          </div>

          <div className="step-content form-container">

            <div className="form-row">
              <div className="field">
                <label>{t.firstName}<span className="required">*</span></label>
                <input
                  value={contact.firstName}
                  placeholder={t.phcontactName}
                  onChange={(e) =>
                    setContact({ ...contact, firstName: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>{t.lastName}<span className="required">*</span></label>
                <input
                  placeholder={t.phLastName}
                  value={contact.lastName}
                  onChange={(e) =>
                    setContact({ ...contact, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>{t.email}<span className="required">*</span></label>
                <input
                  type="email"
                  placeholder={t.phEmail}
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label>{t.phone}<span className="required">*</span></label>
                <input
                  placeholder={t.phPhone}
                  value={contact.phone}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      phone: e.target.value.startsWith("+")
                        ? e.target.value
                        : `+48${e.target.value}`,
                    })
                  }
                />
              </div>
            </div>

            {!stripeData && (
            <button className="btn-primary"
              disabled={loading}
              onClick={handlePay}
            >
              {loading ? "Processing..." : "Continue to payment"}
            </button>
          )}

          </div>

        </div>

        {/* Questions */}
        {hasQuestions && (
          <div
            className={`checkout-step ${activeStep === 2 ? "active" : "collapsed"
              }`}
          >
            <div className="step-header"
              onClick={() => setActiveStep(2)}
              style={{ cursor: "pointer" }}
            >
              <span>2</span>
              <h2>Additional information</h2>
            </div>

            <div className="step-content">

              {/* ACTIVITY LEVEL QUESTIONS */}
              {questionsData?.activityBookings?.[0]?.questions?.map((q: any) => (
                <div key={q.questionId} className="field">
                  <label>
                    {q.label}
                    {q.required && <span className="required">*</span>}
                  </label>

                  <input
                    value={questionAnswers[q.questionId] || ""}
                    className="checkout-input"
                    onChange={(e) =>
                      setQuestionAnswers(prev => ({
                        ...prev,
                        [q.questionId]: e.target.value
                      }))
                    }
                  />
                </div>
              ))}

              {/* Passengers */}
              {questionsData?.activityBookings?.[0]?.passengers?.map(
                (p: any, index: number) => (
                  <div key={p.bookingId} className="passenger-block">
                    <h4>Passenger {index + 1}</h4>

                    {p.passengerDetails?.map((detail: any) => (
                      <div key={detail.questionId} className="passenger-field">
                        <label>
                          {detail.label}
                          {detail.required && (
                            <span className="required">*</span>
                          )}
                        </label>

                        <input
                          type="text"
                          placeholder={
                            detail.questionId === "firstName"
                              ? "First name"
                              : detail.questionId === "lastName"
                                ? "Last name"
                                : detail.label
                          }
                          className="checkout-input"
                          value={
                            questionAnswers[
                            `${p.bookingId}_${detail.questionId}`
                            ] || ""
                          }
                          onChange={(e) =>
                            setQuestionAnswers((prev) => ({
                              ...prev,
                              [`${p.bookingId}_${detail.questionId}`]:
                                e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                )
              )}

              <button
                className="btn-primary"
                onClick={() => {
                  if (!validateQuestions()) return;
                  submitAnswers();
                }}
              >
                Continue to payment
              </button>
            </div>
        </div>
        )}
        
        {/* Payment */}
        <div className={`checkout-step ${activeStep === (hasQuestions ? 3 : 2) ? "active" : "collapsed"}`}>
          <div className="step-header"
            onClick={() => {
              if (stripeData) {
                setActiveStep(3);
              }
            }}
            style={{ cursor: stripeData ? "pointer" : "default" }}
          >
           <span>{hasQuestions ? 3 : 2}</span>
            <h2>Payment</h2>
          </div>

          <div className="step-content">
            {!stripeData ? (
              <p className="checkout-description">
                Complete your contact details to continue to payment.
              </p>
            ) : (
              <StripeWrapper
                publicKey={stripeData.publicKey}
                uti={stripeData.uti}
                sessionId={stripeData.sessionId}
                checkoutOption={stripeData.checkoutOption}
                lang={safeLang}
                customer={contact}
              />
            )}
          </div>
        </div>

      </div>
      {/* RIGHT COLUMN */}
      <aside className="checkout-sidebar">
        

        {/* IMAGE + TITLE */}
        <div className="checkout-sidebar-header">
          {booking.image && (
            <img src={booking.image} alt={booking.title} />
          )}

          <div className="sidebar-meta">
            <h2>{activityTitle}</h2>
            <span>{booking.city}</span>
          </div>
        </div>

        {/* DATE */}
        <div className="sidebar-item">
          <span>{t.date}</span>
          <span>{formatDate(booking.date)}</span>
        </div>

        {/* TIME */}
        <div className="sidebar-item">
          <span>{t.time}</span>
          <span>{booking.timeLabel}</span>
        </div>

        {/* DURATION */}
        {booking.duration && (
          <div className="sidebar-item">
            <span>Duration</span>
            <span>{booking.duration}</span>
          </div>
        )}

        {/* PASSENGERS */}
        <div className="sidebar-item">
          <span>{t.participants}</span>
          <span>{totalPassengers}</span>
        </div>

        {/* TOTAL */}
        <div className="sidebar-total">
          <span className="sidebar-total-label">
            {t.total}
          </span>

          <span>
            {total > 0
              ? `${total.toFixed(2)} ${booking.currency ?? ""}`
              : t.willBeConfirmed}
          </span>
        </div>

      </aside>
    </main>
  );
}