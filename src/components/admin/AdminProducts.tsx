import React, { useState } from 'react';
import { 
  Box, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
  DollarSign,
  Layers,
  FileText,
  Save,
  Upload,
  X,
  MapPin,
  Image as ImageIcon,
  Barcode,
  CheckCircle2,
  Loader2,
  Palette,
  Ruler,
  Check,
  Laptop,
  Smartphone,
  Headphones,
  SlidersHorizontal,
  Cpu,
  Wrench
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Product } from '../../types/store';
import { CATEGORIES } from '../../data/products';
import { saveRealtimeProduct, deleteRealtimeProduct, addRealtimeNotification } from '../../services/supabaseService';
import { playNotificationSound } from '../../services/soundService';
import { useLanguageCurrency } from '../../context/LanguageCurrencyContext';
import { SUPPORTED_CURRENCIES } from '../../data/currencies';
import { FastActionLoader } from '../FastLoadingScreen';
import { HardwareSpecWizard } from './HardwareSpecWizard';

const SPEC_PRESETS: Record<string, { label: string; value: string }[]> = {
  laptop: [
    { label: 'Processor (CPU)', value: 'Intel Core i7 (13th Gen) / Apple M3' },
    { label: 'Installed RAM', value: '16GB DDR5 High-Speed' },
    { label: 'Internal Storage', value: '512GB NVMe M.2 SSD' },
    { label: 'Operating System', value: 'Windows 11 Pro 64-bit' },
    { label: 'Graphics (GPU)', value: 'Intel Iris Xe / Dedicated GPU' },
    { label: 'Display Size & Res', value: '15.6" Full HD (1920 x 1080) IPS' },
    { label: 'Intended Use / Work', value: 'Office, Programming, Design & Multitasking' },
    { label: 'Battery Health', value: 'Up to 9 Hours Battery Life' },
  ],
  phone: [
    { label: 'Internal Storage', value: '256GB High-Speed Storage' },
    { label: 'Installed RAM', value: '8GB RAM' },
    { label: 'Display Size', value: '6.7" Super Retina / AMOLED 120Hz' },
    { label: 'Operating System', value: 'iOS 17 / Android 14' },
    { label: 'Battery Health', value: '100% (Brand New Battery)' },
    { label: 'Network / SIM', value: '5G Unlocked / Dual SIM (eSIM + Nano)' },
    { label: 'Main Camera', value: '48MP Ultra-Clear Triple Camera with 4K' },
  ],
  audio: [
    { label: 'Connectivity', value: 'Bluetooth 5.3 + 3.5mm AUX Cable' },
    { label: 'Noise Cancellation', value: 'Hybrid Active Noise Cancelling (ANC)' },
    { label: 'Battery Playtime', value: 'Up to 35 Hours (ANC Enabled)' },
    { label: 'Microphone Array', value: '4-Mic Beamforming Voice Array' },
    { label: 'Charging Type', value: 'USB-C Fast Charging (15 min = 3 hrs)' },
  ],
  appliance: [
    { label: 'Power / Wattage', value: '1800 Watts' },
    { label: 'Operating Voltage', value: '220V - 240V, 50/60Hz' },
    { label: 'Capacity / Volume', value: '5.5 Litres' },
    { label: 'Energy Rating', value: 'Class A+++ Efficiency' },
    { label: 'Warranty Duration', value: '2 Years Manufacturer Warranty' },
  ],
  lifestyle: [
    { label: 'Form Factor', value: 'Precision Engineered Standard' },
    { label: 'Materials & Finish', value: 'Aerospace-Grade Aluminum & Reinforced Polymer' },
    { label: 'Compatibility', value: 'Universal Standard' },
    { label: 'Country of Origin', value: 'Global Certified Partner' },
    { label: 'Care Instructions', value: 'Wipe with dry microfiber cloth' },
  ],
};

