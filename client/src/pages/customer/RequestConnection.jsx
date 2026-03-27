import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { getCustomerPackages, requestConnection } from '../../services/customer';

const RequestConnection = () => {
  const [packageId, setPackageId] = useState('');
  const [packages, setPackages] = useState([]);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadPackages = async () => {
      setLoadingPackages(true);
      setError('');
      try {
        const data = await getCustomerPackages();
        if (!isMounted) return;
        setPackages(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load packages.');
      } finally {
        if (isMounted) setLoadingPackages(false);
      }
    };
    loadPackages();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    if (!packageId) {
      setError('Please select a package.');
      return;
    }
    setLoading(true);
    try {
      await requestConnection({ packageId });
      setStatus('Connection request submitted.');
      setPackageId('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPackage = packages.find((pkg) => pkg._id === packageId);

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">Request Connection</h3>
        <p className="text-sm text-gray-500">Choose a plan and submit your request.</p>
      </header>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          Select Package
        </label>
        {loadingPackages ? (
          <Loader label="Loading packages..." />
        ) : (
          <select
            value={packageId}
            onChange={(event) => setPackageId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gray-300"
          >
            <option value="">Choose a package</option>
            {packages.map((pkg) => (
              <option key={pkg._id} value={pkg._id}>
                {pkg.name} - {pkg.speed} - ${pkg.price}
              </option>
            ))}
          </select>
        )}

        {selectedPackage ? (
          <Card className="mt-4 border border-emerald-100 bg-emerald-50/60 text-sm text-emerald-800">
            <p className="font-semibold">{selectedPackage.name}</p>
            <p>Speed: {selectedPackage.speed}</p>
            <p>Price: ${selectedPackage.price} per {selectedPackage.duration} days</p>
          </Card>
        ) : null}

        <Button type="submit" className="mt-4" disabled={loading || loadingPackages}>
          {loading ? 'Submitting...' : 'Request Connection'}
        </Button>
        {status ? <p className="mt-3 text-sm text-green-600">{status}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
};

export default RequestConnection;
