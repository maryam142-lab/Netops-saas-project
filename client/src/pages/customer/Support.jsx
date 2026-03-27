import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import { createTicket, getMyTickets } from '../../services/support';

const formatDate = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const formatStatus = (value) => (value === 'closed' ? 'Closed' : 'Open');

const Support = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyTickets();
        if (!isMounted) return;
        setTickets(data);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load tickets.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');
    if (!subject || !message) {
      setError('Please provide a subject and message.');
      return;
    }
    setSubmitting(true);
    try {
      const ticket = await createTicket({ subject, message });
      setTickets((prev) => [ticket, ...prev]);
      setSelectedTicketId(ticket._id);
      setSubject('');
      setMessage('');
      setStatus('Ticket created successfully.');
    } catch (err) {
      setError('Unable to create ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const data = useMemo(
    () =>
      tickets.map((ticket) => ({
        id: ticket._id,
        subject: ticket.subject,
        status: (
          <Badge variant={ticket.status === 'closed' ? 'closed' : 'open'}>
            {formatStatus(ticket.status)}
          </Badge>
        ),
        date: formatDate(ticket.createdAt),
        rawStatus: ticket.status,
      })),
    [tickets]
  );

  const selectedTicket = tickets.find((ticket) => ticket._id === selectedTicketId);
  const sortedReplies = selectedTicket?.replies
    ? [...selectedTicket.replies].sort(
        (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
      )
    : [];

  const columns = [
    { key: 'subject', header: 'Subject' },
    { key: 'status', header: 'Status' },
    { key: 'date', header: 'Date' },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Button
          type="button"
          variant="outline"
          onClick={() => setSelectedTicketId(row.id)}
          className="px-3 py-1 text-xs uppercase tracking-[0.2em]"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-xl font-semibold text-gray-900">Support</h3>
        <p className="text-sm text-gray-500">Create a ticket or review replies.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <form
          className="rounded-xl bg-white p-6 shadow"
          onSubmit={handleSubmit}
        >
          <h4 className="text-lg font-semibold text-gray-900">Create a ticket</h4>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Subject
          </label>
          <input
            type="text"
            placeholder="Billing question"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gray-300"
          />
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Message
          </label>
          <textarea
            rows="4"
            placeholder="Describe your issue..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gray-300"
          />
          <Button className="mt-4" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
          {status ? <p className="mt-3 text-sm text-green-600">{status}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </form>

        <div className="space-y-4">
          {loading ? <Loader label="Loading tickets..." /> : null}
          <Table columns={columns} data={data} emptyLabel="No support tickets yet." />
          {selectedTicket ? (
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={selectedTicket.status === 'closed' ? 'closed' : 'open'}>
                    {formatStatus(selectedTicket.status)}
                  </Badge>
                  <h4 className="mt-2 text-lg font-semibold text-gray-900">
                    {selectedTicket.subject}
                  </h4>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-gray-400">
                  {formatDate(selectedTicket.createdAt)}
                </span>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    Customer
                  </p>
                  <p>{selectedTicket.message}</p>
                </div>
                {sortedReplies.map((reply, index) => (
                  <div key={`${reply.date}-${index}`}>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                      {reply.sender === 'admin' ? 'Admin' : 'Customer'}
                    </p>
                    <p>{reply.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Support;
