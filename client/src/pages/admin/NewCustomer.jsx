import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { createCustomer } from '../../services/admin';

const NewCustomer = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCustomer(form);
      navigate('/admin/customers', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create customer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">Add Customer</h3>
        <p className="text-sm text-gray-500">Create a new customer account.</p>
      </header>

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600">
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoComplete="name"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoComplete="email"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Phone
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoComplete="tel"
            />
          </label>
          <label className="text-sm text-gray-600 md:col-span-2">
            Address
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              autoComplete="street-address"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-600 md:col-span-2">{error}</p>
          ) : null}
          <div className="flex items-center gap-2 md:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating...' : 'Create Customer'}
            </Button>
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewCustomer;
