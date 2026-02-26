"use client";

import Image from "next/image";

type CheckoutSummaryProps = {
  activity: any;
  booking: any;
  formattedDate: string;
  totalPassengers: number;
  preview: any | null;
  lang: "en" | "es";
};

export default function CheckoutSummary({
  activity,
  booking,
  formattedDate,
  totalPassengers,
  preview,
  lang,
}: CheckoutSummaryProps) {

  const totalAmount =
    preview?.totalPrice?.amount ?? 0;

  const currency =
    preview?.totalPrice?.currency ?? activity.currency;

  const formattedTotal = new Intl.NumberFormat(
    lang === "es" ? "es-ES" : "en-GB",
    {
      style: "currency",
      currency,
    }
  ).format(totalAmount);
  return (
    <aside className="checkout-sidebar">
      <div className="checkout-sidebar-main">
        <div className="checkout-sidebar-header">
          <Image
            src={activity.images?.[0]}
            alt={activity.title}
            width={600}
            height={400}
            className="sidebar-image"
            priority
          />
          <h2>{activity.title}</h2>
        </div>

        <div className="sidebar-meta">
          <div className="sidebar-item">
            <Image
              src="/icons/calendar.svg"
              alt="Date"
              width={18}
              height={18}
              className="sidebar-icon"
            />
            <span>{formattedDate}</span>
          </div>

          <div className="sidebar-item">
            <Image
              src="/icons/stopwatch.svg"
              alt="Time"
              width={18}
              height={18}
              className="sidebar-icon"
            />
            <span>{booking.timeLabel}</span>
          </div>

          <div className="sidebar-item">
            <Image
              src="/icons/users-group.svg"
              alt="Participants"
              width={18}
              height={18}
              className="sidebar-icon"
            />
            <span>{totalPassengers}</span>
          </div>
        </div>
      </div>

      <div className="sidebar-totals">
        <div className="sidebar-total">
          <span className="sidebar-total-label">Total</span>
          <strong>{formattedTotal}</strong>
        </div>
      </div>
    </aside>
  );
}