import { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import { getBills, markBillPaid, runMonthlyBilling } from '../../services/admin';

const Billing = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState('');
  const [payingId, setPayingId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getBills();
        if (!isMounted) return;
        setBills(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load bills.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunMonthly = async () => {
    setRunning(true);
    setRunMessage('');
    setError('');
    try {
      const result = await runMonthlyBilling();
      setRunMessage(
        `Monthly billing job completed successfully. Created ${result.created || 0} bills.`
      );
      const data = await getBills();
      setBills(data || []);
    } catch (err) {
      setError('Failed to run monthly billing job.');
    } finally {
      setRunning(false);
    }
  };

  const handleMarkPaid = async (billId) => {
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
      setError('Failed to mark bill as paid.');
    } finally {
      setPayingId('');
    }
  };

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customerId?.name || 'Unknown',
    },
    { key: 'month', header: 'Month' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => `$${Number(row.amount || 0).toLocaleString()}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.status === 'paid' ? 'paid' : 'unpaid'}>
          {row.status || 'unpaid'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Button
          variant="success"
          className="px-3 py-1 text-xs"
          disabled={row.status === 'paid' || payingId === row._id}
          onClick={() => handleMarkPaid(row._id)}
        >
          {row.status === 'paid' ? 'Paid' : payingId === row._id ? 'Updating...' : 'Mark Paid'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Billing</h3>
          <p className="text-sm text-gray-500">Run billing and manage invoices.</p>
        </div>
        <Button onClick={handleRunMonthly} disabled={running}>
          {running ? 'Running...' : 'Run Monthly Billing'}
        </Button>
      </header>

      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}
      {runMessage ? (
        <Card className="border border-green-100 bg-green-50 text-green-700">
          {runMessage}
        </Card>
      ) : null}

      {loading ? <Loader label="Loading bills..." /> : null}
      <Table columns={columns} data={bills} emptyLabel="No bills available." />
    </div>
  );
};

export default Billing;
