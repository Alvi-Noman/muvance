import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';

type WindowWithCapacitor = Window & { Capacitor?: { isNativePlatform?: () => boolean } };

/** True only inside the Android app, where Capacitor adds itself to the page. */
const isNativeApp = () => (window as WindowWithCapacitor).Capacitor?.isNativePlatform?.() === true;

// This phone's push token, so signing out can stop alerts for this account.
let currentToken: string | null = null;

/** Called before signing out, while the session can still authorise it. */
export async function stopPush() {
  if (!currentToken) return;
  const token = currentToken;
  currentToken = null;
  await api.post('/devices/unregister', { token }).catch(() => {});
}

function playAlert() {
  // The system only plays the channel's sound when the app is in the background.
  void new Audio('/sounds/new-lead.wav').play().catch(() => {});
}

/** In the Android app: asks for permission, saves this phone, and handles incoming alerts. */
export function usePushNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isNativeApp()) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      if (cancelled) return;

      await PushNotifications.createChannel({
        id: 'new-leads',
        name: 'New leads',
        description: 'Plays a sound when someone books a call.',
        importance: 5,
        visibility: 1,
        sound: 'new_lead',
        vibration: true,
        lights: true,
        lightColor: '#5CE1FF',
      });

      const handles = await Promise.all([
        PushNotifications.addListener('registration', ({ value }) => {
          currentToken = value;
          void api.post('/devices', { token: value }).catch(() => {});
        }),
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          const leadId = (notification.data as { leadId?: string } | undefined)?.leadId;
          playAlert();
          void queryClient.invalidateQueries();
          toast(notification.title ?? 'New lead', {
            description: notification.body,
            duration: 10_000,
            action: leadId
              ? { label: 'Open', onClick: () => void navigate(`/leads/${leadId}`) }
              : undefined,
          });
        }),
        PushNotifications.addListener('pushNotificationActionPerformed', ({ notification }) => {
          const leadId = (notification.data as { leadId?: string } | undefined)?.leadId;
          if (leadId) void navigate(`/leads/${leadId}`);
        }),
      ]);
      cleanup = () => handles.forEach((handle) => void handle.remove());
      if (cancelled) return cleanup();

      let { receive } = await PushNotifications.checkPermissions();
      if (receive === 'prompt' || receive === 'prompt-with-rationale') {
        ({ receive } = await PushNotifications.requestPermissions());
      }
      if (receive === 'granted' && !cancelled) await PushNotifications.register();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [navigate, queryClient]);
}
