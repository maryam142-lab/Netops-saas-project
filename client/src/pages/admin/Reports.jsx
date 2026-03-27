import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import DataTable from '../../components/DataTable';
import api from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      grid: { color: 'rgba(148,163,184,0.2)' },
      ticks: { color: '#64748b' },
    },
    x: {
      grid: { display: false },
      ticks: { color: '#64748b' },
    },
  },
};

const monthLabel = (monthKey) => {
  if (!monthKey) return '--';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString('en-US', { month: 'short' });
};

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const ExportButtons = ({ onCsv, onPdf, disabled }) => (
  <div className="flex flex-wrap gap-2">
    <button
      type="button"
      onClick={onCsv}
      disabled={disabled}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Export CSV
    </button>
    <button
      type="button"
      onClick={onPdf}
      disabled={disabled}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      Export PDF
    </button>
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerGrowth, setCustomerGrowth] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topPackages, setTopPackages] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [growthRes, revenueRes, packagesRes] = await Promise.all([
          api.get('/reports/customer-growth'),
          api.get('/reports/monthly-revenue'),
          api.get('/reports/top-packages'),
        ]);
        if (!isMounted) return;
        setCustomerGrowth(growthRes.data || []);
        setMonthlyRevenue(revenueRes.data || []);
        setTopPackages(packagesRes.data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load report data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const exportReport = async (path, format, filename) => {
    try {
      const response = await api.get(path, { params: { format }, responseType: 'blob' });
      downloadBlob(response.data, `${filename}.${format}`);
    } catch (err) {
      toast.error('Unable to export report. Please try again.');
    }
  };

  const customerColumns = [
    { key: 'month', header: 'Month', render: (row) => monthLabel(row.month) },
    { key: 'customers', header: 'New Customers' },
  ];

  const revenueColumns = [
    { key: 'month', header: 'Month', render: (row) => monthLabel(row.month) },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (row) => `$${Number(row.revenue || 0).toLocaleString()}`,
    },
    { key: 'payments', header: 'Payments' },
  ];

  const packageColumns = [
    { key: 'package', header: 'Package' },
    { key: 'speed', header: 'Speed' },
    {
      key: 'price',
      header: 'Price',
      render: (row) => `$${Number(row.price || 0).toLocaleString()}`,
    },
    { key: 'customers', header: 'Customers' },
  ];

  const customerChart = useMemo(() => {
    const labels = customerGrowth.map((item) => monthLabel(item.month));
    const values = customerGrowth.map((item) => item.customers || 0);
    return {
      labels: labels.length ? labels : ['--'],
      datasets: [
        {
          data: values.length ? values : [0],
          borderColor: '#0f766e',
          backgroundColor: 'rgba(15, 118, 110, 0.15)',
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [customerGrowth]);

  const revenueChart = useMemo(() => {
    const labels = monthlyRevenue.map((item) => monthLabel(item.month));
    const values = monthlyRevenue.map((item) => item.revenue || 0);
    return {
      labels: labels.length ? labels : ['--'],
      datasets: [
        {
          data: values.length ? values : [0],
          backgroundColor: 'rgba(249, 115, 22, 0.6)',
          borderRadius: 8,
        },
      ],
    };
  }, [monthlyRevenue]);

  const packageChart = useMemo(() => {
    const labels = topPackages.map((item) => item.package || 'Unknown');
    const values = topPackages.map((item) => item.customers || 0);
    return {
      labels: labels.length ? labels : ['--'],
      datasets: [
        {
          data: values.length ? values : [0],
          backgroundColor: 'rgba(59, 130, 246, 0.65)',
          borderRadius: 8,
        },
      ],
    };
  }, [topPackages]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reports</p>
          <h3 className="text-xl font-semibold text-slate-900">Analytics & Reporting</h3>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Customer Growth
              </p>
              <h4 className="text-lg font-semibold text-slate-900">New customers by month</h4>
            </div>
            <ExportButtons
              onCsv={() => exportReport('/reports/customer-growth', 'csv', 'customer-growth')}
              onPdf={() => exportReport('/reports/customer-growth', 'pdf', 'customer-growth')}
              disabled={loading}
            />
          </div>
          <div className="h-56">
            <Line data={customerChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Monthly Revenue
              </p>
              <h4 className="text-lg font-semibold text-slate-900">Payments by month</h4>
            </div>
            <ExportButtons
              onCsv={() => exportReport('/reports/monthly-revenue', 'csv', 'monthly-revenue')}
              onPdf={() => exportReport('/reports/monthly-revenue', 'pdf', 'monthly-revenue')}
              disabled={loading}
            />
          </div>
          <div className="h-56">
            <Bar data={revenueChart} options={chartOptions} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Top Packages
              </p>
              <h4 className="text-lg font-semibold text-slate-900">Most popular plans</h4>
            </div>
            <ExportButtons
              onCsv={() => exportReport('/reports/top-packages', 'csv', 'top-packages')}
              onPdf={() => exportReport('/reports/top-packages', 'pdf', 'top-packages')}
              disabled={loading}
            />
          </div>
          <div className="h-56">
            <Bar data={packageChart} options={chartOptions} />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Package Breakdown
            </p>
            <h4 className="text-lg font-semibold text-slate-900">Customer distribution</h4>
          </div>
          <DataTable
            columns={packageColumns}
            data={topPackages}
            emptyLabel={loading ? 'Loading data...' : 'No package data available'}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Customer Growth Table
            </p>
            <h4 className="text-lg font-semibold text-slate-900">Monthly cohort counts</h4>
          </div>
          <DataTable
            columns={customerColumns}
            data={customerGrowth}
            emptyLabel={loading ? 'Loading data...' : 'No growth data available'}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Revenue Table
            </p>
            <h4 className="text-lg font-semibold text-slate-900">Monthly totals</h4>
          </div>
          <DataTable
            columns={revenueColumns}
            data={monthlyRevenue}
            emptyLabel={loading ? 'Loading data...' : 'No revenue data available'}
          />
        </div>
      </section>
    </div>
  );
};

export default Reports;
