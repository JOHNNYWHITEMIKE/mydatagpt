import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mydatagpt.app',
  appName: 'MyDataGPT',
  webDir: '.next',
  server: {
    // Should be changed to the production URL when deploying
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
