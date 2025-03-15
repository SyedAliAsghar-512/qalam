import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qalam.app',
  appName: 'Qalam ',
  webDir: 'build',
  server: {
    url: "https://qalam-production.up.railway.app",
    cleartext: true
  }
};

export default config;
