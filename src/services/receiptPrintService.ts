import { Order, StoreSettings } from '../types/store';

export type ReceiptTemplateType = 'commercial' | 'invoice' | 'gift' | 'pos' | 'delivery' | 'standard';

interface PrintReceiptOptions {
  template?: ReceiptTemplateType;
  storeSettings?: StoreSettings;
  formatPrice?: (price: number) => string;
  language?: string;
  autoPrint?: boolean;
}

export function generateReceiptHtml(
  order: Order,
  options: PrintReceiptOptions = {}
): string {
  const {
    template = 'commercial',
    storeSettings,
    formatPrice = (p: number) => `${p.toLocaleString('fr-FR')} CFA`,
    language = 'en',
  } = options;

  const isFr = language === 'fr';
  const cleanOrderNum = (order.orderNumber || order.id || 'ORDER').replace(/[^a-zA-Z0-9_-]/g, '');
  const rawSuffix = cleanOrderNum.slice(-4);
  const year = new Date().getFullYear();

  const officialReceiptId = `REC-${year}-${rawSuffix}`;
  const taxInvoiceId = `INV-${year}-${rawSuffix}`;
  const giftReceiptId = `GIFT-${cleanOrderNum}`;
  const posTicketId = `POS-${rawSuffix}-${Date.now().toString().slice(-4)}`;

  const activeDocId =
    template === 'gift'
      ? giftReceiptId
      : template === 'invoice'
      ? taxInvoiceId
      : template === 'pos'
      ? posTicketId
      : officialReceiptId;

  const storeName = storeSettings?.storeName || 'GLADYNS MARKETPLACE';
  const storeAddress = storeSettings?.contactAddress || "Habitat Extension, E 24, Abidjan, Côte d'Ivoire";
  const storePhone = storeSettings?.contactPhone || storeSettings?.whatsappNumber || '+225 05 00 61 99 23';
  const storeEmail = storeSettings?.contactEmail || 'contact@gladyns.store';
  const storeDomain = 'gladyns.store';
  const shopBannerImage = storeSettings?.aboutUs?.image || '/assets/gladyns_store_preview.png';

  const fullName = `${order.shippingAddress?.firstName || 'Client'} ${order.shippingAddress?.lastName || ''}`.trim();
  const customerEmail = order.shippingAddress?.email || 'client@gladyns.store';
  const customerPhone = order.shippingAddress?.phone || storePhone;
  const initialLetter = (order.shippingAddress?.firstName?.[0] || 'G').toUpperCase();

  const formattedDate = new Date().toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rawPayment = (order.paymentMethod || '').toLowerCase();
  const isCOD = rawPayment.includes('cod') || rawPayment.includes('cash') || rawPayment.includes('livraison');
  const isWave = rawPayment.includes('wave');
  const isOM = rawPayment.includes('orange') || rawPayment.includes('om');
  const isMTN = rawPayment.includes('mtn');
  const isApple = rawPayment.includes('apple');

  let paymentLabel = 'Credit / Debit Card';
  let paymentBadge = 'PAID';
  if (isCOD) {
    paymentLabel = isFr ? 'Paiement à la livraison (Espèces)' : 'Cash on Delivery (COD)';
    paymentBadge = order.status === 'delivered' ? (isFr ? 'ENCAISSÉ' : 'COLLECTED') : (isFr ? 'À RÉGLER' : 'DUE ON DELIVERY');
  } else if (isWave) {
    paymentLabel = 'Wave Mobile Money';
    paymentBadge = 'PAID';
  } else if (isOM) {
    paymentLabel = 'Orange Money CI';
    paymentBadge = 'PAID';
  } else if (isMTN) {
    paymentLabel = 'MTN MoMo CI';
    paymentBadge = 'PAID';
  } else if (isApple) {
    paymentLabel = 'Apple Pay Express';
    paymentBadge = 'PAID';
  }

  // Generate table rows
  const itemsHtml = order.items
    .map((it) => {
      const colorText = it.selectedColor?.name ? ` · ${it.selectedColor.name}` : '';
      const sizeText = it.selectedSize?.name ? ` · ${it.selectedSize.name}` : '';
      const variantDesc = `${colorText}${sizeText}`.replace(/^ · /, '');

      return `
        <tr>
          <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 700; color: #0f172a; font-size: 13px;">${it.product.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
              SKU: ${it.product.id}${variantDesc ? ` | ${variantDesc}` : ''}
            </div>
          </td>
          <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: center; font-weight: 700; font-size: 13px;">
            ${it.quantity}
          </td>
          ${
            template !== 'gift'
              ? `
            <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-family: monospace; font-size: 13px; color: #475569;">
              ${formatPrice(it.product.price)}
            </td>
            <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-family: monospace; font-weight: 800; font-size: 13px; color: #0f172a;">
              ${formatPrice(it.product.price * it.quantity)}
            </td>
          `
              : `
            <td style="padding: 12px 14px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; font-size: 12px; color: #d97706;">
              ★ ${isFr ? 'Certifié Maison' : 'House Certified'}
            </td>
          `
          }
        </tr>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="${isFr ? 'fr' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GLADYNS_Receipt_${activeDocId}_${cleanOrderNum}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 24px 16px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* Screen Top Utility Header */
    .screen-action-bar {
      max-width: 760px;
      margin: 0 auto 20px auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 12px 18px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .btn-print {
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
    }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close {
      background: #f1f5f9;
      color: #475569;
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-close:hover { background: #e2e8f0; color: #0f172a; }
    .tip-text {
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Main Receipt Container */
    .receipt-card {
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      overflow: hidden;
      page-break-inside: avoid;
    }

    /* Hero Banner */
    .hero {
      background: linear-gradient(to top, rgba(2, 6, 23, 0.96), rgba(2, 6, 23, 0.6)), url('${shopBannerImage}') center/cover no-repeat;
      color: #ffffff;
      padding: 32px 28px 24px 28px;
      position: relative;
    }
    .hero-title {
      margin: 0 0 6px 0;
      font-size: 24px;
      font-weight: 800;
      font-family: Georgia, serif;
      letter-spacing: 0.5px;
    }
    .hero-sub {
      margin: 0;
      font-size: 12px;
      color: #e2e8f0;
      font-weight: 500;
    }
    .badge-paid {
      position: absolute;
      top: 24px;
      right: 24px;
      background: #00b074;
      color: #ffffff;
      font-weight: 900;
      font-size: 11px;
      padding: 6px 14px;
      border-radius: 8px;
      letter-spacing: 1px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    /* Card Content */
    .content { padding: 28px; }

    /* Client Banner */
    .client-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #2563eb;
      color: #ffffff;
      font-weight: 900;
      font-size: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* 4-col metadata */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
      background: #ffffff;
    }
    .meta-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.8px;
      margin-bottom: 3px;
    }
    .meta-val {
      font-size: 12px;
      font-weight: 800;
      font-family: monospace;
      color: #0f172a;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #475569;
      background: #f8fafc;
      padding: 10px 14px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 2px solid #e2e8f0;
    }

    /* Totals */
    .totals-box {
      margin-left: auto;
      max-width: 320px;
      text-align: right;
      margin-bottom: 24px;
    }
    .tot-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .tot-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      padding-top: 10px;
      border-top: 2px solid #0f172a;
      margin-top: 8px;
    }
    .total-val {
      font-size: 22px;
      color: #2563eb;
      font-family: monospace;
      font-weight: 900;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }

    /* Clean Print Styles (Zero cutoffs, fills full sheet) */
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .screen-action-bar {
        display: none !important;
      }
      .receipt-card {
        max-width: 100% !important;
        width: 100% !important;
        box-shadow: none !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 12px !important;
      }
      .hero {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .client-banner {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .badge-paid {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <!-- Top Screen Action Bar -->
  <div class="screen-action-bar">
    <div style="display: flex; align-items: center; gap: 8px;">
      <button class="btn-print" onclick="window.print()">
        🖨️ ${isFr ? 'Imprimer / Enregistrer en PDF (Save as PDF)' : 'Print / Save as PDF'}
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ ${isFr ? 'Fermer' : 'Close'}
      </button>
    </div>
    <div class="tip-text">
      💡 ${
        isFr
          ? 'Destination : Choisissez "Enregistrer au format PDF" pour sauvegarder le fichier sur votre appareil.'
          : 'Destination: Select "Save as PDF" to download the receipt directly to your device.'
      }
    </div>
  </div>

  <!-- Printable Receipt Body -->
  <div class="receipt-card">
    <div class="hero">
      <div class="badge-paid">${paymentBadge}</div>
      <h1 class="hero-title">${storeName}</h1>
      <p class="hero-sub">📍 ${storeAddress}</p>
    </div>

    <div class="content">
      <!-- Client Banner -->
      <div class="client-banner">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div class="avatar">${initialLetter}</div>
          <div>
            <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase;">
              ${isFr ? 'REÇU OFFICIEL CLIENT' : 'OFFICIAL CUSTOMER RECEIPT'}
            </div>
            <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${fullName}</div>
            <div style="font-size: 11px; color: #64748b;">${customerEmail} · ${customerPhone}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase;">
            ${template === 'gift' ? 'GIFT REF #' : template === 'invoice' ? 'INVOICE #' : 'RECEIPT #'}
          </div>
          <div style="font-size: 15px; font-weight: 900; color: #2563eb; font-family: monospace;">
            ${activeDocId}
          </div>
          <div style="font-size: 11px; color: #64748b;">${formattedDate}</div>
        </div>
      </div>

      <!-- 4-Column Metadata -->
      <div class="grid-4">
        <div>
          <div class="meta-label">${isFr ? 'RÉF COMMANDE' : 'ORDER REF'}</div>
          <div class="meta-val">${order.orderNumber}</div>
        </div>
        <div>
          <div class="meta-label">${isFr ? 'TRANSACTION ID' : 'TRANSACTION ID'}</div>
          <div class="meta-val">TX-${cleanOrderNum.slice(-6)}</div>
        </div>
        <div>
          <div class="meta-label">${isFr ? 'CANAL RÈGLEMENT' : 'PAYMENT CHANNEL'}</div>
          <div class="meta-val" style="font-family: inherit;">${paymentLabel}</div>
        </div>
        <div>
          <div class="meta-label">${isFr ? 'STATUT COMMANDE' : 'ORDER STATUS'}</div>
          <div class="meta-val" style="color: #059669;">${order.status.toUpperCase()}</div>
        </div>
      </div>

      <!-- Items Table -->
      <table>
        <thead>
          <tr>
            <th>${isFr ? 'Désignation des Articles' : 'Curated Items Description'}</th>
            <th style="text-align: center;">${isFr ? 'Qté' : 'Qty'}</th>
            ${
              template !== 'gift'
                ? `
              <th style="text-align: right;">${isFr ? 'Prix Unitaire' : 'Unit Price'}</th>
              <th style="text-align: right;">${isFr ? 'Total Ligne' : 'Line Total'}</th>
            `
                : `
              <th style="text-align: right;">${isFr ? 'Authenticité' : 'Warranty'}</th>
            `
            }
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Totals Breakdown (Zero Tax) -->
      ${
        template !== 'gift'
          ? `
        <div class="totals-box">
          <div class="tot-row">
            <span>${isFr ? 'Sous-total :' : 'Subtotal:'}</span>
            <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${formatPrice(order.subtotal || order.total)}</span>
          </div>
          <div class="tot-row">
            <span>${isFr ? 'Expédition & Livraison :' : 'Shipping & Delivery:'}</span>
            <span style="font-family: monospace; font-weight: 700; color: #0f172a;">
              ${order.shippingCost ? formatPrice(order.shippingCost) : isFr ? 'Gratuit' : 'Free'}
            </span>
          </div>
          <div class="tot-total">
            <span>${isFr ? 'Total Réglé :' : 'Total Settled:'}</span>
            <span class="total-val">${formatPrice(order.total)}</span>
          </div>
          <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">
            ${isFr ? 'Livraison et service compris · 0% Taxe' : 'Fulfillment included · 0% Tax'}
          </div>
        </div>
      `
          : `
        <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 14px; padding: 16px; margin-bottom: 24px; color: #854d0e; font-size: 12px; line-height: 1.5;">
          <strong>🎁 ${isFr ? 'Reçu Cadeau Officiel GLADYNS :' : 'Official GLADYNS Gift Receipt:'}</strong><br />
          ${
            isFr
              ? 'Ce document certifie l’authenticité de votre acquisition sans mention de valeur monétaire. Valable pour échange de taille ou coloris sous 30 jours.'
              : 'This document certifies the authenticity of your acquisition with values hidden. Eligible for size/color exchanges within 30 days.'
          }
        </div>
      `
      }

      <!-- Footer -->
      <div class="footer">
        <div style="font-weight: 800; color: #1e3a8a; margin-bottom: 4px;">
          ❤️ ${isFr ? `MERCI POUR VOTRE COMMANDE, ${fullName.toUpperCase()} !` : `THANK YOU FOR SHOPPING WITH US, ${fullName.toUpperCase()}!`}
        </div>
        <div>
          ${storeName} · ${storeAddress} · ${storePhone} · ${storeDomain}
        </div>
      </div>
    </div>
  </div>

  <script>
    // Trigger native browser print / Save as PDF immediately
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;
}

/**
 * Universal print & Save as PDF launcher.
 * Opens an isolated print window with zero layout clipping or CSS conflicts.
 */
export function printOrSaveReceiptPdf(
  order: Order,
  options: PrintReceiptOptions = {}
): void {
  const html = generateReceiptHtml(order, options);

  // 1. Try opening clean new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    return;
  }

  // 2. Fallback: If popup blocker blocked the window, use a hidden iframe
  let iframe = document.getElementById('gladyns-print-frame') as HTMLIFrameElement;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'gladyns-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 400);
  }
}
