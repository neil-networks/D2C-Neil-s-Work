import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Target, 
  CheckCircle2, 
  ArrowUpRight,
  Zap,
  Download
} from 'lucide-react';
import { brandService } from '../services/brandService';
import { Brand, Stage } from '../types';
import { exportToCSV } from '../lib/utils';

const COLORS = ['#4F46E5', '#818CF8', '#A5B4FC', '#C7D2FE', '#E0E7FF', '#F5F3FF'];

export default function Dashboard() {
  const [brands, setBrands] = React.useState<Brand[]>([]);

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
    exportToCSV(exportData, `d2c-flow-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const stageCounts = brands.reduce((acc, brand) => {
    acc[brand.stage] = (acc[brand.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const funnelData = [
    { name: 'Discovered', value: stageCounts['DISCOVERED'] || 0 },
    { name: 'Contacted', value: stageCounts['CONTACTED'] || 0 },
    { name: 'Invited', value: stageCounts['INVITED'] || 0 },
    { name: 'In Review', value: stageCounts['IN_REVIEW'] || 0 },
    { name: 'Converted', value: stageCounts['CONVERTED'] || 0 },
  ];

  const categoryData = Object.entries(
    brands.reduce((acc, brand) => {
      acc[brand.category] = (acc[brand.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const stats = [
    { label: 'Total Brands', value: brands.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Pipeline', value: brands.filter(b => b.stage !== 'CONVERTED' && b.stage !== 'DECLINED').length, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Converted', value: stageCounts['CONVERTED'] || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg. Fit Score', value: Math.round(brands.reduce((acc, b) => acc + (b.score || 0), 0) / (brands.length || 1)), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Platform Insights</h1>
          <p className="text-[#6B7280]">Real-time performance and conversion metrics.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-[#4F46E5] text-white rounded-2xl font-bold hover:bg-[#4338CA] transition-all shadow-lg shadow-[#4F46E5]/20"
        >
          <Download className="w-4 h-4" />
          Export Full Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#6B7280]">{stat.label}</p>
              <p className="text-2xl font-bold text-[#111827]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Onboarding Funnel</h3>
            <button 
              onClick={handleExport}
              className="text-[#4F46E5] text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Download CSV <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#6B7280' }}
                />
                <Tooltip 
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-lg">Category Distribution</h3>
            <button 
              onClick={handleExport}
              className="text-[#4F46E5] text-xs font-bold flex items-center gap-1 hover:underline"
            >
              Download CSV <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="hidden md:block space-y-2 ml-4">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-medium text-[#4B5563]">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
