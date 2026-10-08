import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { formatToman } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { ProductActions } from "./product-actions";
import { ProductForm } from "./product-form";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams?: { q?: string; new?: string };
}) {
  const { dict } = await getServerDict();
  let auth;
  try {
    auth = await requireAuth();
  } catch {
    redirect("/login");
  }
  const q = (searchParams?.q || "").trim();
  const creating = searchParams?.new === "1";

  if (creating) {
    return (
      <AppShell title={dict.products.addNew} backHref="/products">
        <ProductForm dict={dict} />
      </AppShell>
    );
  }

  const products = await prisma.product.findMany({
    where: {
      businessId: auth.businessId,
      status: { not: "ARCHIVED" },
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: { variants: true },
    orderBy: { updatedAt: "desc" },
    take: 500,
  });

  return (
    <AppShell
      title={dict.products.title}
      actions={
        <div className="flex gap-2">
          <Link href="/products/import" className="btn-secondary text-xs" style={{ padding: "0.5rem 0.75rem" }}>
            {dict.products.import}
          </Link>
          <Link href="/products?new=1" className="btn-primary text-xs" style={{ padding: "0.5rem 0.75rem" }}>
            + {dict.products.addNew}
          </Link>
        </div>
      }
    >
      <form className="mb-4" action="/products" method="get" role="search">
        <label htmlFor="product-search" className="sr-only">
          {dict.common.search}
        </label>
        <input
          id="product-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={dict.common.search}
          className="input"
        />
      </form>

      {products.length === 0 ? (
        <Empty
          title={dict.products.title}
          subtitle="هنوز محصولی ثبت نشده است. اولین محصول خود را اضافه کنید تا سلورا بتواند پاسخ‌گو باشد."
          action={
            <div className="flex gap-2 mt-2">
              <Link href="/products/import">
                <Button variant="secondary" size="sm">{dict.products.import}</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="space-y-2">
          {products.map((p: any) => (
            <div key={p.id} className="card p-3 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-ink-100 flex-shrink-0 overflow-hidden grid place-items-center text-ink-400">
                {p.imageUrl ? (
                  // Remote owner-supplied URLs are not in next/image remotePatterns,
                  // so keep a plain img but make it lazy and CLS-safe.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span aria-hidden="true">🛍</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink-900 truncate">{p.name}</div>
                <div className="text-sm text-ink-500">{formatToman(p.price)} تومان</div>
              </div>
              <Badge tone={p.status === "AVAILABLE" ? "green" : "red"}>
                {p.status === "AVAILABLE" ? dict.common.available : dict.common.unavailable}
              </Badge>
              <ProductActions productId={p.id} currentStatus={p.status} />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
