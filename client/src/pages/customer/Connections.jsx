import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import {
  getCustomerConnections,
  getCustomerPackages,
  requestUpgrade,
} from '../../services/customer';

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomerConnections();
        if (!isMounted) return;
        setConnections(data);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load connections.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const openUpgradeModal = async () => {
    const activeConnection = connections.find((connection) => connection.status === 'active');
    if (!activeConnection) {
      setError('Active connection not found. Request a connection first.');
      return;
    }
    setModalOpen(true);
    setLoadingPackages(true);
    setError('');
    try {
      const data = await getCustomerPackages();
      setPackages(data || []);
    } catch (err) {
      setError('Unable to load packages.');
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPackageId) {
      setError('Please select a package.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await requestUpgrade({ packageId: selectedPackageId });
      setModalOpen(false);
      setSelectedPackageId('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit upgrade request.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'package', header: 'Package' },
    { key: 'speed', header: 'Speed' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.rawStatus === 'active' ? 'active' : 'pending'}>
          {row.status}
        </Badge>
      ),
    },
    { key: 'installDate', header: 'Install Date' },
  ];

  const data = connections.map((connection) => ({
    id: connection._id,
    package: connection.packageId?.name || 'Unknown',
    speed: connection.packageId?.speed || '--',
    status: connection.status,
    rawStatus: connection.status,
    installDate: connection.installDate
      ? new Date(connection.installDate).toLocaleDateString()
      : '--',
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">My Connection</h3>
          <p className="text-sm text-gray-500">Installation progress and status.</p>
        </div>
        <Button
          variant="outline"
          className="px-4 py-2 text-xs uppercase tracking-[0.2em]"
          onClick={openUpgradeModal}
        >
          Request Upgrade
        </Button>
      </header>
      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}
      {loading ? <Loader label="Loading connections..." /> : null}
      {connections.length === 0 ? (
        <Card className="text-sm text-gray-600">
          No connections found. Please request a connection first.
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/customer/request-connection')}>
              Request Connection
            </Button>
          </div>
        </Card>
      ) : (
        <Table columns={columns} data={data} emptyLabel="No connections available." />
      )}

      <Modal open={modalOpen} title="Request Upgrade" onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          <label className="block text-sm text-gray-600">
            Select new package
            {loadingPackages ? (
              <div className="mt-2">
                <Loader label="Loading packages..." />
              </div>
            ) : (
              <select
                value={selectedPackageId}
                onChange={(event) => setSelectedPackageId(event.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="">Choose a package</option>
                {packages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.name} - {pkg.speed} - ${pkg.price}
                  </option>
                ))}
              </select>
            )}
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Upgrade'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Connections;
