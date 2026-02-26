import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatCurrency";
import WishlistButton from "./WishlistButton";

type Props = {
  id: number;
  title: string;
  price: number;
  currency: string;
  city: string;
  image?: string;
  lang?: "es" | "en";
  duration?: {
  hours: number;
  minutes: number;
};
};

export default function TourCard({
  id,
  title,
  price,
  currency,
  city,
  image,
  lang = "en",
  duration,
}: Props) {
  return (
    <Link href={`/${lang}/tour/${id}`} className="tour-card">

      <div className="tour-card-image-wrapper">
        {image && (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="tour-card-image"
          />
        )}

        {/* Heart icon */}
        <div className="tour-card-heart">
          <WishlistButton activityId={id} />
        </div>

        <div className="tour-card-overlay" />
      </div>

      <div className="tour-card-content">
        <div className="card-header">
          <div className="tour-city">{city}</div>
          <h3>{title}</h3>
        </div>
        <div className="card-footer">
          
          {duration && (
            <span className="tour-duration">
              {duration.hours > 0 &&
                (lang === "es"
                  ? `${duration.hours} h`
                  : `${duration.hours}h`)}
              {duration.minutes > 0 &&
                (lang === "es"
                  ? ` ${duration.minutes} min`
                  : ` ${duration.minutes}m`)}
            </span>
          )}
          <div className="tour-card-price">
            {formatCurrency(price, currency)}
          </div>
        </div>
        
      </div>

    </Link>
  );
}