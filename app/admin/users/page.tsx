import { UserRoleManager } from "@/components/admin/user-role-manager";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { articles: true, comments: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Users</h1>
        <p className="text-muted-foreground">Roles and account status.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Activity</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="font-medium">{user.name ?? user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  {user._count.articles} articles · {user._count.comments} comments
                </td>
                <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3">
                  <UserRoleManager
                    id={user.id}
                    role={user.role}
                    isActive={user.isActive}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
