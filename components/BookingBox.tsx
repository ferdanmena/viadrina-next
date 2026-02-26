"use client";

import { useState, useEffect } from "react";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
  price: number;
  currency: string;
  lang: "es" | "en";
  tourId: string;
  title: string;
  image: string;
  duration: string;
  city: string;
};

type Timeslot = {
  startTimeId: number;
  time: string;
  rateId: number;
  minParticipants: number;
};

export default function BookingBox({
  price,
  currency,
  lang,
  tourId,
  title,
  image,
  duration,
  city,
}: Props) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [minPeople, setMinPeople] = useState<number>(1);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [mode, setMode] = useState<"calendar" | "range" | "none">("none");
  const [range, setRange] = useState<{ from: Date; to: Date } | null>(null);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [hasFetchedTimes, setHasFetchedTimes] = useState(false);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [selectedTime, setSelectedTime] =
    useState<number | null>(null);
  const router = useRouter();


  const t = translations[lang];

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let existing = sessionStorage.getItem("bokunSessionId");

    if (!existing) {
      existing = crypto.randomUUID();
      sessionStorage.setItem("bokunSessionId", existing);
    }

    setSessionId(existing);
  }, []);

  useEffect(() => {
    async function fetchAvailability() {
      const res = await fetch(
        `/api/availability/${tourId}?lang=${lang}`
      );

      const data = await res.json();

      if (data.mode === "calendar") {
        setMode("calendar");
        setAvailableDates(data.availableDates);
      }

      if (data.mode === "range") {
        setMode("range");
        setRange({
          from: new Date(data.range.from),
          to: new Date(data.range.to),
        });
      }

    }

    fetchAvailability();
  }, [tourId, lang]);

  useEffect(() => {
    async function fetchPricing() {
      const res = await fetch(`/api/pricing/${tourId}`);
      const data = await res.json();

      setCategories(data);

      const initial: Record<number, number> = {};
      data.forEach((c: any) => {
        initial[c.pricingCategoryId] = 0;
      });

      setQuantities(initial);
    }

    fetchPricing();
  }, [tourId]);

  useEffect(() => {
    if (!selectedTime) return;

    const selectedSlot = timeslots.find(
      (slot) => slot.startTimeId === selectedTime
    );

    if (selectedSlot?.minParticipants) {
      setMinPeople(selectedSlot.minParticipants);
    }
  }, [selectedTime, timeslots]);

  useEffect(() => {
    if (!date) return;

    const selectedDate = date;
    let cancelled = false;

    async function fetchTimes() {
      setLoadingTimes(true);
      setHasFetchedTimes(false);

      const formatted = [
        selectedDate.getFullYear(),
        String(selectedDate.getMonth() + 1).padStart(2, "0"),
        String(selectedDate.getDate()).padStart(2, "0"),
      ].join("-");

      const res = await fetch(
        `/api/timeslots/${tourId}?date=${formatted}&lang=${lang}`
      );

      if (!cancelled) {
        if (res.ok) {
          const data: Timeslot[] = await res.json();
          setTimeslots(data);
        } else {
          setTimeslots([]);
        }

        setHasFetchedTimes(true);
        setLoadingTimes(false);
      }
    }

    fetchTimes();

    return () => {
      cancelled = true;
    };
  }, [date, tourId, lang]);

  const total = categories.reduce(
    (sum, cat) =>
      sum + (quantities[cat.pricingCategoryId] || 0) * cat.price,
    0
  );

  const locale = lang === "es" ? "es-ES" : "en-GB";

  const formattedPrice = formatCurrency(price, currency, locale);
  const formattedTotal = formatCurrency(total, currency, locale);

  let disabledDays: any[] = [{ before: new Date() }];

  if (mode === "calendar") {
    disabledDays.push((day: Date) => {
      const dayString =
        day.getFullYear() +
        "-" +
        String(day.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(day.getDate()).padStart(2, "0");

      return !availableDates.includes(dayString);
    });
  }

  if (mode === "range" && range) {
    disabledDays.push({
      before: range.from,
      after: range.to,
    });
  }

  const totalPassengers = Object.values(quantities)
    .reduce((sum, q) => sum + q, 0);

  const belowMinimum =
    minPeople > 1 &&
    totalPassengers > 0 &&
    totalPassengers < minPeople;

  // Checkout
  function handleCheckout() {
    if (!date) return;

    const formattedDate = date.toISOString().split("T")[0];

    const passengers = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        pricingCategoryId: Number(id),
        quantity: qty,
      }));

    const selectedSlot = timeslots.find(
      (slot) => slot.startTimeId === selectedTime
    );

    if (!selectedSlot?.rateId) {
      alert("Invalid rate");
      return;
    }

    const pricingBreakdown = categories
      .filter((cat) => quantities[cat.pricingCategoryId] > 0)
      .map((cat) => ({
        pricingCategoryId: cat.pricingCategoryId,
        title: cat.title,
        quantity: quantities[cat.pricingCategoryId],
        unitPrice: cat.price,
        total: quantities[cat.pricingCategoryId] * cat.price,
      }));

    const payload = {
      sessionId,
      activityId: tourId,
      rateId: selectedSlot.rateId,
      date: formattedDate,
      startTimeId: selectedSlot.startTimeId,
      timeLabel: selectedSlot.time,
      passengers,
      lang,

      // UI snapshot
      title,
      image,
      duration,
      city,
      currency,

      totalPrice: total,
      pricingBreakdown,
    };

    sessionStorage.setItem(
      "pendingBooking",
      JSON.stringify(payload)
    );

    router.push(`/${lang}/checkout`);
  }

  return (
    <div className="booking-box">

      <div className="booking-price">
        {t.from} {formattedPrice}
        <span className="booking-per-person">
          {t.perPerson}
        </span>
      </div>

      {/* Date */}
      <div className="booking-field">
        <label>{t.date}</label>
        <div className="calendar-wrapper">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabledDays}
          />
        </div>

        {date && hasFetchedTimes && !loadingTimes && timeslots.length === 0 && (
          <div className="booking-warning">
            {t.noAvailabilityForDate}
          </div>
        )}

      </div>

      {/* Time */}
      {timeslots.length > 0 && (
        <div className="booking-field">
          <label>{t.time}</label>
          <select
            className="booking-select"
            value={selectedTime ?? ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = e.target.value;
              setSelectedTime(value ? Number(value) : null);
            }}
          >
            <option value="">{t.selectTime}</option>

            {timeslots.map((slot) => (
              <option
                key={slot.startTimeId}
                value={slot.startTimeId}
              >
                {slot.time}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Participants */}
      <div className="booking-field">
        <label>{t.participants}</label>

        {categories.map((cat) => (
          <div
            key={cat.pricingCategoryId}
            className="participant-row"
          >
            <span>{cat.title}</span>

            <div className="participants-control">
              <button
                type="button"
                onClick={() =>
                  setQuantities((prev) => {
                    const current =
                      prev[cat.pricingCategoryId] || 0;

                    return {
                      ...prev,
                      [cat.pricingCategoryId]: Math.max(
                        0,
                        current - 1
                      ),
                    };
                  })
                }
              >
                −
              </button>

              <span>
                {quantities[cat.pricingCategoryId] || 0}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantities((prev) => {
                    const current =
                      prev[cat.pricingCategoryId] || 0;

                    return {
                      ...prev,
                      [cat.pricingCategoryId]: current + 1,
                    };
                  })
                }
              >
                +
              </button>
            </div>
          </div>
        ))}

      </div>

      {/* Summary */}
      <div className="booking-summary">
        <div>{t.total}:</div>
        <div className="booking-total">
          {formattedTotal}
        </div>
      </div>

      {belowMinimum && (
        <div className="booking-warning">
          {t.minimumParticipantsWarning
            .replace("{min}", String(minPeople))
            .replace("{current}", String(totalPassengers))}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleCheckout}
        disabled={
          !date ||
          totalPassengers === 0 ||
          belowMinimum ||
          (timeslots.length > 0 && !selectedTime)
        }
      >
        {t.reserveNow}
      </button>
      {/*reasurance*/}
      <div className="booking-trust">
        <div className="booking-trust-item">
          <span className="booking-icon">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span className="booking-trust-text">
            {t.freeCancellation}
          </span>
        </div>

        <div className="booking-trust-item">
          <span className="booking-icon">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <span className="booking-trust-text">
            {t.reserveNowPayLater}
          </span>
        </div>
      </div>

    </div>
  );

}