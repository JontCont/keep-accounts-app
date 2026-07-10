import {
  expandInstallment,
  InstallmentReminderConfig,
} from '@keep-accounts-app/domain';
import { isNativePlatform } from './backup';

/**
 * Payment-reminder scheduling for credit-card installments.
 *
 * All scheduling is delivered as on-device local notifications and is
 * native-only (iOS/Android). On the web platform every function is a no-op and
 * `isNotificationSupported()` returns false, so the reminder UI can hide the
 * switch. The Capacitor plugin is imported dynamically so the web build and the
 * vitest suite never load native code.
 */
export const isNotificationSupported = (): boolean => isNativePlatform();

// Android notification ids must fit in a 32-bit signed int. Derive a stable,
// bounded id from the installment id and the 1-based period number.
const notificationId = (installmentId: string, period: number): number => {
  let hash = 0;
  for (let i = 0; i < installmentId.length; i++) {
    hash = (hash * 31 + installmentId.charCodeAt(i)) % 20000000;
  }
  return hash * 100 + period;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const result = await LocalNotifications.requestPermissions();
  return result.display === 'granted';
};

/**
 * Schedule one reminder per future installment period on its payment date.
 * No-op on web. If permission is denied, scheduling is skipped silently.
 */
export const scheduleInstallmentReminders = async (
  installmentId: string,
  total: number,
  periods: number,
  startDate: string,
  message: InstallmentReminderConfig
): Promise<void> => {
  if (!isNativePlatform()) return;
  const granted = await requestNotificationPermission();
  if (!granted) return;

  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const now = Date.now();
  const notifications = expandInstallment(total, periods, startDate)
    .map((p) => ({ period: p.period, at: new Date(p.date) }))
    .filter((p) => p.at.getTime() > now) // only future, not-yet-paid periods
    .map((p) => ({
      id: notificationId(installmentId, p.period),
      title: message.notificationTitle,
      body: message.notificationBody,
      schedule: { at: p.at },
    }));

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
};

/**
 * Cancel any reminders previously scheduled for an installment. No-op on web.
 */
export const cancelInstallmentReminders = async (
  installmentId: string,
  periods: number
): Promise<void> => {
  if (!isNativePlatform()) return;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const notifications = Array.from({ length: periods }, (_, i) => ({
    id: notificationId(installmentId, i + 1),
  }));
  await LocalNotifications.cancel({ notifications });
};
