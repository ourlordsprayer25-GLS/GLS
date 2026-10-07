import React, { useState, useRef } from 'react';
import { StoreSettings } from '../../types/store';
import { 
  Save, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Twitter, 
  Facebook, 
  Info, 
  FileText, 
  Megaphone, 
  Image as ImageIcon, 
  CheckCircle2, 
  Upload, 
  Clock, 
  ShieldCheck, 
  RotateCcw, 
  Lock, 
  Truck, 
  Compass, 
  Sparkles, 
  Trash2,
  ExternalLink,
  Eye,
  Store,
  MessageSquare
} from 'lucide-react';
const defaultShopImg = '/assets/gladyns_store_preview.png';
import { saveRealtimeSettings } from '../../services/supabaseService';

interface AdminSettingsProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ storeSettings, setStoreSettings }) => {
  const [localSettings, setLocalSettings] = useState<StoreSettings>(storeSettings);
  const [activeSubTab, setActiveSubTab] = useState<'about' | 'policies' | 'contact' | 'brand'>('about');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    setIsSaving(true);
    setStoreSettings(localSettings);
    saveRealtimeSettings(localSettings);
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 400);
  };

  const updateNested = (path: string, value: any) => {
    const keys = path.split('.');
    setLocalSettings(prev => {
      const next = { ...prev } as any;
      let current = next;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Image Upload handler for Shop Image
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image size should be under 5MB.');
      return;
    }

    setImageUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          const maxDim = 1200;
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
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            updateNested('aboutUs.image', canvas.toDataURL('image/jpeg', 0.8));
            return;
          }
          updateNested('aboutUs.image', result);
        };
        img.onerror = () => updateNested('aboutUs.image', result);
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  const currentShopImage = localSettings.aboutUs?.image || defaultShopImg;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl pb-24">
      {/* Header and Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-zinc-900 font-display">Store CMS & Legal Policies</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your shop photo, brand story, contact coordinates, and policy conditions appearing on the storefront.
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
            isSaving ? 'bg-zinc-400 cursor-not-allowed text-white' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Deploying Changes...' : 'Save & Publish Live'}</span>
        </button>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in slide-in-from-top-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">Changes Published Successfully</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Your shop photo, About Us narrative, and policy conditions have been synchronized live to the storefront.
            </p>
          </div>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {[
          { id: 'about', label: 'About Us & Shop Photo', icon: Info },
          { id: 'policies', label: 'Policy Conditions & Legal', icon: FileText },
          { id: 'contact', label: 'Contact Us & Store Locator', icon: MapPin },
          { id: 'brand', label: 'Brand Identity & Announcements', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-zinc-600 hover:text-zinc-950 border border-zinc-200 hover:bg-zinc-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ABOUT US & SHOP IMAGE */}
      {activeSubTab === 'about' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Shop Image Manager Card */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Official Store & Boutique Photo</h3>
                  <p className="text-[11px] text-zinc-500">This photo is displayed in About Us, Store Locator, and Contact sections.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 font-bold">
                Live Storefront Asset
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Image Preview Box */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-6 space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Current Active Shop Image
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-900 group shadow-md">
                    <img
                      src={currentShopImage}
                      alt="Shop Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-[9px] font-mono uppercase tracking-widest bg-blue-600 text-white px-2 py-0.5 rounded w-max font-bold">
                        Live Storefront Photo
                      </span>
                      <p className="text-xs font-bold mt-1">{localSettings.storeName || 'GLADYNS'} Official Boutique & Flagship</p>
                      <p className="text-[10px] text-zinc-300 truncate">
                        {localSettings.contactAddress || "Habitat Extension, E 24, Abidjan, Côte d'Ivoire"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Store Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateNested('aboutUs.image', defaultShopImg)}
                      className="py-2.5 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="Reset to official default boutique image"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {imageUploadError && (
                    <p className="text-xs text-rose-600 font-medium">{imageUploadError}</p>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="lg:col-span-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                      Or Paste Image Direct URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://... direct image link (JPG, PNG, WEBP)"
                        value={localSettings.aboutUs?.image || ''}
                        onChange={(e) => updateNested('aboutUs.image', e.target.value)}
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Supports direct JPG, PNG, WEBP, or Cloudinary/Unsplash image links.
                    </p>
                  </div>

                  {/* Storefront Display Guide Box */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Where this Boutique Photo Appears on Storefront:</span>
                    </div>
                    <div className="space-y-2 text-xs text-zinc-600">
                      <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-blue-50">
                        <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-zinc-900">Store Locator (/stores)</p>
                          <p className="text-[11px] text-zinc-500">Displayed as the primary flagship showroom photo banner for customers visiting your location.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-white/70 p-2.5 rounded-lg border border-blue-50">
                        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-zinc-900">About Us Page (/about)</p>
                          <p className="text-[11px] text-zinc-500">Presented as the official workshop and boutique studio photo in your brand narrative.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* About Us Narrative & Story Section */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Info className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">About Us Page Narrative & Information</h3>
                <p className="text-[11px] text-zinc-500">Edit the title, story, mission statement, and founding coordinates.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Page Headline / Title
                  </label>
                  <input
                    type="text"
                    value={localSettings.aboutUs?.title || ''}
                    onChange={(e) => updateNested('aboutUs.title', e.target.value)}
                    placeholder="e.g. À Propos de GLADYNS Boutique"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Catchphrase / Subtitle
                  </label>
                  <input
                    type="text"
                    value={localSettings.aboutUs?.subtitle || ''}
                    onChange={(e) => updateNested('aboutUs.subtitle', e.target.value)}
                    placeholder="e.g. European Fashion House & Boutique Curation"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Main Story Narrative (About Us Content)
                </label>
                <textarea
                  rows={5}
                  value={localSettings.aboutUs?.content || ''}
                  onChange={(e) => updateNested('aboutUs.content', e.target.value)}
                  placeholder="Detail your brand origins, materials, and artisan philosophy..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Mission Statement
                  </label>
                  <input
                    type="text"
                    value={localSettings.aboutUs?.missionStatement || ''}
                    onChange={(e) => updateNested('aboutUs.missionStatement', e.target.value)}
                    placeholder="e.g. Ethical Craftsmanship & Zero Waste"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Flagship & Studio Origin Locations
                  </label>
                  <input
                    type="text"
                    value={localSettings.aboutUs?.atelierLocation || ''}
                    onChange={(e) => updateNested('aboutUs.atelierLocation', e.target.value)}
                    placeholder="e.g. Abidjan, Côte d'Ivoire"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Founded Year
                  </label>
                  <input
                    type="text"
                    value={localSettings.aboutUs?.foundedYear || ''}
                    onChange={(e) => updateNested('aboutUs.foundedYear', e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: POLICIES & LEGAL CONDITIONS */}
      {activeSubTab === 'policies' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Policy Conditions & Legal Terms</h3>
                  <p className="text-[11px] text-zinc-500">Edit and address all legal clauses, warranty promises, return rules, and privacy terms.</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                Last Updated: {localSettings.terms?.lastUpdated || 'September 2025'}
              </span>
            </div>

            <div className="p-6 space-y-8">
              {/* General Terms Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Legal Document Title
                  </label>
                  <input
                    type="text"
                    value={localSettings.terms?.title || ''}
                    onChange={(e) => updateNested('terms.title', e.target.value)}
                    placeholder="Terms & Conditions of Sale"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Document Effective Date / Version
                  </label>
                  <input
                    type="text"
                    value={localSettings.terms?.lastUpdated || ''}
                    onChange={(e) => updateNested('terms.lastUpdated', e.target.value)}
                    placeholder="e.g. September 2025"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Clause 1: General Provisions */}
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <label className="text-xs font-bold text-zinc-900">
                    1. General Provisions & Legal Scope
                  </label>
                </div>
                <textarea
                  rows={4}
                  value={localSettings.terms?.content || ''}
                  onChange={(e) => updateNested('terms.content', e.target.value)}
                  placeholder="These terms and conditions apply to all purchases placed through..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              {/* Clause 2: Warranty Policy */}
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-bold text-zinc-900">Clause 2 Title:</span>
                  </div>
                  <input
                    type="text"
                    value={localSettings.terms?.warrantyTitle ?? '2. Warranty & Quality Guarantee'}
                    onChange={(e) => updateNested('terms.warrantyTitle', e.target.value)}
                    placeholder="e.g. 2. Warranty & Quality Guarantee"
                    className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:outline-none focus:border-blue-600 sm:w-80"
                  />
                </div>
                <textarea
                  rows={3}
                  value={localSettings.terms?.warrantyPolicy || ''}
                  onChange={(e) => updateNested('terms.warrantyPolicy', e.target.value)}
                  placeholder="State your exact warranty coverage, duration, and conditions..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              {/* Clause 3: Returns & Refunds Policy */}
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-xs font-bold text-zinc-900">Clause 3 Title:</span>
                  </div>
                  <input
                    type="text"
                    value={localSettings.terms?.returnTitle ?? '3. Return & Refund Policy'}
                    onChange={(e) => updateNested('terms.returnTitle', e.target.value)}
                    placeholder="e.g. 3. Return & Refund Policy"
                    className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 focus:outline-none focus:border-blue-600 sm:w-80"
                  />
                </div>
                <textarea
                  rows={3}
                  value={localSettings.terms?.returnPolicy || ''}
                  onChange={(e) => updateNested('terms.returnPolicy', e.target.value)}
                  placeholder="State your return conditions, return timeline window, and refund procedure..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              {/* Clause 4: Privacy & GDPR */}
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <label className="text-xs font-bold text-zinc-900">
                    4. Privacy Policy & Data Protection (GDPR Compliant)
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={localSettings.terms?.privacyPolicy || ''}
                  onChange={(e) => updateNested('terms.privacyPolicy', e.target.value)}
                  placeholder="GLADYNS is committed to absolute personal data privacy adhering strictly to EU GDPR standards..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              {/* Clause 5: Shipping Policy */}
              <div className="space-y-2 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-slate-700" />
                  <label className="text-xs font-bold text-zinc-900">
                    5. Shipping, Carbon Neutral Courier & Delivery Timelines
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={localSettings.terms?.shippingPolicy || ''}
                  onChange={(e) => updateNested('terms.shippingPolicy', e.target.value)}
                  placeholder="Global express dispatch with complimentary carbon-neutral courier delivery..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>
            </div>
          </section>

          {/* DEDICATED REFUND POLICY CARD */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Dedicated Refund & Return Policy Page</h3>
                  <p className="text-[11px] text-zinc-500">Edit the dedicated Return & Refund Policy page visible in sidebar and footer (#refund-policy).</p>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
                Live Storefront Route
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Page Headline
                  </label>
                  <input
                    type="text"
                    value={localSettings.refundPolicy?.title || ''}
                    onChange={(e) => updateNested('refundPolicy.title', e.target.value)}
                    placeholder="Return & Refund Policy"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Return Window (Days)
                  </label>
                  <input
                    type="text"
                    value={localSettings.refundPolicy?.returnWindowDays || '30'}
                    onChange={(e) => updateNested('refundPolicy.returnWindowDays', e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Version / Last Revision
                  </label>
                  <input
                    type="text"
                    value={localSettings.refundPolicy?.lastUpdated || ''}
                    onChange={(e) => updateNested('refundPolicy.lastUpdated', e.target.value)}
                    placeholder="September 2025"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Policy Overview & Satisfaction Guarantee
                </label>
                <textarea
                  rows={3}
                  value={localSettings.refundPolicy?.overview || ''}
                  onChange={(e) => updateNested('refundPolicy.overview', e.target.value)}
                  placeholder="At GLADYNS, we stand behind the exceptional quality..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Step-by-Step Return Instructions
                </label>
                <textarea
                  rows={3}
                  value={localSettings.refundPolicy?.stepByStepProcess || ''}
                  onChange={(e) => updateNested('refundPolicy.stepByStepProcess', e.target.value)}
                  placeholder="Initiate your return with one click in your Order Pipeline or contact our Concierge..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Eligibility & Condition Requirements
                  </label>
                  <textarea
                    rows={4}
                    value={localSettings.refundPolicy?.eligibility || ''}
                    onChange={(e) => updateNested('refundPolicy.eligibility', e.target.value)}
                    placeholder="Items must be returned in their original, unworn, unwashed condition..."
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    Refund Timelines & Payment Release
                  </label>
                  <textarea
                    rows={4}
                    value={localSettings.refundPolicy?.processingTime || ''}
                    onChange={(e) => updateNested('refundPolicy.processingTime', e.target.value)}
                    placeholder="Refunds are issued to your original payment method within 24 to 48 hours..."
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Non-Returnable Exceptions & Custom Pieces
                </label>
                <textarea
                  rows={3}
                  value={localSettings.refundPolicy?.exceptions || ''}
                  onChange={(e) => updateNested('refundPolicy.exceptions', e.target.value)}
                  placeholder="Custom-tailored bespoke creations, personalized engraved pieces..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all leading-relaxed"
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 3: CONTACT US & STORE LOCATOR */}
      {activeSubTab === 'contact' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Storefront Coordinates & Contact Channels</h3>
                <p className="text-[11px] text-zinc-500">Edit physical address, official phone, customer email, and WhatsApp hotline.</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Primary Flagship Address</span>
                  </label>
                  <input
                    type="text"
                    value={localSettings.contactAddress || ''}
                    onChange={(e) => setLocalSettings({...localSettings, contactAddress: e.target.value})}
                    placeholder="Habitat Extension, E 24, Abidjan, Côte d'Ivoire"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Boutique Operating Hours</span>
                  </label>
                  <input
                    type="text"
                    value={localSettings.operatingHours || ''}
                    onChange={(e) => setLocalSettings({...localSettings, operatingHours: e.target.value})}
                    placeholder="Monday – Saturday: 10:00 AM – 7:00 PM CET"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Concierge Email</span>
                  </label>
                  <input
                    type="email"
                    value={localSettings.contactEmail || ''}
                    onChange={(e) => setLocalSettings({...localSettings, contactEmail: e.target.value})}
                    placeholder="concierge@gladyns.com"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Direct Boutique Phone</span>
                  </label>
                  <input
                    type="tel"
                    value={localSettings.contactPhone || ''}
                    onChange={(e) => setLocalSettings({...localSettings, contactPhone: e.target.value})}
                    placeholder="+225 05 00 61 99 23"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Concierge Line</span>
                  </label>
                  <input
                    type="tel"
                    value={localSettings.whatsappNumber || ''}
                    onChange={(e) => setLocalSettings({...localSettings, whatsappNumber: e.target.value})}
                    placeholder="+225 05 00 61 99 23"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-zinc-100 space-y-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                  Social Channels
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="Instagram URL"
                      value={localSettings.socialLinks?.instagram || ''}
                      onChange={(e) => updateNested('socialLinks.instagram', e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="X / Twitter URL"
                      value={localSettings.socialLinks?.twitter || ''}
                      onChange={(e) => updateNested('socialLinks.twitter', e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-zinc-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="Facebook URL"
                      value={localSettings.socialLinks?.facebook || ''}
                      onChange={(e) => updateNested('socialLinks.facebook', e.target.value)}
                      className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* TAB 4: BRAND IDENTITY & ANNOUNCEMENT */}
      {activeSubTab === 'brand' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
              <Globe className="w-4.5 h-4.5 text-zinc-400" />
              <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Brand Identity</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Marketplace Name</label>
                  <input 
                    type="text" 
                    value={localSettings.storeName}
                    onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SEO Description</label>
                  <input 
                    type="text" 
                    value={localSettings.storeDescription}
                    onChange={(e) => setLocalSettings({...localSettings, storeDescription: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Announcement Bar */}
          <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Megaphone className="w-4.5 h-4.5 text-zinc-400" />
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-widest">Announcement Bar Ticker</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={localSettings.announcementBar?.enabled}
                  onChange={(e) => updateNested('announcementBar.enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Announcement Text</label>
                <input 
                  type="text" 
                  value={localSettings.announcementBar?.text || ''}
                  disabled={!localSettings.announcementBar?.enabled}
                  onChange={(e) => updateNested('announcementBar.text', e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

