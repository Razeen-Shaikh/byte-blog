import { NewsletterExportButton } from "@/components/admin/newsletter-export-button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminNewsletterPage() {
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Newsletter</h1>
          <p className="text-muted-foreground">
            {subscribers.filter((s) => s.isActive).length} active subscribers
          </p>
        </div>
        <NewsletterExportButton
          rows={subscribers.map((s) => ({
            email: s.email,
            isActive: s.isActive,
            createdAt: s.createdAt.toISOString(),
          }))}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-t border-border">
                <td className="px-4 py-3">{subscriber.email}</td>
                <td className="px-4 py-3">
                  {subscriber.isActive ? "Active" : "Unsubscribed"}
                </td>
                <td className="px-4 py-3">{formatDate(subscriber.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
