import React, { useState } from 'react';
import { Product } from '../../types/store';
import { saveRealtimeCategory, deleteRealtimeCategory } from '../../services/supabaseService';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Layers,
  Box,
  Image as ImageIcon,
  Tag,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  label: string;
  description?: string;
  image?: string;
  badge?: string;
}

interface AdminCategoriesProps {
  categories: CategoryItem[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryItem[]>>;
  products: Product[];
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, setCategories, products }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState<CategoryItem>({ label: '', id: '', description: '', image: '', badge: '' });

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const handleOpenModal = (category?: CategoryItem) => {
    if (category) {
      setEditingCategory(category);
      setFormData(category);
    } else {
      setEditingCategory(null);
      setFormData({ label: '', id: '', description: '', image: '', badge: '' });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleSaveCategory = () => {
    if (!formData.label.trim() || !formData.id.trim()) {
      setError('Display label and slug/ID are required.');
      return;
    }
    
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? formData : c));
      saveRealtimeCategory(formData);
      setSuccessMessage('Category successfully updated.');
    } else {
      if (categories.some(c => c.id === formData.id)) {
        setError('A category with this ID/slug already exists.');
        return;
      }
      setCategories(prev => [...prev, formData]);
      saveRealtimeCategory(formData);
      setSuccessMessage('New category successfully created.');
    }
    setIsModalOpen(false);
    setError(null);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDeleteCategory = (id: string) => {
    deleteRealtimeCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmationId(null);
    setSuccessMessage('Category successfully deleted.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const filteredCategories = categories.filter(cat => 
    cat.label?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    cat.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    (cat.description && cat.description?.toLowerCase().includes(searchQuery?.toLowerCase()))
  );

  const getProductCountForCategory = (catId: string) => {
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Category & Taxonomy Architecture</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage storefront classification groups, descriptions, and merchandise tagging.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-xs font-bold uppercase tracking-tight">{successMessage}</p>
        </div>
      )}

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">{editingCategory ? 'Edit Taxonomy Group' : 'New Taxonomy Group'}</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">Storefront Classification</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors cursor-pointer">
                <Plus className="w-5 h-5 rotate-45 text-zinc-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Box className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Display Label *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Summer Essentials"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                    value={formData.label}
                    onChange={(e) => setFormData({
                      ...formData, 
                      label: e.target.value, 
                      id: editingCategory ? formData.id : e.target.value?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Slug / ID *</label>
                  <input 
                    type="text" 
                    placeholder="summer-essentials"
                    disabled={!!editingCategory}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all font-mono disabled:opacity-50"
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Description / Subtitle</label>
                <textarea 
                  rows={2}
                  placeholder="Short marketing narrative or classification summary..."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all resize-none"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Badge / Tag</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. New Drop, Curated"
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all font-bold"
                      value={formData.badge || ''}
                      onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Imagery / Banner URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 transition-all"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {formData.image && (
                <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategory}
                  className="px-6 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-md cursor-pointer"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-zinc-200 p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-900">Delete Category?</h3>
              <p className="text-xs text-zinc-500">
                This will remove the category taxonomy. Products assigned to this category will remain in your catalog.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmationId(null)}
                className="py-2.5 bg-zinc-100 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCategory(deleteConfirmationId)}
                className="py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all cursor-pointer shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search categories or slugs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Total Taxonomies: {filteredCategories.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/30">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category Name & Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Slug / ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Product Count</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Badge</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredCategories.map((cat) => {
                const count = getProductCountForCategory(cat.id);
                return (
                  <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden flex items-center justify-center text-zinc-500 group-hover:shadow-sm transition-all shrink-0 border border-zinc-200">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                          ) : (
                            <Layers className="w-5 h-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{cat.label}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1">{cat.description || 'No description provided'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-zinc-100 px-2.5 py-1 rounded-lg text-zinc-700 font-semibold">
                        {cat.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 font-mono">
                        {count} {count === 1 ? 'piece' : 'pieces'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {cat.badge ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          <Tag className="w-3 h-3" />
                          {cat.badge}
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all cursor-pointer"
                          title="Edit category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmationId(cat.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-zinc-900">No categories found</p>
            <p className="text-xs text-zinc-500">Try searching with a different term or create a new category.</p>
          </div>
        )}
      </div>
    </div>
  );
};


