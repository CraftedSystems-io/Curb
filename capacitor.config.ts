import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.craftedcompany.curb",
  appName: "Curb",
  webDir: "out",

  server: {
    // Load the deployed Vercel app in the native WebView
    url: "https://curb-app.vercel.app",
    // Allow navigation within app domain and Supabase auth
    allowNavigation: ["curb-app.vercel.app", "*.supabase.co"],
  },

  ios: {
    contentInset: "automatic",
    allowsLinkPreview: false,
    scrollEnabled: true,
    backgroundColor: "#ffffff",
    preferredContentMode: "mobile",
    webContentsDebuggingEnabled: false,
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
      iosSpinnerStyle: "small",
      spinnerColor: "#059669",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#ffffff",
    },
    Keyboard: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resize: "body" as any,
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
