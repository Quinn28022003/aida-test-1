import type { Database } from "./database.types";

type PublicSchema = Database["public"];
type PublicTables = PublicSchema["Tables"];

// Compatibility aliases for existing consumers.
// Prefer `Tables<...>`, `TablesInsert<...>`, `TablesUpdate<...>` in new code.
export type ProfileRow = PublicTables["profiles"]["Row"];
export type ProfileInsert = PublicTables["profiles"]["Insert"];
export type ProfileUpdate = PublicTables["profiles"]["Update"];

