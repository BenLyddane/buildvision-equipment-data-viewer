import { NextResponse } from "next/server";
import requirementsByEquipment from "@/data/generated/requirements-by-equipment.json";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  if (!type) {
    return NextResponse.json({ error: "Missing type" }, { status: 400 });
  }
  const all = requirementsByEquipment as Record<
    string,
    Array<{ type: string | null; numeric: number | null; value: string | null }>
  >;
  const values: number[] = [];
  for (const arr of Object.values(all)) {
    for (const r of arr) {
      if (r.type === type && r.numeric != null) {
        values.push(r.numeric);
      }
    }
  }
  return NextResponse.json({ type, values });
}
