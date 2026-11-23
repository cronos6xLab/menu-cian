import { useState } from 'react';
import { Flame } from 'lucide-react';

interface DishImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function DishImage({ src, alt, className = '' }: DishImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#1B1B1E] via-[#131316] to-[#0D0D11] text-[#BCCBB9] p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Flame className="w-8 h-8 text-[#22C55E] mb-2" />
        <span className="font-display text-xs font-bold text-center text-[#E4E1E6] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
