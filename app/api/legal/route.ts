import { NextResponse } from "next/server";
import { signRequest, API_BASE } from "@/lib/bokun";

export async function GET() {
  try {
    const path = "/operator.json";

    const res = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      ...signRequest(path, "GET"),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LEGAL API ERROR:", errorText);
      return NextResponse.json({ error: "Failed to fetch legal" }, { status: 500 });
    }

    const data = await res.json();

    return NextResponse.json({
      terms: data.termsAndConditions ?? "",
      privacy: data.privacyPolicy ?? "",
    });

  } catch (error) {
    console.error("LEGAL API CRASH:", error);
    return NextResponse.json({ error: "Crash" }, { status: 500 });
  }
}