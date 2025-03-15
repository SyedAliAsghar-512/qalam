import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.qalam.app',
  appName: 'Qalam ',
  webDir: 'build',
  server: {
    url: "http://10.90.22.196:4000",
    cleartext: true
  }
};

export default config;
