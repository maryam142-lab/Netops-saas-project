import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { createPackage, deletePackage, getPackages, updatePackage } from '../../services/admin';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({
    name: '',
    speed: '',
    price: '',
    duration: '',
    description: '',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    speed: '',
    price: '',
    duration: '',
    description: '',
  });

  const refreshPackages = async () => {
    const data = await getPackages();
    setPackages(data || []);
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPackages();
        if (!isMounted) return;
        setPackages(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load packages.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        speed: form.speed.trim(),
        price: Number(form.price),
        duration: Number(form.duration),
        description: form.description.trim(),
      };
      if (
        !payload.name ||
        !payload.speed ||
        Number.isNaN(payload.price) ||
        Number.isNaN(payload.duration)
      ) {
        throw new Error('Please fill in all required fields.');
      }
      await createPackage(payload);
      setForm({ name: '', speed: '', price: '', duration: '', description: '' });
      await refreshPackages();
      toast.success('Package created successfully.');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to create package.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (pkg) => {
    setEditingPackage(pkg);
    setEditForm({
      name: pkg.name || '',
      speed: pkg.speed || '',
      price: pkg.price || '',
      duration: pkg.duration || '',
      description: pkg.description || '',
    });
  };

  const closeEdit = () => {
    setEditingPackage(null);
    setEditForm({ name: '', speed: '', price: '', duration: '', description: '' });
  };

  const handleEditSave = async () => {
    if (!editingPackage) return;
    setSavingEdit(true);
    setError('');
    try {
      const payload = {
        name: editForm.name.trim(),
        speed: editForm.speed.trim(),
        price: Number(editForm.price),
        duration: Number(editForm.duration),
        description: editForm.description.trim(),
      };
      await updatePackage(editingPackage._id, payload);
      await refreshPackages();
      toast.success('Package updated successfully.');
      closeEdit();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update package.';
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    setError('');
    try {
      await deletePackage(id);
      await refreshPackages();
      toast.success('Package deleted.');
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete package.';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Packages</h3>
          <p className="text-sm text-gray-500">Manage service packages.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow">
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-900">Add a new plan</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600">
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2"
              placeholder="Starter"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Speed
            <input
              name="speed"
              value={form.speed}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2"
              placeholder="20 Mbps"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Price
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2"
              placeholder="2000"
              min="0"
              required
            />
          </label>
          <label className="text-sm text-gray-600">
            Duration (days)
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2"
              placeholder="30"
              min="1"
              required
            />
          </label>
        </div>
        <label className="mt-4 block text-sm text-gray-600">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2"
            rows={3}
            placeholder="Optional details about the plan"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Package'}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </form>

      {loading ? <Loader label="Loading packages..." /> : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {packages.length === 0 && !loading ? (
          <Card className="text-sm text-gray-500">No packages available.</Card>
        ) : null}
        {packages.map((pkg) => (
          <Card key={pkg._id}>
            <h4 className="text-lg font-semibold text-gray-900">{pkg.name}</h4>
            <p className="mt-2 text-sm text-gray-500">Speed: {pkg.speed}</p>
            <p className="text-sm text-gray-500">
              Price: ${Number(pkg.price || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Duration: {pkg.duration} days</p>
            <div className="mt-4 flex items-center gap-2">
              <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => openEdit(pkg)}>
                Edit
              </Button>
              <Button variant="danger" className="px-3 py-1 text-xs" onClick={() => handleDelete(pkg._id)}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={Boolean(editingPackage)} title="Edit Package" onClose={closeEdit}>
        <div className="space-y-4">
          <label className="block text-sm text-gray-600">
            Name
            <input
              name="name"
              value={editForm.name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Speed
            <input
              name="speed"
              value={editForm.speed}
              onChange={(event) => setEditForm((prev) => ({ ...prev, speed: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Price
            <input
              type="number"
              name="price"
              value={editForm.price}
              onChange={(event) => setEditForm((prev) => ({ ...prev, price: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Duration (days)
            <input
              type="number"
              name="duration"
              value={editForm.duration}
              onChange={(event) => setEditForm((prev) => ({ ...prev, duration: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-gray-600">
            Description
            <textarea
              name="description"
              value={editForm.description}
              onChange={(event) =>
                setEditForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={closeEdit}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={savingEdit}>
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Packages;
