"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  MonitorPlay,
  Package2,
  Search,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/shared/Input";
import { Badge } from "@/components/shared/Badge";
import { client } from "@/sanity/lib/client";
import { cateringPackagesQuery, menuItemsQuery } from "@/sanity/lib/queries";
import { cn } from "@/lib/utils";

type CatalogView = "items" | "packages";

interface CategoryRef {
  title?: string;
  slug?: string;
  type?: string;
  description?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  category?: CategoryRef;
  description?: string;
  priceTitle?: string;
  price?: string | number;
  dietary?: string[];
  imageUrl?: string;
  isBestseller?: boolean;
  useCaseLabels?: string[];
  inclusionsSummary?: string;
  selectionTitle?: string;
  selectionItems?: string[];
}

interface PricingTier {
  label?: string;
  range?: string;
  price?: number;
}

interface IncludedItem {
  name: string;
  description?: string;
  priceTitle?: string;
  price?: string | number;
  dietary?: string[];
  isBestseller?: boolean;
  imageUrl?: string;
}

interface CateringPackage {
  _id: string;
  name: string;
  category?: CategoryRef;
  description?: string;
  startingAt?: string;
  imageUrl?: string;
  useCaseLabels?: string[];
  pricingTier?: PricingTier[];
  includedItems?: IncludedItem[];
}

interface CatalogData {
  items: MenuItem[];
  packages: CateringPackage[];
}

const DIETARY_LABELS: Record<string, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  gf: "Gluten-Free",
  df: "Dairy-Free",
  nf: "Nut-Free",
};

const DIETARY_STYLES: Record<string, string> = {
  vegan: "bg-green-100 text-green-800 border border-green-200",
  vegetarian: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  gf: "bg-amber-100 text-amber-900 border border-amber-200",
  df: "bg-sky-100 text-sky-900 border border-sky-200",
  nf: "bg-orange-100 text-orange-900 border border-orange-200",
};

