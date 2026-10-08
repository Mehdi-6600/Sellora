import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerDict } from "@/lib/i18n";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { Empty } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { formatToman, toPersianDigits } from "@/lib/utils/format";
import { IconPlus, IconSearch, IconUpload } from "@/components/layout/icons";
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
      <AppShell
        title={dict.products.addNew}
        subtitle="قیمت و موجودی همین‌جا تعیین می‌شود؛ سلورا از همین داده‌ها پاسخ می‌دهد."
        backHref="/products"
      >
        <div className="mx-auto w-full max-w-xl">
          <ProductForm dict={dict} />
        </div>
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

  const available = products.filter((p: any) => p.status === "AVAILABLE").length;

  return (
    <AppShell
      title={dict.products.title}
      subtitle="قیمت و موجودی‌ای که سلورا به مشتری‌ها می‌گوید"
      wide
      actions={
        <div className="flex items-center gap-2">
          <Link
            href="/products/import"
            className="btn-secondary hidden min-h-[40px] px-3 py-2 text-[12px] sm:inline-flex"
          >
            <IconUpload size={16} />
            {dict.products.import}
          </Link>
          <Link
            href="/products?new=1"
            aria-label={dict.products.addNew}
            className="btn-primary min-h-[40px] px-3 py-2 text-[12px]"
          >
            <IconPlus size={16} />
            <span className="hidden sm:inline">{dict.products.addNew}</span>
          </Link>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-3xl space-y-4">
        {/* ------------------------------------------------------ search + count */}
        <div className="flex items-center gap-2">
          <form className="relative flex-1" action="/products" method="get" role="search">
            <label htmlFor="product-search" className="sr-only">
              {dict.common.search}
            </label>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-ink-400"
            >
              <IconSearch size={18} />
            </span>
            <input
              id="product-search"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="جستجو در نام محصول…"
              className="input ps-10"
            />
          </form>
          {q ? (
            <Link href="/products" className="btn-secondary min-h-[48px] px-3 text-[12px]">
              پاک کردن
            </Link>
          ) : null}
        </div>

        {products.length > 0 ? (
          <div className="flex items-center justify-between px-1">
            <span className="text-[12px] font-semibold text-ink-500">
              <span className="tnum">{toPersianDigits(products.length)}</span> محصول
            </span>
            <Badge tone="green">
              <span className="tnum">{toPersianDigits(available)}</span> موجود
            </Badge>
          </div>
        ) : null}

        {/* ---------------------------------------------------------- the list */}
        {products.length === 0 ? (
          q ? (
            <Empty
              title="محصولی با این نام پیدا نشد"
              subtitle={`هیچ محصولی با «${q}» مطابقت نداشت. می‌توانید جستجو را پاک کنید یا همین محصول را تازه اضافه کنید.`}
              nextStep="افزودن محصول تازه، کمتر از یک دقیقه وقت می‌برد."
              icon={<IconSearch size={22} />}
              action={
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <Link href="/products?new=1" className="btn-primary w-full">
                    <IconPlus size={17} />
                    {dict.products.addNew}
                  </Link>
                  <Link href="/products" className="btn-secondary w-full">
                    {dict.common.cancel}
                  </Link>
                </div>
              }
            />
          ) : (
            <Empty
              title="هنوز محصولی ثبت نشده است"
              subtitle="سلورا قیمت و موجودی را از محصولات ثبت‌شده‌ی شما می‌خواند؛ بدون آن، به سوال «قیمت چند؟» باید خودتان جواب بدهید."
              nextStep="اولین محصول را اضافه کنید یا فهرست آماده‌تان را یک‌جا وارد کنید."
              icon={<IconPlus size={22} />}
              action={
                <div className="flex w-full flex-col gap-2 sm:flex-row">
                  <Link href="/products?new=1" className="btn-primary w-full">
                    <IconPlus size={17} />
                    {dict.products.addNew}
                  </Link>
                  <Link href="/products/import" className="btn-secondary w-full">
                    <IconUpload size={17} />
                    {dict.products.import}
                  </Link>
                </div>
              }
            />
          )
        ) : (
          <ul className="space-y-2">
            {products.map((p: any) => (
              <li
                key={p.id}
                className="card flex items-center gap-3 p-3 transition hover:border-brand-200/70 hover:shadow-card-hover"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-ink-100 bg-canvas-soft text-lg text-ink-400">
                  {p.imageUrl ? (
                    // Remote owner-supplied URLs are not in next/image remotePatterns,
                    // so keep a plain img but make it lazy and CLS-safe.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      width={56}
                      height={56}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden="true">🛍</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-bold text-ink-900">{p.name}</div>
                  <div className="tnum mt-0.5 text-[12.5px] font-semibold text-ink-600">
                    {formatToman(p.price)} تومان
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {/* The availability switch next to this row owns the state
                        label (and the interaction) — no duplicate badge here. */}
                    {p.variants?.length ? (
                      <span className="text-[10.5px] text-ink-400">
                        <span className="tnum">{toPersianDigits(p.variants.length)}</span> تنوع
                      </span>
                    ) : null}
                  </div>
                </div>

                <ProductActions productId={p.id} currentStatus={p.status} />
              </li>
            ))}
          </ul>
        )}

        {/* Mobile-only bulk import entry point (header keeps it compact). */}
        {(products.length > 0 || q) && <div className="sm:hidden">
          <Link href="/products/import" className="btn-secondary w-full min-h-[48px]">
            <IconUpload size={17} />
            {dict.products.import}
          </Link>
        </div>}
      </div>
    </AppShell>
  );
}
