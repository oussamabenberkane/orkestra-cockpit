import { supabase } from "@/lib/supabase";

export interface AgentSettings {
  memoryEnabled: boolean;
  model: string;
  temperature: number;
}

const DEFAULTS: AgentSettings = {
  memoryEnabled: true,
  model: "mistral-large-latest",
  temperature: 0.2,
};

export async function loadAgentSettings(userId: string): Promise<AgentSettings> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("memory_enabled, model, temperature")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return DEFAULTS;
  return {
    memoryEnabled: data.memory_enabled as boolean,
    model: (data.model as string) || DEFAULTS.model,
    temperature: typeof data.temperature === "number" ? data.temperature : DEFAULTS.temperature,
  };
}

export async function saveAgentSettings(
  userId: string,
  settings: AgentSettings
): Promise<void> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      memory_enabled: settings.memoryEnabled,
      model: settings.model,
      temperature: settings.temperature,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}
