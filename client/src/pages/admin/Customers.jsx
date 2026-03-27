import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import { deleteCustomer, getCustomers, updateCustomer } from '../../services/admin';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomers();
        if (!isMounted) return;
        setCustomers(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load customers.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const openEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      password: '',
    });
  };

  const closeEdit = () => {
    setEditingCustomer(null);
    setForm({ name: '', email: '', phone: '', address: '', password: '' });
  };

  const handleEditSave = async () => {
    if (!editingCustomer) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      if (form.password) payload.password = form.password;
      const updated = await updateCustomer(editingCustomer._id, payload);
      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === editingCustomer._id ? { ...customer, ...updated } : customer
        )
      );
      closeEdit();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update customer.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    setDeletingId(id);
    setError('');
    try {
      await deleteCustomer(id);
      setCustomers((prev) => prev.filter((customer) => customer._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete customer.');
    } finally {
      setDeletingId('');
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'package', header: 'Package', render: () => '—' },
    { key: 'status', header: 'Status', render: () => 'Active' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="px-3 py-1 text-xs"
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            className="px-3 py-1 text-xs"
            onClick={() => handleDelete(row._id)}
            disabled={deletingId === row._id}
          >
            {deletingId === row._id ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Customers</h3>
          <p className="text-sm text-gray-500">Manage customer accounts.</p>
        </div>
        <Button onClick={() => navigate('/admin/customers/new')}>+ Add Customer</Button>
      </header>

      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      {loading ? <Loader label="Loading customers..." /> : null}
      <Table columns={columns} data={customers} emptyLabel="No customers available" />

      <Modal open={Boolean(editingCustomer)} title="Edit Customer" onClose={closeEdit}>
        <div className="space-y-4">
          <label className="block text-sm text-gray-600">
            Name
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Phone
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Address
            <input
              type="text"
              value={form.address}
              onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Password (optional)
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Customers;
