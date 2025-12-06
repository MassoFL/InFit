import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.infit.app',
  appName: 'InFit',
  webDir: 'out',
  server: {
    // For Android emulator, use 10.0.2.2 instead of localhost
    url: 'http://10.0.2.2:3000',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false,
    }
  }
};

export default config;
