/**
 * API base URL.
 *
 * - iOS Simulator: localhost works
 * - Android Emulator: 10.0.2.2 works
 * - Physical iPhone: Change DEVICE_IP below to your computer's IP
 */
import { Platform } from 'react-native';

// Your computer's IP - change this when testing on physical iPhone
const DEVICE_IP = '192.168.50.202';

export const getApiBaseUrl = (): string => {
  const override = process.env.EXPO_PUBLIC_API_URL;
  if (override) return override;
  if (!__DEV__) return 'https://your-api.example.com';
  if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
  // iOS: use device IP for physical phone (localhost only works in simulator)
  return `http://${DEVICE_IP}:8080`;
};