function toTitleCase(value?: string) {
  if (!value) return "Uncategorized";

  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getCategoryValue(category?: CategoryRef) {
  return category?.slug || category?.title || "uncategorized";
}

function getCategoryLabel(category?: CategoryRef) {
  return category?.title || toTitleCase(category?.slug);
}

function formatPrice(price?: string | number) {
  if (price == null || price === "") return null;
  if (typeof price === "number") return `$${price.toFixed(2)}`;
  if (price.startsWith("$")) return price;
  return `$${price}`;
}

function formatCurrency(price?: number) {
  if (price == null) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

function matchesSearch(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

export default function MenusPage() {
  const [view, setView] = useState<CatalogView>("items");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [presentationMode, setPresentationMode] = useState(true);

  const { data, isLoading } = useQuery<CatalogData>({
    queryKey: ["digital-catalog"],
    queryFn: async () => {
      const [items, packages] = await Promise.all([
        client.fetch(menuItemsQuery),
        client.fetch(cateringPackagesQuery),
      ]);

      return {
        items: items ?? [],
        packages: packages ?? [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.items ?? [];
  const packages = data?.packages ?? [];
  const activeRecords = view === "items" ? items : packages;

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const dynamicCategories = activeRecords
      .map((record) => record.category)
      .filter(Boolean)
      .map((entry) => ({
        value: getCategoryValue(entry),
        label: getCategoryLabel(entry),
        description: entry?.description,
      }))
      .filter((entry) => {
        if (seen.has(entry.value)) return false;
        seen.add(entry.value);
        return true;
      });

    return [{ value: "All", label: "All", description: undefined }, ...dynamicCategories];
  }, [activeRecords]);

  const filteredItems = items.filter((item) => {
    const itemCategory = getCategoryValue(item.category);
    const matchesCategory = category === "All" || itemCategory === category;
    const haystack = [
      item.name,
      item.description,
      item.inclusionsSummary,
      item.selectionTitle,
      item.selectionItems?.join(" "),
      item.useCaseLabels?.join(" "),
      getCategoryLabel(item.category),
      item.dietary?.map((tag) => DIETARY_LABELS[tag] ?? tag).join(" "),
    ]
      .filter(Boolean)
      .join(" ");

    return matchesCategory && (!search || matchesSearch(haystack, search));
  });

  const filteredPackages = packages.filter((pkg) => {
    const packageCategory = getCategoryValue(pkg.category);
    const matchesCategory = category === "All" || packageCategory === category;
    const haystack = [
      pkg.name,
      pkg.description,
      pkg.startingAt,
      pkg.useCaseLabels?.join(" "),
      getCategoryLabel(pkg.category),
      pkg.pricingTier
        ?.map((tier) => `${tier.label || ""} ${tier.range || ""} ${formatCurrency(tier.price) || ""}`)
        .join(" "),
      pkg.includedItems
        ?.map((item) => `${item.name} ${item.description || ""} ${item.dietary?.join(" ") || ""}`)
        .join(" "),
    ]
      .filter(Boolean)
      .join(" ");

    return matchesCategory && (!search || matchesSearch(haystack, search));
  });

  const emptyStateLabel =
    view === "items"
      ? "No individual items match this search."
      : "No event packages match this search.";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="rounded-[2rem] border border-gray-border bg-gradient-to-br from-white via-[#F8F7F4] to-[#F4F0E8] p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge className="w-fit bg-teal-base/10 text-teal-dark border border-teal-base/15 px-3 py-1">
              Sales Enablement
            </Badge>
            <div>
              <h1 className="text-3xl font-bold font-heading text-teal-dark">Digital Catalog</h1>
              <p className="mt-2 max-w-2xl text-sm text-brown/70">
                Presentation-ready menu browsing for field reps. Switch between individual items and
                full event packages, then filter live categories pulled directly from Sanity.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPresentationMode((current) => !current)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                presentationMode
                  ? "border-teal-base bg-teal-base text-white"
                  : "border-gray-border bg-white text-brown/70 hover:border-teal-base/40"
              )}
            >
              <MonitorPlay className="h-4 w-4" />
              {presentationMode ? "Presentation Mode On" : "Presentation Mode Off"}
            </button>

            <a
              href="/studio"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gray-border bg-white px-4 py-2 text-sm font-semibold text-teal-base transition-colors hover:border-teal-base/40 hover:text-teal-dark"
            >
              Edit in Sanity Studio
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-gray-border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown/40" />
            <Input
              placeholder={view === "items" ? "Search dishes, tags, or categories..." : "Search packages, tiers, or included items..."}
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setView("items");
                setCategory("All");
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                view === "items"
                  ? "border-teal-base bg-teal-base text-white"
                  : "border-gray-border bg-white text-brown/70 hover:border-teal-base/40"
              )}
            >
              <UtensilsCrossed className="h-4 w-4" />
              Individual Items
            </button>
            <button
              type="button"
              onClick={() => {
                setView("packages");
                setCategory("All");
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                view === "packages"
                  ? "border-teal-base bg-teal-base text-white"
                  : "border-gray-border bg-white text-brown/70 hover:border-teal-base/40"
              )}
            >
              <Package2 className="h-4 w-4" />
              Event Packages
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((entry) => (
            <button
              key={entry.value}
              type="button"
              onClick={() => setCategory(entry.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                category === entry.value
                  ? "border-teal-base bg-teal-base/10 text-teal-dark"
                  : "border-gray-border bg-white text-brown/70 hover:border-teal-base/40"
              )}
              title={entry.description || entry.label}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-gray-border bg-white py-24 text-brown/40">
          <Loader2 className="mb-3 h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Loading digital catalog...</p>
        </div>
      ) : view === "items" ? (
        filteredItems.length === 0 ? (
          <EmptyState message={items.length === 0 ? "Add active menu items in Sanity Studio to get started." : emptyStateLabel} />
        ) : (
          <div
            className={cn(
              "grid gap-5",
              presentationMode
                ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {filteredItems.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-[1.75rem] border border-gray-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-base/20 hover:shadow-md"
              >
                <div className={cn("relative w-full bg-gray-bg", presentationMode ? "h-64" : "h-48")}>
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes={presentationMode ? "(max-width: 1024px) 100vw, 33vw" : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-cream/40">
                      <UtensilsCrossed className="h-10 w-10 text-brown/20" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                    <Badge className="border border-white/30 bg-white/90 text-brown shadow-sm">
                      {getCategoryLabel(item.category)}
                    </Badge>
                    {item.isBestseller ? (
                      <Badge className="border-none bg-orange text-white shadow-sm">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Bestseller
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-teal-dark">{item.name}</h2>
                      {item.description ? (
                        <p className={cn("mt-2 text-sm text-brown/70", presentationMode ? "line-clamp-4" : "line-clamp-3")}>
                          {item.description}
                        </p>
                      ) : null}
                    </div>

                    {item.price != null ? (
                      <div className="min-w-fit rounded-2xl bg-teal-dark px-3 py-2 text-right text-white shadow-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                          {item.priceTitle || "Price"}
                        </p>
                        <p className="mt-1 text-base font-bold">{formatPrice(item.price)}</p>
                      </div>
                    ) : null}
                  </div>

                  {item.useCaseLabels && item.useCaseLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.useCaseLabels.map((label) => (
                        <Badge key={label} variant="neutral" className="bg-gray-bg px-2.5 py-1 text-[11px]">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  {item.dietary && item.dietary.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {item.dietary.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                            DIETARY_STYLES[tag] || "border border-gray-border bg-gray-bg text-brown"
                          )}
                        >
                          {DIETARY_LABELS[tag] ?? toTitleCase(tag)}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {presentationMode && (item.inclusionsSummary || item.selectionItems?.length) ? (
                    <div className="rounded-2xl bg-[#F8F7F4] p-4">
                      {item.inclusionsSummary ? (
                        <p className="text-sm text-brown/70">{item.inclusionsSummary}</p>
                      ) : null}
                      {item.selectionItems && item.selectionItems.length > 0 ? (
                        <div className={cn(item.inclusionsSummary ? "mt-3" : "")}>
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brown/45">
                            {item.selectionTitle || "Selections"}
                          </p>
                          <p className="mt-2 text-sm text-brown/70">{item.selectionItems.join(", ")}</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )
      ) : filteredPackages.length === 0 ? (
        <EmptyState message={packages.length === 0 ? "Add active catering packages in Sanity Studio to get started." : emptyStateLabel} />
      ) : (
        <div
          className={cn(
            "grid gap-6",
            presentationMode ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 lg:grid-cols-2"
          )}
        >
          {filteredPackages.map((pkg) => (
            <article
              key={pkg._id}
              className="overflow-hidden rounded-[1.85rem] border border-gray-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-base/20 hover:shadow-md"
            >
              <div className={cn("relative w-full bg-gray-bg", presentationMode ? "h-72" : "h-56")}>
                {pkg.imageUrl ? (
                  <Image
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-cream/40">
                    <Package2 className="h-12 w-12 text-brown/20" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="border border-white/25 bg-white/15 text-white backdrop-blur-sm">
                      {getCategoryLabel(pkg.category)}
                    </Badge>
                    <Badge className="border-none bg-orange text-white">Event Package</Badge>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold font-heading">{pkg.name}</h2>
                      {pkg.description ? (
                        <p className="mt-2 max-w-2xl text-sm text-white/80">{pkg.description}</p>
                      ) : null}
                    </div>

                    {pkg.startingAt ? (
                      <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                          Starting At
                        </p>
                        <p className="mt-1 text-xl font-bold">{pkg.startingAt}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                {pkg.useCaseLabels && pkg.useCaseLabels.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pkg.useCaseLabels.map((label) => (
                      <Badge key={label} variant="neutral" className="bg-gray-bg px-2.5 py-1 text-[11px]">
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {pkg.pricingTier && pkg.pricingTier.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brown/45">
                        Pricing Tiers
                      </h3>
                      <span className="text-xs text-brown/50">Per platter or per person, depending on package</span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {pkg.pricingTier.map((tier, index) => (
                        <div key={`${pkg._id}-tier-${index}`} className="rounded-2xl border border-gray-border bg-[#F8F7F4] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-brown">{tier.label || `Tier ${index + 1}`}</p>
                              {tier.range ? <p className="mt-1 text-sm text-brown/60">{tier.range}</p> : null}
                            </div>
                            {tier.price != null ? (
                              <p className="text-base font-bold text-teal-dark">{formatCurrency(tier.price)}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {pkg.includedItems && pkg.includedItems.length > 0 ? (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brown/45">
                        Included Items
                      </h3>
                      <span className="text-xs text-brown/50">{pkg.includedItems.length} total</span>
                    </div>
                    <div className="grid gap-3">
                      {pkg.includedItems.slice(0, presentationMode ? 4 : 3).map((item) => (
                        <div
                          key={`${pkg._id}-${item.name}`}
                          className="rounded-2xl border border-gray-border/80 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-brown">{item.name}</p>
                                {item.isBestseller ? (
                                  <Badge className="border-none bg-orange text-white">Bestseller</Badge>
                                ) : null}
                              </div>
                              {item.description ? (
                                <p className="mt-1 text-sm text-brown/65">{item.description}</p>
                              ) : null}
                            </div>

                            {item.price != null ? (
                              <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown/45">
                                  {item.priceTitle || "Price"}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-teal-dark">{formatPrice(item.price)}</p>
                              </div>
                            ) : null}
                          </div>

                          {item.dietary && item.dietary.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.dietary.map((tag) => (
                                <span
                                  key={`${pkg._id}-${item.name}-${tag}`}
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
                                    DIETARY_STYLES[tag] || "border border-gray-border bg-gray-bg text-brown"
                                  )}
                                >
                                  {DIETARY_LABELS[tag] ?? toTitleCase(tag)}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-gray-border bg-white py-24 text-brown/40">
      <UtensilsCrossed className="mb-4 h-12 w-12" />
      <p className="text-base font-medium text-brown/70">Nothing to show yet</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}
