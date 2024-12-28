import 'dotenv/config'; // Optional if you have a .env file for local development

export default {
  expo: {
    name: "expoBartenderApp",
    slug: "expoBartenderApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.juanse07.expobartenderapp",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.juanse07.expobartenderapp",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-font"
    ],
    extra: {
      eas: {
        projectId: "d1dfadbc-7ed9-4862-ae04-1ff656a876e8"
      },
      expoPublicApiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.denverbartenders.online"
    }
  }
};
