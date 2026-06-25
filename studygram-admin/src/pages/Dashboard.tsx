import React from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  CloudLightning,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

import { apiClient } from '../utils/apiClient';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState<{
    totalUsers: number;
    totalPosts: number;
    totalCategories: number;
    pendingReports: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    apiClient.get('/admin/stats')
      .then(res => {
        if (active && res.status === 'success') {
          setStats(res.data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching dashboard stats:', err);
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  // Chart Data configs
  const mainChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        fill: true,
        label: 'User Growth',
        data: [200, 350, 480, 720, 980, 1420, stats?.totalUsers ?? 1824],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Uploads (x10)',
        data: [100, 180, 240, 310, 390, 410, (stats?.totalPosts ?? 48) * 10],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        tension: 0.4,
      }
    ],
  };

  const revenueChartData = {
    labels: ['Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'MRR ($)',
        data: [350, 540, 890, 1240],
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 8,
      }
    ]
  };

  const widgets = [
    { name: 'Total Users', val: loading ? '...' : String(stats?.totalUsers ?? 0), change: '+12%', isUp: true, icon: <Users className="w-5 h-5 text-indigo-500" /> },
    { name: 'Active Users', val: loading ? '...' : String(Math.round((stats?.totalUsers ?? 0) * 0.75)), change: '+22%', isUp: true, icon: <CloudLightning className="w-5 h-5 text-sky-500" /> },
    { name: 'Total Posts', val: loading ? '...' : String(stats?.totalPosts ?? 0), change: '+5%', isUp: true, icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
    { name: 'Total Categories', val: loading ? '...' : String(stats?.totalCategories ?? 0), change: '+8%', isUp: true, icon: <FileText className="w-5 h-5 text-rose-500" /> },
    { name: 'Pending Reports', val: loading ? '...' : String(stats?.pendingReports ?? 0), change: '-15%', isUp: false, icon: <TrendingUp className="w-5 h-5 text-emerald-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1.5">
          <h2 className="text-2xl font-bold font-heading">System Overview</h2>
          <p className="text-xs text-indigo-200">Real-time statistics, active connections, and subscription metrics.</p>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {widgets.map(w => (
          <div key={w.name} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{w.name}</span>
              {w.icon}
            </div>
            <div>
              <span className="text-lg font-black block font-heading">{w.val}</span>
              <span className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                w.isUp ? 'text-emerald-500' : 'text-rose-500'
              }`}>
                {w.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {w.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm font-heading">Growth Analytics</h3>
            <p className="text-xs text-slate-500">Overview of user registration vs. notes/media uploads</p>
          </div>
          <div className="h-64">
            <Line
              data={mainChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' as const } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.03)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        {/* Revenue Ready Widget Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm font-heading">MRR Growth</h3>
            <p className="text-xs text-slate-500">Monthly recurring revenue from VIP subscriptions</p>
          </div>
          <div className="h-64">
            <Bar
              data={revenueChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { grid: { color: 'rgba(0,0,0,0.03)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
