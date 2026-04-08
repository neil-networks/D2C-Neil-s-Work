import React from 'react';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  Clock, 
  User,
  Filter,
  ArrowRight,
  Download
} from 'lucide-react';
import { brandService } from '../services/brandService';
import { Brand, Stage } from '../types';
import { cn, formatDate, exportToCSV } from '../lib/utils';
import { motion } from 'motion/react';

const STAGES: { id: Stage; label: string; color: string }[] = [
  { id: 'DISCOVERED', label: 'Discovered', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { id: 'CONTACTED', label: 'Contacted', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { id: 'INVITED', label: 'Invited', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { id: 'IN_REVIEW', label: 'In Review', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  { id: 'CONVERTED', label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  { id: 'DECLINED', label: 'Declined', color: 'bg-rose-50 text-rose-700 border-rose-100' },
];

export default function PipelineCRM() {
  const [brands, setBrands] = React.useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null);

  React.useEffect(() => {
    const unsubscribe = brandService.subscribeToBrands(setBrands);
    return () => unsubscribe();
  }, []);

  const handleExport = () => {
    const exportData = brands.map(b => ({
      Name: b.name,
      Website: b.website || 'N/A',
      Category: b.category,
      Stage: b.stage,
      Score: b.score || 0,
      Followers: b.igFollowers || 0,
      IsMicro: b.isMicro ? 'Yes' : 'No',
      AddedBy: b.addedBy,
      CreatedAt: b.createdAt?.toDate?.()?.toISOString() || ''
    }));
    exportToCSV(exportData, `d2c-flow-pipeline-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleMoveStage = async (brandId: string, nextStage: Stage) => {
    await brandService.updateBrand(brandId, { stage: nextStage });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Pipeline CRM</h1>
          <p className="text-[#6B7280]">Manage brand onboarding from discovery to conversion.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 min-h-[70vh]">
        {STAGES.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-80 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#111827]">{stage.label}</h3>
                <span className="text-xs font-bold bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">
                  {brands.filter(b => b.stage === stage.id).length}
                </span>
              </div>
              <button className="p-1 hover:bg-[#F3F4F6] rounded-md transition-colors">
                <MoreHorizontal className="w-4 h-4 text-[#9CA3AF]" />
              </button>
            </div>

            <div className="space-y-3">
              {brands
                .filter((brand) => brand.stage === stage.id)
                .map((brand) => (
                  <motion.div
                    key={brand.id}
                    layoutId={brand.id}
                    className="bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                    onClick={() => setSelectedBrand(brand)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-[#111827] group-hover:text-[#4F46E5] transition-colors">
                          {brand.name}
                        </h4>
                        <div className="text-xs font-black text-[#4F46E5]">{brand.score}</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#F9FAFB] text-[#6B7280] rounded border border-[#F3F4F6]">
                          {brand.category}
                        </span>
                        {brand.isMicro && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#ECFDF5] text-[#059669] rounded border border-[#D1FAE5]">
                            Micro
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6]">
                        <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-medium">{formatDate(brand.updatedAt)}</span>
                        </div>
                        <div className="flex -space-x-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#F3F4F6] border-2 border-white flex items-center justify-center">
                            <User className="w-3 h-3 text-[#9CA3AF]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stage Move */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {STAGES.findIndex(s => s.id === stage.id) < STAGES.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextIdx = STAGES.findIndex(s => s.id === stage.id) + 1;
                            handleMoveStage(brand.id, STAGES[nextIdx].id);
                          }}
                          className="p-1.5 bg-[#4F46E5] text-white rounded-lg shadow-lg hover:bg-[#4338CA] transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Brand Detail Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-[#E5E7EB] flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{selectedBrand.name}</h2>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-full border", STAGES.find(s => s.id === selectedBrand.stage)?.color)}>
                    {STAGES.find(s => s.id === selectedBrand.stage)?.label}
                  </span>
                </div>
                <p className="text-[#6B7280]">{selectedBrand.website}</p>
              </div>
              <button 
                onClick={() => setSelectedBrand(null)}
                className="p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors"
              >
                <MoreHorizontal className="w-6 h-6 text-[#9CA3AF]" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Brand Info</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">Category</span>
                      <span className="text-sm font-medium">{selectedBrand.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">IG Followers</span>
                      <span className="text-sm font-medium">{selectedBrand.igFollowers?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">Fit Score</span>
                      <span className="text-sm font-bold text-[#4F46E5]">{selectedBrand.score}/100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Contact</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">Name</span>
                      <span className="text-sm font-medium">{selectedBrand.contactName || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[#6B7280]">Email</span>
                      <span className="text-sm font-medium">{selectedBrand.contactEmail || 'Not set'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Signals & Notes</h4>
                <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-[#F3F4F6]">
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {selectedBrand.notes}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Action History</h4>
                <ActivityList brandId={selectedBrand.id} />
              </div>
            </div>

            <div className="p-6 bg-[#F9FAFB] border-t border-[#E5E7EB] flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[#E5E7EB] rounded-xl font-medium hover:bg-[#F3F4F6] transition-all">
                <MessageSquare className="w-4 h-4" />
                Add Note
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4F46E5] text-white rounded-xl font-medium hover:bg-[#4338CA] transition-all shadow-sm">
                <Mail className="w-4 h-4" />
                Send Outreach
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ActivityList({ brandId }: { brandId: string }) {
  const [activities, setActivities] = React.useState<any[]>([]);

  React.useEffect(() => {
    const unsubscribe = brandService.subscribeToActivities(brandId, setActivities);
    return () => unsubscribe();
  }, [brandId]);

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-4">
          <div className="mt-1">
            <div className="w-2 h-2 rounded-full bg-[#4F46E5]" />
            <div className="w-0.5 h-full bg-[#E5E7EB] mx-auto mt-1" />
          </div>
          <div className="space-y-1 pb-4">
            <p className="text-sm font-medium text-[#111827]">{activity.message}</p>
            <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF]">
              <span className="font-bold uppercase">{activity.userName}</span>
              <span>•</span>
              <span>{formatDate(activity.createdAt)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
