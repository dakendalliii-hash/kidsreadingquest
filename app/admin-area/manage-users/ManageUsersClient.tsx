"use client";

import { useTransition } from "react";
import { updateUserRole } from "./actions";

// ✅ Define prop types
type User = {
  id: string;
  email?: string;
};

type UserRole = {
  user_id: string;
  role: string;
};

type ManageUsersClientProps = {
  users: User[];
  userRoles: UserRole[];
  roleCodes: string[];
};

export default function ManageUsersClient({
  users,
  userRoles,
  roleCodes,
}: ManageUsersClientProps) {
  const [isPending, startTransition] = useTransition();

  function getRoleForUser(userId: string) {
    return userRoles.find((r) => r.user_id === userId)?.role ?? "parent";
  }

  return (
    <div className="space-y-4">
      {users.map((u) => (
        <div
          key={u.id}
          className="p-4 bg-slate-900 border border-slate-700 rounded-xl"
        >
          <p className="text-slate-100 font-semibold">{u.email}</p>

          <div className="mt-2 flex items-center space-x-3">
            <select
              defaultValue={getRoleForUser(u.id)}
              className="bg-slate-800 border border-slate-700 p-2 rounded"
              onChange={(e) =>
                startTransition(() => updateUserRole(u.id, e.target.value))
              }
            >
              {roleCodes.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {isPending && (
              <span className="text-sky-400 text-sm">Updating…</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
