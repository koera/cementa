import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'cementa',
  webDir: 'www',

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#F7F3EC',
    },
  },
};

export default config;
