import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useCustomers } from "@/hooks/admin/useCustomers";
import AdminLayout, { formatDate } from "../AdminLayout";

function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function CustomersList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { page, limit, setPage } = usePagination(10);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, error } = useCustomers({
    search: debouncedSearch || undefined,
    status: status === "all" ? undefined : status,
    page,
    limit,
  });

  return (
    <AdminLayout
      title="Customer Report"
      subtitle="Search customers across the platform and manage their access."
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or phone…"
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
            <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Email / Phone</TableHead>
                <TableHead>Joined On</TableHead>
                <TableHead className="pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.customers ?? []).map((c) => (
                <TableRow
                  key={c._id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/customers/${c._id}`)}
                >
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-brand-gradient text-[11px] font-semibold text-white">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold">{c.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{c.email}</div>
                    <div>{c.phone}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </TableCell>
                  <TableCell className="pr-6">
                    <Badge
                      variant={c.isActive ? "ok" : "danger"}
                      className="capitalize"
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.customers?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-muted-foreground"
                  >
                    No customers match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
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
        itemLabel="customers"
      />
    </AdminLayout>
  );
}
