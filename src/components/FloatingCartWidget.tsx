import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

interface FloatingCartWidgetProps {
  cartItemCount: number;
  onOpenCart: () => void;
  isCartOpen: boolean;
}

export const FloatingCartWidget: React.FC<FloatingCartWidgetProps> = ({
  cartItemCount,
  onOpenCart,
  isCartOpen,
}) => {
  const { language } = useLanguageCurrency();
  const isFr = language === 'fr';

  // Draggable Y Position (percentage or pixels)
  const [posY, setPosY] = useState<number>(240); // default top offset in px
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartY = useRef<number>(0);
  const initialPosY = useRef<number>(240);
  const hasMoved = useRef<boolean>(false);

  // Set initial Y position relative to viewport on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initial = Math.max(120, Math.min(window.innerHeight * 0.45, window.innerHeight - 200));
      setPosY(initial);
      initialPosY.current = initial;
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    setIsDragging(true);
    hasMoved.current = false;
    dragStartY.current = e.clientY;
    initialPosY.current = posY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    const deltaY = e.clientY - dragStartY.current;
    if (Math.abs(deltaY) > 4) {
      hasMoved.current = true;
    }

    const minTop = 80; // Below sticky header
    const maxTop = window.innerHeight - 210; // Above bottom nav
    const newY = Math.max(minTop, Math.min(initialPosY.current + deltaY, maxTop));
    setPosY(newY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    if (!hasMoved.current && !isCartOpen) {
      onOpenCart();
    }
  };

  if (isCartOpen) return null;

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ top: `${posY}px` }}
      aria-label="Open Shopping Cart"
      title={isFr ? 'Voir le Panier' : 'View Cart'}
      className={`fixed right-0 z-40 flex flex-col items-center justify-center py-3.5 px-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-l-2xl shadow-2xl border-l-2 border-y-2 border-white/20 select-none touch-none transition-transform duration-100 cursor-grab active:cursor-grabbing group ${
        isDragging ? 'scale-105 shadow-2xl bg-blue-700' : 'hover:translate-x-[-2px]'
      }`}
    >
      {/* Cart Icon */}
      <div className="relative mb-2">
        <ShoppingCart className="w-5 h-5 text-white transition-transform group-hover:scale-110 stroke-[2.2]" />

        {/* Red Circular Badge */}
        <span className="absolute -top-2 -right-2 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-blue-600 shadow-md animate-in zoom-in-50 duration-200">
          {cartItemCount}
        </span>
      </div>

      {/* Vertical Lettering: C A R T / P A N I E R */}
      <div className="flex flex-col items-center gap-0.5 text-[11px] font-black tracking-widest leading-none text-white uppercase opacity-95">
        {(isFr ? ['P', 'A', 'N', 'I', 'E', 'R'] : ['C', 'A', 'R', 'T']).map((letter, idx) => (
          <span key={idx} className="block text-center font-sans">
            {letter}
          </span>
        ))}
      </div>
    </button>
  );
};
