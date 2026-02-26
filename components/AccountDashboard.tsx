"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Props = {
  lang: "es" | "en";
};

export default function AccountDashboard({ lang }: Props) {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      setUserId(userData.user.id);

      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", userData.user.id);

      setWishlist(wishlistData ?? []);

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      setBookings(bookingsData ?? []);
    }

    loadData();
  }, []);

  if (!userId) return null;

  return (
    <div style={{ marginTop: 40 }}>
      <h2>Wishlist</h2>
      {wishlist.length === 0 && <p>No saved tours.</p>}

      {wishlist.map((item) => (
        <div key={item.id}>
          Activity ID: {item.activity_id}
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>My Bookings</h2>
      {bookings.length === 0 && <p>No bookings yet.</p>}

      {bookings.map((b) => (
        <div key={b.id}>
          Booking Code: {b.confirmation_code}
        </div>
      ))}
    </div>
  );
}