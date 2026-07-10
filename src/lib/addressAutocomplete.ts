// Хаягийн autocomplete / reverse-geocode — provider-independent adapter.
// API key байхгүй үед бүх зүйл graceful — autocomplete унтарч, энгийн input хэвээр ажиллана.
// Дараа нь Google Places эсвэл Mapbox холбохад зөвхөн энэ файлыг өргөтгөнө.

import type { AddressValue } from "./checkout";

export interface AddressSuggestion {
  id: string;
  label: string; // харагдах текст
}

export interface AddressDetails {
  address: AddressValue;   // боломжтой талбарууд
  countryCode?: string;    // ISO alpha-2 (байвал)
  latitude?: number;
  longitude?: number;
}

export interface AddressProvider {
  name: string;
  search(query: string, countryCode?: string): Promise<AddressSuggestion[]>;
  details(id: string): Promise<AddressDetails | null>;
}

export interface ReverseGeocodeProvider {
  name: string;
  reverse(lat: number, lng: number): Promise<AddressDetails | null>;
}

// ---- Provider тохиргоо (env-ээс). Одоогоор түлхүүр байхгүй тул null. ----
// Ирээдүйд: NEXT_PUBLIC_GOOGLE_PLACES_KEY эсвэл NEXT_PUBLIC_MAPBOX_TOKEN тавиад
// доорх adapter-уудыг бодит хэрэгжүүлэлтээр солино.

function googlePlacesKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_PLACES_KEY || undefined;
}
function mapboxToken(): string | undefined {
  return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || undefined;
}

let _autocomplete: AddressProvider | null | undefined;
export function getAddressProvider(): AddressProvider | null {
  if (_autocomplete !== undefined) return _autocomplete;
  // TODO: түлхүүр тохируулбал энд Google/Mapbox adapter буцаана.
  // Жишээ бүтэц (хэрэгжүүлээгүй): if (googlePlacesKey()) return makeGoogleProvider(googlePlacesKey()!)
  void googlePlacesKey; void mapboxToken;
  _autocomplete = null;
  return _autocomplete;
}
export function hasAddressAutocomplete(): boolean {
  return getAddressProvider() !== null;
}

let _reverse: ReverseGeocodeProvider | null | undefined;
export function getReverseGeocoder(): ReverseGeocodeProvider | null {
  if (_reverse !== undefined) return _reverse;
  _reverse = null; // provider тохируулаагүй тул унтраалттай
  return _reverse;
}
export function hasReverseGeocode(): boolean {
  return getReverseGeocoder() !== null;
}
