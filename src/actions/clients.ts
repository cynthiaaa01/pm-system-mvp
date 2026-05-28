"use server";

import { createClient } from "@/lib/supabase/server";

export async function getClients() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data;
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const contact_person = formData.get("contact_person") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      contact_person,
      contact_email,
      contact_phone,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    return { error: error.message };
  }

  return { data };
}

export async function searchClients(query: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name");

  if (error) {
    console.error("Error searching clients:", error);
    return [];
  }

  return data;
}
