"use client";

// Хадгалсан хаяг — CRUD (RLS: хэрэглэгч зөвхөн өөрийнхөө хаягийг удирдана).

import { supabase } from "./supabase";
import type { AddressValue } from "./checkout";

export interface SavedAddress {
  id: string;
  label?: string;
  recipientName?: string;
  phone?: string;
  countryCode: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  district?: string;
  subdistrict?: string;
  deliveryNote?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface SavedAddressInput {
  label?: string;
  recipientName?: string;
  phone?: string;
  countryCode: string;
  address: AddressValue;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): SavedAddress {
  return {
    id: r.id,
    label: r.label ?? undefined,
    recipientName: r.recipient_name ?? undefined,
    phone: r.phone ?? undefined,
    countryCode: r.country_code ?? "MN",
    addressLine1: r.address_line_1 ?? undefined,
    addressLine2: r.address_line_2 ?? undefined,
    city: r.city ?? undefined,
    stateRegion: r.state_region ?? undefined,
    postalCode: r.postal_code ?? undefined,
    district: r.district ?? undefined,
    subdistrict: r.subdistrict ?? undefined,
    deliveryNote: r.delivery_note ?? undefined,
    latitude: r.latitude ?? undefined,
    longitude: r.longitude ?? undefined,
    isDefault: !!r.is_default,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// SavedAddress → form-д ашиглах AddressValue
export function toAddressValue(a: SavedAddress): AddressValue {
  return {
    line1: a.addressLine1, line2: a.addressLine2, city: a.city, state: a.stateRegion,
    postal: a.postalCode, district: a.district, subdistrict: a.subdistrict, note: a.deliveryNote,
  };
}

async function uid(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function listAddresses(): Promise<SavedAddress[]> {
  const { data, error } = await supabase
    .from("saved_addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return [];
  return (data ?? []).map(mapRow);
}

export async function saveAddress(input: SavedAddressInput): Promise<SavedAddress | null> {
  const user_id = await uid();
  if (!user_id) throw new Error("unauthorized");
  const row = {
    user_id,
    label: input.label ?? null,
    recipient_name: input.recipientName ?? null,
    phone: input.phone ?? null,
    country_code: input.countryCode,
    address_line_1: input.address.line1 ?? null,
    address_line_2: input.address.line2 ?? null,
    city: input.address.city ?? null,
    state_region: input.address.state ?? null,
    postal_code: input.address.postal ?? null,
    district: input.address.district ?? null,
    subdistrict: input.address.subdistrict ?? null,
    delivery_note: input.address.note ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    is_default: input.isDefault ?? false,
  };
  // default бол бусдыг эхлээд арилгана (нэг default баталгаа)
  if (row.is_default) await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user_id);
  const { data, error } = await supabase.from("saved_addresses").insert(row).select("*").maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

export async function deleteAddress(id: string): Promise<void> {
  await supabase.from("saved_addresses").delete().eq("id", id);
}

export async function setDefaultAddress(id: string): Promise<void> {
  const user_id = await uid();
  if (!user_id) return;
  await supabase.from("saved_addresses").update({ is_default: false }).eq("user_id", user_id);
  await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
}
