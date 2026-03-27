import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import { getAdminSettings, updateAdminSettings } from '../../services/admin';

const Settings = () => {
  const [settings, setSettings] = useState({
    ispProfile: { name: '', address: '', contactEmail: '' },
    billingSettings: { currency: 'USD', billingDay: 1 },
    notificationSettings: { emailNotifications: true, smsNotifications: false },
    securitySettings: { mfaEnabled: false },
    systemSettings: { maintenanceMode: false },
  });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAdminSettings();
        if (!isMounted) return;
        setSettings({
          ispProfile: data.ispProfile || { name: '', address: '', contactEmail: '' },
          billingSettings: data.billingSettings || { currency: 'USD', billingDay: 1 },
          notificationSettings:
            data.notificationSettings || { emailNotifications: true, smsNotifications: false },
          securitySettings: data.securitySettings || { mfaEnabled: false },
          systemSettings: data.systemSettings || { maintenanceMode: false },
        });
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load settings.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (sectionKey) => {
    setSavingSection(sectionKey);
    setError('');
    setStatus('');
    try {
      await updateAdminSettings({ [sectionKey]: settings[sectionKey] });
      setStatus('Settings updated successfully.');
    } catch (err) {
      setError('Unable to update settings.');
    } finally {
      setSavingSection('');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">Settings</h3>
        <p className="text-sm text-gray-500">Manage system preferences.</p>
      </header>

      {loading ? <Loader label="Loading settings..." /> : null}
      {error ? <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card> : null}
      {status ? (
        <Card className="border border-green-100 bg-green-50 text-green-700">{status}</Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h4 className="text-lg font-semibold text-gray-900">ISP Profile</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="block">
              Company Name
              <input
                value={settings.ispProfile.name}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ispProfile: { ...prev.ispProfile, name: event.target.value },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Address
              <input
                value={settings.ispProfile.address}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ispProfile: { ...prev.ispProfile, address: event.target.value },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Contact Email
              <input
                type="email"
                value={settings.ispProfile.contactEmail}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ispProfile: { ...prev.ispProfile, contactEmail: event.target.value },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleSave('ispProfile')}
            disabled={savingSection === 'ispProfile'}
          >
            {savingSection === 'ispProfile' ? 'Saving...' : 'Save ISP Profile'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Billing Settings</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="block">
              Currency
              <input
                value={settings.billingSettings.currency}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    billingSettings: { ...prev.billingSettings, currency: event.target.value },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
            <label className="block">
              Billing Day
              <input
                type="number"
                min="1"
                max="28"
                value={settings.billingSettings.billingDay}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    billingSettings: {
                      ...prev.billingSettings,
                      billingDay: Number(event.target.value),
                    },
                  }))
                }
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2"
              />
            </label>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleSave('billingSettings')}
            disabled={savingSection === 'billingSettings'}
          >
            {savingSection === 'billingSettings' ? 'Saving...' : 'Save Billing Settings'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Notification Settings</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notificationSettings.emailNotifications}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      emailNotifications: event.target.checked,
                    },
                  }))
                }
              />
              Email notifications
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.notificationSettings.smsNotifications}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    notificationSettings: {
                      ...prev.notificationSettings,
                      smsNotifications: event.target.checked,
                    },
                  }))
                }
              />
              SMS notifications
            </label>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleSave('notificationSettings')}
            disabled={savingSection === 'notificationSettings'}
          >
            {savingSection === 'notificationSettings' ? 'Saving...' : 'Save Notifications'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">Security Settings</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.securitySettings.mfaEnabled}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    securitySettings: {
                      ...prev.securitySettings,
                      mfaEnabled: event.target.checked,
                    },
                  }))
                }
              />
              Enable multi-factor authentication
            </label>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleSave('securitySettings')}
            disabled={savingSection === 'securitySettings'}
          >
            {savingSection === 'securitySettings' ? 'Saving...' : 'Save Security Settings'}
          </Button>
        </Card>

        <Card>
          <h4 className="text-lg font-semibold text-gray-900">System Settings</h4>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.systemSettings.maintenanceMode}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    systemSettings: {
                      ...prev.systemSettings,
                      maintenanceMode: event.target.checked,
                    },
                  }))
                }
              />
              Enable maintenance mode
            </label>
          </div>
          <Button
            className="mt-4"
            onClick={() => handleSave('systemSettings')}
            disabled={savingSection === 'systemSettings'}
          >
            {savingSection === 'systemSettings' ? 'Saving...' : 'Save System Settings'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
