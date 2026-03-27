import { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import {
  getCustomers,
  getPackages,
  getPendingConnections,
  getRevenueSummary,
  getSupportTickets,
} from '../../services/admin';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [packages, setPackages] = useState([]);
  const [revenueSummary, setRevenueSummary] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [customersData, pendingData, revenueData, packagesData, ticketsData] =
          await Promise.all([
            getCustomers(),
            getPendingConnections(),
            getRevenueSummary(6),
            getPackages(),
            getSupportTickets(),
          ]);
        if (!isMounted) return;
        setCustomers(customersData || []);
        setPendingConnections(pendingData || []);
        setRevenueSummary(revenueData.summaries || []);
        setPackages(packagesData || []);
        setSupportTickets(ticketsData || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load dashboard data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const latestRevenue = revenueSummary[0]?.totalBilled || 0;

  const stats = [
    { title: 'Active Customers', value: `${customers.length}` },
    { title: 'Pending Connections', value: `${pendingConnections.length}` },
    { title: 'Monthly Revenue', value: `$${latestRevenue.toLocaleString()}` },
    { title: 'Active Packages', value: `${packages.length}` },
  ];

  const connectionColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customerId?.name || 'Unknown',
    },
    {
      key: 'package',
      header: 'Package',
      render: (row) => row.packageId?.name || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'active' : 'pending'}>
          {row.status || 'pending'}
        </Badge>
      ),
    },
  ];

  const supportColumns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customerId?.name || 'Unknown',
    },
    { key: 'subject', header: 'Subject' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'closed' ? 'closed' : 'open'}>
          {row.status || 'open'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </Card>
        ))}
      </section>

      {loading ? <Loader label="Loading dashboard data..." /> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Connections</h3>
          </div>
          <Table
            columns={connectionColumns}
            data={pendingConnections.slice(0, 5)}
            emptyLabel="No recent connections."
          />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Support Tickets</h3>
          </div>
          <Table
            columns={supportColumns}
            data={supportTickets.slice(0, 5)}
            emptyLabel="No recent tickets."
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
