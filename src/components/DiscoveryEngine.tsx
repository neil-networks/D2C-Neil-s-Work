import React from 'react';
import { Search, Sparkles, Plus, ExternalLink, Info, Loader2, CheckCircle2 } from 'lucide-react';
import { discoverBrands, DiscoveredBrand } from '../services/discoveryService';
import { brandService } from '../services/brandService';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function DiscoveryEngine() {
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<DiscoveredBrand[]>([]);
  const [addedIds, setAddedIds] = React.useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setResults([]);
    try {
      const brands = await discoverBrands(query);
      setResults(brands);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToPipeline = async (brand: DiscoveredBrand) => {
    try {
      await brandService.createBrand({
        name: brand.name,
        website: brand.website,
        category: brand.category,
        score: brand.score,
        igFollowers: brand.igFollowers,
        isMicro: brand.isMicro,
        signals: brand.signals,
        notes: brand.description,
        stage: 'DISCOVERED'
      });
      setAddedIds(prev => new Set(prev).add(brand.name));
    } catch (error) {
      console.error("Failed to add brand", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Discovery Engine</h1>
        <p className="text-[#6B7280]">Surface hidden gems and micro-brands across India's D2C landscape.</p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-[#9CA3AF] group-focus-within:text-[#4F46E5] transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 'small-batch kumkumadi face oils' or 'sustainable bamboo activewear'"
          className="w-full pl-12 pr-32 py-4 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] outline-none transition-all text-lg"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-2 bottom-2 px-6 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isSearching ? 'Searching...' : 'Discover'}
        </button>
      </form>

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#EEF2FF] border-t-[#4F46E5] rounded-full animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#4F46E5]" />
          </div>
          <p className="text-[#6B7280] animate-pulse">Scanning Instagram, Reddit, and Nykaa for signals...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((brand, idx) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h3 className="font-bold text-lg group-hover:text-[#4F46E5] transition-colors">{brand.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded-full">
                    {brand.category}
                  </span>
                  {brand.isMicro && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-[#ECFDF5] text-[#059669] rounded-full">
                      Micro-Brand
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="text-2xl font-black text-[#4F46E5]">{brand.score}</div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-[#9CA3AF]">Fit Score</div>
              </div>
            </div>

            <p className="text-sm text-[#4B5563] line-clamp-3 mb-6 min-h-[60px]">
              {brand.description}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9CA3AF]">Signals</span>
                <div className="flex gap-2">
                  {Object.entries(brand.signals).map(([key, val]) => (
                    <span key={key} className="font-mono text-[#4B5563] bg-[#F9FAFB] px-1.5 py-0.5 rounded border border-[#F3F4F6]">
                      {key}: {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 border border-[#E5E7EB] rounded-xl text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-all"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              <button
                onClick={() => handleAddToPipeline(brand)}
                disabled={addedIds.has(brand.name)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all",
                  addedIds.has(brand.name)
                    ? "bg-[#F3F4F6] text-[#9CA3AF] cursor-default"
                    : "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm hover:shadow-md"
                )}
              >
                {addedIds.has(brand.name) ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Added to Pipeline
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Pipeline
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {!isSearching && results.length === 0 && (
        <div className="text-center py-20 bg-white border border-dashed border-[#E5E7EB] rounded-3xl">
          <div className="w-16 h-16 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-[#D1D5DB]" />
          </div>
          <h3 className="text-lg font-medium text-[#111827]">Start your discovery</h3>
          <p className="text-[#6B7280] max-w-xs mx-auto mt-1">
            Enter a niche or category to find high-potential Indian D2C brands.
          </p>
        </div>
      )}
    </div>
  );
}
