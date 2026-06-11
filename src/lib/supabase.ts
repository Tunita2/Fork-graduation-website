import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Wish {
  id: number;
  name: string;
  wishes: string;
  created_at?: string;
}

export interface NewWish {
  name: string;
  wishes: string;
}

export async function fetchWishes(): Promise<Wish[]> {
  try {
    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching wishes:", error);
    return [];
  }
}

export async function addWish(wish: NewWish): Promise<Wish | null> {
  try {
    const { data, error } = await supabase
      .from("wishes")
      .insert([wish])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding wish:", error);
    return null;
  }
}
