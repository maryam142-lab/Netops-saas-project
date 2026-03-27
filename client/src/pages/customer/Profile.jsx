import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import {
  changeCustomerPassword,
  getCustomerBills,
  getCustomerConnections,
  getCustomerPayments,
  getCustomerProfile,
  updateCustomerProfile,
} from '../../services/customer';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changing, setChanging] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [profileData, connectionData, billData, paymentData] =
          await Promise.all([
            getCustomerProfile(),
            getCustomerConnections(),
            getCustomerBills(),
            getCustomerPayments(),
          ]);
        if (!isMounted) return;
        setProfile(profileData);
        setConnections(connectionData || []);
        setBills(billData || []);
        setPayments(paymentData || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load profile data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeConnection = connections.find((connection) => connection.status === 'active');

  const billingSummary = useMemo(() => {
    const totalPaid = bills
      .filter((bill) => bill.status === 'paid')
      .reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
    const pendingBills = bills.filter((bill) => bill.status === 'unpaid').length;
    const lastPaymentDate = payments[0]?.paymentDate
      ? new Date(payments[0].paymentDate).toLocaleDateString()
      : '--';
    return { totalPaid, pendingBills, lastPaymentDate };
  }, [bills, payments]);

  const handleProfileChange = (event) => {
    if (!profile) return;
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError('');
    setStatus('');
    try {
      const updated = await updateCustomerProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
      });
      setProfile(updated);
      setStatus('Profile updated successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError('Please provide current and new password.');
      return;
    }
    setChanging(true);
    setError('');
    setStatus('');
    try {
      await changeCustomerPassword(passwordForm);
      setStatus('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update password.');
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">Profile</h3>
        <p className="text-sm text-gray-500">Manage your account details.</p>
      </header>

      {loading ? <Loader label="Loading profile..." /> : null}
      {error ? <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card> : null}
      {status ? (
        <Card className="border border-green-100 bg-green-50 text-green-700">{status}</Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Profile Information</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="block">
              Name
              <input
                name="name"
                value={profile?.name || ''}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Email
              <input
                type="email"
                name="email"
                value={profile?.email || ''}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Phone
              <input
                name="phone"
                value={profile?.phone || ''}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Address
              <input
                name="address"
                value={profile?.address || ''}
                onChange={handleProfileChange}
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
          </div>
          <Button className="mt-4" onClick={handleProfileSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Security Settings</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="block">
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: event.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
          </div>
          <Button className="mt-4" onClick={handlePasswordChange} disabled={changing}>
            {changing ? 'Updating...' : 'Change Password'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Connection Information</h4>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Package:</span>{' '}
              {activeConnection?.packageId?.name || '—'}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{' '}
              {activeConnection?.status || connections[0]?.status || '—'}
            </p>
            <p>
              <span className="font-semibold">Connection Date:</span>{' '}
              {activeConnection?.installDate
                ? new Date(activeConnection.installDate).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Billing Summary</h4>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Total Paid:</span> $
              {billingSummary.totalPaid.toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Pending Bills:</span>{' '}
              {billingSummary.pendingBills}
            </p>
            <p>
              <span className="font-semibold">Last Payment Date:</span>{' '}
              {billingSummary.lastPaymentDate}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
