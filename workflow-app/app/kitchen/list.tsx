"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Order } from "@/lib/pizza";

type Item = { order: Order; runId: string; updatedAt: string };

export function KitchenList({ orders }: { orders: Item[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(id);
  }, [router]);

  async function markReady(orderId: string) {
    setBusyId(orderId);
    setErrors(({ [orderId]: _, ...rest }) => rest);
    try {
      const res = await fetch("/api/kitchen/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setErrors((e) => ({ ...e, [orderId]: data.error ?? "Something went wrong. Try again." }));
      }
    } catch {
      setErrors((e) => ({ ...e, [orderId]: "Network error. Try again." }));
    }
    setBusyId(null);
    router.refresh();
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <ul className="mt-8 grid gap-3">
      {orders.map(({ order }) => (
        <li
          key={order.id}
          className="flex items-center justify-between rounded-lg border border-stone-300 bg-white p-4"
        >
          <div>
            <p className="font-semibold">
              {order.size} {order.pizza}
            </p>
            <p className="text-sm text-stone-500">
              {order.customerName} · {order.crust} crust
            </p>
            {errors[order.id] && (
              <p role="alert" className="mt-1 text-sm text-red-700">{errors[order.id]}</p>
            )}
          </div>
          <button
            onClick={() => markReady(order.id)}
            disabled={busyId === order.id}
            className="rounded-md px-4 py-2 text-white font-semibold disabled:opacity-60"
            style={{ background: "var(--pizza-red)" }}
          >
            {busyId === order.id ? "Sending..." : "Mark ready"}
          </button>
        </li>
      ))}
    </ul>
  );
}
