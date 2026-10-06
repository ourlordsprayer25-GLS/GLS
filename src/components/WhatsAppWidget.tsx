import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, ArrowUpRight, Sparkles, Check, GripVertical } from 'lucide-react';

import { StoreSettings } from '../types/store';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';

export const WHATSAPP_NUMBER = '2250500619923';
export const WHATSAPP_FORMATTED = '+225 05 00 61 99 23';

/**
 * Normalizes any phone number into clean numeric digits for wa.me/ URL.
 * Automatically adds Côte d'Ivoire +225 country code if a 10-digit number starting with 0 is provided.
 */
export const cleanWhatsAppNumber = (rawPhone?: string): string => {
  if (!rawPhone || !rawPhone.trim()) return WHATSAPP_NUMBER;
  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return WHATSAPP_NUMBER;
  // If user entered 10 digits starting with 0 (e.g. 0500619923, 07..., 01...)
  if (digits.length === 10 && digits.startsWith('0')) {
    return '225' + digits;
  }
  return digits;
};

/**
 * Formats a phone number for elegant human display.
 * E.g. "0500619923" -> "+225 05 00 61 99 23"
 */
export const formatWhatsAppDisplay = (rawPhone?: string): string => {
  if (!rawPhone || !rawPhone.trim()) return WHATSAPP_FORMATTED;
  const clean = cleanWhatsAppNumber(rawPhone);
  if (clean.startsWith('225') && clean.length === 13) {
    return `+225 ${clean.slice(3, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)} ${clean.slice(9, 11)} ${clean.slice(11, 13)}`;
  }
  if (clean.length === 10 && clean.startsWith('0')) {
    return `+225 ${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 6)} ${clean.slice(6, 8)} ${clean.slice(8, 10)}`;
  }
  return rawPhone;
};

export const getWhatsAppLink = (message: string, phone?: string) => {
  const targetPhone = cleanWhatsAppNumber(phone);
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};