const autoDetectSpecsFromName = (title: string, desc: string = '') => {
  const combined = `${title} ${desc}`;
  const detected: { label: string; value: string }[] = [];

  // 1. RAM detection
  const explicitRam = combined.match(/\b(\d+)\s*(GB|gb)\s*(?:RAM|ram|memory)\b/i);
  const generalRam = combined.match(/\b(4|8|16|24|32|64)\s*(?:GB|gb)\b/i);
  if (explicitRam) {
    detected.push({ label: 'Installed RAM', value: `${explicitRam[1]}GB DDR RAM` });
  } else if (generalRam) {
    detected.push({ label: 'Installed RAM', value: `${generalRam[1]}GB RAM` });
  }

  // 2. Storage detection
  const storageWithUnit = combined.match(/\b(128|256|512|1000|1024)\s*(?:GB|gb)\s*(?:SSD|NVMe|HDD|Storage|ROM)?\b/i);
  const tbStorage = combined.match(/\b(1|2|4)\s*(?:TB|tb)\s*(?:SSD|NVMe|HDD)?\b/i);
  if (tbStorage) {
    detected.push({ label: 'Internal Storage', value: `${tbStorage[1]}TB High-Speed NVMe SSD` });
  } else if (storageWithUnit) {
    detected.push({ label: 'Internal Storage', value: `${storageWithUnit[1]}GB High-Speed SSD` });
  }

  // 3. Operating System / Windows Type
  if (/\b(?:windows\s*11\s*pro|win\s*11\s*pro)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Windows 11 Pro (64-bit)' });
  } else if (/\b(?:windows\s*11|win\s*11)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Windows 11 Home' });
  } else if (/\b(?:windows\s*10\s*pro|win\s*10\s*pro)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Windows 10 Pro (64-bit)' });
  } else if (/\b(?:windows\s*10|win\s*10)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Windows 10' });
  } else if (/\b(?:macos|mac\s*os|macbook|imac)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Apple macOS' });
  } else if (/\b(?:android)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Android OS' });
  } else if (/\b(?:ios|iphone|ipad)\b/i.test(combined)) {
    detected.push({ label: 'Operating System', value: 'Apple iOS' });
  }

  // 4. Processor / CPU
  const cpuMatch = combined.match(/\b(Intel\s*Core\s*i[3579](?:-\w+)?|Core\s*i[3579](?:-\w+)?|Ryzen\s*[3579](?:\s*\w+)?|Apple\s*M[1234](?:\s*(?:Pro|Max|Ultra))?|M[1234]\s*(?:Pro|Max|Ultra)?|Snapdragon\s*[\w\d]+|Celeron\s*\w+)\b/i);
  if (cpuMatch) {
    detected.push({ label: 'Processor (CPU)', value: cpuMatch[0].trim() });
  }

  // 5. Screen Size
  const screenMatch = combined.match(/\b(\d{1,2}(?:\.\d)?)\s*(?:inch|"|'')\b/i);
  if (screenMatch) {
    detected.push({ label: 'Display Size & Res', value: `${screenMatch[1]}-inch High-Definition Display` });
  }

  // 6. Graphics GPU
  const gpuMatch = combined.match(/\b(RTX\s*\d{4}|GTX\s*\d{4}|NVIDIA\s*(?:GeForce\s*)?[\w\d]+|Radeon\s*[\w\d]+|Intel\s*Iris\s*Xe)\b/i);
  if (gpuMatch) {
    detected.push({ label: 'Graphics (GPU)', value: gpuMatch[0].trim() });
  }

  // 7. Purpose / Recommended Work
  if (/\b(?:gaming|gamer)\b/i.test(combined)) {
    detected.push({ label: 'Intended Use / Work', value: 'High-Performance Gaming & 3D Workloads' });
  } else if (detected.some(s => s.label.includes('Processor') || s.label.includes('RAM'))) {
    detected.push({ label: 'Intended Use / Work', value: 'Office, Programming, Student & Business Work' });
  }

  return detected;
};

interface AdminProductsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: { id: string; label: string }[];
  brands: { name: string; origin: string }[];
  initialSearchQuery?: string;
  onNewProductAdded?: (product: Product) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ 
  products, 
  setProducts, 
  categories, 
  brands,
  initialSearchQuery,
  onNewProductAdded
}) => {
  const { currency, formatPrice } = useLanguageCurrency();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [categoryFilter, setCategoryFilter] = useState('all');

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [priceCurrency, setPriceCurrency] = useState<string>(currency.code || 'XOF');
  const [salePriceInput, setSalePriceInput] = useState<string>('');
  const [origPriceInput, setOrigPriceInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Variant Management States
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [customSizeName, setCustomSizeName] = useState('');

  // Specification Management States
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const handleAddCustomSpec = () => {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) return;
    const currentSpecs = formData.specs || [];
    setFormData(prev => ({
      ...prev,
      specs: [...currentSpecs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]
    }));
    setNewSpecLabel('');
    setNewSpecValue('');
  };

  const handleUpdateSpec = (index: number, field: 'label' | 'value', text: string) => {
    const currentSpecs = [...(formData.specs || [])];
    if (!currentSpecs[index]) return;
    currentSpecs[index] = { ...currentSpecs[index], [field]: text };
    setFormData(prev => ({ ...prev, specs: currentSpecs }));
  };

  const handleRemoveSpec = (index: number) => {
    const currentSpecs = (formData.specs || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, specs: currentSpecs }));
  };

  const handleApplySpecPreset = (presetKey: string) => {
    const preset = SPEC_PRESETS[presetKey];
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      specs: [...preset]
    }));
  };

  const handleClearAllSpecs = () => {
    setFormData(prev => ({ ...prev, specs: [] }));
  };

  const handleSmartAutoDetectSpecs = () => {
    const detected = autoDetectSpecsFromName(formData.name || '', formData.description || '');
    if (detected.length === 0) {
      const cat = (formData.category || '').toLowerCase();
      if (cat.includes('elect') || cat.includes('it') || cat.includes('comp') || cat.includes('audio')) {
        handleApplySpecPreset('laptop');
      } else if (cat.includes('appliance')) {
        handleApplySpecPreset('appliance');
      } else {
        handleApplySpecPreset('laptop');
      }
      return;
    }
    const current = formData.specs || [];
    const merged = [...current];
    detected.forEach(d => {
      const idx = merged.findIndex(m => m.label.toLowerCase() === d.label.toLowerCase());
      if (idx >= 0) {
        merged[idx] = d;
      } else {
        merged.push(d);
      }
    });
    setFormData(prev => ({ ...prev, specs: merged }));
  };

  const [isHardwareWizardOpen, setIsHardwareWizardOpen] = useState(false);

  const handleApplyWizardSpecs = (
    specs: { label: string; value: string }[],
    generatedTitle?: string,
    brandName?: string
  ) => {
    setFormData(prev => ({
      ...prev,
      specs,
      name: generatedTitle || prev.name,
      brand: brandName || prev.brand,
      category: 'computer-it',
      categoryLabel: 'COMPUTER & IT',
    }));
    setIsHardwareWizardOpen(false);
  };

  const handleAddCustomColor = () => {
    if (!customColorName.trim()) return;
    const newColor = {
      id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: customColorName.trim(),
      colorHex: customColorHex,
      inStock: true,
    };
    const currentColors = (formData.colors || []).filter(c => c.name.toLowerCase() !== 'standard');
    setFormData(prev => ({
      ...prev,
      colors: [...currentColors, newColor]
    }));
    setCustomColorName('');
  };

  const handleAddCustomSize = () => {
    if (!customSizeName.trim()) return;
    const exists = (formData.sizes || []).some(s => s.name.toLowerCase() === customSizeName.trim().toLowerCase());
    if (exists) return;
    const newSize = {
      name: customSizeName.trim(),
      inStock: true,
    };
    const currentSizes = (formData.sizes || []).filter(s => !['standard', 'one size'].includes(s.name.toLowerCase()));
    setFormData(prev => ({
      ...prev,
      sizes: [...currentSizes, newSize]
    }));
    setCustomSizeName('');
  };

  const POPULAR_COLOR_PRESETS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gold', hex: '#D4AF37' },
    { name: 'Space Gray', hex: '#4B5563' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'Royal Blue', hex: '#2563EB' },
    { name: 'Forest Green', hex: '#15803D' },
    { name: 'Burgundy', hex: '#831843' },
    { name: 'Red', hex: '#DC2626' },
    { name: 'Rose Gold', hex: '#B76E79' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Brown', hex: '#78350F' },
  ];

  const handleAddPresetColor = (name: string, hex: string) => {
    const current = (formData.colors || []).filter(c => c.name.toLowerCase() !== 'standard');
    if (current.some(c => c.name.toLowerCase() === name.toLowerCase())) return;
    setFormData(prev => ({
      ...prev,
      colors: [...current, {
        id: `col-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        colorHex: hex,
        inStock: true
      }]
    }));
  };

  const handleRemoveColor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).filter(c => c.id !== id)
    }));
  };

  const handleToggleColorStock = (id: string) => {
    setFormData(prev => ({
      ...prev,
      colors: (prev.colors || []).map(c => c.id === id ? { ...c, inStock: !c.inStock } : c)
    }));
  };

  const handleApplySizePreset = (type: 'none' | 'tiers' | 'storage' | 'audio' | 'voltage') => {
    if (type === 'none') {
      setFormData(prev => ({ ...prev, sizes: [] }));
      return;
    }
    let names: string[] = [];
    if (type === 'tiers') names = ['Standard Edition', 'Pro Edition', 'Master Kit'];
    if (type === 'storage') names = ['128GB SSD', '256GB SSD', '512GB NVMe', '1TB NVMe', '2TB NVMe'];
    if (type === 'audio') names = ['Solo Unit', 'Stereo Pair', 'Studio Master Package'];
    if (type === 'voltage') names = ['65W GaN', '100W Fast Charge', '120W Rapid High-Output'];

    setFormData(prev => ({
      ...prev,
      sizes: names.map(n => ({ name: n, inStock: true }))
    }));
  };

  const handleRemoveSize = (sizeName: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).filter(s => s.name !== sizeName)
    }));
  };

  const handleToggleSizeStock = (sizeName: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).map(s => s.name === sizeName ? { ...s, inStock: !s.inStock } : s)
    }));
  };

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    tagline: '',
    price: 0,
    originalPrice: 0,
    category: 'essentials',
    categoryLabel: 'Essentials',
    brand: '',
    brandOrigin: '',
    tag: '',
    description: '',
    materials: '',
    care: '',
    madeIn: '',
    primaryImage: '',
    featured: false,
    isNewArrival: false,
    isHotDeal: false,
    sku: '',
    barcode: '',
    stockLevel: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  // Auto-generate SKU and Barcode
  const generateIdentifiers = () => {
    const newSku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newBarcode = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
    setFormData(prev => ({
      ...prev,
      sku: newSku,
      barcode: newBarcode
    }));
  };

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleAutoGenerateDescription = async () => {
    if (!formData.name?.trim()) {
      setError('Please provide at least a product name before generating a description.');
      return;
    }
    setError(null);
    setIsGeneratingDesc(true);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          materials: formData.materials,
          category: formData.categoryLabel || formData.category,
          condition: formData.condition,
          specs: formData.specs,
          tagline: formData.tagline,
        }),
      });
      const data = await response.json();
      if (data.description) {
        setFormData(prev => ({ ...prev, description: data.description }));
      } else {
        setError(data.error || 'Failed to generate description.');
      }
    } catch (e) {
      setError('Error connecting to description service.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    const activeCode = currency.code || 'XOF';
    setPriceCurrency(activeCode);
    const rate = SUPPORTED_CURRENCIES[activeCode]?.rate || 1;
    const decimals = SUPPORTED_CURRENCIES[activeCode]?.decimals || 0;

    if (product) {
      setEditingProduct(product);
      const convertedSale = (product.price * rate).toFixed(decimals);
      const convertedOrig = product.originalPrice ? (product.originalPrice * rate).toFixed(decimals) : '';
      setSalePriceInput(convertedSale);
      setOrigPriceInput(convertedOrig);

      setFormData({
        ...product,
        images: product.images || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        specs: product.specs || [],
        condition: product.condition || 'Brand New',
      });
    } else {
      setEditingProduct(null);
      setCustomColorName('');
      setCustomColorHex('#000000');
      setCustomSizeName('');
      let draft: any = null;
      try {
        const raw = localStorage.getItem('gls_admin_product_draft');
        if (raw) draft = JSON.parse(raw);
      } catch (e) {}

      if (draft && draft.formData && (draft.formData.name || (draft.formData.images && draft.formData.images.length > 0))) {
        setFormData(draft.formData);
        setSalePriceInput(draft.salePriceInput || '');
        setOrigPriceInput(draft.origPriceInput || '');
        if (draft.priceCurrency) setPriceCurrency(draft.priceCurrency);
      } else {
        setSalePriceInput('');
        setOrigPriceInput('');
        setFormData({
          name: '',
          subtitle: 'Premium Acquisition',
          tagline: 'Excellence in Craftsmanship',
          price: 0,
          originalPrice: 0,
          category: 'essentials',
          categoryLabel: 'Essentials',
          brand: 'GLADYNS',
          brandOrigin: 'Europe',
          tag: 'New Arrival',
          description: '',
          materials: 'Premium Materials',
          care: 'Professional dry clean only',
          madeIn: 'Portugal',
          primaryImage: '',
          featured: false,
          isNewArrival: true,
          isHotDeal: false,
          images: [],
          colors: [],
          sizes: [],
          specs: [],
          condition: 'Brand New',
          details: [],
          reviewCount: 0,
          rating: 5,
          reviews: [],
          sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          barcode: Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
          stockLevel: 0,
        });
      }
    }
    setIsModalOpen(true);
  };

  // Auto-save uncommitted product draft to protect against mobile camera/app switches
  React.useEffect(() => {
    if (isModalOpen && !editingProduct && (formData.name || (formData.images && formData.images.length > 0))) {
      try {
        localStorage.setItem('gls_admin_product_draft', JSON.stringify({
          formData,
          salePriceInput,
          origPriceInput,
          priceCurrency,
        }));
      } catch (e) {}
    }
  }, [isModalOpen, editingProduct, formData, salePriceInput, origPriceInput, priceCurrency]);

  const handleDiscardDraft = () => {
    try { localStorage.removeItem('gls_admin_product_draft'); } catch (e) {}
    setSalePriceInput('');
    setOrigPriceInput('');
    setFormData({
      name: '',
      subtitle: 'Premium Acquisition',
      tagline: 'Excellence in Craftsmanship',
      price: 0,
      originalPrice: 0,
      category: 'essentials',
      categoryLabel: 'Essentials',
      brand: 'GLADYNS',
      brandOrigin: 'Europe',
      tag: 'New Arrival',
      description: '',
      materials: 'Premium Materials',
      care: 'Professional dry clean only',
      madeIn: 'Portugal',
      primaryImage: '',
      featured: false,
      isNewArrival: true,
      isHotDeal: false,
      images: [],
      colors: [],
      sizes: [],
      details: [],
      reviewCount: 0,
      rating: 5,
      reviews: [],
      sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      barcode: Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0'),
      stockLevel: 0,
    });
  };

  const compressImageFile = (file: File, maxDim = 1000, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (!dataUrl || !file.type.startsWith('image/')) {
          resolve(dataUrl);
          return;
        }

        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = formData.images || [];
    const remainingSlots = 4 - currentImages.length;
    
    if (remainingSlots <= 0) {
      setError('Maximum 4 images allowed per product.');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    try {
      const base64Images = await Promise.all(filesToUpload.map(file => compressImageFile(file)));
      const newImageObjects = base64Images.map(base64 => ({
        url: base64,
        alt: formData.name || 'Product Image'
      }));

      const updatedImages = [...currentImages, ...newImageObjects];
      
      setFormData(prev => ({
        ...prev,
        images: updatedImages,
        primaryImage: prev.primaryImage || updatedImages[0]?.url
      }));
    } catch (err) {
      console.error('Image upload failed:', err);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (formData.images || []).filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: updatedImages,
      primaryImage: prev.primaryImage === prev.images?.[index].url 
        ? updatedImages[0]?.url || '' 
        : prev.primaryImage
    }));
  };

  const setPrimaryImage = (url: string) => {
    setFormData(prev => ({ ...prev, primaryImage: url }));
  };

  const handleSaveProduct = async () => {
    const rawSale = parseFloat(salePriceInput);
    if (!formData.name || isNaN(rawSale) || rawSale <= 0) {
      setError('Please provide at least a product name and a valid sale price.');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      // Convert from the chosen currency to base USD storage value
      const curRate = SUPPORTED_CURRENCIES[priceCurrency]?.rate || 1;
      const basePrice = rawSale / curRate;
      const rawOrig = parseFloat(origPriceInput);
      const baseOrigPrice = !isNaN(rawOrig) && rawOrig > 0 ? rawOrig / curRate : undefined;
      
      const finalFormData: Product = {
        ...(formData as Product),
        price: basePrice,
        originalPrice: baseOrigPrice,
      };

      if (editingProduct) {
        const updated = { ...editingProduct, ...finalFormData };
        const res = await saveRealtimeProduct(updated);
        if (!res.success) {
          setError(res.error || 'Failed to update product in database.');
          setIsSaving(false);
          return;
        }
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        const product: Product = {
          ...finalFormData,
          id: `prod-${Date.now()}`,
          slug: (formData.name || '')?.toLowerCase().replace(/\s+/g, '-'),
          isNewArrival: true,
          tag: finalFormData.tag || 'New Arrival',
          created_at: new Date().toISOString(),
        };
        const res = await saveRealtimeProduct(product);
        if (!res.success) {
          setError(res.error || 'Failed to save product in database.');
          setIsSaving(false);
          return;
        }
        setProducts(prev => [product, ...prev]);
        // Record this product as alerted so it never triggers duplicate notifications
        try {
          const alerted = new Set(JSON.parse(localStorage.getItem('gls_alerted_product_ids') || '[]'));
          alerted.add(product.id);
          localStorage.setItem('gls_alerted_product_ids', JSON.stringify(Array.from(alerted)));
        } catch (e) {}

        const formattedPriceStr = `${Math.round(product.price < 500 ? product.price * 605 : product.price).toLocaleString()} CFA`;
        addRealtimeNotification({
          id: `notif-new-product-${product.id}`,
          title: `✨ New Arrival: ${product.name}`,
          message: `Discover our newest addition: "${product.name}" is now available in store for ${formattedPriceStr}.`,
          timestamp: Date.now(),
          read: false,
          type: 'product',
          linkTarget: product.id,
          image: product.primaryImage || product.images?.[0],
        });
        if (onNewProductAdded) {
          onNewProductAdded(product);
        }
      }

      try { localStorage.removeItem('gls_admin_product_draft'); } catch (e) {}
      setIsSaving(false);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while saving.');
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = () => {
    if (deleteConfirmationId) {
      setProducts(prev => prev.filter(p => p.id !== deleteConfirmationId));
      deleteRealtimeProduct(deleteConfirmationId);
      setDeleteConfirmationId(null);
    }
  };

  const filteredProducts = products.filter(product => {
    const q = searchQuery?.toLowerCase().trim();
    if (!q) return categoryFilter === 'all' || product.category === categoryFilter;

    const matchesSearch = 
      product.name?.toLowerCase().includes(q) ||
      product.id?.toLowerCase().includes(q) ||
      (product.sku && product.sku?.toLowerCase().includes(q)) ||
      product.categoryLabel?.toLowerCase().includes(q) ||
      (product.brand && product.brand?.toLowerCase().includes(q));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold text-zinc-900">Product Management</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-800">
              Catalog & Drops
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">Create, edit, curate descriptions, specifications, photos, and live storefront catalog pieces.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Arrival</span>
          </button>
        </div>
      </div>

      {/* Advanced Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
            <div className="p-6 sm:p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">{editingProduct ? 'Edit Catalogue Piece' : 'Catalogue New Arrival'}</h3>
                <p className="text-xs text-zinc-500 mt-1">Configure advanced product parameters and assets.</p>
              </div>
              <div className="flex items-center gap-2">
                {!editingProduct && (formData.name || (formData.images && formData.images.length > 0)) && (
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Clear Draft
                  </button>
                )}
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer">
                  <Plus className="w-6 h-6 rotate-45 text-zinc-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-8">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Box className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Basic Information</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Piece Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Silk Chore Coat"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Subtitle / Collection</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Premium Acquisition"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tagline</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.tagline}
                      onChange={(e) => setFormData({...formData, tagline: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Commercials Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Financials & Pricing</h4>
                  </div>
                  
                  {/* Currency Picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Input Currency:</span>
                    <select
                      value={priceCurrency}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const oldRate = SUPPORTED_CURRENCIES[priceCurrency]?.rate || 1;
                        const newRate = SUPPORTED_CURRENCIES[newCode]?.rate || 1;
                        const decimals = SUPPORTED_CURRENCIES[newCode]?.decimals || 0;
                        setPriceCurrency(newCode);

                        // Convert current input values if entered
                        if (salePriceInput && !isNaN(parseFloat(salePriceInput))) {
                          const base = parseFloat(salePriceInput) / oldRate;
                          setSalePriceInput((base * newRate).toFixed(decimals));
                        }
                        if (origPriceInput && !isNaN(parseFloat(origPriceInput))) {
                          const base = parseFloat(origPriceInput) / oldRate;
                          setOrigPriceInput((base * newRate).toFixed(decimals));
                        }
                      }}
                      className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 cursor-pointer"
                    >
                      <option value="XOF">🇨🇮 Franc CFA (XOF)</option>
                      <option value="USD">🇺🇸 US Dollar (USD $)</option>
                      <option value="EUR">🇪🇺 Euro (EUR €)</option>
                      <option value="GBP">🇬🇧 British Pound (GBP £)</option>
                      <option value="CAD">🇨🇦 Canadian Dollar (CAD $)</option>
                      <option value="NGN">🇳🇬 Nigerian Naira (NGN ₦)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Sale Price ({SUPPORTED_CURRENCIES[priceCurrency]?.symbol || priceCurrency})
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {priceCurrency}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        {SUPPORTED_CURRENCIES[priceCurrency]?.symbol}
                      </span>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="e.g. 10000"
                        className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-emerald-600"
                        value={salePriceInput}
                        onChange={(e) => setSalePriceInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-zinc-400" />
                        Original Retail Price (Optional for Discount Strikethrough)
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {priceCurrency}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        {SUPPORTED_CURRENCIES[priceCurrency]?.symbol}
                      </span>
                      <input 
                        type="number" 
                        step="any"
                        placeholder="0.00"
                        className="w-full pl-9 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold text-zinc-500"
                        value={origPriceInput}
                        onChange={(e) => setOrigPriceInput(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Live Currency Conversion Preview Card */}
                {salePriceInput && !isNaN(parseFloat(salePriceInput)) && parseFloat(salePriceInput) > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">
                          Storefront Live Conversion Preview
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          Customers around the world will see this price calculated accurately in their local currency:
                        </p>
                      </div>
                    </div>

                    {(() => {
                      const curRate = SUPPORTED_CURRENCIES[priceCurrency]?.rate || 1;
                      const baseUSD = parseFloat(salePriceInput) / curRate;
                      const cfaVal = Math.round(baseUSD * 605).toLocaleString();
                      const usdVal = baseUSD.toFixed(2);
                      const eurVal = (baseUSD * 0.92).toFixed(2);

                      return (
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-zinc-900">
                            🇨🇮 {cfaVal} CFA
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-zinc-900">
                            🇺🇸 ${usdVal}
                          </span>
                          <span className="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-mono font-bold text-zinc-900">
                            🇪🇺 {eurVal} €
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Taxonomy & Branding Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Classification & Branding</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dedicated Category</label>
                    <select 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value, categoryLabel: e.target.options[e.target.selectedIndex].text})}
                    >
                      <option value="">Select Category / Department</option>
                      {categories.filter(c => c.id !== 'all').map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">House / Brand Selection</label>
                    <select 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                      value={formData.brand}
                      onChange={(e) => {
                        const selectedBrand = brands.find(b => b.name === e.target.value);
                        setFormData({...formData, brand: e.target.value, brandOrigin: selectedBrand?.origin || formData.brandOrigin});
                      }}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Brand Origin / Provenance
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Porto, Portugal"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.brandOrigin}
                      onChange={(e) => setFormData({...formData, brandOrigin: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Assets Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <ImageIcon className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-black uppercase tracking-widest">Digital Assets (Max 4 Images)</h4>
                  </div>
                  <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-blue-100 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Images</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload}
                      disabled={(formData.images || []).length >= 4}
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(formData.images || []).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-200 group bg-zinc-50">
                      <img src={img.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          onClick={() => removeImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setPrimaryImage(img.url)}
                          className={`px-2 py-1 rounded text-[8px] font-black uppercase transition-all ${
                            formData.primaryImage === img.url 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-white text-zinc-900 hover:bg-zinc-100'
                          }`}
                        >
                          {formData.primaryImage === img.url ? 'Primary' : 'Set Primary'}
                        </button>
                      </div>
                      {formData.primaryImage === img.url && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded shadow-sm">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {(formData.images || []).length < 4 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-all cursor-pointer bg-zinc-50/30">
                      <Plus className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Add Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Or Provide Primary Image URL (Fallback)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                    value={formData.primaryImage}
                    onChange={(e) => setFormData({...formData, primaryImage: e.target.value})}
                  />
                </div>
              </div>

              {/* Product Color Variants Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Palette className="w-4 h-4 text-purple-600" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest">Color Variants</h4>
                      <p className="text-[11px] text-zinc-500 font-normal">Add available colors. Leave empty if product has a single universal color.</p>
                    </div>
                  </div>
                  {(formData.colors || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, colors: [] }))}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider"
                    >
                      Clear All Colors
                    </button>
                  )}
                </div>

                {/* Popular Color Quick Presets */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Presets</label>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_COLOR_PRESETS.map((preset) => {
                      const isAdded = (formData.colors || []).some(c => c.name.toLowerCase() === preset.name.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleAddPresetColor(preset.name, preset.hex)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                            isAdded
                              ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-xs'
                              : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span>{preset.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-purple-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Creator */}
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Add Custom Color</label>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-2 py-1.5 shrink-0">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-7 h-7 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                        title="Pick Color"
                      />
                      <input
                        type="text"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        placeholder="#000000"
                        className="w-20 text-xs font-mono font-bold text-zinc-700 bg-transparent outline-none uppercase"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Color Name (e.g. Titanium, Midnight Black, Rosewood)"
                      value={customColorName}
                      onChange={(e) => setCustomColorName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomColor(); } }}
                      className="flex-1 min-w-[160px] px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-zinc-950/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomColor}
                      disabled={!customColorName.trim()}
                      className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                    >
                      + Add Color
                    </button>
                  </div>
                </div>

                {/* Active Color Variants List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Active Colors ({(formData.colors || []).length})
                    </label>
                    {(formData.colors || []).length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No color variants (Single standard item)</span>
                    )}
                  </div>
                  {(formData.colors || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(formData.colors || []).map((col) => (
                        <div
                          key={col.id}
                          className="inline-flex items-center gap-2 pl-2 pr-1.5 py-1.5 bg-white border border-zinc-200 rounded-xl shadow-xs"
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-inner"
                            style={{ backgroundColor: col.colorHex }}
                          />
                          <span className="text-xs font-bold text-zinc-800">{col.name}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleColorStock(col.id)}
                            title={col.inStock ? 'Mark out of stock' : 'Mark in stock'}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                              col.inStock
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            {col.inStock ? 'In Stock' : 'Out'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(col.id)}
                            className="p-1 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-xs text-zinc-400">
                      Product has no color options. Storefront will not show color swatches.
                    </div>
                  )}
                </div>
              </div>

              {/* Product Size Variants Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <Ruler className="w-4 h-4 text-indigo-600" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest">Sizes & Dimension Variants</h4>
                      <p className="text-[11px] text-zinc-500 font-normal">Set sizes if applicable. Leave empty for electronics, perfumes, or IT hardware.</p>
                    </div>
                  </div>
                  {(formData.sizes || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('none')}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider"
                    >
                      Clear All Sizes
                    </button>
                  )}
                </div>

                {/* Size Presets */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Presets</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('none')}
                      className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-all"
                    >
                      🚫 Universal / No Sizes
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('tiers')}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-lg text-xs font-bold transition-all"
                    >
                      ⚙️ Hardware Editions (Standard / Pro / Master)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('storage')}
                      className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 rounded-lg text-xs font-bold transition-all"
                    >
                      💾 Storage / SSD (128GB - 2TB)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('audio')}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 rounded-lg text-xs font-bold transition-all"
                    >
                      🎧 Audio Edition (Solo / Stereo / Studio)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySizePreset('voltage')}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-bold transition-all"
                    >
                      ⚡ Charging Power (65W - 120W)
                    </button>
                  </div>
                </div>

                {/* Custom Size Input */}
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Add Custom Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Size label (e.g. 15-inch, 2TB, Extra Large, 100ml)"
                      value={customSizeName}
                      onChange={(e) => setCustomSizeName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSize(); } }}
                      className="flex-1 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-zinc-950/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      disabled={!customSizeName.trim()}
                      className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
                    >
                      + Add Size
                    </button>
                  </div>
                </div>

                {/* Active Sizes List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Active Sizes ({(formData.sizes || []).length})
                    </label>
                    {(formData.sizes || []).length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No size selector will be shown on storefront</span>
                    )}
                  </div>
                  {(formData.sizes || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(formData.sizes || []).map((sz) => (
                        <div
                          key={sz.name}
                          className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-white border border-zinc-200 rounded-xl shadow-xs"
                        >
                          <span className="text-xs font-bold text-zinc-800">{sz.name}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleSizeStock(sz.name)}
                            title={sz.inStock ? 'Mark out of stock' : 'Mark in stock'}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                              sz.inStock
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            }`}
                          >
                            {sz.inStock ? 'In Stock' : 'Out'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sz.name)}
                            className="p-1 hover:bg-rose-50 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center text-xs text-zinc-400">
                      Product has no size options. Clothing size selectors (S, M, L) and size guides are hidden.
                    </div>
                  )}
                </div>
              </div>

              {/* Item Specifications & Hardware Details (Facebook Marketplace-Style) */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-zinc-900">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest">
                        Item Specifications & Details (Marketplace Attributes)
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-normal">
                        RAM, Operating System, Processor, Storage, Condition, Intended Work, etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setIsHardwareWizardOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Open interactive cascading drill-down wizard for Laptop/Desktop, RAM, Storage, CPU, Generation & OS"
                    >
                      <Laptop className="w-3.5 h-3.5 text-amber-300" />
                      <span>🛠️ Interactive Laptop / PC Builder</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSmartAutoDetectSpecs}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Automatically detect RAM, Processor, OS, Storage from product title and description"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>⚡ Auto-Generate from Name</span>
                    </button>
                    {(formData.specs || []).length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllSpecs}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 uppercase tracking-wider cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Condition Selector */}
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    Item Condition (Marketplace Standard)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Brand New', 'Like New', 'Open Box', 'Refurbished', 'Good Condition'].map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, condition: cond }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          (formData.condition || 'Brand New') === cond
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        {cond === 'Brand New' ? '✨ ' : cond === 'Refurbished' ? '🔄 ' : cond === 'Open Box' ? '📦 ' : '✓ '}
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Category Templates */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    One-Click Specification Templates
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplySpecPreset('laptop')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>💻 Laptop / PC Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySpecPreset('phone')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>📱 Phone / Tablet Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySpecPreset('audio')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>🎧 Audio / Sound Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySpecPreset('appliance')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>🔌 Appliances Template</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplySpecPreset('lifestyle')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>🛠️ Lifestyle & Hardware Template</span>
                    </button>
                  </div>
                </div>

                {/* Active Specs Table & Inline Editor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Active Specifications ({(formData.specs || []).length})
                    </label>
                  </div>

                  {(formData.specs || []).length > 0 ? (
                    <div className="space-y-2 border border-zinc-200 rounded-2xl p-3 bg-zinc-50/50">
                      {(formData.specs || []).map((spec, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-zinc-200 shadow-2xs">
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) => handleUpdateSpec(idx, 'label', e.target.value)}
                            placeholder="Attribute Label (e.g. Installed RAM)"
                            className="w-1/3 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                          />
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                            placeholder="Attribute Value (e.g. 16GB DDR5)"
                            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(idx)}
                            className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove attribute"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-zinc-400">
                      No technical details entered yet. Click <strong>⚡ Auto-Generate from Name</strong> or choose a template above.
                    </div>
                  )}

                  {/* Add Custom Row */}
                  <div className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center gap-2 shadow-2xs">
                    <input
                      type="text"
                      placeholder="Custom Attribute (e.g. GPU, Weight, Keyboard)"
                      value={newSpecLabel}
                      onChange={(e) => setNewSpecLabel(e.target.value)}
                      className="w-1/3 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold focus:bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. NVIDIA RTX 4060, 1.4kg, QWERTY Backlit)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomSpec(); } }}
                      className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSpec}
                      disabled={!newSpecLabel.trim() || !newSpecValue.trim()}
                      className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                    >
                      + Add Detail
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Editorial Content</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Artisanal Narrative / Product Description</span>
                    <button
                      type="button"
                      onClick={handleAutoGenerateDescription}
                      disabled={isGeneratingDesc}
                      className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isGeneratingDesc ? 'animate-spin text-blue-500' : 'text-blue-600'}`} />
                      <span>{isGeneratingDesc ? 'Generating AI Description...' : 'Auto-Generate Description'}</span>
                    </button>
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Describe the craftsmanship, materials, and inspiration..."
                    className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all resize-none leading-relaxed"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Materials</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.materials}
                      onChange={(e) => setFormData({...formData, materials: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Care Instructions</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.care}
                      onChange={(e) => setFormData({...formData, care: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Tracking Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Package className="w-4 h-4 text-blue-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Inventory & Tracking</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                      Product SKU
                      <button onClick={generateIdentifiers} className="text-blue-600 hover:underline">Auto-Gen</button>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. GL-EXT-001"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-mono uppercase"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Barcode</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. 123456789012"
                        className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-mono"
                        value={formData.barcode}
                        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Current Stock Level</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                      value={formData.stockLevel}
                      onChange={(e) => setFormData({...formData, stockLevel: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
              </div>

              {/* Promotions & Visibility Section */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-2 text-zinc-900">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest">Promotions & Visibility</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Promo Tag / Label</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Limited Edition, Hot Deal"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.tag}
                      onChange={(e) => setFormData({...formData, tag: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Discount Highlight (%)</label>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.discountPercentage}
                      onChange={(e) => setFormData({...formData, discountPercentage: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-zinc-300 text-zinc-950 focus:ring-zinc-950"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">Featured Piece</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-zinc-300 text-blue-600 focus:ring-blue-500"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({...formData, isNewArrival: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-md border-zinc-300 text-rose-600 focus:ring-rose-500"
                      checked={formData.isHotDeal}
                      onChange={(e) => setFormData({...formData, isHotDeal: e.target.checked})}
                    />
                    <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-950 transition-colors">Hot Deal</span>
                  </label>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <button 
                  type="button"
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 disabled:opacity-60 transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Saving & Syncing to Cloud...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editingProduct ? 'Update Catalogue Piece' : 'Catalogue Piece'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total SKU Count</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-display font-bold text-zinc-900">{products.length}</h4>
            <Box className="w-5 h-5 text-zinc-300" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Featured Active</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-display font-bold text-zinc-900">{products.filter(p => p.featured).length}</h4>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hot Deals</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-display font-bold text-zinc-900">{products.filter(p => p.isHotDeal).length}</h4>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">New Arrivals</p>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-display font-bold text-zinc-900">{products.filter(p => p.isNewArrival).length}</h4>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search inventory by name, category, SKU, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none rounded-xl text-sm focus:ring-1 focus:ring-zinc-900"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-zinc-50 border-none rounded-xl text-sm px-4 py-2 focus:ring-1 focus:ring-zinc-900 font-semibold text-zinc-700"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group hover:border-zinc-300 transition-all">
            <div className="aspect-[4/5] bg-zinc-100 relative overflow-hidden">
              <img 
                src={product.primaryImage} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.featured && (
                  <span className="bg-zinc-900 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">Featured</span>
                )}
                {product.isNewArrival && (
                  <span className="bg-blue-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">New</span>
                )}
                {product.isHotDeal && (
                  <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full">Hot Deal</span>
                )}
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1 flex flex-col gap-1 shadow-lg">
                  <button 
                    onClick={() => handleOpenModal(product)}
                    className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors border-t border-zinc-200/50">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmationId(product.id)}
                    className="p-2 text-rose-600 hover:text-rose-700 transition-colors border-t border-zinc-200/50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{product.categoryLabel}</p>
                  <p className="text-[10px] font-bold text-zinc-400">{product.brand}</p>
                </div>
                <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">{product.name}</h4>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 font-mono">{formatPrice(product.price)}</span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-[10px] text-zinc-400 line-through font-mono">{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${product.sizes.some(s => s.inStock) ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="text-[10px] font-semibold text-zinc-500">
                    In Stock
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <button 
                  onClick={() => handleOpenModal(product)}
                  className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors"
                >
                  Manage Product
                </button>
                <div className="flex -space-x-1">
                  {product.colors.slice(0, 3).map((color, i) => (
                    <div 
                      key={i} 
                      className="w-3.5 h-3.5 rounded-full border border-white shadow-sm"
                      style={{ backgroundColor: color.colorHex }}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <div className="w-3.5 h-3.5 rounded-full bg-zinc-100 border border-white flex items-center justify-center text-[8px] font-bold text-zinc-500">
                      +{product.colors.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Placeholder */}
        <button 
          onClick={() => handleOpenModal()}
          className="aspect-[4/5] sm:aspect-auto rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center gap-4 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 transition-all group bg-zinc-50/30"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Add Piece</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Delete Piece?</h3>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              This action is permanent. The piece will be removed from your boutique archive and storefront.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteConfirmationId(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Interactive Hardware Specification Wizard Modal */}
      {isHardwareWizardOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-hidden">
            <HardwareSpecWizard
              initialBrand={formData.brand || 'HP'}
              onApplySpecs={handleApplyWizardSpecs}
              onClose={() => setIsHardwareWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Fast Action Loading Feedback */}
      {isSaving && (
        <FastActionLoader message={editingProduct ? 'Saving Piece Updates...' : 'Publishing New Piece to Live Storefront...'} />
      )}
    </div>
  );
};



