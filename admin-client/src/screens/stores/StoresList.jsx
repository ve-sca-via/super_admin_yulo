import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import PaginationBar from "@/components/admin/PaginationBar";
import { usePagination } from "@/hooks/admin/usePagination";
import { useDebouncedValue } from "@/hooks/admin/useDebouncedValue";
import { useStores } from "@/hooks/admin/useStores";
import AdminLayout, { formatDate } from "../AdminLayout";

const TABS = [
  { value: "", label: "All Stores" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
];

const PLANS = ["all", "trial", "basic", "standard", "premium"];

const STATUS_VARIANT = {
  pending: "warn",
  active: "ok",
  suspended: "danger",
  rejected: "danger",
  expired: "muted",
};
const DONUT_COLORS = {
  pending: "#D9480F",
  active: "#2E7D32",
  suspended: "#B11226",
  rejected: "#8a7566",
  expired: "#9CA3AF",
};

function RecentRegistrations() {
  const navigate = useNavigate();
  const { data } = useStores({ page: 1, limit: 5 });

  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-sm font-bold">Recent Store Registrations</h2>
      </CardHeader>
      <CardContent className="space-y-3">
        {(data?.stores ?? []).map((s) => (
          <div
            key={s._id}
            className="flex cursor-pointer items-center justify-between border-b border-[#F6EFE9] pb-2.5 last:border-0 last:pb-0"
            onClick={() => navigate(`/stores/${s._id}`)}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.address?.city ?? "—"}
              </p>
            </div>
            <Badge
              variant={STATUS_VARIANT[s.approvalStatus] ?? "muted"}
              className="shrink-0 capitalize"
            >
              {s.approvalStatus}
            </Badge>
          </div>
        ))}
        {data?.stores?.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No stores yet.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export default function StoresList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const [search, setSearch] = useState("");
  const [plan, setPlan] = useState("all");
  const { page, limit, setPage } = usePagination(10);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, error } = useStores({
    status: status || undefined,
    plan: plan === "all" ? undefined : plan,
    search: debouncedSearch || undefined,
    page,
    limit,
  });

  const counts = data?.statusCounts;
  const total = counts
    ? counts.pending +
      counts.active +
      counts.suspended +
      counts.rejected +
      counts.expired
    : 0;

  const donutData = useMemo(
    () =>
      counts
        ? Object.entries(counts)
            .filter(([, v]) => v > 0)
            .map(([k, v]) => ({ name: k, value: v }))
        : [],
    [counts],
  );

  function setStatus(next) {
    setPage(1);
    if (next) setSearchParams({ status: next });
    else setSearchParams({});
  }

  return (
    <AdminLayout
      title="Store Management"
      subtitle="Approve, monitor, and manage every store on the platform."
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {TABS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatus(t.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  status === t.value
                    ? "bg-brand-gradient text-white"
                    : "border border-brand-cream bg-white text-[#5a403e] hover:bg-brand-cream/30",
                )}
              >
                {t.label}
                {t.value && counts
                  ? ` (${counts[t.value] ?? 0})`
                  : t.value === "" && counts
                    ? ` (${total})`
                    : ""}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search store name…"
                className="pl-9"
              />
            </div>
            <Select
              value={plan}
              onValueChange={(v) => {
                setPlan(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p === "all" ? "All Plans" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="text-sm text-brand-maroon">{error.message}</p>
          ) : null}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-brand-cream/60">
                    <TableHead className="pl-6">Store</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data?.stores ?? []).map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="pl-6 font-semibold">
                        {s.name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.ownerId?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div>{s.ownerId?.email}</div>
                        <div>{s.ownerId?.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="muted" className="capitalize">
                          {s.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.address?.city ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={STATUS_VARIANT[s.approvalStatus] ?? "muted"}
                          className="capitalize"
                        >
                          {s.approvalStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(s.submittedAt ?? s.createdAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/stores/${s._id}`)}
                          className="rounded-lg border border-brand-orange px-3 py-1.5 text-xs font-semibold text-brand-orange hover:bg-brand-orange/10"
                        >
                          View Profile
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!isLoading && data?.stores?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        No stores match your filters.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <PaginationBar
            page={data?.page ?? page}
            pages={data?.pages}
            total={data?.total}
            onPageChange={setPage}
            itemLabel="stores"
          />
        </div>

        <div className="space-y-4">
          <RecentRegistrations />
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-sm font-bold">Store Status Overview</h2>
            </CardHeader>
            <CardContent>
              {donutData.length ? (
                <div className="relative h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {donutData.map((d) => (
                          <Cell
                            key={d.name}
                            fill={DONUT_COLORS[d.name] ?? "#9CA3AF"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <p className="text-xl font-bold leading-none">{total}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Total Stores
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No data yet.
                </p>
              )}
              <div className="mt-3 space-y-1.5">
                {donutData.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="flex items-center gap-2 capitalize">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: DONUT_COLORS[d.name] }}
                      />
                      {d.name}
                    </span>
                    <span className="font-semibold">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </AdminLayout>
  );
}
