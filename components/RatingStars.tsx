import Image from "next/image";

type Props = {
  rating: number;
  reviewCount?: number;
};

export default function RatingStars({ rating, reviewCount }: Props) {
  const totalStars = 5;

  return (
    <div className="rating-stars">
      {Array.from({ length: totalStars }).map((_, index) => {
        const fillPercentage = Math.min(
          Math.max(rating - index, 0),
          1
        ) * 100;

        return (
          <div key={index} className="star-wrapper">
            <svg
              viewBox="0 0 24 24"
              className="star-svg"
            >
              <defs>
                <linearGradient id={`grad-${index}`}>
                  <stop
                    offset={`${fillPercentage}%`}
                    stopColor="currentColor"
                  />
                  <stop
                    offset={`${fillPercentage}%`}
                    stopColor="#e5e5e5"
                  />
                </linearGradient>
              </defs>

              <path
                fill={`url(#grad-${index})`}
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 
                   9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
          </div>
        );
      })}

      <div className="rating-meta">
        <span className="rating-score">
          {rating.toFixed(1)}
        </span>

        {reviewCount !== undefined && (
          <span className="rating-count">
            ({reviewCount})
          </span>
        )}
      </div>
    </div>
  );
}