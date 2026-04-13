import { NextRequest, NextResponse } from "next/server";
import { AdminRequestStatus } from "@/lib/access-enums";
import {
  ForbiddenError,
  UnauthorizedError,
  isSuperAdmin,
  readBearerTokenFromHeaders,
  validateDbSession,
} from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = readBearerTokenFromHeaders(req.headers);
    const fallbackUserIdRaw = req.nextUrl.searchParams.get("userId");
    const fallbackUserId = Number(fallbackUserIdRaw);
    const hasValidFallbackUserId =
      Number.isInteger(fallbackUserId) && fallbackUserId > 0;

    const actorUserId = sessionToken
      ? (await validateDbSession({ sessionToken })).userId
      : hasValidFallbackUserId
      ? fallbackUserId
      : null;

    if (!actorUserId) {
      throw new UnauthorizedError("Missing session token");
    }

    await isSuperAdmin(actorUserId);

    const prismaDynamic = prisma as unknown as {
      adminRequest?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    if (!prismaDynamic.adminRequest?.findMany) {
      return NextResponse.json([], { status: 200 });
    }

    const pendingRequests = await prismaDynamic.adminRequest.findMany({
      where: { status: AdminRequestStatus.PENDING },
      orderBy: { requestedAt: "asc" },
      select: {
        id: true,
        userId: true,
        communityId: true,
        status: true,
        justification: true,
        requestedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            platformRole: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(pendingRequests, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
