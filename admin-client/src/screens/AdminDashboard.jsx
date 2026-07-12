import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  CheckCircle2,
  ClipboardList,
  Headset,
  Plus,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  useDashboardOverview,
  useRevenueOverview,
  useTopDeliveryPartners,
  useTopStores,
} from "@/hooks/admin/useDashboard";
import { useStores } from "@/hooks/admin/useStores";
import AdminLayout, {
  formatDate,
  formatNumber,
  formatPrice,
} from "./AdminLayout";

const RANGES = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

function pointLabel(date, range) {
  const d = new Date(date);
  if (range === "day")
    return d.toLocaleTimeString("en-IN", { hour: "2-digit" });
  if (range === "year")
    return d.toLocaleDateString("en-IN", { month: "short" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function QuickAction({ icon: Icon, iconClass, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 items-center gap-3 rounded-2xl border border-brand-cream/60 bg-white p-4 text-left shadow-sm transition hover:border-brand-orange/40"
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconClass}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </span>
    </button>
  );
}

function StatCard({ icon: Icon, label, value, breakdown }) {
  return (
    <Card>
      <CardContent className="p-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-orange/10 text-brand-orange">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <strong className="mt-3 block text-2xl font-bold leading-none">
          {value}
        </strong>
        <span className="mt-1 block text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {breakdown ? (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-brand-cream/60 pt-2.5 text-xs">
            {breakdown.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${b.dot}`} />
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-semibold">{b.value}</span>
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [range, setRange] = useState("month");

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useDashboardOverview();
  const { data: revenueData, isLoading: revenueLoading } =
    useRevenueOverview(range);
  const { data: topStores } = useTopStores(5);
  const { data: topPartners } = useTopDeliveryPartners(5);
  const { data: pendingStores } = useStores({
    status: "pending",
    page: 1,
    limit: 5,
  });

  if (overviewError) {
    return (
      <AdminLayout title="Dashboard">
        <p className="text-sm text-brand-maroon">
          Failed to load dashboard: {overviewError.message}
        </p>
      </AdminLayout>
    );
  }

  const avgOrderValue =
    overview?.revenue?.orders > 0
      ? overview.revenue.total / overview.revenue.orders
      : 0;

  return (
    <AdminLayout
      title={`Dashboard 👋`}
      subtitle={`Welcome back, ${user?.name?.split(" ")[0] ?? "Admin"}! Here's what's happening on the platform today.`}
    >
      {/* Quick actions */}
      <section className="flex flex-col gap-4 sm:flex-row">
        <QuickAction
          icon={Plus}
          iconClass="bg-[#FCE9E4] text-brand-orange"
          title="Add Delivery Partner"
          subtitle="Onboard a new delivery partner"
          onClick={() => navigate("/delivery-partners/new")}
        />
        <QuickAction
          icon={ClipboardList}
          iconClass="bg-[#FFF3E0] text-[#D9480F]"
          title="Pending Store Approvals"
          subtitle={`${overview?.stores?.pending ?? 0} awaiting review`}
          onClick={() => navigate("/stores?status=pending")}
        />
        <QuickAction
          icon={Headset}
          iconClass="bg-[#E7F0FB] text-[#1565C0]"
          title="Open Support Tickets"
          subtitle={`${overview?.tickets?.open ?? 0} need a response`}
          onClick={() => navigate("/tickets?status=open")}
        />
      </section>

      {/* Stat cards */}
      {overviewLoading ? (
        <p className="text-sm text-muted-foreground">Loading platform stats…</p>
      ) : (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Store}
            label="Total Stores"
            value={formatNumber(
              (overview?.stores?.pending ?? 0) +
                (overview?.stores?.active ?? 0) +
                (overview?.stores?.suspended ?? 0) +
                (overview?.stores?.rejected ?? 0) +
                (overview?.stores?.expired ?? 0),
            )}
            breakdown={[
              {
                label: "Active",
                value: formatNumber(overview?.stores?.active),
                dot: "bg-[#2E7D32]",
              },
              {
                label: "Pending",
                value: formatNumber(overview?.stores?.pending),
                dot: "bg-[#D9480F]",
              },
            ]}
          />
          <StatCard
            icon={Headset}
            label="Support Tickets"
            value={formatNumber(
              (overview?.tickets?.open ?? 0) +
                (overview?.tickets?.in_progress ?? 0) +
                (overview?.tickets?.resolved ?? 0) +
                (overview?.tickets?.closed ?? 0),
            )}
            breakdown={[
              {
                label: "Open",
                value: formatNumber(overview?.tickets?.open),
                dot: "bg-[#B11226]",
              },
              {
                label: "Resolved",
                value: formatNumber(overview?.tickets?.resolved),
                dot: "bg-[#2E7D32]",
              },
            ]}
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={formatNumber(overview?.customers)}
          />
          <StatCard
            icon={Truck}
            label="Total Revenue"
            value={formatPrice(overview?.revenue?.total)}
            breakdown={[
              {
                label: "Orders",
                value: formatNumber(overview?.revenue?.orders),
                dot: "bg-[#1565C0]",
              },
              {
                label: "Avg Order",
                value: formatPrice(avgOrderValue),
                dot: "bg-[#D9480F]",
              },
            ]}
          />
        </section>
      )}

      {/* Revenue chart */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <h2 className="text-base font-bold">Revenue Overview</h2>
          <div className="flex gap-1 rounded-lg border border-brand-cream/70 p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRange(r.value)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  range === r.value
                    ? "bg-brand-gradient text-white"
                    : "text-muted-foreground hover:bg-brand-cream/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <p className="text-sm text-muted-foreground">Loading chart…</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData?.points ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F6EFE9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => pointLabel(d, range)}
                    tick={{ fontSize: 11, fill: "#8a7566" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#8a7566" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "revenue" ? formatPrice(value) : value,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]}
                    labelFormatter={(d) => pointLabel(d, range)}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D9480F"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#1565C0"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold">Top Performing Stores</h2>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-brand-cream/60">
                  <TableHead className="pl-5">Store</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead className="pr-5">Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(topStores ?? []).map((s) => (
                  <TableRow key={s.restaurantId}>
                    <TableCell className="pl-5 font-semibold">
                      {s.name}
                    </TableCell>
                    <TableCell>{formatPrice(s.revenue)}</TableCell>
                    <TableCell className="pr-5">
                      ★ {s.avgRating?.toFixed?.(1) ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {topStores?.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No data yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <h2 className="text-base font-bold">Store Approval Queue</h2>
            <button
              type="button"
              onClick={() => navigate("/stores?status=pending")}
              className="text-xs font-semibold text-brand-orange"
            >
              View all
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pendingStores?.stores ?? []).map((s) => (
              <div
                key={s._id}
                className="flex cursor-pointer items-center justify-between border-b border-[#F6EFE9] pb-3 last:border-0 last:pb-0"
                onClick={() => navigate(`/stores/${s._id}`)}
              >
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.address?.city ?? "—"}
                  </p>
                </div>
                <Badge variant="warn">Pending</Badge>
              </div>
            ))}
            {pendingStores?.stores?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No stores awaiting approval.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold">
              Most Active Delivery Partners
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {(topPartners ?? []).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between border-b border-[#F6EFE9] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold">{p.fullName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(p.totalDeliveries)} deliveries
                  </p>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#D9480F]">
                  <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                  {p.rating?.toFixed?.(1) ?? "—"}
                </span>
              </div>
            ))}
            {topPartners?.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No delivery data yet.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AdminLayout>
  );
}
