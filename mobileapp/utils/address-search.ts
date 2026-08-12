export type AddressSuggestion = {
  label: string;
  lat: number;
  lon: number;
};

type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
  postcode?: string;
};

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: PhotonProperties;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

function formatPhotonLabel(properties: PhotonProperties = {}): string {
  const street = [properties.housenumber, properties.street].filter(Boolean).join(' ');
  const locality = properties.city || properties.town || properties.village;
  const parts = [street || properties.name, locality, properties.state, properties.postcode, properties.country]
    .map(part => part?.trim())
    .filter((part): part is string => Boolean(part));
  return [...new Set(parts)].join(', ');
}

function mapFeature(feature: PhotonFeature): AddressSuggestion | null {
  const coords = feature.geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lon, lat] = coords;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const label = formatPhotonLabel(feature.properties);
  if (!label) return null;
  return { label, lat, lon };
}

async function photonRequest(url: string): Promise<AddressSuggestion[]> {
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = (await response.json()) as PhotonResponse;
  const seen = new Set<string>();
  const results: AddressSuggestion[] = [];
  for (const feature of data.features ?? []) {
    const mapped = mapFeature(feature);
    if (!mapped || seen.has(mapped.label)) continue;
    seen.add(mapped.label);
    results.push(mapped);
  }
  return results;
}

export async function searchAddresses(query: string, lang: 'en' | 'es'): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=${lang}`;
  return photonRequest(url);
}

export async function reverseGeocode(lat: number, lon: number, lang: 'en' | 'es'): Promise<AddressSuggestion | null> {
  const url = `https://photon.komoot.io/reverse?lon=${lon}&lat=${lat}&lang=${lang}`;
  const results = await photonRequest(url);
  return results[0] ?? { label: `${lat.toFixed(5)}, ${lon.toFixed(5)}`, lat, lon };
}

export function osmEmbedUrl(lat: number, lon: number, delta = 0.008): string {
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat},${lon}`;
}
