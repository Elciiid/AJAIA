import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = loginSchema.parse(body);

    // Lightweight auth: an email signs you in, creating the account on first use.
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: name?.trim() || email.split("@")[0] },
      select: { id: true, email: true, name: true },
    });

    const session = await getSession();
    session.userId = user.id;
    await session.save();

    return NextResponse.json({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
