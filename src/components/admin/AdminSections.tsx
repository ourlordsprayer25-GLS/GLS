import React, { useState } from 'react';
import { StoreSettings, StoreSectionConfig } from '../../types/store';
import { 
  Layout, 
  Image as ImageIcon, 
  Type, 
  MousePointer2, 
  Save, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Layers,
  Sparkles
} from 'lucide-react';

interface AdminSectionsProps {
  storeSettings: StoreSettings;
  setStoreSettings: React.Dispatch<React.SetStateAction<StoreSettings>>;
}

export const AdminSections: React.FC<AdminSectionsProps> = ({ storeSettings, setStoreSettings }) => {
  const [localSettings, setLocalSettings] = useState<StoreSettings>({
    ...storeSettings,
    sections: storeSettings.sections || [
      { id: 'announcement', name: 'Announcement Bar', subtitle: 'Top promotional ticker', enabled: true, position: 1, type: 'announcement' },
      { id: 'hero', name: 'Hero Campaign', subtitle: 'Main landing banner and CTA', enabled: true, position: 2, type: 'hero' },
      { id: 'collections', name: 'Featured Collections', subtitle: 'Curated category showcase', enabled: true, position: 3, type: 'collections' },
      { id: 'new_arrivals', name: 'New Arrivals Grid', subtitle: 'Latest drops and releases', enabled: true, position: 4, type: 'grid' },
      { id: 'heritage', name: 'Brand Heritage & Craft', subtitle: 'Store story and values', enabled: true, position: 5, type: 'about' },
      { id: 'reviews', name: 'Patron Testimonials', subtitle: 'Client reviews and trust', enabled: true, position: 6, type: 'testimonials' },
      { id: 'newsletter', name: 'VIP Newsletter Club', subtitle: 'Subscriber acquisition banner', enabled: true, position: 7, type: 'newsletter' },
      { id: 'more_to_love', name: 'More to Love Recommendations', subtitle: 'Product page cross-sell section', enabled: true, position: 8, type: 'more_to_love' },
    ]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleHeroChange = (field: keyof StoreSettings['heroContent'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      heroContent: {
        ...prev.heroContent,
        [field]: value
      }
    }));
  };

  const handleAnnouncementChange = (field: keyof StoreSettings['announcementBar'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      announcementBar: {
        ...prev.announcementBar,
        [field]: value
      }
    }));
  };

  const handleMoreToLoveChange = (field: keyof StoreSettings['moreToLoveSection'], value: any) => {
    setLocalSettings(prev => {
      const updatedMoreToLove = {
        ...(prev.moreToLoveSection || { enabled: true, title: 'More to Love', subtitle: '', tagLabel: '', itemCount: 4 }),
        [field]: value
      };
      let updatedSections = prev.sections;
      if (field === 'enabled') {
        updatedSections = prev.sections.map(sec => sec.id === 'more_to_love' ? { ...sec, enabled: value } : sec);
      }
      return {
        ...prev,
        moreToLoveSection: updatedMoreToLove,
        sections: updatedSections,
      };
    });
  };

  const handleSectionFieldChange = (id: string, field: keyof StoreSectionConfig, value: any) => {
    setLocalSettings(prev => {
      const updatedSections = prev.sections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec);
      let updatedMoreToLove = prev.moreToLoveSection;
      if (id === 'more_to_love' && field === 'enabled') {
        updatedMoreToLove = { ...prev.moreToLoveSection, enabled: value };
      }
      return {
        ...prev,
        sections: updatedSections,
        moreToLoveSection: updatedMoreToLove,
      };
    });
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const sections = [...localSettings.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    // Swap positions
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // Reassign position numbers
    const updated = sections.map((sec, idx) => ({ ...sec, position: idx + 1 }));

    setLocalSettings(prev => ({
      ...prev,
      sections: updated
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setStoreSettings(localSettings);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Advanced Sections Management</h2>
          <p className="text-xs text-zinc-500 mt-1">Reorder storefront layout, customize section titles, descriptions, and visibility.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isSaving ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving Layout...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-xs font-bold uppercase tracking-tight">Storefront layout and sections successfully updated.</p>
        </div>
      )}

      {/* Sections Sequence Management */}
      <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Storefront Section Ordering & Visibility</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Drag or use arrows to rearrange layout sequence</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full">
            {localSettings.sections.filter(s => s.enabled).length} Active Sections
          </span>
        </div>

        <div className="space-y-3">
          {localSettings.sections.sort((a, b) => a.position - b.position).map((section, index, arr) => (
            <div 
              key={section.id} 
              className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                section.enabled ? 'bg-zinc-50/50 border-zinc-200' : 'bg-zinc-100/60 border-zinc-200 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-xs font-black text-zinc-700 shadow-xs">
                  #{section.position}
                </div>
                <div className="space-y-1">
                  <input 
                    type="text" 
                    value={section.name}
                    onChange={(e) => handleSectionFieldChange(section.id, 'name', e.target.value)}
                    className="text-xs font-bold text-zinc-900 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none transition-all py-0.5"
                    placeholder="Section Name"
                  />
                  <input 
                    type="text" 
                    value={section.subtitle}
                    onChange={(e) => handleSectionFieldChange(section.id, 'subtitle', e.target.value)}
                    className="text-[11px] text-zinc-500 bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-900 focus:outline-none transition-all w-full md:w-80"
                    placeholder="Section Subtitle / Description"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionFieldChange(section.id, 'enabled', !section.enabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                    section.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{section.enabled ? 'Visible' : 'Hidden'}</span>
                </button>

                <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveSection(index, 'up')}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-700 transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === arr.length - 1}
                    onClick={() => handleMoveSection(index, 'down')}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent text-zinc-700 transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hero Section Config */}
        <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Hero Campaign Content</h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Main Banner Configuration</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Main Heading</label>
              <div className="relative">
                <Type className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text"
                  value={localSettings.heroContent.title}
                  onChange={(e) => handleHeroChange('title', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Button Text</label>
              <div className="relative">
                <MousePointer2 className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text"
                  value={localSettings.heroContent.buttonText}
                  onChange={(e) => handleHeroChange('buttonText', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sub-text / Narrative</label>
              <textarea 
                rows={3}
                value={localSettings.heroContent.subtitle}
                onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hero Imagery URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                <input 
                  type="text"
                  value={localSettings.heroContent.image}
                  onChange={(e) => handleHeroChange('image', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                />
              </div>
              <div className="mt-3 aspect-video rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                <img src={localSettings.heroContent.image} alt="Hero Preview" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* Announcement Bar & Quick Settings */}
        <div className="space-y-8">
          <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Announcement Bar</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Top Promotional Ticker</p>
                </div>
              </div>
              <button 
                onClick={() => handleAnnouncementChange('enabled', !localSettings.announcementBar.enabled)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                  localSettings.announcementBar.enabled 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {localSettings.announcementBar.enabled ? 'Active' : 'Disabled'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ticker Message Content</label>
                <input 
                  type="text"
                  value={localSettings.announcementBar.text}
                  onChange={(e) => handleAnnouncementChange('text', e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                />
              </div>
            </div>
          </section>

          {/* More to Love / Product Recommendations Section Settings */}
          <section className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">"More to Love" Recommendations</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Product Page Cross-Sell Showcase</p>
                </div>
              </div>
              <button 
                onClick={() => handleMoreToLoveChange('enabled', !(localSettings.moreToLoveSection?.enabled ?? true))}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                  (localSettings.moreToLoveSection?.enabled ?? true)
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-zinc-100 text-zinc-500'
                }`}
              >
                {(localSettings.moreToLoveSection?.enabled ?? true) ? 'Active' : 'Disabled'}
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Section Heading Title</label>
                <input 
                  type="text"
                  value={localSettings.moreToLoveSection?.title ?? 'More to Love'}
                  onChange={(e) => handleMoreToLoveChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold text-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tag / Badge Label</label>
                <input 
                  type="text"
                  value={localSettings.moreToLoveSection?.tagLabel ?? 'ARCHIVAL DISCOVERIES'}
                  onChange={(e) => handleMoreToLoveChange('tagLabel', e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold text-zinc-900"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Subtitle Description</label>
                <textarea 
                  rows={2}
                  value={localSettings.moreToLoveSection?.subtitle ?? ''}
                  onChange={(e) => handleMoreToLoveChange('subtitle', e.target.value)}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all resize-none text-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Display Item Count (Max)</label>
                <select
                  value={localSettings.moreToLoveSection?.itemCount ?? 4}
                  onChange={(e) => handleMoreToLoveChange('itemCount', parseInt(e.target.value) || 4)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-800 focus:ring-2 focus:ring-zinc-950/10"
                >
                  <option value={2}>2 Items</option>
                  <option value={4}>4 Items (Recommended)</option>
                  <option value={6}>6 Items</option>
                  <option value={8}>8 Items</option>
                </select>
              </div>
            </div>
          </section>

          <section className="bg-zinc-900 text-white rounded-3xl p-6 lg:p-8 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Layout className="w-4 h-4 text-blue-400" />
              Storefront Architecture Guide
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every section can be reordered using the index arrows. Disabling a section hides it instantly from customer view while retaining its configuration for future campaigns.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
