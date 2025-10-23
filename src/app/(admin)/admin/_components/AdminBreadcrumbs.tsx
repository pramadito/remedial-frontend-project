"use client";

import Link from "next/link";

type Item = { label: string; href?: string };

export default function AdminBreadcrumbs({ items }: { items: Item[] }) {
  return (
    <nav className="text-sm" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-muted-foreground">
        {items.map((item, idx) => {
          const last = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "text-foreground" : ""}>{item.label}</span>
              )}
              {!last && <span className="opacity-40">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
