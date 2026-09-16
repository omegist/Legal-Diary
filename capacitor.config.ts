import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.legaldiary.app',
  appName: 'Legal Diary',
  webDir: 'dist',
  server: {
    cleartext: true,
    androidScheme: 'https'
  }
};

export default config;
