import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.156ee5cd96b04b86be06814e097c3931',
  appName: 'relay',
  webDir: 'dist',
  server: {
    url: 'https://156ee5cd-96b0-4b86-be06-814e097c3931.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#25D366',
      showSpinner: false
    }
  }
};

export default config;