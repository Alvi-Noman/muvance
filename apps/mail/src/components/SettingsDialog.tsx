import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, errorMessage } from '@/lib/api';
import { useMail } from '@/pages/MailApp';
import { Button, Dialog } from './ui';

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me, toast } = useMail();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(me.displayName);
  const [signature, setSignature] = useState(me.signature);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState<'profile' | 'password' | null>(null);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setBusy('profile');
    try {
      await api.put('/settings', { displayName, signature });
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      toast('Settings saved');
      onClose();
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setBusy('password');
    try {
      await api.post('/password', { current, next });
      toast('Password changed. Update it in your phone’s mail app too.');
      setCurrent('');
      setNext('');
    } catch (error) {
      toast(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const field =
    'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-ink focus:ring-4 focus:ring-black/5';

  return (
    <Dialog open={open} onClose={onClose} title="Settings">
      <form onSubmit={saveProfile} className="space-y-4">
        <label className="block text-sm font-medium">
          Your name, as people see it
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={field}
            maxLength={80}
          />
        </label>
        <label className="block text-sm font-medium">
          Signature
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={4}
            placeholder={'Alvi Noman\nMuvance · muvance.com'}
            className={`${field} resize-none`}
          />
          <span className="mt-1 block text-xs font-normal text-muted">
            Added to new messages and replies.
          </span>
        </label>
        <div className="flex justify-end">
          <Button type="submit" disabled={busy === 'profile'}>
            Save
          </Button>
        </div>
      </form>

      <form onSubmit={changePassword} className="mt-6 space-y-4 border-t border-line pt-6">
        <h3 className="text-sm font-semibold">Change password</h3>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          className={field}
          required
        />
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="New password (10+ characters)"
          autoComplete="new-password"
          minLength={10}
          className={field}
          required
        />
        <div className="flex justify-end">
          <Button type="submit" variant="secondary" disabled={busy === 'password'}>
            Change password
          </Button>
        </div>
      </form>

      <div className="mt-6 rounded-xl bg-canvas p-4 text-[13px] text-muted">
        <p className="font-medium text-ink">Phone and computer mail apps</p>
        <p className="mt-1">
          Incoming: <span className="font-mono">mail.muvance.com</span>, IMAP, port 993, SSL.
          Outgoing: <span className="font-mono">mail.muvance.com</span>, port 465, SSL. Username:{' '}
          {me.address}.
        </p>
      </div>
    </Dialog>
  );
}
