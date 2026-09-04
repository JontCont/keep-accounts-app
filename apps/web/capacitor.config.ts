import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.keepaccounts.app',
  appName: 'Keep Accounts',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Ionic,
    },
  },
};

export default config;
