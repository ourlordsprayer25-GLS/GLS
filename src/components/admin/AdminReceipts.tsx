import React, { useState, useMemo } from 'react';
import { Order, StoreSettings, StoreNotification } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { getWhatsAppLink } from '../WhatsAppWidget';
import { ReceiptModal } from '../receipts/ReceiptModal';
import { printReceipt, downloadReceiptFile } from '../../services/receiptPrintService';
import { updateRealtimeOrderReview, addRealtimeNotification } from '../../services/supabaseService';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  CreditCard, 
  Eye, 
  X, 
  Package,
  Check,
  Copy,
  Smartphone,
  Banknote,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Receipt,
  Truck,
  Clock,
  Gift,
  Mail,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface AdminReceiptsProps {
  orders: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  setNotifications?: React.Dispatch<React.SetStateAction<StoreNotification[]>>;
  storeSettings?: StoreSettings;
  initialSearchQuery?: string;
}

export const AdminReceipts: React.FC<AdminReceiptsProps> = ({ 
  orders, 
  setOrders, 
  setNotifications, 
  storeSettings,
  initialSearchQuery
}) => {
  const { formatPrice, language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [filterTab, setFilterTab] = useState<'all' | 'pending_review' | 'reviewed' | 'delivered' | 'cod' | 'card' | 'wave' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Luxury Receipt Template
  const [receiptTemplate, setReceiptTemplate] = useState<'standard' | 'gift' | 'delivery' | 'pos'>('standard');

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Auto-dismiss toast
  React.useEffect(() => {
    if (actionToast) {
      const t = setTimeout(() => setActionToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [actionToast]);

  // Store profile resolution
  const storeName = storeSettings?.storeName || 'GLADYNS MARKETPLACE';
  const storeAddress = storeSettings?.contactAddress || "Habitat Extension, E 24, Abidjan, Côte d'Ivoire";
  const storePhone = storeSettings?.contactPhone || storeSettings?.whatsappNumber || '+225 05 00 61 99 23';
  const storeEmail = storeSettings?.contactEmail || 'contact@gladyns.store';
  const storeDomain = 'gladyns.store';

  // Format standard invoice ID
  const getInvoiceId = (order: Order) => {
    const raw = (order.orderNumber || order.id).replace(/[^a-zA-Z0-9]/g, '');
    return `INV-${raw.slice(-8).toUpperCase()}`;
  };

  // Accurate Payment Method & Status Resolver
  const resolvePaymentInfo = (order: Order) => {
    const raw = (order.paymentMethod || '').trim().toLowerCase();
    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';

    // 1. Cash on Delivery (COD)
    if (raw === 'cod' || raw.includes('cash') || raw.includes('livraison')) {
      return {
        code: 'COD',
        label: isFr ? 'Paiement à la livraison (Cash / Espèces)' : 'Cash on Delivery (COD)',
        channelName: isFr ? 'Espèces à la réception du colis' : 'Cash upon parcel handover',
        icon: Banknote,
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-900',
        isSettled: isDelivered,
        statusLabel: isCancelled
          ? (isFr ? 'Annulé' : 'Cancelled')
          : isDelivered
          ? (isFr ? 'Encaissé à la livraison' : 'Collected on Delivery')
          : (isFr ? 'À régler à la livraison' : 'Due upon Delivery'),
        statusColor: isCancelled
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : isDelivered
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
          : 'bg-amber-50 text-amber-800 border-amber-200',
        statusDot: isCancelled ? 'bg-rose-500' : isDelivered ? 'bg-emerald-500' : 'bg-amber-500'
      };
    }

    // 2. Wave Mobile Money
    if (raw.includes('wave')) {
      return {
        code: 'WAVE',
        label: 'Wave Mobile Money',
        channelName: 'Wave Côte d\'Ivoire',
        icon: Smartphone,
        color: 'bg-sky-50 text-sky-800 border-sky-200',
        badgeBg: 'bg-sky-100 text-sky-900',
        isSettled: !isCancelled,
        statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Payé via Wave' : 'Paid via Wave'),
        statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
      };
    }

    // 3. Orange Money
    if (raw.includes('orange') || raw.includes('om')) {
      return {
        code: 'OM',
        label: 'Orange Money',
        channelName: 'Orange Money Côte d\'Ivoire',
        icon: Smartphone,
        color: 'bg-orange-50 text-orange-800 border-orange-200',
        badgeBg: 'bg-orange-100 text-orange-900',
        isSettled: !isCancelled,
        statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Payé via Orange Money' : 'Paid via Orange Money'),
        statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
      };
    }

    // 4. MTN MoMo
    if (raw.includes('mtn')) {
      return {
        code: 'MTN',
        label: 'MTN Mobile Money',
        channelName: 'MTN MoMo CI',
        icon: Smartphone,
        color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
        badgeBg: 'bg-yellow-100 text-yellow-900',
        isSettled: !isCancelled,
        statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Payé via MTN MoMo' : 'Paid via MTN MoMo'),
        statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
      };
    }

    // Default: Credit / Debit Card
    return {
      code: 'CARD',
      label: isFr ? 'Carte Bancaire (Visa / Mastercard)' : 'Credit Card (Visa / Mastercard)',
      channelName: 'Passerelle Bancaire Sécurisée 3D-Secure',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-900',
      isSettled: !isCancelled,
      statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Encaissé en ligne' : 'Paid Online'),
      statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
    };
  };

  // Format date & time
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { date: dateStr, time: '' };
      return {
        date: d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString(isFr ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } catch (e) {
      return { date: dateStr, time: '' };
    }
  };

  // Copy invoice reference
  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(text);
    setTimeout(() => setCopiedInvoiceId(null), 2000);
  };

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        const inv = getInvoiceId(order).toLowerCase();
        const ord = (order.orderNumber || '').toLowerCase();
        const fName = (order.shippingAddress?.firstName || '').toLowerCase();
        const lName = (order.shippingAddress?.lastName || '').toLowerCase();
        const email = (order.shippingAddress?.email || '').toLowerCase();
        const phone = (order.shippingAddress?.phone || '').toLowerCase();
        const city = (order.shippingAddress?.city || '').toLowerCase();
        const q = searchQuery.toLowerCase().trim();

        const matchesQuery = !q || 
          inv.includes(q) || 
          ord.includes(q) || 
          fName.includes(q) || 
          lName.includes(q) || 
          email.includes(q) || 
          phone.includes(q) || 
          city.includes(q);

        if (!matchesQuery) return false;

        const info = resolvePaymentInfo(order);

        if (filterTab === 'pending_review') return !order.receiptReviewed;
        if (filterTab === 'reviewed') return !!order.receiptReviewed;
        if (filterTab === 'cod') return info.code === 'COD';
        if (filterTab === 'card') return info.code === 'CARD';
        if (filterTab === 'wave') return info.code === 'WAVE' || info.code === 'OM' || info.code === 'MTN';
        if (filterTab === 'delivered') return order.status === 'delivered';
        if (filterTab === 'cancelled') return order.status === 'cancelled';

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'amount_desc') return b.total - a.total;
        if (sortBy === 'amount_asc') return a.total - b.total;
        if (sortBy === 'date_asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [orders, searchQuery, filterTab, sortBy, isFr]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    let totalVolume = 0;
    let settledVolume = 0;
    let pendingCodVolume = 0;
    let codCount = 0;
    let cardCount = 0;
    let waveCount = 0;
    let settledCount = 0;
    let pendingReviewCount = 0;
    let reviewedCount = 0;

    orders.forEach(o => {
      if (o.receiptReviewed) {
        reviewedCount++;
      } else {
        pendingReviewCount++;
      }

      if (o.status === 'cancelled') return;
      totalVolume += o.total;
      const info = resolvePaymentInfo(o);
      if (info.code === 'COD') {
        codCount++;
        if (o.status === 'delivered') {
          settledVolume += o.total;
          settledCount++;
        } else {
          pendingCodVolume += o.total;
        }
      } else {
        settledVolume += o.total;
        settledCount++;
        if (info.code === 'WAVE' || info.code === 'OM' || info.code === 'MTN') {
          waveCount++;
        } else {
          cardCount++;
        }
      }
    });

    return {
      totalVolume,
      settledVolume,
      pendingCodVolume,
      totalCount: orders.length,
      settledCount,
      codCount,
      cardCount,
      waveCount,
      pendingReviewCount,
      reviewedCount,
      avgTicket: orders.length > 0 ? totalVolume / orders.length : 0
    };
  }, [orders, isFr]);

  // Toggle Receipt Review Status & Notify Customer
  const handleToggleReview = async (order: Order) => {
    const nextReviewed = !order.receiptReviewed;
    
    // 1. Update server & Supabase
    await updateRealtimeOrderReview(order.id, nextReviewed);

    // 2. Update local state
    if (setOrders) {
      setOrders(prev => prev.map(o => o.id === order.id ? { 
        ...o, 
        receiptReviewed: nextReviewed, 
        receiptReviewedAt: Date.now() 
      } : o));
    }

    // 3. Dispatch customer notification when reviewed
    if (nextReviewed) {
      const notif: StoreNotification = {
        id: `notif-receipt-${order.id}-${Date.now()}`,
        title: isFr 
          ? `Reçu Officiel Disponible : #${order.orderNumber}` 
          : `Official Receipt Ready: #${order.orderNumber}`,
        message: isFr 
          ? `Votre reçu d'achat officiel pour la commande #${order.orderNumber} a été validé et est prêt à être téléchargé.` 
          : `Your certified purchase receipt for Order #${order.orderNumber} has been verified and released for download.`,
        timestamp: Date.now(),
        read: false,
        type: 'order',
        linkTarget: order.orderNumber,
        customerId: order.customerId,
      };

      await addRealtimeNotification(notif);
      if (setNotifications) {
        setNotifications(prev => [notif, ...prev]);
      }

      setActionToast({
        message: isFr 
          ? `Reçu #${order.orderNumber} validé avec succès ! Notification envoyée au client.` 
          : `Receipt #${order.orderNumber} reviewed! Customer notification dispatched.`,
        type: 'success'
      });
    } else {
      setActionToast({
        message: isFr 
          ? `Validation du reçu #${order.orderNumber} révoquée.` 
          : `Receipt #${order.orderNumber} review revoked.`,
        type: 'info'
      });
    }
  };

  // Direct File Download (Never opens print dialog)
  const handleDirectDownload = (order: Order) => {
    downloadReceiptFile(order, {
      template: receiptTemplate as any,
      storeSettings,
      formatPrice,
      language,
    });
    setActionToast({
      message: isFr 
        ? `Téléchargement du reçu #${order.orderNumber} en cours...` 
        : `Downloading receipt file for #${order.orderNumber}...`,
      type: 'success'
    });
  };

  // Native Print Launcher (Can print multiple orders in succession without locking)
  const handlePrint = (order: Order) => {
    printReceipt(order, {
      template: receiptTemplate as any,
      storeSettings,
      formatPrice,
      language,
    });
  };

  // Send Receipt via Email
  const handleEmailReceipt = async (order: Order) => {
    const customerEmail = order.shippingAddress?.email;
    if (!customerEmail) {
      setActionToast({
        message: isFr 
          ? 'Aucune adresse email renseignée pour ce client.' 
          : 'No email address found for this order.',
        type: 'error'
      });
      return;
    }

    setSendingEmailId(order.id);
    const customerName = `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() || 'Client';
    const totalStr = formatPrice(order.total);
    const paymentInfo = resolvePaymentInfo(order);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: customerEmail,
          subject: `GLADYNS — Reçu Officiel d'Achat #${order.orderNumber}`,
          customerName,
          orderNumber: order.orderNumber,
          statusText: order.status === 'delivered' ? 'Livré (Reçu Certifié)' : 'Validé',
          detailsText: `Facture Réf. ${getInvoiceId(order)} · Total: ${totalStr} · Règlement: ${paymentInfo.label} (${paymentInfo.statusLabel})`,
        }),
      });

      if (res.ok) {
        setActionToast({
          message: isFr 
            ? `Reçu transmis par email à ${customerEmail} !` 
            : `Receipt emailed to ${customerEmail}!`,
          type: 'success'
        });
      } else {
        throw new Error('Email failed');
      }
    } catch (e) {
      // Fallback: mailto
      const subject = encodeURIComponent(`GLADYNS — Reçu Officiel #${order.orderNumber}`);
      const body = encodeURIComponent(
        `Bonjour ${customerName},\n\nVotre reçu officiel pour la commande #${order.orderNumber} est disponible.\nMontant: ${totalStr}\nStatut: ${paymentInfo.statusLabel}\n\nConsultez votre reçu en ligne sur https://${storeDomain}\n\nMerci de votre confiance,\nGLADYNS`
      );
      window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, '_blank');
      setActionToast({
        message: isFr 
          ? `Application email ouverte pour ${customerEmail}` 
          : `Opened email client for ${customerEmail}`,
        type: 'info'
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  // WhatsApp receipt share message
  const getReceiptWhatsAppUrl = (order: Order) => {
    const inv = getInvoiceId(order);
    const clientName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();
    const pInfo = resolvePaymentInfo(order);

    let text = isFr 
      ? `Bonjour ${clientName},\nVoici le reçu officiel de votre commande chez ${storeName}.\n\n📄 Réf. Facture : ${inv}\n📦 N° Commande : ${order.orderNumber}\n💰 Montant Total : ${formatPrice(order.total)}\n💳 Mode de paiement : ${pInfo.label}\n📌 Statut : ${pInfo.statusLabel}\n🚚 Adresse : ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\nConsultez et téléchargez votre reçu en ligne sur : https://${storeDomain}\n\nMerci pour votre confiance !`
      : `Hello ${clientName},\nHere is your official purchase receipt from ${storeName}.\n\n📄 Invoice Ref: ${inv}\n📦 Order #: ${order.orderNumber}\n💰 Total Amount: ${formatPrice(order.total)}\n💳 Payment: ${pInfo.label}\n📌 Status: ${pInfo.statusLabel}\n🚚 Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\nDownload your receipt online at: https://${storeDomain}\n\nThank you for choosing ${storeDomain}!`;

    const phone = order.shippingAddress.phone?.replace(/[^0-9+]/g, '') || storePhone;
    return getWhatsAppLink(text, phone);
  };

  // Export CSV Ledger
  const handleExportLedger = () => {
    const headers = [
      'Invoice Number',
      'Order Reference',
      'Date',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Delivery Address',
      'City',
      'Country',
      'Payment Method',
      'Receipt Reviewed',
      'Total Amount'
    ];

    const rows = filteredOrders.map(o => {
      const inv = getInvoiceId(o);
      const name = `"${o.shippingAddress.firstName || ''} ${o.shippingAddress.lastName || ''}"`.trim();
      const email = `"${o.shippingAddress.email || ''}"`;
      const phone = `"${o.shippingAddress.phone || ''}"`;
      const address = `"${(o.shippingAddress.street || '').replace(/"/g, '""')}"`;
      const city = `"${o.shippingAddress.city || ''}"`;
      const country = `"${o.shippingAddress.country || ''}"`;
      const info = resolvePaymentInfo(o);
      const pMethod = `"${info.label}"`;
      const isReviewed = o.receiptReviewed ? 'YES' : 'NO';
      const total = o.total;

      return [
        inv,
        o.orderNumber || o.id,
        o.date,
        name,
        email,
        phone,
        address,
        city,
        country,
        pMethod,
        isReviewed,
        total
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `receipts_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast Feedback */}
      {actionToast && (
        <div className={`fixed bottom-6 right-6 z-[999] px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold text-white transition-all transform animate-in slide-in-from-bottom-3 ${
          actionToast.type === 'success' ? 'bg-emerald-600' : actionToast.type === 'error' ? 'bg-rose-600' : 'bg-zinc-900'
        }`}>
          {actionToast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{actionToast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-zinc-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center p-1.5 shadow-md border border-amber-500/30 shrink-0 ring-2 ring-amber-400/20">
            <img 
              src="/assets/logo-icon.png" 
              alt={storeName} 
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-zinc-950 tracking-tight">
                {isFr ? 'Grand Livre des Reçus & Facturation' : 'Receipt Ledger & Invoices'}
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                PRESTIGE
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5 font-sans">
              {isFr 
                ? `Maison de Commerce ${storeName} · Reçus d'exception, validation & transmission client.` 
                : `House of ${storeName} · Official accounting receipts, administrative review & delivery.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportLedger}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:border-blue-400 text-zinc-900 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-amber-50/50 cursor-pointer active:scale-95"
            title={isFr ? 'Exporter toutes les lignes au format CSV' : 'Export ledger rows to CSV'}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>{isFr ? 'Exporter CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Volume */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-blue-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'Volume Total Commandes' : 'Total Invoiced Volume'}
            </span>
            <p className="text-2xl font-black text-zinc-950 font-mono tracking-tight">
              {formatPrice(metrics.totalVolume)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span>{metrics.totalCount} {isFr ? 'reçus au total' : 'total receipts'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Settled / Paid Volume */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-emerald-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'Volume Encaissé / Réglé' : 'Collected / Settled Volume'}
            </span>
            <p className="text-2xl font-black text-emerald-600 font-mono tracking-tight">
              {formatPrice(metrics.settledVolume)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{metrics.settledCount} {isFr ? 'factures réglées' : 'settled receipts'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Pending Review Count */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-amber-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">
              {isFr ? 'En Attente de Validation' : 'Pending Admin Review'}
            </span>
            <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              {metrics.pendingReviewCount}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              <span>{isFr ? 'À réviser pour visibilité' : 'Require review for release'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Reviewed & Released */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-blue-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'Reçus Validés & Visibles' : 'Reviewed & Released'}
            </span>
            <p className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {metrics.reviewedCount}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{isFr ? 'Accessibles aux clients' : 'Accessible by patrons'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={isFr ? "Rechercher par N° Facture, Commande, Client, Téléphone, Ville..." : "Search by Invoice #, Order #, Customer, Phone, City..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 focus:bg-white focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 p-1 text-zinc-400 hover:text-zinc-600 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">
              {isFr ? 'Trier par :' : 'Sort by:'}
            </span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="pl-3 pr-8 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 cursor-pointer"
              >
                <option value="date_desc">{isFr ? 'Date : Plus récent' : 'Date: Newest First'}</option>
                <option value="date_asc">{isFr ? 'Date : Plus ancien' : 'Date: Oldest First'}</option>
                <option value="amount_desc">{isFr ? 'Montant : Élevé → Faible' : 'Amount: High to Low'}</option>
                <option value="amount_asc">{isFr ? 'Montant : Faible → Élevé' : 'Amount: Low to High'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-zinc-100 text-xs">
          {[
            { id: 'all', label: isFr ? 'Tous les reçus' : 'All Receipts', count: orders.length },
            { id: 'pending_review', label: isFr ? 'En attente de validation' : 'Pending Review', count: metrics.pendingReviewCount, highlight: true },
            { id: 'reviewed', label: isFr ? 'Validés & Publiés' : 'Reviewed & Released', count: metrics.reviewedCount },
            { id: 'delivered', label: isFr ? 'Commandes Livrées' : 'Delivered Orders', count: orders.filter(o => o.status === 'delivered').length },
            { id: 'cod', label: isFr ? 'Paiement à la livraison' : 'Cash on Delivery', count: metrics.codCount },
            { id: 'card', label: isFr ? 'Cartes Bancaires' : 'Credit Card', count: metrics.cardCount },
            { id: 'wave', label: 'Mobile Money', count: metrics.waveCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                filterTab === tab.id
                  ? 'bg-zinc-950 text-white shadow-xs'
                  : tab.highlight && tab.count > 0
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                filterTab === tab.id ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/80 text-zinc-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/70">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {isFr ? 'Document / Facture' : 'Document / Invoice'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {isFr ? 'Client & Destinataire' : 'Customer & Client'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {isFr ? 'Articles' : 'Items'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">
                  {isFr ? 'Mode de Règlement' : 'Payment Method'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">
                  {isFr ? 'Montant & Validation' : 'Amount & Review'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">
                  {isFr ? 'Actions Reçu' : 'Receipt Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredOrders.map((order) => {
                const invId = getInvoiceId(order);
                const paymentInfo = resolvePaymentInfo(order);
                const { date, time } = formatDateTime(order.date);
                const PaymentIcon = paymentInfo.icon;
                const isCopied = copiedInvoiceId === invId;
                const isReviewed = !!order.receiptReviewed;

                return (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-amber-500/5 transition-all group cursor-pointer"
                  >
                    {/* Column 1: Document */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shrink-0 shadow-xs ${
                          isReviewed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-zinc-950 group-hover:text-blue-700 transition-colors">
                              {invId}
                            </span>
                            <button
                              onClick={(e) => handleCopy(invId, e)}
                              className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors"
                              title={isFr ? "Copier le numéro de facture" : "Copy invoice number"}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-medium text-zinc-500 font-mono">
                              {order.orderNumber}
                            </span>
                            <span className="text-zinc-300">·</span>
                            <span className="text-[11px] text-zinc-400">
                              {date} {time && `(${time})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Customer */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-900">
                          {order.shippingAddress?.firstName || 'Client'} {order.shippingAddress?.lastName || ''}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {order.shippingAddress?.phone || order.shippingAddress?.email || 'N/A'}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {order.shippingAddress?.city}, {order.shippingAddress?.country}
                        </p>
                      </div>
                    </td>

                    {/* Column 3: Items */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.selectedColor?.image || item.product.primaryImage}
                              alt={item.product.name}
                              className="inline-block h-8 w-8 rounded-lg ring-2 ring-white object-cover bg-zinc-100 shadow-2xs"
                              title={`${item.product.name} (x${item.quantity})`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded-md">
                          {order.items.reduce((s, it) => s + it.quantity, 0)} {isFr ? 'art.' : 'items'}
                        </span>
                      </div>
                    </td>

                    {/* Column 4: Payment Mode */}
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${paymentInfo.color}`}>
                        <PaymentIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{paymentInfo.label}</span>
                      </div>
                    </td>

                    {/* Column 5: Total & Review Status */}
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-zinc-950 font-mono">
                          {formatPrice(order.total)}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {isReviewed ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-2 py-0.5 rounded-md shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{isFr ? 'Validé & Publié' : 'Reviewed & Live'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shadow-2xs">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>{isFr ? 'En attente de revue' : 'Pending Review'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 6: Quick Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {/* Review / Release Toggle Button */}
                        <button
                          onClick={() => handleToggleReview(order)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            isReviewed
                              ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                          title={isReviewed 
                            ? (isFr ? 'Révoquer la validation du reçu' : 'Revoke receipt review') 
                            : (isFr ? 'Valider et rendre visible pour le client' : 'Review and release receipt to customer')}
                        >
                          {isReviewed ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>{isReviewed ? (isFr ? 'Validé' : 'Reviewed') : (isFr ? 'Valider le reçu' : 'Review Receipt')}</span>
                        </button>

                        {/* Direct File Download */}
                        <button 
                          onClick={() => handleDirectDownload(order)}
                          className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Télécharger le reçu directement (Fichier)" : "Download receipt file directly"}
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {/* Print Receipt */}
                        <button 
                          onClick={() => handlePrint(order)}
                          className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Imprimer le reçu" : "Print receipt"}
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Send via Email */}
                        <button 
                          onClick={() => handleEmailReceipt(order)}
                          disabled={sendingEmailId === order.id}
                          className="p-2 text-zinc-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer disabled:opacity-50" 
                          title={isFr ? "Envoyer le reçu par Email" : "Email receipt to customer"}
                        >
                          {sendingEmailId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        </button>

                        {/* Send via WhatsApp */}
                        <button 
                          onClick={() => window.open(getReceiptWhatsAppUrl(order), '_blank')}
                          className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Envoyer le reçu via WhatsApp" : "Send receipt via WhatsApp"}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Full Preview */}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Aperçu interactif du reçu" : "Preview receipt"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-zinc-950">
              {isFr ? 'Aucun reçu correspondant trouvé' : 'No matching receipts found'}
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {isFr 
                ? 'Essayez de modifier votre mot-clé de recherche ou réinitialisez le filtre sélectionné.' 
                : 'Try adjusting your search query or reset your selected filter.'}
            </p>
            {(searchQuery || filterTab !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterTab('all');
                }}
                className="mt-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all cursor-pointer"
              >
                {isFr ? 'Réinitialiser les filtres' : 'Reset filters'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modern Receipt Modal */}
      {selectedOrder && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          storeSettings={storeSettings}
        />
      )}
    </div>
  );
};
