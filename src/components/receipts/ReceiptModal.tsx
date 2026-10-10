import React, { useState, useEffect, useRef } from 'react';
import { 
  Order, 
  StoreSettings 
} from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { getWhatsAppLink } from '../WhatsAppWidget';
import JsBarcode from 'jsbarcode';
import { printReceipt, downloadReceiptFile } from '../../services/receiptPrintService';
import { 
  Printer, 
  Download, 
  MessageSquare, 
  Copy, 
  Check, 
  X, 
  User, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  Gift, 
  FileText, 
  Receipt as ReceiptIcon, 
  Store, 
  Phone, 
  Clock, 
  Heart,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export interface ReceiptModalProps {
  order: Order | null;
  onClose: () => void;
  storeSettings?: StoreSettings;
  initialTemplate?: 'commercial' | 'gift' | 'invoice' | 'pos';
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  order,
  onClose,
  storeSettings,
  initialTemplate = 'commercial'
}) => {
  const { formatPrice, language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [activeTemplate, setActiveTemplate] = useState<'commercial' | 'gift' | 'invoice' | 'pos'>(initialTemplate);
  const [copiedId, setCopiedId] = useState(false);

  const barcodeRef = useRef<SVGSVGElement | null>(null);

  if (!order) return null;

  // Resolve Store Info with Brand Fallbacks from About Us & Store Settings
  const storeName = storeSettings?.storeName || storeSettings?.aboutUs?.title || 'GLADYNS Marketplace';
  const storeAddress = storeSettings?.aboutUs?.atelierLocation || storeSettings?.contactAddress || 'ABIDJAN ADJAME ivory coast';
  const storePhone = storeSettings?.contactPhone || storeSettings?.whatsappNumber || '+225 05 00 61 99 23';
  const storeEmail = storeSettings?.contactEmail || 'contact@gladyns.store';
  const storeDomain = 'gladyns.store';

  // Live Boutique Photo from Admin About Us settings
  const shopBannerImage = storeSettings?.aboutUs?.image || storeSettings?.aboutUs?.secondaryImage || '/assets/gladyns_store_preview.png';

  // Format Receipt & Invoice identifiers
  const cleanOrderNum = (order.orderNumber || order.id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const rawSuffix = cleanOrderNum.slice(-5) || '06373';
  const year = new Date(order.date || Date.now()).getFullYear() || 2026;
  const officialReceiptId = `REC-${year}-${rawSuffix}`;
  const taxInvoiceId = `INV-${year}-${rawSuffix}`;
  const orderRefId = `GLA-${rawSuffix}`;
  const transactionId = `TXN-${cleanOrderNum.slice(-6) || '532232'}`;
  const authCode = `AUTH-${cleanOrderNum.slice(-5) || '82232'}`;
  const giftReceiptId = `GIFT-${orderRefId}`;

  // Customer display details
  const firstName = order.shippingAddress.firstName || 'Client';
  const lastName = order.shippingAddress.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  const customerEmail = order.shippingAddress.email || 'customer@gladyns.store';
  const customerPhone = order.shippingAddress.phone || storePhone;
  const initialLetter = (firstName[0] || 'G').toUpperCase();

  // Date formatting
  const formattedDate = (() => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return new Date().toLocaleDateString();
      return d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
    } catch {
      return '9/23/2026';
    }
  })();

  const formattedDateTime = (() => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return `${formattedDate}, 14:30:00`;
      return d.toLocaleString(isFr ? 'fr-FR' : 'en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return `${formattedDate}, 14:30:00`;
    }
  })();

  // Payment method resolver
  const resolveTender = () => {
    const raw = (order.paymentMethod || '').toLowerCase();
    if (raw.includes('cod') || raw.includes('cash') || raw.includes('livraison')) {
      return {
        label: isFr ? 'Paiement à la livraison' : 'Cash on Delivery',
        channel: isFr ? 'Espèces à la remise' : 'Cash upon Delivery',
        cardSuffix: isFr ? 'Espèces' : 'Cash',
        icon: Banknote,
        isSettled: order.status === 'delivered',
        badge: order.status === 'delivered' ? 'PAID' : (isFr ? 'À PAYER' : 'DUE ON ARRIVAL')
      };
    }
    if (raw.includes('wave')) {
      return {
        label: 'Wave Mobile Money',
        channel: 'Wave Côte d\'Ivoire',
        cardSuffix: '•••• 4209',
        icon: Smartphone,
        isSettled: true,
        badge: 'PAID'
      };
    }
    if (raw.includes('orange') || raw.includes('om')) {
      return {
        label: 'Orange Money',
        channel: 'Orange Money CI',
        cardSuffix: '•••• 8821',
        icon: Smartphone,
        isSettled: true,
        badge: 'PAID'
      };
    }
    if (raw.includes('apple')) {
      return {
        label: 'Apple Pay Express',
        channel: 'Apple Pay Biometric',
        cardSuffix: '•••• 7781',
        icon: Smartphone,
        isSettled: true,
        badge: 'PAID'
      };
    }
    return {
      label: 'Instant Checkout · Stripe',
      channel: 'Credit / Debit Card (Secure 3D)',
      cardSuffix: '•••• 7781',
      icon: CreditCard,
      isSettled: true,
      badge: 'PAID'
    };
  };

  const tender = resolveTender();

  // Barcode string calculation depending on template
  const barcodeValue = activeTemplate === 'gift' 
    ? giftReceiptId 
    : activeTemplate === 'invoice' 
    ? taxInvoiceId 
    : officialReceiptId;

  // Render JsBarcode whenever barcodeValue or activeTemplate changes
  useEffect(() => {
    if (barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: 'CODE128',
          width: 1.6,
          height: 48,
          displayValue: false,
          margin: 0,
          background: 'transparent',
          lineColor: '#0f172a'
        });
      } catch (err) {
        console.warn('Barcode generation warning:', err);
      }
    }
  }, [barcodeValue, activeTemplate]);

  // Copy to clipboard helper
  const handleCopyId = () => {
    navigator.clipboard.writeText(officialReceiptId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // WhatsApp share helper
  const handleWhatsAppShare = () => {
    const text = isFr
      ? `Bonjour ${fullName},\nVoici votre reçu officiel GLADYNS (${officialReceiptId}) pour la commande ${order.orderNumber}.\nTotal : ${formatPrice(order.total)}\nStatut : ${tender.badge}\nConsultez votre reçu en ligne sur https://${storeDomain}`
      : `Hello ${fullName},\nHere is your official GLADYNS receipt (${officialReceiptId}) for order ${order.orderNumber}.\nTotal: ${formatPrice(order.total)}\nStatus: ${tender.badge}\nView your receipt online at https://${storeDomain}`;
    const url = getWhatsAppLink(text, customerPhone);
    window.open(url, '_blank');
  };

  // Print helper using clean isolated document
  const handlePrintReceipt = () => {
    printReceipt(order, {
      template: activeTemplate as any,
      storeSettings,
      formatPrice,
      language,
    });
  };

  // Direct file download helper
  const handleDownloadReceipt = () => {
    downloadReceiptFile(order, {
      template: activeTemplate as any,
      storeSettings,
      formatPrice,
      language,
    });
  };

  return (
    <div 
      className="receipt-modal-backdrop fixed inset-0 z-[120] overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Clean Print Media CSS */}
      <style>{`
        @media print {
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: #ffffff !important;
          }
          body * {
            visibility: hidden !important;
          }
          .receipt-modal-backdrop {
            position: static !important;
            overflow: visible !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .receipt-modal-card {
            position: static !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .receipt-modal-body {
            overflow: visible !important;
            padding: 0 !important;
            height: auto !important;
            background: #ffffff !important;
          }
          #gladyns-printable-receipt, #gladyns-printable-receipt * {
            visibility: visible !important;
          }
          #gladyns-printable-receipt {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Main Modal Card */}
      <div 
        className="receipt-modal-card relative w-full max-w-3xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-50/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
              {officialReceiptId}
            </span>
            <button
              onClick={handleCopyId}
              className="p-1 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
              title={isFr ? 'Copier la référence' : 'Copy ID'}
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {copiedId && (
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {isFr ? 'Copié !' : 'Copied!'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Print Button */}
            <button
              onClick={handlePrintReceipt}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title={isFr ? "Imprimer le document complet" : "Print complete receipt"}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isFr ? 'Imprimer' : 'Print'}</span>
            </button>

            {/* Direct Download Button */}
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title={isFr ? "Télécharger le reçu directement" : "Download receipt file"}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isFr ? 'Télécharger' : 'Download'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title={isFr ? 'Partager via WhatsApp' : 'Share via WhatsApp'}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Mode Tabs Switcher (Blue & White Design) */}
        <div className="px-4 sm:px-6 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto no-print">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap hidden sm:inline">
            {isFr ? 'FORMAT DE REÇU :' : 'RECEIPT FORMAT:'}
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold w-full sm:w-auto">
            {/* 1. Customer Receipt (Hero banner) */}
            <button
              onClick={() => setActiveTemplate('commercial')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTemplate === 'commercial'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60'
              }`}
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              <span>{isFr ? 'Reçu Client' : 'Customer Receipt'}</span>
            </button>

            {/* 2. Tax Invoice */}
            <button
              onClick={() => setActiveTemplate('invoice')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTemplate === 'invoice'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isFr ? 'Facture Officielle' : 'Official Invoice'}</span>
            </button>

            {/* 3. Gift Receipt */}
            <button
              onClick={() => setActiveTemplate('gift')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTemplate === 'gift'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>{isFr ? 'Reçu Cadeau' : 'Gift Receipt'}</span>
            </button>

            {/* 4. POS Thermal Slip */}
            <button
              onClick={() => setActiveTemplate('pos')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTemplate === 'pos'
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60'
              }`}
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              <span>{isFr ? 'Ticket POS' : 'POS Ticket'}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="receipt-modal-body overflow-y-auto p-4 sm:p-8 bg-slate-50/50 flex-1">
          <div id="gladyns-printable-receipt" className="max-w-2xl mx-auto">
            
            {/* ========================================================================= */}
            {/* 1. CUSTOMER RECEIPT (Hero Banner, Avatar, Full Details)                   */}
            {/* ========================================================================= */}
            {activeTemplate === 'commercial' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-6">
                
                {/* Hero Header with boutique showroom photo from About Us & PAID badge */}
                <div className="relative h-36 sm:h-44 bg-slate-950 overflow-hidden flex items-end p-5 sm:p-7">
                  <img
                    src={shopBannerImage}
                    alt={storeName}
                    className="absolute inset-0 w-full h-full object-cover opacity-65"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                  
                  {/* Store Name & Address */}
                  <div className="relative z-10 text-white">
                    <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight drop-shadow-md">
                      {storeName}
                    </h2>
                    <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1 drop-shadow-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{storeAddress}</span>
                    </p>
                  </div>

                  {/* PAID Badge */}
                  <div className="absolute top-5 right-5 z-10">
                    <span className="bg-[#00B074] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg tracking-wider shadow-md uppercase">
                      {tender.badge || 'PAID'}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-7 space-y-6 pt-1">
                  
                  {/* Customer Record Banner with Blue Avatar */}
                  <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-xs">
                        {initialLetter}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600">
                          <User className="w-3 h-3" />
                          <span>{isFr ? 'REÇU CLIENT POUR' : 'CUSTOMER RECEIPT FOR'}</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          {fullName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {customerEmail} {customerPhone ? `· ${customerPhone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right sm:border-l sm:border-blue-200/70 sm:pl-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                        {isFr ? 'N° REÇU OFFICIEL' : 'OFFICIAL RECEIPT #'}
                      </span>
                      <span className="font-mono font-black text-blue-600 text-sm sm:text-base block">
                        {officialReceiptId}
                      </span>
                      <span className="text-xs text-slate-500 block">
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* 4-Column Metadata Card */}
                  <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isFr ? 'RÉF COMMANDE' : 'ORDER REFERENCE'}
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 mt-0.5 block">
                        {orderRefId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isFr ? 'ID TRANSACTION' : 'TRANSACTION ID'}
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-700 mt-0.5 block">
                        {transactionId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isFr ? 'CODE AUTH' : 'AUTH CODE'}
                      </span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-slate-700 mt-0.5 block">
                        {authCode}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {isFr ? 'MODE DE RÈGLEMENT' : 'PAYMENT TENDER'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <tender.icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {tender.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two Address Cards: Billed To & Delivery Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Billed To Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-white space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">
                        <User className="w-3 h-3" />
                        <span>{isFr ? 'FACTURÉ AU CLIENT' : 'BILLED TO CUSTOMER'}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{fullName}</p>
                      <p className="text-xs text-slate-500 font-mono">{customerEmail}</p>
                      {customerPhone && <p className="text-xs text-slate-500 font-mono">{customerPhone}</p>}
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                        {order.shippingAddress.street || '428 Broome Street, Studio 4B'}<br />
                        {order.shippingAddress.city || 'SoHo, New York'}, {order.shippingAddress.postalCode || 'NY 10013'}, {order.shippingAddress.country || 'USA'}
                      </p>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 sm:p-5 bg-white space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1.5">
                        <MapPin className="w-3 h-3" />
                        <span>{isFr ? 'ADRESSE DE LIVRAISON' : 'DELIVERY ADDRESS'}</span>
                      </div>
                      <p className="font-bold text-sm text-slate-900">{fullName}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {order.shippingAddress.street || '742 Montgomery St'}<br />
                        {order.shippingAddress.city || 'San Francisco'}, {order.shippingAddress.postalCode || 'CA 94111'}<br />
                        {order.shippingAddress.country || 'United States'}
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          <span>{isFr ? 'Destination de livraison vérifiée' : 'Verified Shipping Destination'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchased Articles Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="uppercase tracking-wider text-slate-900 text-xs">
                        {isFr ? 'ARTICLES ACHETÉS' : 'PURCHASED ARTICLES'} ({order.items.reduce((acc, it) => acc + it.quantity, 0)})
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                        {isFr ? 'TOUS PRIX EN DEVISE LOCALE' : 'ALL PRICES IN USD'}
                      </span>
                    </div>

                    <div className="border border-slate-200/90 rounded-2xl overflow-hidden">
                      <div className="grid grid-cols-12 bg-slate-50/80 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <div className="col-span-6">{isFr ? 'DESCRIPTION DU PRODUIT' : 'PRODUCT DESCRIPTION'}</div>
                        <div className="col-span-2 text-center">{isFr ? 'QTÉ' : 'QTY'}</div>
                        <div className="col-span-2 text-right">{isFr ? 'PRIX UNIT.' : 'UNIT PRICE'}</div>
                        <div className="col-span-2 text-right">{isFr ? 'TOTAL LIGNE' : 'LINE TOTAL'}</div>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="grid grid-cols-12 px-4 py-3.5 items-center text-xs">
                            <div className="col-span-6 flex items-center gap-3">
                              <img
                                src={it.selectedColor?.image || it.product.primaryImage || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                                alt={it.product.name}
                                className="w-11 h-11 object-cover rounded-xl border border-slate-200/80 shrink-0 bg-slate-50"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {it.product.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  SKU: {it.product.id ? it.product.id.slice(0, 10).toUpperCase() : 'GLA-001'}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-2 text-center font-bold text-slate-800">
                              {it.quantity}
                            </div>

                            <div className="col-span-2 text-right font-mono text-slate-600">
                              {formatPrice(it.product.price)}
                            </div>

                            <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                              {formatPrice(it.product.price * it.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Certified Commercial Receipt & Totals Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end pt-2">
                    {/* Certified Commercial Receipt with Barcode */}
                    <div className="border border-slate-200/90 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>{isFr ? 'Reçu Commercial Certifié' : 'Certified Commercial Receipt'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {isFr ? 'Client :' : 'Customer:'} <strong>{fullName}</strong>. {isFr 
                          ? 'Ce document certifie l\'autorisation de règlement. À conserver pour toute réclamation sous garantie.' 
                          : 'This document verifies settlement authorization. Retain for warranty claims.'}
                      </p>

                      {/* Barcode box */}
                      <div className="bg-white border border-slate-200/80 rounded-xl p-3 flex flex-col items-center justify-center shadow-2xs">
                        <svg ref={barcodeRef} className="max-w-full h-10" />
                        <span className="font-mono text-[11px] font-bold text-slate-700 tracking-wider mt-1">
                          *{officialReceiptId}*
                        </span>
                      </div>
                    </div>

                    {/* Right Totals Breakdown */}
                    <div className="space-y-2 sm:pl-4">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{isFr ? 'Sous-total' : 'Subtotal'}</span>
                        <span className="font-mono font-semibold">{formatPrice(order.subtotal || order.total)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600 pb-2 border-b border-slate-200">
                        <span>{isFr ? 'Expédition & Livraison' : 'Shipping & Delivery'}</span>
                        <span className="font-mono font-semibold">{order.shippingCost ? formatPrice(order.shippingCost) : (isFr ? 'Offert' : 'Free')}</span>
                      </div>

                      {/* Total Tendered Big Callout */}
                      <div className="flex items-baseline justify-between pt-1">
                        <div>
                          <span className="text-sm font-black text-slate-900 block">
                            {isFr ? 'Total Réglé' : 'Total Tendered'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {isFr ? 'Expédition et service compris' : 'Shipping and fulfillment included'}
                          </span>
                        </div>
                        <span className="text-2xl sm:text-3xl font-black font-mono text-blue-600">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thanks Banner */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 text-center space-y-1">
                    <h4 className="font-black text-sm text-blue-700 flex items-center justify-center gap-1.5 uppercase tracking-wide">
                      <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
                      <span>{isFr ? `MERCI POUR VOTRE COMMANDE, ${fullName.toUpperCase()} !` : `THANKS FOR SHOPPING WITH US, ${fullName.toUpperCase()}!`}</span>
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      {isFr 
                        ? 'Merci pour votre confiance ! Nous apprécions grandement votre fidélité et espérons que votre commande vous apportera entière satisfaction.' 
                        : 'Thank you for shopping with us! We truly appreciate your business and hope you love your purchase.'}
                    </p>
                  </div>

                  {/* 3-Column Store Footer */}
                  <div className="border border-slate-200/90 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-5 bg-white text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isFr ? 'ADRESSE BOUTIQUE' : 'SHOP LOCATION'}</span>
                      </div>
                      <p className="font-bold text-slate-800">{storeName}</p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{storeAddress}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isFr ? 'CONTACT & SUPPORT' : 'SHOP CONTACT NUMBER'}</span>
                      </div>
                      <p className="font-bold font-mono text-slate-800">{storePhone}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{storeEmail}</p>
                      <button 
                        onClick={handleWhatsAppShare}
                        className="text-emerald-600 hover:text-emerald-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp: {storePhone}</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs uppercase tracking-wider">
                        <Clock className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isFr ? 'HORAIRES DE SERVICE' : 'STORE SUPPORT HOURS'}</span>
                      </div>
                      <p className="text-slate-700 text-[11px]">
                        {isFr ? 'Lundi – Vendredi : 9h00 – 18h00' : 'Monday – Friday: 9:00 AM – 6:00 PM'}
                      </p>
                      <p className="text-slate-700 text-[11px]">
                        {isFr ? 'Samedi : 10h00 – 16h00' : 'Saturday: 10:00 AM – 4:00 PM'}
                      </p>
                      <p className="text-blue-600 font-bold text-[10px] pt-0.5">
                        {isFr ? 'Garantie retour sous 30 jours' : '30-Day Hassle-Free Returns'}
                      </p>
                    </div>
                  </div>

                  {/* Subfooter */}
                  <p className="text-[10px] text-slate-400 text-center font-mono pt-1">
                    Receipt #{officialReceiptId} · Issued for {fullName} ({customerEmail})
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. TAX INVOICE FORMAT (Image 3 layout)                                    */}
            {/* ========================================================================= */}
            {activeTemplate === 'invoice' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
                
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-slate-950">
                      {storeName}
                    </h2>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>{storeAddress}</span>
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1 font-mono mt-0.5">
                      <Phone className="w-3 h-3 text-blue-600" />
                      <span>Tel: {storePhone} · Email: {storeEmail}</span>
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-blue-900">
                      {isFr ? 'FACTURE OFFICIELLE' : 'OFFICIAL INVOICE'}
                    </h3>
                    <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                      INVOICE #{taxInvoiceId}
                    </p>
                    <p className="text-xs text-slate-500">
                      Date: {formattedDate}
                    </p>
                  </div>
                </div>

                {/* Solid Divider */}
                <div className="border-b-2 border-slate-900" />

                {/* Customer / Client Record Card */}
                <div className="border border-slate-200 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/40 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">
                      <User className="w-3.5 h-3.5" />
                      <span>{isFr ? 'DOSSIER CLIENT / DESTINATAIRE' : 'CUSTOMER / CLIENT RECORD'}</span>
                    </div>
                    <p className="font-black text-sm text-slate-900">{fullName}</p>
                    <p className="text-slate-600 font-mono">{customerEmail}</p>
                    {customerPhone && <p className="text-slate-600 font-mono">{customerPhone}</p>}
                    <p className="text-slate-600 pt-1 leading-relaxed">
                      {order.shippingAddress.street || '742 Montgomery St'}<br />
                      {order.shippingAddress.city || 'San Francisco'}, {order.shippingAddress.postalCode || 'CA 94111'}
                    </p>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      {isFr ? 'RÈGLEMENT DE TRANSACTION' : 'TRANSACTION SETTLEMENT'}
                    </div>
                    <p className="text-slate-700">
                      Status: <strong className="text-emerald-600">{tender.badge}</strong>
                    </p>
                    <p className="text-slate-700">
                      Method: <strong>{tender.label}</strong>
                    </p>
                    <p className="text-slate-700 font-mono">
                      Txn ID: {transactionId}
                    </p>
                    <p className="text-slate-700 font-mono">
                      Auth Code: {authCode}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-slate-50 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                    <div className="col-span-6">{isFr ? 'DÉSIGNATION' : 'DESCRIPTION'}</div>
                    <div className="col-span-2 text-center">{isFr ? 'QTÉ' : 'QTY'}</div>
                    <div className="col-span-2 text-right">{isFr ? 'PRIX UNITAIRE' : 'UNIT PRICE'}</div>
                    <div className="col-span-2 text-right">{isFr ? 'MONTANT' : 'AMOUNT'}</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="grid grid-cols-12 px-4 py-3 items-center text-xs">
                        <div className="col-span-6">
                          <span className="font-bold text-slate-900">{it.product.name}</span>
                          <span className="ml-2 font-mono text-[10px] text-slate-400">
                            SKU: {it.product.id ? it.product.id.slice(0, 10).toUpperCase() : 'GLA-001'}
                          </span>
                        </div>
                        <div className="col-span-2 text-center font-bold text-slate-800">
                          {it.quantity}
                        </div>
                        <div className="col-span-2 text-right font-mono text-slate-600">
                          {formatPrice(it.product.price)}
                        </div>
                        <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                          {formatPrice(it.product.price * it.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="max-w-xs ml-auto space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 pb-2 border-b-2 border-slate-900">
                    <span>Shipping:</span>
                    <span className="font-mono font-semibold">{order.shippingCost ? formatPrice(order.shippingCost) : (isFr ? 'Offert' : 'Free')}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="font-black text-sm text-slate-900">Total Due / Paid:</span>
                    <span className="font-black font-mono text-xl text-blue-900">{formatPrice(order.total)}</span>
                  </div>
                </div>

                {/* Footer Note */}
                <div className="pt-6 border-t border-slate-200 text-center space-y-3">
                  <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-900">
                    {isFr ? `MERCI POUR VOTRE COMMANDE, ${fullName.toUpperCase()} !` : `THANK YOU FOR YOUR VALUED BUSINESS, ${fullName.toUpperCase()}!`}
                  </h4>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span>Shop Location: {storeAddress}</span>
                    <span>Shop Phone: {storePhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. GIFT RECEIPT & EXCHANGE SLIP (Image 2 layout - Blue Accents)           */}
            {/* ========================================================================= */}
            {activeTemplate === 'gift' && (
              <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 text-center">
                
                {/* Gift Icon Badge */}
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs border border-blue-100">
                  <Gift className="w-7 h-7" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {storeName}
                  </h3>
                  <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 mt-1">
                    {isFr ? 'REÇU CADEAU & BON D\'ÉCHANGE' : 'GIFT RECEIPT & EXCHANGE SLIP'}
                  </h4>
                </div>

                <div className="border-b border-slate-100" />

                {/* Recipient Details Card */}
                <div className="bg-blue-50/40 border border-blue-100/90 rounded-2xl p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isFr ? 'Destinataire :' : 'Customer / Recipient:'}</span>
                    <span className="font-bold text-slate-900">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isFr ? 'N° Reçu Cadeau :' : 'Gift Receipt #:'}</span>
                    <span className="font-mono font-bold text-blue-600">{giftReceiptId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{isFr ? 'Date d\'émission :' : 'Date Issued:'}</span>
                    <span className="text-slate-700">{formattedDate}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-blue-100">
                    <span className="font-bold text-blue-700">{isFr ? 'Délai d\'échange :' : 'Exchange Deadline:'}</span>
                    <span className="font-black text-blue-700">{isFr ? '30 Jours dès émission' : '30 Days from Issue'}</span>
                  </div>
                </div>

                {/* Gifted Articles (NO PRICES) */}
                <div className="text-left space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {isFr ? 'ARTICLES OFFERTS' : 'GIFTED ARTICLES'}
                  </span>
                  <div className="space-y-2 divide-y divide-slate-100">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900">{it.product.name}</p>
                          <p className="text-[11px] text-slate-500">Qty: {it.quantity}</p>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Item #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-b border-slate-100" />

                <div className="space-y-1">
                  <h4 className="font-black text-sm uppercase tracking-wide text-slate-900">
                    {isFr ? 'MERCI POUR VOTRE CONFIANCE !' : 'THANKS FOR SHOPPING WITH US!'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Store Location: {storeAddress}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    USA · Tel: {storePhone}
                  </p>
                </div>

                {/* Barcode box */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <svg ref={barcodeRef} className="max-w-full h-11" />
                  <span className="font-mono text-[11px] font-bold text-slate-700 tracking-wider mt-1">
                    {giftReceiptId}
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 4. POS / THERMAL TICKET FORMAT (Image 4 layout)                           */}
            {/* ========================================================================= */}
            {activeTemplate === 'pos' && (
              <div className="max-w-md mx-auto bg-white border-2 border-dashed border-blue-200 rounded-3xl p-6 sm:p-8 font-mono text-xs space-y-4 shadow-sm text-slate-800">
                
                {/* Store Header */}
                <div className="text-center space-y-1">
                  <h3 className="font-black text-base uppercase tracking-widest text-slate-950">
                    {storeName}
                  </h3>
                  <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>{storeAddress}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center justify-center gap-1">
                    <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>TEL: {storePhone}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {storeEmail}
                  </p>
                </div>

                <div className="border-b border-dashed border-slate-300" />

                {/* Customer Information Box */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 space-y-1 text-[11px]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 block mb-1">
                    CUSTOMER INFORMATION
                  </span>
                  <p><strong>NAME:</strong> {fullName}</p>
                  <p><strong>EMAIL:</strong> {customerEmail}</p>
                  <p><strong>PHONE:</strong> {customerPhone}</p>
                  <p><strong>ADDR:</strong> {order.shippingAddress.street || '742 Montgomery St'}, {order.shippingAddress.city || 'San Francisco'}</p>
                </div>

                {/* Order metadata lines */}
                <div className="space-y-1 text-[11px] pt-1">
                  <div className="flex justify-between">
                    <span>RCV NO:</span>
                    <strong className="font-bold text-slate-900">{officialReceiptId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ORD NO:</span>
                    <strong>{orderRefId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>DATE:</span>
                    <span>{formattedDateTime}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-300" />

                {/* Items */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                    <span>ITEM</span>
                    <span>TOTAL</span>
                  </div>
                  {order.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{it.product.name}</span>
                        <span>{formatPrice(it.product.price * it.quantity)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {it.quantity} @ {formatPrice(it.product.price)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-b border-dashed border-slate-300" />

                {/* Totals */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>SUBTOTAL:</span>
                    <span>{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SHIPPING:</span>
                    <span>{order.shippingCost ? formatPrice(order.shippingCost) : '$0.00'}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-blue-900 pt-2 border-t border-dashed border-slate-300">
                    <span>TOTAL PAID:</span>
                    <span className="text-blue-600">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-300" />

                {/* Settlement tender */}
                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>TENDER:</span>
                    <span>{tender.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CARD LAST 4:</span>
                    <span>{tender.cardSuffix}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AUTH CODE:</span>
                    <span>{authCode}</span>
                  </div>
                </div>

                <div className="border-b border-dashed border-slate-300" />

                {/* Store note */}
                <div className="text-center space-y-1 pt-1">
                  <p className="font-black text-xs text-slate-900">
                    *** THANKS FOR SHOPPING WITH US! ***
                  </p>
                  <p className="text-[11px] text-slate-600">Customer: {fullName}</p>
                  <p className="text-[10px] text-slate-500">Store Location: {storeAddress}</p>
                  <p className="text-[10px] text-slate-500">Helpline: {storePhone} · Hours: Mon–Fri 9AM–6PM</p>
                </div>

                {/* Monospace Barcode */}
                <div className="pt-2 flex flex-col items-center justify-center">
                  <svg ref={barcodeRef} className="max-w-full h-10" />
                  <span className="text-[11px] font-bold text-slate-700 tracking-widest mt-1">
                    {officialReceiptId}
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
