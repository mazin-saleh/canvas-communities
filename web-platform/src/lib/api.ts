// web-platform/src/lib/api.ts
type User = {
  id: number;
  username: string;
  interests: { id: number; name: string }[];
  memberships: { id: number; communityId: number }[];
};

type Community = {
  id: number;
  name: string;
  tags: { id: number; name: string }[];
  members: { id: number; userId: number }[];
};

type ClubPermissionSet = {
  canManageSettings: boolean;
  canManageRoles: boolean;
  canManageEvents: boolean;
  canManageGallery: boolean;
  canManageAnnouncements: boolean;
  canManageRoster: boolean;
  canBlacklistUsers: boolean;
};

type UserAccessPayload = {
  user: {
    id: number;
    username: string;
    platformRole: string;
    sessionVersion: number;
  };
  clubs: Array<{
    clubId: number;
    clubName: string;
    avatarUrl: string | null;
    isMember: boolean;
    isOwner: boolean;
    isAdmin: boolean;
    permissions: ClubPermissionSet;
  }>;
};

function getActiveUserId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("cc_auth");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      user?: { id?: string | number };
    };
    const userId = Number(parsed?.user?.id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
  } catch {
    return null;
  }
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  console.log("[api] request >", url, {
    method: options.method,
    body: options?.body ? JSON.parse(String(options.body)) : undefined,
  });

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const responseText = await res.text();
  let data: unknown = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch (e) {
    console.warn("[api] non-json response", url, e, responseText);
    data = { error: responseText || "API returned non-JSON response" };
  }

  if (!res.ok) {
    console.warn("[api] request failed <", url, res.status, data);
    const errorMessage =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : "API request failed";

    throw new Error(errorMessage);
  }

  console.log("[api] response <", url, data);
  return data;
}

export const api = {
  user: {
    getAll: (): Promise<User[]> => request("/api/user/all", { method: "GET" }),
    getAccess: (userId: number): Promise<UserAccessPayload> =>
      request(`/api/user/access?userId=${userId}`, { method: "GET" }),
    create: (username: string, password: string): Promise<User> =>
      request("/api/user/create", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),
    addInterest: (userId: number, tagName: string): Promise<User> =>
      request("/api/user/add-interest", {
        method: "PATCH",
        body: JSON.stringify({ userId, tagName }),
      }),
    removeInterest: (userId: number, tagName: string): Promise<User> =>
      request("/api/user/remove-interest", {
        method: "PATCH",
        body: JSON.stringify({ userId, tagName }),
      }),
    getInterests: (userId: number): Promise<{ id: number; name: string }[]> =>
      request(`/api/user/interests?userId=${userId}`, { method: "GET" }),
    joinCommunity: (userId: number, communityId: number): Promise<unknown> =>
      request("/api/user/join-community", {
        method: "PATCH",
        body: JSON.stringify({ userId, communityId }),
      }),
    getCommunities: (userId: number): Promise<Community[]> =>
      request(`/api/user/communities?userId=${userId}`, {
        method: "GET",
      }),
  },
  clubs: {
    requestAdminAccess: (clubId: number, justification: string) =>
      request(`/api/clubs/${clubId}/admin-requests`, {
        method: "POST",
        body: JSON.stringify({ justification }),
      }),
    manageRoles: (
      clubId: number,
      payload:
        | {
            action: "approve_request";
            requestId: number;
            permissions: ClubPermissionSet;
          }
        | { action: "deny_request"; requestId: number; reason?: string }
        | {
            action: "update_permissions";
            adminUserId: number;
            permissions: ClubPermissionSet;
          }
        | { action: "transfer_ownership"; newOwnerUserId: number }
    ) =>
      request(`/api/clubs/${clubId}/manage-roles`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  admin: {
    listPendingRequests: () => {
      const userId = getActiveUserId();
      const requestUrl = userId
        ? `/api/admin/requests?userId=${userId}`
        : "/api/admin/requests";
      return request(requestUrl, { method: "GET" });
    },
    approveRequest: (requestId: number, permissions: ClubPermissionSet) =>
      request(
        `/api/admin/requests/${requestId}/approve${
          getActiveUserId() ? `?userId=${getActiveUserId()}` : ""
        }`,
        {
        method: "POST",
        body: JSON.stringify({ permissions }),
      }
      ),
  },
  tags: {
    getAll: (): Promise<{ id: number; name: string }[]> =>
      request("/api/tags", { method: "GET" }),
  },
  community: {
    create: (name: string): Promise<Community> =>
      request("/api/community/create", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    addTag: (communityId: number, tagName: string): Promise<Community> =>
      request("/api/community/add-tag", {
        method: "PATCH",
        body: JSON.stringify({ communityId, tagName }),
      }),
    getRecommended: (userId: number): Promise<Community[]> =>
      request(`/api/community/recommend?userId=${userId}`, { method: "GET" }),
    getById: (id: number): Promise<Community> =>
      request(`/api/community/get?id=${id}`, { method: "GET" }),
  },
};
