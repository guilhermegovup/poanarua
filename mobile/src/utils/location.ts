import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export async function getPermissions(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === Location.PermissionStatus.GRANTED;
}

export async function getLocation(): Promise<Coords | null> {
  try {
    const granted = await getPermissions();
    if (!granted) return null;

    const position = await Location.getLastKnownPositionAsync();
    const current = position ?? (await Location.getCurrentPositionAsync({}));

    return {
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  } catch {
    return null;
  }
}

/** Centro de Porto Alegre — fallback quando a localização é negada. */
export const POA_CENTER: Coords = { latitude: -30.0346, longitude: -51.2177 };
