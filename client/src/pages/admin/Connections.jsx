import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import { approveConnection, getPendingConnections, rejectConnection } from '../../services/admin';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState('');
  const [rejectingId, setRejectingId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPendingConnections();
        if (!isMounted) return;
        setConnections(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load pending connections.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = async (id) => {
    setApprovingId(id);
    try {
      const response = await approveConnection(id);
      setConnections((prev) => prev.filter((item) => String(item._id) !== String(id)));
      const message = response?.message || 'Connection approved.';
      toast.success(message);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to approve connection.';
      toast.error(message);
    } finally {
      setApprovingId('');
    }
  };

  const handleReject = async (id) => {
    setRejectingId(id);
    try {
      await rejectConnection(id);
      setConnections((prev) => prev.filter((item) => String(item._id) !== String(id)));
      toast.success('Connection rejected.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to reject connection.';
      toast.error(message);
    } finally {
      setRejectingId('');
    }
  };

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => row.customerId?.name || 'Unknown',
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => row.customerId?.email || '--',
    },
    {
      key: 'package',
      header: 'Package',
      render: (row) => row.packageId?.name || '--',
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
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            onClick={() => handleApprove(row._id)}
            disabled={approvingId === row._id || rejectingId === row._id}
            className="px-3 py-1 text-xs"
          >
            {approvingId === row._id ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(row._id)}
            disabled={approvingId === row._id || rejectingId === row._id}
            className="px-3 py-1 text-xs"
          >
            {rejectingId === row._id ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Connections</h3>
          <p className="text-sm text-gray-500">Approve or reject customer requests.</p>
        </div>
      </header>

      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      {loading ? <Loader label="Loading pending connections..." /> : null}
      <Table
        columns={columns}
        data={connections}
        emptyLabel="No pending connections."
      />
    </div>
  );
};

export default Connections;
