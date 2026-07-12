import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Truck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import PaginationBar from "@/components/admin/PaginationBar";
import { usePagination } from "@/hooks/admin/usePagination";
import { useDebouncedValue } from "@/hooks/admin/useDebouncedValue";
import { useDeliveryPartners } from "@/hooks/admin/useDeliveryPartners";
import AdminLayout, { formatDate, formatNumber } from "../AdminLayout";

const STATUS_VARIANT = {
  active: "ok",
  busy: "warn",
  inactive: "muted",
  suspended: "danger",
};

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PartnersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { page, limit, setPage } = usePagination(10);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, error } = useDeliveryPartners({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  return (
    <AdminLayout
      title="Delivery Partners"
      subtitle="Onboard and manage delivery partners across the platform."
      action={
        <Button
          onClick={() => navigate("/delivery-partners/new")}
          className="gap-2 bg-brand-gradient text-white hover:brightness-105"
        >
          <Plus className="h-4 w-4" /> Add New Delivery Partner
        </Button>
      }
    >
      <Card className="w-fit">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold leading-none">
              {formatNumber(data?.total)}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
              Total Delivery Partners
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
                <TableHead className="pl-6">Partner</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.partners ?? []).map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-gradient text-[11px] font-semibold text-white">
                          {initials(p.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{p.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          ID: {p._id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div>{p.phone}</div>
                    <div>{p.email}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{p.vehicle?.model ?? "—"}</div>
                    <div className="text-xs capitalize text-muted-foreground">
                      {p.vehicle?.type?.replace(/_/g, " ")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_VARIANT[p.status] ?? "muted"}
                      className="capitalize"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.joinedOn ?? p.createdAt)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatNumber(p.totalDeliveries)}
                  </TableCell>
                  <TableCell>★ {p.rating?.toFixed?.(1) ?? "—"}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/delivery-partners/${p._id}`)}
                      className="rounded-lg border border-brand-orange px-3 py-1.5 text-xs font-semibold text-brand-orange hover:bg-brand-orange/10"
                    >
                      View Profile
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.partners?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No delivery partners match your filters.
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
        itemLabel="partners"
      />
    </AdminLayout>
  );
}
