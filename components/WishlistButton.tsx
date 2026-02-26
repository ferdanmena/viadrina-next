"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Props = {
  activityId: number;
};

export default function WishlistButton({ activityId }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkWishlist() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("wishlists")
        .select("id")
        .eq("activity_id", activityId.toString())
        .eq("user_id", userData.user.id)
        .single();

      if (data) setIsSaved(true);
    }

    checkWishlist();
  }, [activityId]);

  async function toggleWishlist(e: React.MouseEvent) {
    e.preventDefault();     // prevent Link navigation
    e.stopPropagation();    // prevent bubbling

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      alert("Please login first");
      setLoading(false);
      return;
    }

    if (isSaved) {
      await supabase
        .from("wishlists")
        .delete()
        .eq("activity_id", activityId.toString())
        .eq("user_id", userData.user.id);

      setIsSaved(false);
    } else {
      await supabase.from("wishlists").insert({
        user_id: userData.user.id,
        activity_id: activityId.toString(),
      });

      setIsSaved(true);
    }

    setLoading(false);
  }

  return (
    <div onClick={toggleWishlist} style={{ cursor: "pointer" }}>
      <Image
        src={isSaved ? "/icons/heart-filled.svg" : "/icons/heart.svg"}
        alt="Wishlist"
        width={20}
        height={20}
      />
    </div>
  );
}