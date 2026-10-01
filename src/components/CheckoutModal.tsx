import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  ShieldCheck,
  Truck,
  ArrowLeft,
  PackageCheck,
  Gift,
  Lock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  MapPin,
  Search,
  Navigation,
} from 'lucide-react';
import { CartItem, ShippingAddress, Order, UserProfile } from '../types/store';
import { WhatsAppButton, WhatsAppIcon, getWhatsAppLink } from './WhatsAppWidget';
import { useLanguageCurrency } from '../context/LanguageCurrencyContext';
import { COUNTRY_CODES, COUNTRIES } from '../data/countries';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onOpenOrders?: () => void;
  user?: any;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  onOpenOrders,
  user,
  onUpdateUser,
}) => {
  const { formatPrice, t, language } = useLanguageCurrency();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');

  // Shipping Form State (Auto-filled from User profile or Google login)
  const defaultAddress = user?.addresses?.[0];
  const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.displayName || '';
  const [address, setAddress] = useState<ShippingAddress>({
    firstName: defaultAddress?.firstName || user?.firstName || googleName.split(' ')[0] || '',
    lastName: defaultAddress?.lastName || user?.lastName || googleName.split(' ').slice(1).join(' ') || '',
    email: defaultAddress?.email || user?.email || '',
    phone: defaultAddress?.phone || user?.phone || '',
    street: defaultAddress?.street || '',
    apartment: defaultAddress?.apartment || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    postalCode: defaultAddress?.postalCode || '',
    country: defaultAddress?.country || "Côte d'Ivoire (Ivory Coast)",
  });

  const [phoneDialCode, setPhoneDialCode] = useState('+225');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Synchronize dynamic phone state
  useEffect(() => {
    setAddress(prev => ({
      ...prev,
      phone: `${phoneDialCode} ${phoneRaw}`.trim()
    }));
  }, [phoneDialCode, phoneRaw]);

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Gift Option
  const [includeGiftPackaging, setIncludeGiftPackaging] = useState(false);
  const [giftNote, setGiftNote] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple-pay' | 'klarna' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState(user?.displayName || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Pricing Calculations
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = 0;
  const discountedSubtotal = subtotal;

  const standardShippingCost = discountedSubtotal >= 150 ? 0 : 15;
  const shippingCost = shippingMethod === 'standard' ? standardShippingCost : 28;
  const estimatedTax = +(discountedSubtotal * 0.08).toFixed(2);
  const finalTotal = +(discountedSubtotal + shippingCost + estimatedTax).toFixed(2);

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const orderNumber = `GL-${Math.floor(1000 + Math.random() * 9000)}`;
      const trackingNumber = `DHL-${Math.floor(100000000 + Math.random() * 900000000)}`;

      const getGuestId = () => {
        let gid = localStorage.getItem('guest_id');
        if (!gid) {
          gid = `guest-${Math.random().toString(36).substring(2, 9)}-${Date.now()}`;
          localStorage.setItem('guest_id', gid);
        }
        return gid;
      };

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customerId: user?.id || getGuestId(),
        date: new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        items: [...items],
        shippingAddress: address,
        shippingMethod,
        shippingCost,
        subtotal,
        discount: discountAmount,
        tax: estimatedTax,
        total: finalTotal,
        paymentMethod,
        status: 'confirmed',
        trackingNumber,
        estimatedDelivery: shippingMethod === 'express' ? (language === 'fr' ? '2–3 jours ouvrés' : '2–3 business days') : (language === 'fr' ? '4–6 jours ouvrés' : '4–6 business days'),
      };

      setConfirmedOrder(newOrder);
      setIsProcessing(false);
      setStep('confirmation');
      onOrderSuccess(newOrder);

      if (user && onUpdateUser) {
        const newAddressRecord = {
          id: `addr-${Date.now()}`,
          isDefault: true,
          firstName: address.firstName,
          lastName: address.lastName,
          street: address.street,
          apartment: address.apartment,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
          phone: address.phone,
        };
        const updatedUser = {
          ...user,
          firstName: address.firstName || user.firstName,
          lastName: address.lastName || user.lastName,
          phone: address.phone || user.phone,
          addresses: [newAddressRecord, ...(user.addresses || []).filter((a: any) => !a.isDefault)]
        };
        onUpdateUser(updatedUser);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/90 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-display font-bold tracking-tight text-blue-600">
              GLADYNS
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              {step === 'shipping' && (language === 'fr' ? 'Étape 1 : Client & Livraison' : 'Step 1: Customer & Delivery')}
              {step === 'payment' && (language === 'fr' ? 'Étape 2 : Paiement & Options' : 'Step 2: Payment & Packaging')}
              {step === 'confirmation' && (language === 'fr' ? 'Commande Confirmée' : 'Order Confirmed')}
            </span>
          </div>
          {step !== 'confirmation' && (
            <button
              onClick={onClose}
              aria-label="Close checkout"
              className="p-1.5 text-slate-400 hover:text-slate-950 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        {step === 'confirmation' && confirmedOrder ? (
          <div className="p-8 sm:p-12 text-center space-y-6 max-h-[82vh] overflow-y-auto bg-slate-50/50">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-200 shadow-2xs">
              <PackageCheck className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600">
                {language === 'fr' ? 'Commande GLADYNS Enregistrée' : 'GLADYNS Order Registered'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-950">
                {language === 'fr' ? 'Merci pour votre commande' : 'Thank You for Your Order'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'fr' ? 'La commande ' : 'Order '}
                <strong className="font-mono text-slate-950">{confirmedOrder.orderNumber}</strong>
                {language === 'fr' ? ' est en cours de préparation pour expédition rapide.' : ' has been allocated for swift dispatch.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 text-left max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 text-[11px] block">{language === 'fr' ? 'Numéro de suivi' : 'Carrier Tracking'}</span>
                  <span className="font-mono font-bold text-slate-950">{confirmedOrder.trackingNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">{language === 'fr' ? 'Livraison estimée' : 'Estimated Arrival'}</span>
                  <span className="font-semibold text-slate-950">{confirmedOrder.estimatedDelivery}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'fr' ? 'Articles commandés' : 'Purchased Items'} ({confirmedOrder.items.length})
                </span>
                {confirmedOrder.items.map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={it.selectedColor?.image || it.product.primaryImage}
                        alt={it.product.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                      />
                      <div>
                        <p className="font-medium text-slate-950">{it.product.name}</p>
                        <p className="text-slate-500 text-[11px]">
                          {it.selectedColor?.name || 'Standard'} · {language === 'fr' ? 'Taille' : 'Size'} {it.selectedSize?.name || 'One Size'} · Qty {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-slate-950 tabular-nums">
                      {formatPrice(it.product.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Destination Address */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-0.5">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
                  {language === 'fr' ? 'Adresse de livraison' : 'Dispatch Destination'}
                </span>
                <p className="font-semibold text-slate-950">
                  {confirmedOrder.shippingAddress.firstName} {confirmedOrder.shippingAddress.lastName}
                </p>
                <p>{confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.apartment}</p>
                <p>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} {confirmedOrder.shippingAddress.postalCode}, {confirmedOrder.shippingAddress.country}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-slate-950">
                <span className="font-display font-bold">{language === 'fr' ? 'Total Payé (TTC & Port inclus)' : 'Total Paid (VAT & Courier Included)'}</span>
                <span className="font-mono text-base font-bold text-blue-600">{formatPrice(confirmedOrder.total)}</span>
              </div>
            </div>

            {/* Dual CTAs & WhatsApp Support */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {onOpenOrders && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOrders();
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{language === 'fr' ? 'Suivre la commande en temps réel' : 'Track in 5-Stage Live Pipeline'}</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Continuer mes achats' : 'Continue Exploring Catalog'}
                </button>
              </div>

              {/* WhatsApp Shipment Update Trigger */}
              <div className="pt-2">
                <a
                  href={getWhatsAppLink(
                    `Hello GLADYNS Studio, I would like direct updates and courier notes regarding my order ${confirmedOrder.orderNumber} (Tracking: ${confirmedOrder.trackingNumber}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                  <span>{language === 'fr' ? `Recevoir le suivi WhatsApp (Commande #${confirmedOrder.orderNumber})` : `Receive WhatsApp Courier Updates (Order #${confirmedOrder.orderNumber})`}</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
            {/* Form Column */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              {step === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-base font-display font-bold text-slate-950">
                      {language === 'fr' ? 'Informations de livraison' : 'Customer & Delivery Information'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'fr' ? 'Expédition rapide et sécurisée avec suivi en temps réel.' : 'Fast warehouse dispatch and verified tracked shipping.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Prénom' : 'First Name'}</label>
                      <input
                        type="text"
                        required
                        value={address.firstName}
                        onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Nom' : 'Last Name'}</label>
                      <input
                        type="text"
                        required
                        value={address.lastName}
                        onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'E-mail' : 'Email Address'}</label>
                      <input
                        type="email"
                        required
                        value={address.email}
                        onChange={(e) => setAddress({ ...address, email: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Téléphone' : 'Phone Number'}</label>
                      <div className="flex gap-2">
                        <select
                          value={phoneDialCode}
                          onChange={(e) => setPhoneDialCode(e.target.value)}
                          className="text-xs px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white max-w-[100px]"
                        >
                          {COUNTRY_CODES.map((c, i) => (
                            <option key={i} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. 07 08 09 10"
                          value={phoneRaw}
                          onChange={(e) => setPhoneRaw(e.target.value)}
                          className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Searchable Country Selector (Côte d'Ivoire default) */}
                  <div className="relative">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {language === 'fr' ? 'Pays de destination' : 'Country of Destination'}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search for your country..."
                          value={address.country}
                          onFocus={() => setShowCountryDropdown(true)}
                          onChange={(e) => {
                            setAddress({ ...address, country: e.target.value });
                            setShowCountryDropdown(true);
                          }}
                          className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                        />
                        {showCountryDropdown && (
                          <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 divide-y divide-slate-100">
                            {COUNTRIES.filter(c => c.name.toLowerCase().includes((address.country || '').toLowerCase())).map((c, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setAddress({ ...address, country: c.name });
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Street Address & GPS Locator Button */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[11px] font-semibold text-slate-700">{language === 'fr' ? 'Adresse' : 'Street Address'}</label>
                      <button
                        type="button"
                        disabled={isLocating}
                        onClick={() => {
                          if (!navigator.geolocation) {
                            alert("Geolocation is not supported by your browser");
                            return;
                          }
                          setIsLocating(true);
                          navigator.geolocation.getCurrentPosition(
                            async (position) => {
                              try {
                                const { latitude, longitude } = position.coords;
                                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
                                const data = await response.json();
                                if (data && data.address) {
                                  const street = data.address.road || data.address.suburb || data.address.neighbourhood || data.display_name.split(',')[0] || '';
                                  const city = data.address.city || data.address.town || data.address.village || 'Abidjan';
                                  const countryName = data.address.country || "Côte d'Ivoire (Ivory Coast)";
                                  const postalCode = data.address.postcode || '00225';
                                  const state = data.address.state || data.address.region || '';
                                  
                                  setAddress(prev => ({
                                    ...prev,
                                    street,
                                    city,
                                    state,
                                    postalCode,
                                    country: countryName,
                                  }));
                                } else {
                                  setAddress(prev => ({
                                    ...prev,
                                    street: `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                                    city: 'Abidjan',
                                  }));
                                }
                              } catch (err) {
                                console.error('Nominatim reverse geocode error:', err);
                              } finally {
                                setIsLocating(false);
                              }
                            },
                            (err) => {
                              console.error('GPS tracking failed:', err);
                              setIsLocating(false);
                            }
                          );
                        }}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Navigation className={`w-3 h-3 ${isLocating ? 'animate-bounce' : ''}`} />
                        <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder={language === 'fr' ? 'Numéro et rue' : 'Street and house number'}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Complément' : 'Apt / Suite'}</label>
                      <input
                        type="text"
                        value={address.apartment}
                        onChange={(e) => setAddress({ ...address, apartment: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Ville' : 'City'}</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Code postal' : 'Postal Code'}</label>
                      <input
                        type="text"
                        required
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        className="w-full text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Courier Speed Selection */}
                  <div className="pt-2 space-y-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      {language === 'fr' ? 'Mode de livraison' : 'Courier Dispatch Speed'}
                    </label>
                    <div className="space-y-2">
                      <label
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          shippingMethod === 'standard'
                            ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="accent-blue-600"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-950">{language === 'fr' ? 'Livraison Standard' : 'Standard Courier'}</p>
                            <p className="text-[11px] text-slate-500">{language === 'fr' ? '4–6 jours ouvrés · Neutre en carbone' : '4–6 business days · Climate-neutral transport'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-950">
                          {standardShippingCost === 0 ? (language === 'fr' ? 'Offerte' : 'Complimentary') : formatPrice(15)}
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          shippingMethod === 'express'
                            ? 'border-blue-600 bg-blue-50/50 shadow-2xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="accent-blue-600"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-950">{language === 'fr' ? 'Livraison Prioritaire DHL Express' : 'DHL Express Priority Delivery'}</p>
                            <p className="text-[11px] text-slate-500">{language === 'fr' ? '2–3 jours ouvrés express' : '2–3 business days expedited priority flight'}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-950">{formatPrice(28)}</span>
                      </label>
                    </div>
                  </div>

                  {/* Gift Packaging Option */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2.5">
                        <Gift className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs font-semibold text-slate-950">{language === 'fr' ? 'Emballage Cadeau GLADYNS' : 'GLADYNS Gift Packaging'}</p>
                          <p className="text-[11px] text-slate-500">{language === 'fr' ? 'Coffret cadeau de luxe et carte personnalisée' : 'Premium gift box, protective wrap, personalized card'}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeGiftPackaging}
                        onChange={(e) => setIncludeGiftPackaging(e.target.checked)}
                        className="accent-blue-600 w-4 h-4 rounded"
                      />
                    </label>

                    {includeGiftPackaging && (
                      <div className="pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                          placeholder={language === 'fr' ? 'Votre mot personnalisé pour le cadeau...' : 'Personalized gift message...'}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 group"
                    >
                      <span>{language === 'fr' ? 'Continuer vers le Paiement' : 'Continue to Payment & Packaging'}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              )}

              {step === 'payment' && (
                <form onSubmit={handlePlaceOrder} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-display font-bold text-slate-950">
                        {language === 'fr' ? 'Paiement sécurisé' : 'Payment & Verification'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{language === 'fr' ? 'Chiffrement SSL 256-bit garanti.' : 'Encrypted 256-bit secure checkout.'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{language === 'fr' ? 'Retour' : 'Back to address'}</span>
                    </button>
                  </div>

                  {/* Payment Options Selector */}
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="text-[11px] font-semibold">{language === 'fr' ? 'Carte' : 'Card'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple-pay')}
                      className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'apple-pay'
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-semibold text-sm"> Pay</span>
                      <span className="text-[11px]">1-Click</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('klarna')}
                      className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'klarna'
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-xs">Klarna</span>
                      <span className="text-[10px]">4x sans frais</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-xs font-medium flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span className="text-[11px]">{language === 'fr' ? 'À réception' : 'COD'}</span>
                    </button>
                  </div>

                  {/* Virtual Card Preview */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      {/* Realistic Blue Card Graphic */}
                      <div className="relative p-5 rounded-2xl bg-gradient-to-tr from-blue-900 via-blue-700 to-blue-600 text-white shadow-lg border border-blue-400/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-display tracking-widest text-xs font-bold text-white">
                            GLADYNS PREMIER CARD
                          </span>
                          <Lock className="w-3.5 h-3.5 text-blue-200" />
                        </div>

                        <div className="py-2">
                          <span className="font-mono text-base tracking-widest text-white font-semibold">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-blue-100 font-mono">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider block text-blue-200">{language === 'fr' ? 'Titulaire' : 'Cardholder'}</span>
                            <span className="text-white font-semibold">{cardName || 'JULIAN VANCE'}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-wider block text-blue-200">{language === 'fr' ? 'Expire' : 'Expires'}</span>
                            <span className="text-white font-semibold">{cardExpiry || 'MM/YY'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Inputs */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Numéro de Carte' : 'Card Number'}</label>
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Expiration (MM/AA)' : 'Expires (MM/YY)'}</label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVC</label>
                            <input
                              type="text"
                              required
                              value={cardCvc}
                              onChange={(e) => setCardCvc(e.target.value)}
                              className="w-full text-xs font-mono px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">{language === 'fr' ? 'Nom du titulaire' : 'Cardholder Name'}</label>
                          <input
                            type="text"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full text-xs px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'apple-pay' && (
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                      <span className="text-xl font-bold font-display block"> Pay</span>
                      <p className="text-xs text-slate-600">
                        {language === 'fr' ? `Autoriser le paiement de ${formatPrice(finalTotal)} avec Face ID ou Touch ID.` : `Authorize total payment of ${formatPrice(finalTotal)} using biometric Face ID or Touch ID authentication.`}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'klarna' && (
                    <div className="p-5 bg-pink-50/60 rounded-2xl border border-pink-200 text-xs text-slate-700 space-y-2">
                      <span className="font-bold text-sm text-pink-900 block">{language === 'fr' ? 'Paiement en 4x sans frais Klarna' : 'Klarna 4 Interest-Free Installments'}</span>
                      <p className="leading-relaxed">
                        {language === 'fr' ? `Payez 4 échéances de ${formatPrice(finalTotal / 4)} tous les 15 jours. 0 frais, 0 intérêt.` : `Pay 4 equal payments of ${formatPrice(finalTotal / 4)} every 2 weeks. Zero interest, zero late fees.`}
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'cod' && (
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-950">{language === 'fr' ? 'Paiement à la livraison (Espèces ou Carte)' : 'Cash or Card on Courier Arrival'}</p>
                      <p>{language === 'fr' ? 'Payez directement auprès du livreur lors de la réception de votre colis. Sans supplément.' : 'You can pay our certified delivery courier directly at your address via contactless card terminal or cash. Zero surcharge.'}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>{language === 'fr' ? 'Autorisation en cours...' : 'Authorizing Order...'}</span>
                        </span>
                      ) : (
                        <span>{language === 'fr' ? `Confirmer la commande — ${formatPrice(finalTotal)}` : `Complete Order — ${formatPrice(finalTotal)}`}</span>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'fr' ? 'Chiffrement SSL 256-bit · Garantie satisfait ou remboursé 30 jours' : '256-bit encrypted SSL · 30-day money-back guarantee'}</span>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-slate-50 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200/90 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {language === 'fr' ? 'Récapitulatif' : 'Order Summary'}
                </h4>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} {language === 'fr' ? 'articles' : 'pieces'}
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs">
                    <img
                      src={item.selectedColor?.image || item.product.primaryImage}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="font-semibold text-slate-950 truncate">{item.product.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.selectedColor?.name || 'Standard'} · {language === 'fr' ? 'Taille' : 'Size'} {item.selectedSize?.name || 'One Size'} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-mono font-bold text-slate-950 tabular-nums">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono tabular-nums text-slate-950 font-semibold">{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>{t('shipping')}</span>
                  <span className="font-mono tabular-nums text-slate-950 font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-semibold">{t('freeDelivery')}</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>{language === 'fr' ? 'Taxes estimées (8%)' : 'Estimated Tax (8%)'}</span>
                  <span className="font-mono tabular-nums text-slate-950">{formatPrice(estimatedTax)}</span>
                </div>

                <div className="flex justify-between text-base font-semibold text-slate-950 pt-2.5 border-t border-slate-200">
                  <span className="font-display font-bold">{t('total')}</span>
                  <span className="font-mono tabular-nums text-lg font-bold text-blue-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* WhatsApp Checkout Assistance Card */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>{language === 'fr' ? 'Assistance Directe' : 'Need Custom Checkout Help?'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  {language === 'fr' ? 'Une question sur le paiement ou la livraison ? Contactez notre concierge GLADYNS en direct.' : 'Have questions regarding order payment, corporate invoicing, or delivery timing? Chat with our GLADYNS support immediately.'}
                </p>
                <a
                  href={getWhatsAppLink(
                    `Hello GLADYNS Concierge, I need assistance with my checkout order (${items.length} pieces, Total: ${formatPrice(finalTotal)}).`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 bg-white hover:bg-emerald-100 text-emerald-950 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-emerald-300 transition-colors shadow-2xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>{language === 'fr' ? 'Assistance sur WhatsApp' : 'Chat with Support on WhatsApp'}</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>{language === 'fr' ? 'Garantie GLADYNS Officielle' : 'GLADYNS Certified Guarantee'}</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  {language === 'fr' ? 'Retours simplifiés sous 30 jours et garantie de 2 ans sur tous les appareils.' : '30-day effortless return guarantee with full coverage and 2-year warranty support on electronics and appliances.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
