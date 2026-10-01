import React, { useState } from 'react';
import { Product } from '../../types/store';
import { saveRealtimeBrand, deleteRealtimeBrand } from '../../services/supabaseService';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag,
  Globe,
  ArrowUpRight
} from 'lucide-react';

interface AdminBrandsProps {
  brands: { name: string; origin: string }[];
  setBrands: React.Dispatch<React.SetStateAction<{ name: string; origin: string }[]>>;
}

export const AdminBrands: React.FC<AdminBrandsProps> = ({ brands, setBrands }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<{ name: string; origin: string } | null>(null);
  const [formData, setFormData] = useState({ name: '', origin: '' });

  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState<string | null>(null);

  const handleOpenModal = (brand?: { name: string; origin: string }) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData(brand);
    } else {
      setEditingBrand(null);
      setFormData({ name: '', origin: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveBrand = () => {
    if (!formData.name || !formData.origin) return;
    
    if (editingBrand) {
      setBrands(prev => prev.map(b => b.name === editingBrand.name ? formData : b));
        saveRealtimeBrand(formData);
    } else {
      if (brands.some(b => b.name === formData.name)) {
        setError('A brand with this name already exists.');
        return;
      }
      setBrands(prev => [...prev, formData]);
        saveRealtimeBrand(formData);
    }
    setIsModalOpen(false);
    setError(null);
  };

  const handleDeleteBrand = () => {
    if (deleteConfirmationName) {
      setBrands(prev => prev.filter(b => b.name !== deleteConfirmationName));
        deleteRealtimeBrand(deleteConfirmationName);
      setDeleteConfirmationName(null);
    }
  };

  const filteredBrands = brands.filter(brand => 
    brand.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    brand.origin?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Brand Portfolio</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage partner labels and artisanal house identities.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Brand</span>
        </button>
      </div>

      {/* Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">{editingBrand ? 'Update Registration' : 'Brand Registration'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <Plus className="w-6 h-6 rotate-45 text-zinc-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-bold rounded-xl flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">House Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Atelier V"
                  disabled={!!editingBrand}
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold disabled:opacity-50"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Origin / HQ</label>
                <input 
                  type="text" 
                  placeholder="e.g. Florence, Italy"
                  className="w-full px-4 py-3 bg-zinc-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-zinc-950/10 transition-all"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              <button 
                onClick={handleSaveBrand}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 mt-4"
              >
                {editingBrand ? 'Update Registration' : 'Register Brand'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active Houses: {filteredBrands.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredBrands.map((brand) => (
            <div key={brand.name} className="group bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5 hover:border-blue-500 hover:bg-white hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(brand)}
                    className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmationName(brand.name)}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{brand.name}</h3>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <Globe className="w-3 h-3" />
                  <span>{brand.origin}</span>
                </div>
              </div>

              <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-white border border-zinc-200 rounded-xl text-[10px] font-bold text-zinc-600 hover:text-zinc-900 hover:border-zinc-900 transition-all">
                <span>View Brand Catalog</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-900">No brands found</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your search query.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmationName && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Remove Brand?</h3>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              This will remove the brand registration from the boutique. Pieces associated with this brand will remain.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteConfirmationName(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteBrand}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


