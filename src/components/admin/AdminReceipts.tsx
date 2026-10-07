import React, { useState, useMemo } from 'react';
import { Order, StoreSettings } from '../../types/store';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { getWhatsAppLink } from '../WhatsAppWidget';
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
  CheckSquare,
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
  
  // Multiple Receipt Templates Switcher
  const [receiptTemplate, setReceiptTemplate] = useState<'standard' | 'gift' | 'delivery' | 'pos'>('standard');

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

  // Accurate genuine Payment Method & Status Resolver (NO FAKE DATA)
  const resolvePaymentInfo = (order: Order) => {
    const raw = (order.paymentMethod || '').trim().toLowerCase();
    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';

    // 1. Cash on Delivery (COD) - Common in CI & Emerging Markets
    if (raw === 'cod' || raw.includes('cash') || raw.includes('livraison')) {
      return {
        code: 'COD',
        label: isFr ? 'Paiement à la livraison (Cash)' : 'Cash on Delivery (COD)',
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
        channelName: 'Wave CI',
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
        channelName: 'Orange Money CI',
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
        channelName: 'MTN MoMo',
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
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9;">
          <strong style="color: #0f172a; font-size: 13px;">${item.product.name}</strong><br/>
          <span style="font-size: 11px; color: #64748b;">${item.selectedColor?.name || 'Standard'} · ${item.selectedSize?.name || 'Unique'} · Qté: ${item.quantity}</span>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 13px; color: #334155;">
          ${item.quantity}
        </td>
        ${receiptTemplate !== 'gift' ? `
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; font-weight: 600; color: #0f172a; font-family: monospace;">
          ${formatPrice(item.product.price * item.quantity)}
        </td>
        ` : `
        <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 11px; font-weight: bold; color: #10b981;">
          ✓ ${isFr ? 'Garanti' : 'Verified'}
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
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 40px 20px; }
    .invoice-card { max-width: ${receiptTemplate === 'pos' ? '420px' : '720px'}; margin: 0 auto; background: #ffffff; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; overflow: hidden; }
    .header { background: #0f172a; color: #ffffff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .store-name { font-size: 20px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; margin: 0; }
    .store-sub { font-size: 11px; color: #94a3b8; margin-top: 4px; }
    .inv-badge { text-align: right; }
    .inv-title { font-size: 20px; font-weight: 900; font-family: monospace; color: #38bdf8; margin: 0; }
    .inv-date { font-size: 12px; color: #94a3b8; margin-top: 4px; }
    .body-content { padding: 32px; }
    .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
    .section-label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
    .info-box p { margin: 2px 0; font-size: 13px; color: #334155; }
    .info-box strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
    th { background: #f8fafc; padding: 12px 16px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
    .total-banner { background: #f8fafc; border-radius: 12px; padding: 20px; text-align: right; margin-top: 20px; border: 1px solid #e2e8f0; }
    .total-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 1.5px; }
    .total-amount { font-size: 28px; font-weight: 900; font-family: monospace; color: #0f172a; margin-top: 4px; }
    .gift-notice { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; color: #92400e; font-size: 12px; line-height: 1.5; margin-top: 20px; }
    .seal-footer { text-align: center; padding: 24px 32px; border-top: 1px dashed #cbd5e1; font-size: 12px; color: #64748b; background: #fafafa; }
    .btn-print { display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 700; font-size: 12px; margin-top: 16px; cursor: pointer; border: none; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { box-shadow: none; border: none; max-width: 100%; }
      .btn-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <h1 class="store-name">${storeName}</h1>
        <div class="store-sub">${storeAddress}</div>
        <div class="store-sub">${storeDomain} · ${storePhone}</div>
      </div>
      <div class="inv-badge">
        <h2 class="inv-title">${receiptTemplate === 'gift' ? `GIFT-${order.orderNumber}` : invoiceId}</h2>
        <div class="inv-date">${isFr ? 'Date :' : 'Date:'} ${date} ${time !== '—' ? '· ' + time : ''}</div>
        <div style="margin-top: 8px;">
          <span style="background: ${receiptTemplate === 'gift' ? '#d97706' : pInfo.isSettled ? '#10b981' : '#f59e0b'}; color: white; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 800; text-transform: uppercase;">
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
          <p>${order.shippingAddress.city}, ${order.shippingAddress.country || ''}</p>
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
            <th style="text-align: left;">${isFr ? 'Article' : 'Item Description'}</th>
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
        <div class="total-title">${isFr ? 'Montant Total' : 'Total Amount'}</div>
        <div class="total-amount">${formatPrice(order.total)}</div>
        <div style="font-size: 11px; color: ${pInfo.isSettled ? '#10b981' : '#f59e0b'}; font-weight: 700; margin-top: 4px;">
          ✓ ${pInfo.statusLabel}
        </div>
      </div>
      ` : `
      <div class="gift-notice">
        <strong>🎁 ${isFr ? 'Certificat d\'échange sous 30 jours :' : '30-Day Gift Exchange Guarantee:'}</strong><br/>
        ${isFr 
          ? `Ce reçu cadeau permet au destinataire de procéder à un échange de taille/couleur ou de solliciter la garantie chez ${storeName} dans un délai de 30 jours, sans mention de prix.`
          : `This gift receipt allows the recipient to exchange size/color or request service support at ${storeName} within 30 days without disclosing item prices.`}
      </div>
      `}
    </div>

    <div class="seal-footer">
      <p style="margin: 0; font-style: italic;">« ${isFr ? `Merci pour votre confiance sur ${storeDomain}.` : `Thank you for choosing ${storeDomain}.`} »</p>
      <div style="margin-top: 12px;">
        <button class="btn-print" onclick="window.print()">${isFr ? 'Imprimer ce document (PDF)' : 'Print Document (PDF)'}</button>
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
          <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center p-1.5 shadow-xs border border-zinc-900 shrink-0">
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
              <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
                {isFr ? 'Grand Livre des Reçus & Facturation' : 'Receipt Ledger & Invoices'}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200/60">
                {storeDomain}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isFr 
                ? `Documentation financière, reçus cadeaux et bordereaux d'expédition pour ${storeName}.` 
                : `Official accounting invoices, gift receipts, and courier delivery slips for ${storeName}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleExportLedger}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-900 rounded-xl text-xs font-bold transition-all shadow-xs hover:bg-zinc-50 cursor-pointer active:scale-95"
            title={isFr ? 'Exporter toutes les lignes au format CSV' : 'Export ledger rows to CSV'}
          >
            <Download className="w-4 h-4 text-zinc-600" />
            <span>{isFr ? 'Exporter le Grand Livre (CSV)' : 'Export Ledger (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics Cards based on REAL transaction data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Invoiced Volume */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'Volume Total Commandes' : 'Total Invoiced Volume'}
            </span>
            <p className="text-2xl font-black text-zinc-950 font-mono tracking-tight">
              {formatPrice(metrics.totalVolume)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600">
              <Package className="w-3.5 h-3.5 text-zinc-400" />
              <span>{metrics.totalCount} {isFr ? 'commandes passées' : 'total orders'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Settled / Paid Volume */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
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
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {isFr ? 'À Encaisser à la Livraison' : 'Due on Delivery (COD)'}
            </span>
            <p className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              {formatPrice(metrics.pendingCodVolume)}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
              <Truck className="w-3.5 h-3.5" />
              <span>{metrics.codCount} {isFr ? 'en livraison cash' : 'cash-on-delivery orders'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Average Order Ticket */}
        <div className="bg-white p-5 rounded-3xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
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
            <Receipt className="w-6 h-6" />
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
                        <div className="w-10 h-10 rounded-2xl bg-zinc-100 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center text-zinc-600 transition-colors shrink-0">
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
                              className="inline-block h-8 w-8 rounded-lg ring-2 ring-white object-cover bg-zinc-100"
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
                          className="p-2 text-zinc-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer" 
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

      {/* FULL MULTI-TEMPLATE RECEIPT / INVOICE MODAL */}
      {selectedOrder && (() => {
        const invId = getInvoiceId(selectedOrder);
        const { date, time } = formatDateTime(selectedOrder.date);
        const paymentInfo = resolvePaymentInfo(selectedOrder);
        const isCopied = copiedInvoiceId === invId;

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[94vh] overflow-y-auto shadow-2xl border border-zinc-200 flex flex-col relative animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Control Bar (Hidden when printing) */}
              <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 bg-white/95 backdrop-blur-md z-20 no-print">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${paymentInfo.statusDot}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-900 font-mono">
                    {receiptTemplate === 'gift' ? `GIFT-${selectedOrder.orderNumber}` : invId}
                  </span>
                  <button
                    onClick={() => handleCopy(invId)}
                    className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors"
                    title={isFr ? "Copier l'identifiant" : "Copy ID"}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {isCopied && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {isFr ? 'Copié !' : 'Copied!'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    title={isFr ? "Imprimer le document" : "Print document"}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Imprimer' : 'Print'}</span>
                  </button>

                  <button
                    onClick={() => handleDownloadInvoiceHtml(selectedOrder)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title={isFr ? "Télécharger le fichier HTML" : "Download HTML file"}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Télécharger' : 'Download'}</span>
                  </button>

                  <button
                    onClick={() => window.open(getReceiptWhatsAppUrl(selectedOrder), '_blank')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title={isFr ? "Partager via WhatsApp" : "Share via WhatsApp"}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="p-2 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded-full transition-colors cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* RECEIPT TEMPLATE SWITCHER (Tabs: Standard | Gift Receipt | Delivery Slip | POS Slip) */}
              <div className="px-5 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between gap-2 overflow-x-auto no-print">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                  {isFr ? 'Modèle de Reçu :' : 'Receipt Type:'}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-bold">
                  {/* Option 1: Standard Invoice */}
                  <button
                    onClick={() => setReceiptTemplate('standard')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      receiptTemplate === 'standard'
                        ? 'bg-zinc-950 text-white shadow-xs'
                        : 'bg-white text-zinc-600 hover:bg-zinc-200/60 border border-zinc-200/70'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Facture Standard' : 'Standard Invoice'}</span>
                  </button>

                  {/* Option 2: Gift Receipt (No Prices) */}
                  <button
                    onClick={() => setReceiptTemplate('gift')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      receiptTemplate === 'gift'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-white text-zinc-600 hover:bg-amber-50 border border-zinc-200/70 hover:text-amber-700'
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Reçu Cadeau (Sans Prix)' : 'Gift Receipt (No Prices)'}</span>
                  </button>

                  {/* Option 3: Delivery Slip */}
                  <button
                    onClick={() => setReceiptTemplate('delivery')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      receiptTemplate === 'delivery'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-zinc-600 hover:bg-blue-50 border border-zinc-200/70 hover:text-blue-700'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Bordereau Livraison' : 'Delivery Slip'}</span>
                  </button>

                  {/* Option 4: POS Thermal Slip */}
                  <button
                    onClick={() => setReceiptTemplate('pos')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      receiptTemplate === 'pos'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-zinc-600 hover:bg-purple-50 border border-zinc-200/70 hover:text-purple-700'
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>{isFr ? 'Ticket POS (80mm)' : 'POS Ticket (80mm)'}</span>
                  </button>
                </div>
              </div>

              {/* PRINTABLE RECEIPT CONTAINER (#admin-printable-receipt) */}
              <div id="admin-printable-receipt" className="p-6 sm:p-10 space-y-6 bg-[#FCFBF9]">

                {/* ========================================================================= */}
                {/* 1. STANDARD OFFICIAL COMMERCIAL INVOICE TEMPLATE */}
                {/* ========================================================================= */}
                {receiptTemplate === 'standard' && (
                  <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-8 animate-in fade-in duration-300">
                    {/* Header: Store Identity & Invoice Title */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-dashed border-zinc-200">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-950 flex items-center justify-center p-1 shadow-xs border border-zinc-900 shrink-0">
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
                            <h3 className="text-lg font-black tracking-wider text-zinc-950 uppercase font-sans">
                              {storeName}
                            </h3>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">
                              {isFr ? 'Boutique Officielle' : 'Official Boutique'} · {storeDomain}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 font-medium pt-1">
                          {storeAddress}
                        </p>
                        <p className="text-xs text-zinc-500 font-mono">
                          {storePhone} · {storeEmail}
                        </p>
                      </div>

                      <div className="sm:text-right space-y-1">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                          {isFr ? 'FACTURE OFFICIELLE DE VENTE' : 'OFFICIAL SALES INVOICE'}
                        </span>
                        <p className="font-mono text-base font-black text-zinc-950">
                          {invId}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                          {date} {time !== '—' && `· ${time}`}
                        </p>
                        <div className="pt-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${paymentInfo.statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${paymentInfo.statusDot}`} />
                            {paymentInfo.statusLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Info Grid: Genuine Customer Info & Genuine Payment Mode */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-1">
                      <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-100 space-y-1">
                        <span className="text-[9px] font-black text-zinc-400 tracking-widest block uppercase mb-2">
                          {isFr ? 'CLIENT / DESTINATAIRE' : 'BILLED TO / CUSTOMER'}
                        </span>
                        <p className="font-bold text-sm text-zinc-950">
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-xs text-zinc-600 font-mono">
                          {selectedOrder.shippingAddress.email}
                        </p>
                        {selectedOrder.shippingAddress.phone && (
                          <p className="text-xs text-zinc-700 font-mono font-semibold">
                            {selectedOrder.shippingAddress.phone}
                          </p>
                        )}
                        <p className="text-xs text-zinc-500 pt-1 leading-relaxed">
                          {selectedOrder.shippingAddress.street}<br />
                          {selectedOrder.shippingAddress.city}{selectedOrder.shippingAddress.postalCode ? `, ${selectedOrder.shippingAddress.postalCode}` : ''} {selectedOrder.shippingAddress.country ? `· ${selectedOrder.shippingAddress.country}` : ''}
                        </p>
                      </div>

                      <div className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-100 space-y-1 sm:text-right">
                        <span className="text-[9px] font-black text-zinc-400 tracking-widest block uppercase mb-2">
                          {isFr ? 'MODE DE RÈGLEMENT & LIVRAISON' : 'PAYMENT & FULFILLMENT'}
                        </span>
                        <p className="font-bold text-sm text-zinc-950">
                          {paymentInfo.label}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {paymentInfo.channelName}
                        </p>
                        <p className="text-xs text-zinc-700 font-mono pt-1">
                          {isFr ? 'Réf. Commande :' : 'Order Reference:'} <strong>#{selectedOrder.orderNumber}</strong>
                        </p>
                        <p className="text-xs text-zinc-500">
                          {isFr ? 'Statut Livraison :' : 'Fulfillment Status:'} <strong className="uppercase">{selectedOrder.status}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        {isFr 
                          ? `ARTICLES DU REÇU (${selectedOrder.items.length})` 
                          : `LINE ITEMS INVOICED (${selectedOrder.items.length})`}
                      </span>
                      <div className="border border-zinc-200/80 rounded-2xl overflow-hidden bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-50 border-b border-zinc-200/80">
                            <tr>
                              <th className="px-4 py-3 font-bold text-zinc-900">{isFr ? 'Désignation de la pièce' : 'Item Description'}</th>
                              <th className="px-4 py-3 font-bold text-zinc-900 text-center">{isFr ? 'Qté' : 'Qty'}</th>
                              <th className="px-4 py-3 font-bold text-zinc-900 text-right">{isFr ? 'Prix Unitaire' : 'Unit Price'}</th>
                              <th className="px-4 py-3 font-bold text-zinc-900 text-right">{isFr ? 'Total' : 'Total'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/50">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={item.selectedColor?.image || item.product.primaryImage} 
                                      alt={item.product.name} 
                                      className="w-10 h-10 object-cover rounded-xl border border-zinc-200 bg-zinc-50 shrink-0" 
                                    />
                                    <div>
                                      <p className="font-bold text-zinc-950 text-xs">{item.product.name}</p>
                                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                                        {item.selectedColor?.name || 'Standard'} · {isFr ? 'Taille' : 'Size'} {item.selectedSize?.name || 'Unique'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-center font-bold text-zinc-700">{item.quantity}</td>
                                <td className="px-4 py-3.5 text-right font-mono text-zinc-600">{formatPrice(item.product.price)}</td>
                                <td className="px-4 py-3.5 text-right font-mono font-bold text-zinc-950">
                                  {formatPrice(item.product.price * item.quantity)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pricing Breakdown & Grand Total Banner */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-dashed border-zinc-200">
                      <div className="space-y-1 text-xs text-zinc-500 w-full sm:w-auto">
                        <div className="flex justify-between sm:justify-start gap-8">
                          <span>{isFr ? 'Sous-total :' : 'Subtotal:'}</span>
                          <span className="font-mono font-bold text-zinc-900">
                            {formatPrice(selectedOrder.items.reduce((s, it) => s + it.product.price * it.quantity, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between sm:justify-start gap-8">
                          <span>{isFr ? 'Frais de livraison :' : 'Shipping fee:'}</span>
                          <span className="font-mono font-bold text-emerald-600">
                            {selectedOrder.shippingCost && selectedOrder.shippingCost > 0 ? formatPrice(selectedOrder.shippingCost) : (isFr ? 'Offert' : 'Free')}
                          </span>
                        </div>
                      </div>

                      <div className="w-full sm:w-auto bg-zinc-950 text-white px-6 py-4 rounded-2xl text-center sm:text-right shadow-xs">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
                          {isFr ? 'MONTANT TOTAL DE LA COMMANDE' : 'TOTAL ORDER AMOUNT'}
                        </span>
                        <p className="text-2xl font-black font-mono tracking-tight text-amber-400 mt-0.5">
                          {formatPrice(selectedOrder.total)}
                        </p>
                        <p className="text-[9px] text-zinc-400 uppercase font-semibold mt-1">
                          {paymentInfo.statusLabel}
                        </p>
                      </div>
                    </div>

                    {/* Certified Authenticity Stamp */}
                    <div className="pt-2 text-center space-y-1.5 border-t border-zinc-100">
                      <p className="text-xs text-zinc-500 font-sans">
                        {isFr 
                          ? `« Merci pour votre confiance. Document officiel émis par ${storeName}. »` 
                          : `"Thank you for your purchase. Official receipt issued by ${storeName}."`}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1 text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                        <span className="h-px w-10 bg-zinc-200" />
                        <span>{storeName} · {storeDomain}</span>
                        <span className="h-px w-10 bg-zinc-200" />
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 2. GIFT RECEIPT TEMPLATE (NO PRICES SHOWN - FOR GIFTING) */}
                {/* ========================================================================= */}
                {receiptTemplate === 'gift' && (
                  <div className="bg-amber-50/40 border border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-8 animate-in fade-in duration-300">
                    {/* Gift Ribbon Badge Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                          <Gift className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">
                            {isFr ? 'REÇU CADEAU OFFICIEL · SANS MENTION DE PRIX' : 'OFFICIAL GIFT RECEIPT · NO PRICES SHOWN'}
                          </span>
                          <h3 className="text-xl font-black text-amber-950 font-serif">
                            {storeName}
                          </h3>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                          GIFT-#{selectedOrder.orderNumber}
                        </span>
                        <p className="text-[11px] text-amber-700 font-medium mt-1">
                          {date}
                        </p>
                      </div>
                    </div>

                    {/* Gift Recipient & Care Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/60 space-y-1">
                        <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">
                          {isFr ? 'DESTINATAIRE DU CADEAU' : 'GIFT RECIPIENT'}
                        </span>
                        <p className="text-sm font-bold text-zinc-950">
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country || 'Côte d\'Ivoire'}
                        </p>
                      </div>

                      <div className="bg-white/80 p-4 rounded-2xl border border-amber-200/60 space-y-1 sm:text-right">
                        <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">
                          {isFr ? 'GARANTIE & SERVICE CLIENT' : 'WARRANTY & ASSISTANCE'}
                        </span>
                        <p className="text-sm font-bold text-zinc-950">
                          {storePhone}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {storeDomain} · {storeEmail}
                        </p>
                      </div>
                    </div>

                    {/* Gift Items Table (Completely WITHOUT prices) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                          {isFr ? 'ARTICLES DU CADEAU' : 'GIFT ARTICLES'}
                        </span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          {selectedOrder.items.reduce((s, it) => s + it.quantity, 0)} {isFr ? 'pièces' : 'items'}
                        </span>
                      </div>

                      <div className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-amber-100/40 border-b border-amber-200/70">
                            <tr>
                              <th className="px-4 py-3 font-bold text-amber-950">{isFr ? 'Désignation de la pièce' : 'Item Description'}</th>
                              <th className="px-4 py-3 font-bold text-amber-950 text-center">{isFr ? 'Quantité' : 'Quantity'}</th>
                              <th className="px-4 py-3 font-bold text-amber-950 text-right">{isFr ? 'Authenticité' : 'Warranty'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/50">
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <img 
                                      src={item.selectedColor?.image || item.product.primaryImage} 
                                      alt={item.product.name} 
                                      className="w-10 h-10 object-cover rounded-xl border border-amber-200 bg-amber-50 shrink-0" 
                                    />
                                    <div>
                                      <p className="font-bold text-zinc-950 text-xs">{item.product.name}</p>
                                      <p className="text-[10px] text-zinc-600 uppercase mt-0.5">
                                        {item.selectedColor?.name || 'Standard'} · {isFr ? 'Taille' : 'Size'} {item.selectedSize?.name || 'Unique'}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-center font-bold text-zinc-800">
                                  {item.quantity}x
                                </td>
                                <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                                  ✓ 100% {isFr ? 'Certifié' : 'Genuine'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Gift Return & Exchange Policy Notice */}
                    <div className="bg-amber-100/60 p-4 rounded-2xl border border-amber-300/80 text-xs text-amber-950 space-y-2">
                      <div className="flex items-center gap-2 font-black text-amber-900">
                        <Gift className="w-4 h-4 text-amber-700" />
                        <span>{isFr ? 'CONDITIONS D\'ÉCHANGE CADEAU (30 JOURS) :' : 'GIFT EXCHANGE TERMS (30 DAYS):'}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {isFr 
                          ? `Ce reçu cadeau permet au destinataire de solliciter un échange de taille, de couleur ou une prise en charge sous garantie auprès du service client ${storeName} dans un délai de 30 jours, sans aucune indication de prix.`
                          : `This gift receipt allows the recipient to exchange size, color, or request warranty support with ${storeName} Customer Service within 30 days without disclosing any prices.`}
                      </p>
                    </div>

                    {/* Barcode / Stamp area */}
                    <div className="pt-2 flex flex-col items-center justify-center text-center space-y-1">
                      <div className="font-mono text-sm tracking-widest text-zinc-700 bg-white px-6 py-2 rounded-lg border border-dashed border-amber-300">
                        ||| | |||| | ||| ||||| | ||||| | ||||
                      </div>
                      <span className="text-[9px] font-mono font-bold text-amber-800">
                        *GIFT-{selectedOrder.orderNumber}*
                      </span>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 3. COURIER DELIVERY SLIP / PACKING WAYBILL TEMPLATE */}
                {/* ========================================================================= */}
                {receiptTemplate === 'delivery' && (
                  <div className="bg-white border-2 border-blue-900/30 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6 animate-in fade-in duration-300">
                    {/* Header: Carrier Waybill */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-zinc-900">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 bg-blue-900 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                          <Truck className="w-4 h-4" />
                          <span>{isFr ? 'BORDEREAU D\'EXPÉDITION & DE LIVRAISON' : 'DELIVERY WAYBILL & DISPATCH'}</span>
                        </div>
                        <h3 className="text-xl font-black text-zinc-950 uppercase pt-1">
                          {storeName}
                        </h3>
                        <p className="text-xs text-zinc-600 font-mono">
                          {storeAddress} · {storePhone}
                        </p>
                      </div>

                      <div className="sm:text-right space-y-0.5">
                        <span className="text-[10px] font-black uppercase text-zinc-400">
                          {isFr ? 'N° BORDEREAU' : 'WAYBILL NO'}
                        </span>
                        <p className="font-mono text-lg font-black text-blue-900">
                          BL-{selectedOrder.orderNumber}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">
                          {date} · {time}
                        </p>
                      </div>
                    </div>

                    {/* COURIER DIRECTIVE BOX (High visibility for delivery driver!) */}
                    {paymentInfo.code === 'COD' && selectedOrder.status !== 'delivered' ? (
                      <div className="bg-amber-500 text-black p-4 rounded-2xl border-2 border-amber-600 space-y-1 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                          <AlertTriangle className="w-5 h-5 text-black" />
                          <span>{isFr ? 'DIRECTIVE OBLIGATOIRE POUR LE LIVREUR :' : 'MANDATORY COURIER INSTRUCTION:'}</span>
                        </div>
                        <p className="text-base font-black">
                          {isFr 
                            ? `ENCAISSER EN CASH LA SOMME DE ${formatPrice(selectedOrder.total)} AVANT REMISE DU COLIS.`
                            : `COLLECT CASH AMOUNT OF ${formatPrice(selectedOrder.total)} BEFORE HANDOVER.`}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-600 text-white p-4 rounded-2xl space-y-1 shadow-sm">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{isFr ? 'COLIS DÉJÀ RÉGLÉ EN LIGNE' : 'PACKAGE ALREADY PAID ONLINE'}</span>
                        </div>
                        <p className="text-sm font-bold">
                          {isFr 
                            ? 'NE DEMANDER AUCUN PAIEMENT AU CLIENT. Remettre le colis contre signature.' 
                            : 'DO NOT COLLECT ANY PAYMENT. Handover parcel upon signature.'}
                        </p>
                      </div>
                    )}

                    {/* Customer Destination Info Block */}
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                          {isFr ? 'DESTINATAIRE DU COLIS' : 'RECIPIENT & DESTINATION'}
                        </span>
                        <p className="text-base font-black text-zinc-950">
                          {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                        </p>
                        <p className="text-sm font-black text-blue-700 font-mono pt-1">
                          📞 {selectedOrder.shippingAddress.phone || 'Non renseigné'}
                        </p>
                        <p className="text-xs text-zinc-700 font-medium pt-1">
                          📍 {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}
                        </p>
                      </div>

                      <div className="sm:text-right space-y-1">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                          {isFr ? 'TRANSPORTEUR & STATUT' : 'CARRIER & STATUS'}
                        </span>
                        <p className="text-sm font-bold text-zinc-950">
                          {isFr ? 'Coursier Express GLADYNS' : 'GLADYNS Direct Courier'}
                        </p>
                        <p className="text-xs text-zinc-600">
                          {isFr ? 'Statut :' : 'Status:'} <strong>{selectedOrder.status.toUpperCase()}</strong>
                        </p>
                        <p className="text-xs text-zinc-600 font-mono">
                          Ref: #{selectedOrder.orderNumber}
                        </p>
                      </div>
                    </div>

                    {/* Items Checklist for Packaging / Courier */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                        {isFr ? 'ARTICLES À CONTRÔLER DANS LE COLIS' : 'ARTICLES TO VERIFY IN PACKAGE'}
                      </span>
                      <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-zinc-100 border-b border-zinc-200">
                            <tr>
                              <th className="px-4 py-2.5 font-bold text-zinc-900 w-12 text-center">✓</th>
                              <th className="px-4 py-2.5 font-bold text-zinc-900">{isFr ? 'Désignation de la pièce' : 'Description'}</th>
                              <th className="px-4 py-2.5 font-bold text-zinc-900 text-center">{isFr ? 'Qté' : 'Qty'}</th>
                              <th className="px-4 py-2.5 font-bold text-zinc-900 text-right">{isFr ? 'Contrôle' : 'Status'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedOrder.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-center">
                                  <div className="w-4 h-4 rounded border-2 border-zinc-400 mx-auto" />
                                </td>
                                <td className="px-4 py-3">
                                  <strong>{item.product.name}</strong><br/>
                                  <span className="text-[11px] text-zinc-500">{item.selectedColor?.name || 'Standard'} · {item.selectedSize?.name || 'Unique'}</span>
                                </td>
                                <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                                <td className="px-4 py-3 text-right text-zinc-600 font-mono text-[11px]">
                                  [ ] {isFr ? 'Conforme' : 'Checked'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sign-Off Boxes (Courier and Recipient) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="border-2 border-dashed border-zinc-300 p-4 rounded-2xl space-y-4">
                        <span className="text-[10px] font-black uppercase text-zinc-400 block">
                          {isFr ? 'SIGNATURE DU COURSIER / LIVREUR' : 'COURIER SIGNATURE'}
                        </span>
                        <div className="h-12" />
                        <p className="text-[10px] text-zinc-400 border-t border-zinc-200 pt-1">
                          Nom & Date : ___________________________
                        </p>
                      </div>

                      <div className="border-2 border-dashed border-zinc-300 p-4 rounded-2xl space-y-4">
                        <span className="text-[10px] font-black uppercase text-zinc-400 block">
                          {isFr ? 'DATE & SIGNATURE DU CLIENT RÉCEPTIONNAIRE' : 'CLIENT RECEPTION SIGNATURE'}
                        </span>
                        <div className="h-12" />
                        <p className="text-[10px] text-zinc-400 border-t border-zinc-200 pt-1">
                          Colis reçu en bon état : __________________
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================================= */}
                {/* 4. POS THERMAL REGISTER RECEIPT (COMPACT 80MM SLIP) */}
                {/* ========================================================================= */}
                {receiptTemplate === 'pos' && (
                  <div className="max-w-sm mx-auto bg-white border border-zinc-300 shadow-sm rounded-2xl p-6 font-mono text-zinc-900 text-xs space-y-4 animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="text-center space-y-1">
                      <div className="w-10 h-10 mx-auto rounded-xl bg-zinc-950 flex items-center justify-center p-1 mb-2">
                        <img src="/assets/logo-icon.png" alt={storeName} className="w-full h-full object-contain" />
                      </div>
                      <p className="font-black text-sm uppercase">{storeName}</p>
                      <p className="text-[10px] text-zinc-500">{storeAddress}</p>
                      <p className="text-[10px] text-zinc-500">{storePhone}</p>
                      <p className="text-[10px] text-zinc-500">{storeDomain}</p>
                    </div>

                    <div className="border-t border-dashed border-zinc-300 pt-2 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>Ticket :</span>
                        <span className="font-bold">{invId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date :</span>
                        <span>{date} {time !== '—' && time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Client :</span>
                        <span className="font-bold truncate max-w-[160px]">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</span>
                      </div>
                      {selectedOrder.shippingAddress.phone && (
                        <div className="flex justify-between">
                          <span>Tel :</span>
                          <span>{selectedOrder.shippingAddress.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Compact Items List */}
                    <div className="border-t border-dashed border-zinc-300 pt-2 space-y-2 text-[11px]">
                      <div className="flex justify-between font-bold border-b border-zinc-200 pb-1">
                        <span>ARTICLE</span>
                        <div className="flex gap-4">
                          <span>QTE</span>
                          <span>TOTAL</span>
                        </div>
                      </div>
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="pr-2">
                            <p className="font-bold">{item.product.name}</p>
                            <span className="text-[9px] text-zinc-500">{item.selectedColor?.name || ''} {item.selectedSize?.name || ''}</span>
                          </div>
                          <div className="flex gap-4 shrink-0 font-bold">
                            <span>x{item.quantity}</span>
                            <span>{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* POS Total Banner */}
                    <div className="border-t-2 border-zinc-900 pt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>SOUS-TOTAL :</span>
                        <span>{formatPrice(selectedOrder.items.reduce((s, it) => s + it.product.price * it.quantity, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>LIVRAISON :</span>
                        <span className="text-emerald-700 font-bold">{selectedOrder.shippingCost && selectedOrder.shippingCost > 0 ? formatPrice(selectedOrder.shippingCost) : 'OFFERT'}</span>
                      </div>
                      <div className="flex justify-between text-base font-black pt-1 border-t border-dashed border-zinc-300">
                        <span>TOTAL :</span>
                        <span className="text-zinc-950">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-t border-dashed border-zinc-300 pt-2 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span>MODE :</span>
                        <span className="font-bold uppercase">{paymentInfo.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>STATUT :</span>
                        <span className="font-bold">{paymentInfo.statusLabel}</span>
                      </div>
                    </div>

                    {/* Barcode & Footer Message */}
                    <div className="text-center pt-2 space-y-1 border-t border-dashed border-zinc-300">
                      <div className="text-sm tracking-widest font-mono select-none">
                        ||| | |||| | ||| ||||| | ||||
                      </div>
                      <p className="text-[9px] text-zinc-500">#{selectedOrder.orderNumber}</p>
                      <p className="text-[10px] font-bold pt-1">{isFr ? 'MERCI DE VOTRE VISITE !' : 'THANK YOU FOR SHOPPING!'}</p>
                      <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-400 pt-1">
                        <Scissors className="w-3 h-3" />
                        <span>- - - - - - - - - - - - - - - - - - -</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  {isFr ? 'Fermer' : 'Close'}
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => handleDownloadInvoiceHtml(selectedOrder)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isFr ? 'Télécharger ce modèle' : 'Download Template'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isFr ? 'Imprimer ce modèle' : 'Print Template'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
