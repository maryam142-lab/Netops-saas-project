import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Table from '../../components/ui/Table';
import {
  closeSupportTicket,
  getSupportTicketById,
  getSupportTickets,
  replySupportTicket,
} from '../../services/admin';

const formatDate = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const formatStatus = (value) => (value === 'closed' ? 'Closed' : 'Open');

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getSupportTickets();
        if (!isMounted) return;
        setTickets(data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Unable to load support tickets.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleView = async (ticketId) => {
    setError('');
    try {
      const ticket = await getSupportTicketById(ticketId);
      setSelectedTicket(ticket);
      setReplyMessage('');
    } catch (err) {
      setError('Unable to load ticket details.');
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setReplying(true);
    setError('');
    try {
      const updated = await replySupportTicket(selectedTicket._id, {
        message: replyMessage.trim(),
      });
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updated._id ? { ...ticket, status: updated.status } : ticket
        )
      );
      setReplyMessage('');
    } catch (err) {
      setError('Unable to send reply.');
    } finally {
      setReplying(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket) return;
    setClosing(true);
    setError('');
    try {
      const updated = await closeSupportTicket(selectedTicket._id);
      setSelectedTicket(updated);
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === updated._id ? { ...ticket, status: updated.status } : ticket
        )
      );
    } catch (err) {
      setError('Unable to close ticket.');
    } finally {
      setClosing(false);
    }
  };

  const data = useMemo(
    () =>
      tickets.map((ticket) => ({
        id: ticket._id,
        customer: ticket.customerId?.name || 'Unknown',
        subject: ticket.subject,
        status: (
          <Badge variant={ticket.status === 'closed' ? 'closed' : 'open'}>
            {formatStatus(ticket.status)}
          </Badge>
        ),
        date: formatDate(ticket.createdAt),
      })),
    [tickets]
  );

  const columns = [
    { key: 'customer', header: 'Customer' },
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
          onClick={() => handleView(row.id)}
          className="px-3 py-1 text-xs uppercase tracking-[0.2em]"
        >
          View
        </Button>
      ),
    },
  ];

  const sortedReplies = selectedTicket?.replies
    ? [...selectedTicket.replies].sort(
        (a, b) => new Date(a.date || 0) - new Date(b.date || 0)
      )
    : [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Support</p>
          <h3 className="text-xl font-semibold text-slate-900">Customer tickets</h3>
        </div>
      </header>

      {error ? (
        <Card className="border border-red-100 bg-red-50 text-red-700">{error}</Card>
      ) : null}

      {loading ? <Loader label="Loading tickets..." /> : null}
      <Table columns={columns} data={data} emptyLabel="No tickets available." />

      {selectedTicket ? (
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge variant={selectedTicket.status === 'closed' ? 'closed' : 'open'}>
                {formatStatus(selectedTicket.status)}
              </Badge>
              <h4 className="mt-2 text-lg font-semibold text-gray-900">
                {selectedTicket.subject}
              </h4>
              <p className="text-sm text-gray-500">
                Customer: {selectedTicket.customerId?.name || 'Unknown'}
              </p>
            </div>
            <Button
              variant="danger"
              onClick={handleClose}
              disabled={selectedTicket.status === 'closed' || closing}
              className="px-4 py-2 text-xs uppercase tracking-[0.2em]"
            >
              {closing ? 'Closing...' : 'Close Ticket'}
            </Button>
          </div>

          <div className="mt-5 space-y-3 text-sm text-gray-700">
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

          <div className="mt-6">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
              Reply
            </label>
            <textarea
              rows="3"
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-gray-300"
              placeholder="Type your response..."
            />
            <Button
              type="button"
              onClick={handleReply}
              disabled={replying || !replyMessage.trim()}
              className="mt-3 px-5 py-2 text-xs uppercase tracking-[0.2em]"
            >
              {replying ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Support;
