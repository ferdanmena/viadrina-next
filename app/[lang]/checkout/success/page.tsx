"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { translations } from "@/lib/translations";

export default function SuccessPage() {

  const params = useParams();
  const lang = params.lang as "en" | "es";
  const t = translations[lang];

  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    if (!code) return;

    const isDev = process.env.NODE_ENV === "development";

    // DEV MOCK
    if (isDev && code === "TEST") {
      setBookingData({
        booking: {
          confirmationCode: "VIA-TEST123",
          customer: { firstName: "Fernando", lastName: "Mena" },
          activityBookings: [
            {
              activity: { title: "Free Tour de Wroclaw" },
              dateString: "Tue, February 24 2026 - 10:30 AM",
            },
          ],
        },
        travelDocuments: {},
      });
      return;
    }

    // REAL FETCH
    async function fetchBooking() {
      const res = await fetch(`/api/booking?code=${code}`);
      if (!res.ok) return;

      const data = await res.json();
      setBookingData(data);
    }

    fetchBooking();

  }, [code]);

  if (!code) {
    return <p>Invalid booking reference.</p>;
  }

  if (!bookingData) {
    return <p>{t.processing}</p>;
  }

  const booking = bookingData.booking;
  const activity = booking.activityBookings?.[0];

  return (
    <main className="success-container">

      <h1 className="success-title">{t.successTitle}</h1>
      <p className="success-message">{t.successMessage}</p>

      <div className="success-card">

        {/* IMAGE */}
        {activity.activity?.keyPhoto?.originalUrl && (
          <img
            src={activity.activity.keyPhoto.originalUrl}
            alt={activity.activity.title}
            className="success-image"
          />
        )}

        {/* TITLE */}
        <h2 className="success-tour-title">
          {activity.activity.title}
        </h2>

        {/* PARTICIPANTS */}
        <p className="success-participants">
          {activity.pricingCategoryBookings?.map((p: any) => (
            `${p.quantity} ${p.pricingCategoryTitle}`
          )).join(", ")}
        </p>

        <hr className="success-divider" />

        {/* WHEN */}
        <div className="success-section">
          <h3>{t.dateLabel}</h3>
          <p>{activity.dateString}</p>
        </div>

        <hr className="success-divider" />

        {/* MEETING POINT */}
        {activity.activity?.meetingPoint?.address && (
          <div className="success-section">
            <h3>{t.meetingPoint}</h3>
            <p>{activity.activity.meetingPoint.address}</p>

            {activity.activity.meetingPoint?.googlePlaceId && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activity.activity.meetingPoint.address
                )}`}
                target="_blank"
                className="success-map-link"
              >
                View on map
              </a>
            )}
          </div>
        )}

        <hr className="success-divider" />

        {/* PRICING BLOCK */}
        {booking.paymentType === "FREE" ? (
          <div className="success-free-note">
            {lang === "es"
              ? "Nuestros free tours no tienen precio fijo. Al finalizar la experiencia, cada persona contribuye con el importe que considere justo según su satisfacción."
              : "Our free tours have no fixed price. At the end of the experience, each participant contributes what they consider fair based on their satisfaction."}
          </div>
        ) : (
          <table className="success-table">
            <thead>
              <tr>
                <th>{t.experience}</th>
                <th>{t.unitPrice}</th>
                <th>{t.price}</th>
              </tr>
            </thead>
            <tbody>
              {booking.invoice?.productInvoices?.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.lineItems[0].unitPriceAsText}</td>
                  <td>{item.totalAsText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <hr className="success-divider" />

        {/* CONFIRMATION CODE */}
        <div className="success-reference">
          <strong>
            {lang === "es"
              ? "Referencia de reserva:"
              : "Your booking confirmation reference:"}
          </strong>
          <div className="success-code">
            {booking.confirmationCode}
          </div>
        </div>

        {/* INVOICE */}
        {bookingData.travelDocuments?.invoice && (
          <a
            className="success-invoice-link"
            href={`https://api.bokun.io${bookingData.travelDocuments.invoice}`}
            target="_blank"
          >
            {t.downloadInvoice}
          </a>
        )}

      </div>

    </main>
  );
}