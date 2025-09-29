import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mydatagpt.app',
  appName: 'MyDataGPT',
  webDir: 'out',
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
