import React, { useState } from 'react';
import { Product, Review } from '../../types/store';
import { 
  Star, 
  Search, 
  MoreVertical, 
  Trash2, 
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Filter
} from 'lucide-react';

interface AdminReviewsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({ products, setProducts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ productId: string, reviewId: string } | null>(null);

  const handleDeleteReview = () => {
    if (!deleteConfirmation) return;
    
    const { productId, reviewId } = deleteConfirmation;
    
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          reviews: p.reviews.filter(r => r.id !== reviewId),
          reviewCount: p.reviewCount - 1
        };
      }
      return p;
    }));
    
    setDeleteConfirmation(null);
  };

  // Collect all reviews from all products
  const allReviews = products.flatMap(p => 
    p.reviews.map(r => ({
      ...r,
      productName: p.name,
      productId: p.id
    }))
  );

  const filteredReviews = allReviews.filter(review => {
    const matchesSearch = 
      review.author?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      review.productName?.toLowerCase().includes(searchQuery?.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === filterRating;
    
    return matchesSearch && matchesRating;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Patron Feedback</h2>
          <p className="text-xs text-zinc-500 mt-1">Monitor and moderate product reviews and ratings.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by author, content or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-zinc-950/10 focus:border-zinc-950 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="bg-transparent text-[10px] font-bold text-zinc-600 focus:outline-none cursor-pointer"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total: {filteredReviews.length}</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-zinc-50/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} 
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{review.author}</span>
                      {review.verified && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Verified Purchase
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono">{review.date}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{review.title}</h4>
                    <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{review.comment}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg flex items-center gap-1.5">
                      <span className="font-bold text-zinc-400">Product:</span>
                      <span className="font-bold text-zinc-900">{review.productName}</span>
                    </div>
                    {review.variantPurchased && (
                      <div className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg flex items-center gap-1.5">
                        <span className="font-bold text-zinc-400">Variant:</span>
                        <span className="font-bold text-zinc-900">{review.variantPurchased}</span>
                      </div>
                    )}
                    {review.helpfulVotes !== undefined && (
                      <div className="text-[10px] text-zinc-400">
                        {review.helpfulVotes} patrons found this helpful
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start">
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all" title="Pin to Featured">
                    <Star className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirmation({ productId: review.productId, reviewId: review.id })}
                    className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-zinc-900">No feedback entries found</p>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">Remove Feedback?</h3>
            <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
              This action is permanent. The patron's review will be scrubbed from the boutique's archive.
            </p>
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteReview}
                className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-rose-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

