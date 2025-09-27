import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mydatagpt.app',
  appName: 'MyDataGPT',
  server: {
    // Replace this with your VPS's domain name in production
    url: 'http://localhost:3000',
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;
