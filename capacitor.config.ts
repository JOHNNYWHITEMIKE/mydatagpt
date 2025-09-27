import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mydatagpt.app',
  appName: 'MyDataGPT',
  webDir: '.next',
  server: {
    url: 'https://mydatagpt.example.com',
    cleartext: true,
  },
};

export default config;
