import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import { getCustomerBills, getCustomerConnections, markBillPaid } from '../../services/customer';

const Dashboard = () => {
  const [connections, setConnections] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [connectionsData, billsData] = await Promise.all([
          getCustomerConnections(),
          getCustomerBills(),
        ]);
        if (!isMounted) return;
        setConnections(connectionsData);
        setBills(billsData);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load customer data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const safeConnections = Array.isArray(connections) ? connections : [];
  const safeBills = Array.isArray(bills) ? bills : [];
  const activeConnection = safeConnections.find((connection) => connection.status === 'active');
  const pendingBills = safeBills.filter((bill) => bill.status === 'unpaid');

  const stats = [
    {
      title: 'Connection Status',
      value: activeConnection ? 'Active' : safeConnections[0]?.status || 'No connection',
      subtitle: activeConnection ? 'Uptime 99.9%' : 'Awaiting activation',
    },
    {
      title: 'Current Package',
      value: activeConnection?.packageId?.name || 'None',
      subtitle: activeConnection?.packageId?.speed || 'No active plan',
    },
    {
      title: 'Unpaid Bills',
      value: `${pendingBills.length}`,
      subtitle: pendingBills.length ? `${pendingBills.length} due` : 'All caught up',
    },
    {
      title: 'Support Tickets',
      value: 'View Support',
      subtitle: 'Open or closed',
    },
  ];

  const columns = [
    { key: 'month', header: 'Month' },
    { key: 'amount', header: 'Amount' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.rawStatus === 'paid' ? 'paid' : 'unpaid'}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Pay',
      render: (row) => (
        <Button
          variant="success"
          className="px-3 py-1 text-xs uppercase tracking-[0.2em]"
          disabled={row.rawStatus === 'paid' || payingId === row.id}
          onClick={() => handlePay(row.id)}
        >
          {row.rawStatus === 'paid' ? 'Paid' : payingId === row.id ? 'Paying...' : 'Pay'}
        </Button>
      ),
    },
  ];

  const data = useMemo(
    () =>
      safeBills.map((bill) => ({
        id: bill._id,
        month: bill.month,
        amount: `$${Number(bill.amount || 0).toLocaleString()}`,
        status: bill.status === 'paid' ? 'Paid' : 'Unpaid',
        rawStatus: bill.status,
      })),
    [safeBills]
  );

  const handlePay = async (billId) => {
    setPayingId(billId);
    setError('');
    try {
      await markBillPaid(billId, { method: 'manual' });
      setBills((prev) =>
        prev.map((bill) =>
          bill._id === billId ? { ...bill, status: 'paid' } : bill
        )
      );
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setPayingId('');
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <p className="text-sm text-gray-500">{stat.title}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
          </Card>
        ))}
      </section>

      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}
      <section className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">My Bills</h3>
            <p className="text-sm text-gray-500">Upcoming payments</p>
          </div>
          <Button variant="outline" className="px-4 py-2 text-xs uppercase tracking-[0.2em]">
            Auto Pay
          </Button>
        </div>
        {loading ? <Loader label="Loading bills..." /> : null}
        <Table columns={columns} data={data} emptyLabel="No bills available." />
      </section>
    </div>
  );
};

export default Dashboard;
