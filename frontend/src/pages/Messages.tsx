import { useEffect, useState, type FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface MessageItem {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  created_at: string;
}

export const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('social/messages/');
      setMessages(response.data || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Unable to load messages right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMessages();
  }, []);

  const handleSend = async (event: FormEvent) => {
    event.preventDefault();
    if (!recipientEmail.trim() || !draft.trim()) return;

    setSending(true);
    try {
      const response = await apiClient.post('social/messages/', {
        receiver_email: recipientEmail.trim(),
        text: draft.trim(),
      });

      setMessages((prev) => [...prev, response.data]);
      setDraft('');
      setRecipientEmail('');
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.receiver_email || err.response?.data?.detail || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 700, marginBottom: '8px' }}>Messages</h1>
        <p style={{ color: 'var(--text-muted)' }}>Send and receive direct messages with staff and families.</p>
      </header>

      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <input
              type="email"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              placeholder="Recipient email"
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '14px 16px',
                color: 'var(--text-main)',
              }}
            />
            <input
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message"
              required
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                padding: '14px 16px',
                color: 'var(--text-main)',
              }}
            />
          </div>
          <button type="submit" className="btn" disabled={sending} style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} /> {sending ? 'Sending…' : 'Send message'}
          </button>
        </form>

        {error && (
          <div style={{ color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 12px' }}>
            {error}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <MessageCircle size={20} color="var(--accent)" />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Conversation history</h2>
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading your messages…</p>
        ) : messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No conversations yet. Start the first message above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((message) => {
              const isSent = user?.id && message.sender === user.id;
              return (
                <div
                  key={message.id}
                  style={{
                    alignSelf: isSent ? 'flex-end' : 'flex-start',
                    background: isSent ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    maxWidth: '80%',
                  }}
                >
                  <p style={{ marginBottom: '6px', color: 'var(--text-main)', lineHeight: 1.5 }}>{message.text}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