interface WhatsAppButtonProps {
  message?: string;
  phone?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'compact' | 'pill';
  label?: string;
  showIcon?: boolean;
}

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="currentColor"
    className={className}
  >
    <path
      fill="currentColor"
      stroke="none"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
    />
  </svg>
);

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  message,
  phone,
  className = '',
  variant = 'primary',
  label,
  showIcon = true,
}) => {
  const { language } = useLanguageCurrency();
  const defaultMsg = language === 'fr' 
    ? 'Bonjour Conciergerie GLADYNS, je souhaite des renseignements sur vos produits.' 
    : 'Hello GLADYNS Concierge, I would like to inquire about products and studio assistance.';
  const effectiveMsg = message || defaultMsg;
  const effectiveLabel = label || (language === 'fr' ? 'Discuter sur WhatsApp' : 'Chat on WhatsApp');
  const url = getWhatsAppLink(effectiveMsg, phone);

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles =
        'bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-semibold shadow-2xs border border-[#1ebd56]';
      break;
    case 'secondary':
      variantStyles =
        'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 font-semibold';
      break;
    case 'subtle':
      variantStyles =
        'bg-white hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 font-medium shadow-2xs';
      break;
    case 'compact':
      variantStyles =
        'bg-slate-900 hover:bg-[#25D366] text-slate-300 hover:text-slate-950 border border-slate-800 hover:border-[#25D366]';
      break;
    case 'pill':
      variantStyles =
        'bg-emerald-900/90 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 font-medium';
      break;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${variantStyles} ${className}`}
    >
      {showIcon && <WhatsAppIcon className="w-4 h-4 shrink-0" />}
      <span>{label}</span>
    </a>
  );
};

interface FloatingWhatsAppConciergeProps {
  storeSettings?: StoreSettings;
  phoneNumber?: string;
}

// Floating WhatsApp Concierge Beacon with Quick Concierge Modal & Draggable Position
export const FloatingWhatsAppConcierge: React.FC<FloatingWhatsAppConciergeProps> = ({
  storeSettings,
  phoneNumber,
}) => {
  const { language } = useLanguageCurrency();
  const activePhone = phoneNumber || storeSettings?.whatsappNumber || WHATSAPP_NUMBER;
  const displayPhone = formatWhatsAppDisplay(activePhone);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY };
    initialPosRef.current = { ...position };
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }

    setPosition({
      x: initialPosRef.current.x + dx,
      y: initialPosRef.current.y + dy,
    });
  }, []);

  const handleEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onMouseUp = () => {
      handleEnd();
    };
    const onTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleMove, handleEnd]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
  };

  const conciergeOptions = [
    {
      title: language === 'fr' ? 'Spécialiste Produits & Conseils' : 'Product & Technical Specialist',
      subtitle: language === 'fr' ? 'Fiches techniques, caractéristiques & conseils' : 'Specifications, features & tech advice',
      msg: language === 'fr' 
        ? 'Bonjour Conciergerie GLADYNS, je souhaite des spécifications et conseils techniques sur vos produits.'
        : 'Hello GLADYNS Concierge, I would like personalized specifications and technical guidance for your products.',
    },
    {
      title: language === 'fr' ? 'Aide Commande & Livraison' : 'Checkout & Courier Assistance',
      subtitle: language === 'fr' ? 'Livraison express, facture & options de paiement' : 'Express delivery inquiries & custom invoice support',
      msg: language === 'fr'
        ? 'Bonjour Conciergerie GLADYNS, j\'ai besoin d\'assistance pour ma commande, la livraison ou le paiement.'
        : 'Hello GLADYNS Concierge, I need assistance regarding my checkout, courier dispatch, or payment methods.',
    },
    {
      title: language === 'fr' ? 'Disponibilité & Garantie 2 ans' : 'Private Archive & Warranty Inquiries',
      subtitle: language === 'fr' ? 'Disponibilité en stock, arrivages & garantie' : 'Inquire about limited releases, drops & 2-year warranty',
      msg: language === 'fr'
        ? 'Bonjour Studio GLADYNS, je souhaite me renseigner sur la disponibilité des produits et les garanties.'
        : 'Hello GLADYNS Studio, I would like to inquire about product availability, batch releases, and warranties.',
    },
  ];

  return (
    <div
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 select-none touch-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Expanded Quick Inquiries Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-92 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 animate-in fade-in slide-in-from-bottom-3 duration-200 text-left select-text touch-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#25D366] text-slate-950 flex items-center justify-center shadow-2xs">
                <WhatsAppIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  <span>{language === 'fr' ? 'Conciergerie GLADYNS' : 'GLADYNS Concierge'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-500 font-mono">
                  {language === 'fr' ? 'Studios Paris & Abidjan · En ligne' : 'Porto & Florence Studios · Online'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close concierge menu"
              className="p-1 text-slate-400 hover:text-slate-950 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-slate-600 my-2.5 leading-relaxed">
            {language === 'fr'
              ? 'Échangez directement avec un spécialiste GLADYNS sur WhatsApp pour des conseils d\'achat personnalisés ou le suivi de votre commande.'
              : 'Connect directly with a GLADYNS specialist via WhatsApp for immediate styling, product advice, or order tracking updates.'}
          </p>

          <div className="space-y-1.5">
            {conciergeOptions.map((opt, idx) => (
              <a
                key={idx}
                href={getWhatsAppLink(opt.msg, activePhone)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="block p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-300 text-xs transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-950 group-hover:text-emerald-950">
                    {opt.title}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{opt.subtitle}</p>
              </a>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Direct: {displayPhone}</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{language === 'fr' ? 'Rép. moy. : ~5 min' : 'Avg. reply: ~5 mins'}</span>
            </span>
          </div>
        </div>
      )}

      {/* Floating Draggable Trigger Beacon */}
      <div
        onClick={handleClick}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            handleStart(e.touches[0].clientX, e.touches[0].clientY);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Drag or open WhatsApp live studio concierge"
        className={`group flex items-center gap-2 pl-2.5 pr-4 py-2.5 bg-slate-950 hover:bg-blue-950 text-white rounded-full shadow-xl hover:shadow-2xl border border-slate-800 transition-all cursor-grab active:cursor-grabbing ${
          isDragging ? 'scale-105 shadow-2xl ring-2 ring-emerald-400/60 opacity-95' : 'active:scale-95'
        }`}
      >
        <div className="p-0.5 text-slate-400 group-hover:text-white cursor-grab">
          <GripVertical className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <WhatsAppIcon className="w-4 h-4 text-slate-950" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[11px] font-bold text-white leading-tight">
            {language === 'fr' ? 'Conciergerie GLADYNS' : 'GLADYNS Concierge'}
          </p>
          <p className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{language === 'fr' ? 'En direct WhatsApp' : 'WhatsApp Live'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
