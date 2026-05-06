import { NextResponse } from "next/server";
import requirementsByEquipment from "@/data/generated/requirements-by-equipment.json";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const all = requirementsByEquipment as Record<string, any[]>;
  const reqs = all[params.id] || [];
  return NextResponse.json({ id: params.id, requirements: reqs });
}
