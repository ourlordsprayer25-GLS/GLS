import React, { useState, useMemo } from 'react';
import { Order, StoreSettings } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { getWhatsAppLink } from '../WhatsAppWidget';
import { ReceiptModal } from '../receipts/ReceiptModal';
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
  Building,
  Clock,
  AlertTriangle,
  Gift,
  QrCode,
  Scissors,
  Sparkles,
  Award,
  Crown,
  Share2
} from 'lucide-react';

interface AdminReceiptsProps {
  orders: Order[];
  storeSettings?: StoreSettings;
}

export const AdminReceipts: React.FC<AdminReceiptsProps> = ({ orders, storeSettings }) => {
  const { formatPrice, language } = useLanguageCurrency();
  const isFr = language === 'fr';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'cod' | 'card' | 'wave' | 'delivered' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null);
  
  // Multiple Luxury Receipt Templates Switcher
  const [receiptTemplate, setReceiptTemplate] = useState<'standard' | 'gift' | 'delivery' | 'pos'>('standard');
  const [colorTheme, setColorTheme] = useState<'gold' | 'emerald' | 'obsidian'>('gold');

  // Store profile resolution (100% Genuine, Zero Mock)
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

  // Accurate genuine Payment Method & Status Resolver
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

    // 5. Apple Pay
    if (raw === 'apple-pay') {
      return {
        code: 'APPLEPAY',
        label: 'Apple Pay',
        channelName: 'Apple Pay Biométrique',
        icon: Smartphone,
        color: 'bg-slate-50 text-slate-800 border-slate-200',
        badgeBg: 'bg-slate-100 text-slate-900',
        isSettled: !isCancelled,
        statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Payé via Apple Pay' : 'Paid via Apple Pay'),
        statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
      };
    }

    // 6. Online Credit / Debit Card
    return {
      code: 'CARD',
      label: isFr ? 'Carte Bancaire (En ligne)' : 'Credit / Debit Card (Online)',
      channelName: isFr ? 'Paiement sécurisé par carte' : 'Secured Card Transaction',
      icon: CreditCard,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-900',
      isSettled: !isCancelled,
      statusLabel: isCancelled ? (isFr ? 'Annulé' : 'Cancelled') : (isFr ? 'Payé par carte' : 'Paid by Card'),
      statusColor: isCancelled ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
      statusDot: isCancelled ? 'bg-rose-500' : 'bg-emerald-500'
    };
  };

  // Format real date and time
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return { date: isFr ? 'Date inconnue' : 'Unknown date', time: '—' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        return { date: dateStr, time: '—' };
      }
      const locale = isFr ? 'fr-FR' : 'en-US';
      const date = d.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const time = d.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit'
      });
      return { date, time };
    } catch {
      return { date: dateStr, time: '—' };
    }
  };

  // Copy invoice number
  const handleCopy = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedInvoiceId(text);
    setTimeout(() => setCopiedInvoiceId(null), 2500);
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

        if (filterTab === 'cod') return info.code === 'COD';
        if (filterTab === 'card') return info.code === 'CARD' || info.code === 'APPLEPAY';
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

  // Overall Financial Metrics Calculated from REAL order data
  const metrics = useMemo(() => {
    let totalVolume = 0;
    let settledVolume = 0;
    let pendingCodVolume = 0;
    let codCount = 0;
    let cardCount = 0;
    let waveCount = 0;
    let settledCount = 0;

    orders.forEach(o => {
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
      avgTicket: orders.length > 0 ? totalVolume / orders.length : 0
    };
  }, [orders, isFr]);

  // Real CSV Ledger Export
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
      'Settlement Status',
      'Items Count',
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
      const sStatus = `"${info.statusLabel}"`;
      const itemsCount = o.items.reduce((s, it) => s + it.quantity, 0);
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
        sStatus,
        itemsCount,
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

  // Real Standalone HTML Invoice Download according to ACTIVE TEMPLATE
  const handleDownloadInvoiceHtml = (order: Order) => {
    const invoiceId = getInvoiceId(order);
    const { date, time } = formatDateTime(order.date);
    const pInfo = resolvePaymentInfo(order);

    let templateTitle = isFr ? 'Facture Commerciale' : 'Commercial Invoice';
    let filenamePrefix = 'Facture';

    if (receiptTemplate === 'gift') {
      templateTitle = isFr ? 'Reçu Cadeau Officiel (Sans Prix)' : 'Official Gift Receipt (No Prices)';
      filenamePrefix = 'Recu_Cadeau';
    } else if (receiptTemplate === 'delivery') {
      templateTitle = isFr ? 'Bordereau de Livraison & Expédition' : 'Delivery Slip & Waybill';
      filenamePrefix = 'Bordereau_Livraison';
    } else if (receiptTemplate === 'pos') {
      templateTitle = isFr ? 'Ticket de Caisse POS (80mm)' : 'POS Register Slip (80mm)';
      filenamePrefix = 'Ticket_POS';
    }

    const itemsRows = order.items.map(item => `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9;">
          <strong style="color: #0f172a; font-size: 13px; font-family: 'Playfair Display', Georgia, serif;">${item.product.name}</strong><br/>
          <span style="font-size: 11px; color: #64748b; letter-spacing: 0.5px;">${item.selectedColor?.name || 'Standard'} · ${item.selectedSize?.name || 'Unique'} · Qté: ${item.quantity}</span>
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #334155; font-weight: 700;">
          ${item.quantity}
        </td>
        ${receiptTemplate !== 'gift' ? `
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; font-weight: 800; color: #0f172a; font-family: monospace;">
          ${formatPrice(item.product.price * item.quantity)}
        </td>
        ` : `
        <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 11px; font-weight: 800; color: #d97706;">
          ★ ${isFr ? 'Certifié GLADYNS' : 'GLADYNS Certified'}
        </td>
        `}
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="${isFr ? 'fr' : 'en'}">
<head>
  <meta charset="utf-8">
  <title>${templateTitle} - ${invoiceId} - ${storeName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #fbf9f5; color: #0f172a; margin: 0; padding: 40px 20px; }
    .invoice-card { max-width: ${receiptTemplate === 'pos' ? '400px' : '720px'}; margin: 0 auto; background: #ffffff; border-radius: 24px; box-shadow: 0 15px 40px rgba(180, 130, 60, 0.08); border: 2px solid #e7dfd1; overflow: hidden; position: relative; }
    .gold-header { background: linear-gradient(135deg, #18181b 0%, #09090b 100%); color: #ffffff; padding: 36px 40px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #d4af37; }
    .store-name { font-size: 22px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase; margin: 0; color: #fef08a; font-family: Georgia, serif; }
    .store-sub { font-size: 11px; color: #a1a1aa; margin-top: 6px; letter-spacing: 1px; }
    .inv-badge { text-align: right; }
    .inv-title { font-size: 22px; font-weight: 900; font-family: monospace; color: #fbbf24; margin: 0; }
    .inv-date { font-size: 12px; color: #a1a1aa; margin-top: 4px; }
    .body-content { padding: 36px 40px; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
    .info-box { background: #faf8f5; border: 1px solid #ede8e1; border-radius: 16px; padding: 18px; }
    .section-label { font-size: 9px; font-weight: 900; color: #b45309; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .info-box p { margin: 3px 0; font-size: 13px; color: #27272a; }
    .info-box strong { color: #09090b; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; margin-bottom: 24px; border: 1px solid #ede8e1; border-radius: 16px; overflow: hidden; }
    th { background: #f5f2eb; padding: 12px 16px; font-size: 10px; font-weight: 800; color: #78350f; text-transform: uppercase; letter-spacing: 1.5px; border-bottom: 2px solid #e7dfd1; }
    .total-banner { background: linear-gradient(135deg, #18181b 0%, #09090b 100%); color: #ffffff; border-radius: 16px; padding: 22px; text-align: right; margin-top: 24px; border: 1px solid #d4af37; }
    .total-title { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #fef08a; letter-spacing: 2px; }
    .total-amount { font-size: 32px; font-weight: 900; font-family: monospace; color: #fbbf24; margin-top: 6px; }
    .gift-notice { background: #fefce8; border: 1.5px solid #fef08a; border-radius: 16px; padding: 20px; color: #854d0e; font-size: 12px; line-height: 1.6; margin-top: 24px; }
    .seal-footer { text-align: center; padding: 28px 40px; border-top: 1px dashed #d4af37; font-size: 12px; color: #71717a; background: #faf8f5; }
    .btn-print { display: inline-block; background: #18181b; color: #fef08a; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 800; font-size: 12px; margin-top: 18px; cursor: pointer; border: 1px solid #d4af37; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { box-shadow: none; border: 1px solid #e2e8f0; max-width: 100%; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="gold-header">
      <div>
        <h1 class="store-name">${storeName}</h1>
        <div class="store-sub">${storeAddress}</div>
        <div class="store-sub">${storeDomain} · ${storePhone}</div>
      </div>
      <div class="inv-badge">
        <h2 class="inv-title">${receiptTemplate === 'gift' ? `GIFT-${order.orderNumber}` : invoiceId}</h2>
        <div class="inv-date">${isFr ? 'Date :' : 'Date:'} ${date} ${time !== '—' ? '· ' + time : ''}</div>
        <div style="margin-top: 10px;">
          <span style="background: ${receiptTemplate === 'gift' ? '#d97706' : pInfo.isSettled ? '#059669' : '#d97706'}; color: white; padding: 5px 12px; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            ${receiptTemplate === 'gift' ? (isFr ? '🎁 Reçu Cadeau' : '🎁 Gift Receipt') : pInfo.statusLabel}
          </span>
        </div>
      </div>
    </div>

    <div class="body-content">
      <div class="grid-info">
        <div class="info-box">
          <div class="section-label">${isFr ? 'Destinataire (Client)' : 'Recipient / Customer'}</div>
          <p><strong>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong></p>
          <p>${order.shippingAddress.street}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.country || 'Côte d\'Ivoire'}</p>
          <p>${order.shippingAddress.phone || ''}</p>
        </div>
        <div class="info-box" style="text-align: right;">
          <div class="section-label">${isFr ? 'Règlement & Commande' : 'Order & Channel'}</div>
          ${receiptTemplate !== 'gift' ? `
            <p><strong>${isFr ? 'Mode :' : 'Method:'} ${pInfo.label}</strong></p>
          ` : `
            <p><strong>🎁 ${isFr ? 'Reçu sans indication de prix' : 'Price Hidden for Gifting'}</strong></p>
          `}
          <p>${isFr ? 'N° Commande :' : 'Order #:'} <code>${order.orderNumber}</code></p>
          <p>${isFr ? 'Livraison :' : 'Fulfillment:'} <strong>${order.status.toUpperCase()}</strong></p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="text-align: left;">${isFr ? 'Article de Haute Facture' : 'Curated Item Description'}</th>
            <th style="text-align: center;">${isFr ? 'Quantité' : 'Qty'}</th>
            <th style="text-align: right;">${receiptTemplate === 'gift' ? (isFr ? 'Authenticité' : 'Warranty') : (isFr ? 'Total' : 'Total')}</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${receiptTemplate !== 'gift' ? `
      <div class="total-banner">
        <div class="total-title">${isFr ? 'Montant Total Règlement' : 'Total Settled Amount'}</div>
        <div class="total-amount">${formatPrice(order.total)}</div>
        <div style="font-size: 11px; color: ${pInfo.isSettled ? '#34d399' : '#fde047'}; font-weight: 700; margin-top: 6px;">
          ✓ ${pInfo.statusLabel}
        </div>
      </div>
      ` : `
      <div class="gift-notice">
        <strong style="color: #78350f;">🎁 ${isFr ? 'Garantie & Certificat d\'Échange sous 30 Jours :' : '30-Day Gift Exchange Guarantee:'}</strong><br/>
        ${isFr 
          ? `Ce reçu cadeau certifie l'authenticité de vos créations chez ${storeName}. Il permet au destinataire de procéder à un échange de taille/couleur ou de solliciter le service client dans un délai de 30 jours, sans aucune divulgation de prix.`
          : `This gift receipt certifies the authenticity of your acquisition from ${storeName}. It allows the recipient to exchange size/color or request service support within 30 days without disclosing item values.`}
      </div>
      `}
    </div>

    <div class="seal-footer">
      <p style="margin: 0; font-style: italic; font-family: Georgia, serif;">« ${isFr ? `Maison ${storeName} · Authenticité et Qualité d'Exception Garanties.` : `House of ${storeName} · Exceptional Craftsmanship & Quality Guaranteed.`} »</p>
      <div style="margin-top: 14px;">
        <button class="btn-print" onclick="window.print()">${isFr ? 'Imprimer ce document de prestige (PDF)' : 'Print Prestige Document (PDF)'}</button>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${invoiceId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // WhatsApp receipt share message adjusted for ACTIVE TEMPLATE
  const getReceiptWhatsAppUrl = (order: Order) => {
    const inv = getInvoiceId(order);
    const clientName = `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`.trim();
    const pInfo = resolvePaymentInfo(order);

    let text = '';
    if (receiptTemplate === 'gift') {
      text = isFr
        ? `🎁 Bonjour ${clientName},\nVoici votre reçu cadeau officiel pour la commande ${order.orderNumber} chez ${storeName}.\n\nCe reçu sans mention de prix certifie l'authenticité de vos pièces et permet tout échange de taille sous 30 jours.\n\nMerci pour votre confiance sur ${storeDomain} !`
        : `🎁 Hello ${clientName},\nHere is your official Gift Receipt for order ${order.orderNumber} from ${storeName}.\n\nThis receipt hides prices and allows size exchange or warranty support within 30 days.\n\nThank you for choosing ${storeDomain}!`;
    } else if (receiptTemplate === 'delivery') {
      text = isFr
        ? `🚚 *BORDEREAU DE LIVRAISON GLADYNS*\nN° Commande : ${order.orderNumber}\nClient : ${clientName}\nTéléphone : ${order.shippingAddress.phone || 'Non renseigné'}\nAdresse : ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\n📌 Modalité : ${pInfo.label}\n💰 Montant : ${pInfo.code === 'COD' && order.status !== 'delivered' ? `ENCAISSER EN CASH : ${formatPrice(order.total)}` : 'DÉJÀ RÉGLÉ EN LIGNE'}`
        : `🚚 *GLADYNS DELIVERY WAYBILL*\nOrder #: ${order.orderNumber}\nCustomer: ${clientName}\nPhone: ${order.shippingAddress.phone || 'N/A'}\nAddress: ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\n📌 Directives: ${pInfo.code === 'COD' && order.status !== 'delivered' ? `COLLECT CASH: ${formatPrice(order.total)}` : 'ALREADY PAID ONLINE'}`;
    } else {
      text = isFr 
        ? `Bonjour ${clientName},\nVoici le reçu officiel de votre commande chez ${storeName}.\n\n📄 Réf. Facture : ${inv}\n📦 N° Commande : ${order.orderNumber}\n💰 Montant Total : ${formatPrice(order.total)}\n💳 Mode de paiement : ${pInfo.label}\n📌 Statut : ${pInfo.statusLabel}\n🚚 Adresse de livraison : ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\nMerci pour votre confiance sur ${storeDomain} !`
        : `Hello ${clientName},\nHere is your official purchase receipt from ${storeName}.\n\n📄 Invoice Ref: ${inv}\n📦 Order #: ${order.orderNumber}\n💰 Total Amount: ${formatPrice(order.total)}\n💳 Payment: ${pInfo.label}\n📌 Status: ${pInfo.statusLabel}\n🚚 Delivery Address: ${order.shippingAddress.street}, ${order.shippingAddress.city}\n\nThank you for choosing ${storeDomain}!`;
    }

    const phone = order.shippingAddress.phone?.replace(/[^0-9+]/g, '') || storePhone;
    return getWhatsAppLink(text, phone);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Clean Print CSS: Shows ONLY the active receipt without any website chrome */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #admin-printable-receipt, #admin-printable-receipt * {
            visibility: visible !important;
          }
          #admin-printable-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            z-index: 99999 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Bar with Store Logo & Identity */}
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
                ? `Maison de Commerce ${storeName} · Reçus d'exception, facturation & bordereaux d'expédition.` 
                : `House of ${storeName} · Official accounting invoices, gift cards, and courier delivery slips.`}
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
            <span>{isFr ? 'Exporter le Grand Livre (CSV)' : 'Export Ledger (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards based on REAL transaction data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Invoiced Volume */}
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
              <span>{metrics.totalCount} {isFr ? 'commandes passées' : 'total orders'}</span>
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

        {/* Metric 3: Pending Cash on Delivery (COD) */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-blue-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'À Encaisser à la Livraison' : 'Due on Delivery (COD)'}
            </span>
            <p className="text-2xl font-black text-blue-600 font-mono tracking-tight">
              {formatPrice(metrics.pendingCodVolume)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
              <Truck className="w-3.5 h-3.5" />
              <span>{metrics.codCount} {isFr ? 'en livraison cash' : 'cash-on-delivery orders'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-blue-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Average Order Ticket */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between relative overflow-hidden group hover:border-blue-400/60 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'Panier Moyen' : 'Average Receipt Value'}
            </span>
            <p className="text-2xl font-black text-zinc-950 font-mono tracking-tight">
              {formatPrice(metrics.avgTicket)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{storeDomain}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6 text-blue-600" />
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
            { id: 'all', label: isFr ? 'Toutes les factures' : 'All Receipts', count: orders.length },
            { id: 'cod', label: isFr ? 'Paiement à la livraison (Cash)' : 'Cash on Delivery (COD)', count: metrics.codCount },
            { id: 'delivered', label: isFr ? 'Encaissées / Livrées' : 'Delivered & Settled', count: orders.filter(o => o.status === 'delivered').length },
            { id: 'card', label: isFr ? 'Cartes Bancaires' : 'Credit Card', count: metrics.cardCount },
            { id: 'wave', label: 'Wave & Mobile Money', count: metrics.waveCount },
            { id: 'cancelled', label: isFr ? 'Annulées' : 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-950 text-white shadow-xs'
                    : 'bg-zinc-100/70 text-zinc-600 hover:bg-zinc-200/70'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isActive ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Receipts Table Container */}
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
                  {isFr ? 'Montant & Statut' : 'Amount & Status'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">
                  {isFr ? 'Actions' : 'Actions'}
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

                return (
                  <tr 
                    key={order.id} 
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-amber-500/5 transition-all group cursor-pointer"
                  >
                    {/* Column 1: Document */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-zinc-600 transition-colors shrink-0 shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-zinc-950 group-hover:text-amber-700 transition-colors">
                              {invId}
                            </span>
                            <button
                              onClick={(e) => handleCopy(invId, e)}
                              className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors"
                              title={isFr ? "Copier le numéro de facture" : "Copy invoice number"}
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] text-zinc-500 font-medium">{date}</span>
                            {time !== '—' && (
                              <>
                                <span className="text-zinc-300">·</span>
                                <span className="text-[10px] text-zinc-400 font-mono">{time}</span>
                              </>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            Ref: #{order.orderNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Customer */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-950">
                          {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          {order.shippingAddress.email}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span>{order.shippingAddress.city || (isFr ? 'Abidjan' : 'Abidjan')}</span>
                          {order.shippingAddress.phone && (
                            <>
                              <span>·</span>
                              <span className="font-mono text-zinc-600 font-medium">{order.shippingAddress.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 3: Items Thumbnails stack */}
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

                    {/* Column 5: Total & Status */}
                    <td className="px-6 py-4 text-right">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-zinc-950 font-mono">
                          {formatPrice(order.total)}
                        </p>
                        <div className="flex items-center justify-end gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${paymentInfo.statusDot}`} />
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${paymentInfo.statusColor}`}>
                            {paymentInfo.statusLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Column 6: Quick Actions */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => {
                            setReceiptTemplate('standard');
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Afficher le reçu complet" : "View full receipt"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setReceiptTemplate('gift');
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Reçu Cadeau (Sans prix)" : "Gift Receipt (No prices)"}
                        >
                          <Gift className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setReceiptTemplate('delivery');
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Bordereau de livraison" : "Delivery Slip"}
                        >
                          <Truck className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setTimeout(() => window.print(), 250);
                          }}
                          className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Imprimer le reçu" : "Print receipt"}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadInvoiceHtml(order)}
                          className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Télécharger la facture HTML / PDF" : "Download invoice HTML / PDF"}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => window.open(getReceiptWhatsAppUrl(order), '_blank')}
                          className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer" 
                          title={isFr ? "Envoyer via WhatsApp" : "Send via WhatsApp"}
                        >
                          <MessageSquare className="w-4 h-4" />
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

      {/* Modern Blue & White Receipt Modal with 4 Reference Formats */}
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
