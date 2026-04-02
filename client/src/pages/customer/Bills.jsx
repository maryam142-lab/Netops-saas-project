import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import { getCustomerBills, markBillPaid, payAllBills } from '../../services/customer';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState('');
  const [payingAll, setPayingAll] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomerBills();
        if (!isMounted) return;
        setBills(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!isMounted) return;
        setError(err?.response?.data?.message || 'Unable to load bills.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

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
      render: () => null,
    },
  ];

  const safeBills = Array.isArray(bills) ? bills : [];
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

  const handlePayAll = async () => {
    setPayingAll(true);
    setError('');
    try {
      await payAllBills();
      const data = await getCustomerBills();
      setBills(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to pay all due bills.');
    } finally {
      setPayingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">My Bills</h3>
          <p className="text-sm text-gray-500">Billing history and payments.</p>
        </div>
        <Button
          variant="outline"
          className="px-4 py-2 text-xs uppercase tracking-[0.2em]"
          onClick={handlePayAll}
          disabled={payingAll}
        >
          {payingAll ? 'Paying...' : 'Pay All Due'}
        </Button>
      </header>
      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}
      {loading ? <Loader label="Loading bills..." /> : null}
      <Table
        columns={columns.map((column) =>
          column.key === 'action'
            ? {
                ...column,
                render: (row) => (
                  <Button
                    variant="success"
                    className="px-3 py-1 text-xs uppercase tracking-[0.2em]"
                    disabled={row.rawStatus === 'paid' || payingId === row.id}
                    onClick={() => handlePay(row.id)}
                  >
                    {row.rawStatus === 'paid'
                      ? 'Paid'
                      : payingId === row.id
                        ? 'Paying...'
                        : 'Pay'}
                  </Button>
                ),
              }
            : column
        )}
        data={data}
        emptyLabel="No bills available."
      />
    </div>
  );
};

export default Bills;
