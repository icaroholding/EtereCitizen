export function RatingDisplay({ score, count }: { score: number; count?: number }) {
  const fullStars = Math.floor(score);
  const hasHalf = score - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= fullStars ? 'text-yellow-400' : i === fullStars + 1 && hasHalf ? 'text-yellow-300' : 'text-gray-300'}>
          ★
        </span>
      ))}
      <span className="text-sm text-gray-600 ml-1">
        {score.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}
