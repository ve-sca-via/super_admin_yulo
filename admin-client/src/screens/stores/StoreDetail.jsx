import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Trash2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import EditableCard from "@/components/admin/EditableCard";
import {
  useApproveStore,
  useAddStoreNote,
  useReactivateStore,
  useRejectStore,
  useRemoveStore,
  useStore,
  useSuspendStore,
  useUpdateStore,
  useVerifyDocument,
} from "@/hooks/admin/useStores";
import AdminLayout, { formatDate } from "../AdminLayout";

const STATUS_VARIANT = {
  pending: "warn",
  active: "ok",
  suspended: "danger",
  rejected: "danger",
  expired: "muted",
};

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function hhmm(value) {
  if (value === undefined || value === null) return "";
  const s = String(value).padStart(4, "0");
  return `${s.slice(0, 2)}:${s.slice(2)}`;
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value ?? "—"}</p>
    </div>
  );
}

export default function StoreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: store, isLoading, error } = useStore(id);

  const approve = useApproveStore(id);
  const reject = useRejectStore(id);
  const suspend = useSuspendStore(id);
  const reactivate = useReactivateStore(id);
  const update = useUpdateStore(id);
  const addNote = useAddStoreNote(id);
  const verifyDoc = useVerifyDocument(id);
  const remove = useRemoveStore(id);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [note, setNote] = useState("");

  const [editingHours, setEditingHours] = useState(false);
  const [hoursForm, setHoursForm] = useState([]);
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({});
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [businessForm, setBusinessForm] = useState({});
  const [editingLicenses, setEditingLicenses] = useState(false);
  const [licensesForm, setLicensesForm] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  useEffect(() => {
    if (!store) return;
    setHoursForm(
      DAYS.map((day) => {
        const existing = store.operatingHours?.find((h) => h.day === day);
        return (
          existing ?? { day, isOpen: true, openTime: 900, closeTime: 2200 }
        );
      }),
    );
    setDeliveryForm(store.delivery ?? {});
    setBusinessForm(store.settings ?? {});
    setLicensesForm(store.settings ?? {});
    setProfileForm({
      name: store.name ?? "",
      description: store.description ?? "",
      cuisineTypes: (store.cuisineTypes ?? []).join(", "),
      street: store.address?.street ?? "",
      city: store.address?.city ?? "",
      state: store.address?.state ?? "",
      pincode: store.address?.pincode ?? "",
    });
  }, [store]);

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Store Management" title="Loading…">
        <p className="text-sm text-muted-foreground">Loading store…</p>
      </AdminLayout>
    );
  }
  if (error || !store) {
    return (
      <AdminLayout breadcrumb="Store Management" title="Store not found">
        <p className="text-sm text-brand-maroon">
          {error?.message ?? "This store could not be found."}
        </p>
      </AdminLayout>
    );
  }

  const status = store.approvalStatus;

  return (
    <AdminLayout
      breadcrumb="Store Management > Store Details"
      title={
        <span className="flex items-center gap-3">
          {store.name}
          <Badge
            variant={STATUS_VARIANT[status] ?? "muted"}
            className="capitalize"
          >
            {status}
          </Badge>
        </span>
      }
      subtitle={`Store ID: ${store._id} · Submitted on ${formatDate(store.submittedAt ?? store.createdAt)}`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {status === "pending" ? (
            <>
              <Button
                size="sm"
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
                className="gap-1.5 bg-brand-gradient text-white hover:brightness-105"
              >
                <CheckCircle2 className="h-4 w-4" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectOpen(true)}
                className="gap-1.5 text-brand-maroon"
              >
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </>
          ) : null}
          {status === "active" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => suspend.mutate()}
              disabled={suspend.isPending}
              className="text-brand-maroon"
            >
              Suspend
            </Button>
          ) : null}
          {status === "suspended" ? (
            <Button
              size="sm"
              onClick={() => reactivate.mutate()}
              disabled={reactivate.isPending}
              className="bg-brand-gradient text-white hover:brightness-105"
            >
              Reactivate
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setRemoveOpen(true)}
            className="gap-1.5 text-brand-maroon"
          >
            <Trash2 className="h-4 w-4" /> Remove Store
          </Button>
        </div>
      }
    >
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Profile */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-5 p-5">
              {store.logo ? (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="h-20 w-20 rounded-xl border border-brand-cream/70 object-cover"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-xl border border-brand-cream/70 bg-brand-cream/30 text-lg font-bold">
                  {store.name?.slice(0, 2)?.toUpperCase()}
                </div>
              )}
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Owner Name" value={store.ownerId?.name} />
                <Field label="Email" value={store.ownerId?.email} />
                <Field label="Phone" value={store.ownerId?.phone} />
                <Field
                  label="Plan"
                  value={<span className="capitalize">{store.plan}</span>}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <EditableCard
            title="Business Hours"
            editing={editingHours}
            saving={update.isPending}
            onEdit={() => setEditingHours(true)}
            onCancel={() => setEditingHours(false)}
            onSave={() =>
              update.mutate(
                { operatingHours: hoursForm },
                { onSuccess: () => setEditingHours(false) },
              )
            }
            editChildren={hoursForm.map((h, i) => (
              <div
                key={h.day}
                className="flex items-center gap-2 sm:col-span-2"
              >
                <span className="w-24 shrink-0 text-sm capitalize">
                  {h.day}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setHoursForm((cur) =>
                      cur.map((x, xi) =>
                        xi === i ? { ...x, isOpen: !x.isOpen } : x,
                      ),
                    )
                  }
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${h.isOpen ? "bg-[#E8F5EC] text-[#2E7D32]" : "bg-[#F3F4F6] text-[#5F5F5F]"}`}
                >
                  {h.isOpen ? "Open" : "Closed"}
                </button>
                {h.isOpen ? (
                  <>
                    <Input
                      type="time"
                      value={hhmm(h.openTime)}
                      onChange={(e) => {
                        const [hh, mm] = e.target.value.split(":");
                        setHoursForm((cur) =>
                          cur.map((x, xi) =>
                            xi === i
                              ? {
                                  ...x,
                                  openTime: Number(hh) * 100 + Number(mm),
                                }
                              : x,
                          ),
                        );
                      }}
                      className="w-32"
                    />
                    <Input
                      type="time"
                      value={hhmm(h.closeTime)}
                      onChange={(e) => {
                        const [hh, mm] = e.target.value.split(":");
                        setHoursForm((cur) =>
                          cur.map((x, xi) =>
                            xi === i
                              ? {
                                  ...x,
                                  closeTime: Number(hh) * 100 + Number(mm),
                                }
                              : x,
                          ),
                        );
                      }}
                      className="w-32"
                    />
                  </>
                ) : null}
              </div>
            ))}
          >
            {DAYS.map((day) => {
              const h = store.operatingHours?.find((x) => x.day === day);
              return (
                <div
                  key={day}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize text-muted-foreground">
                    {day}
                  </span>
                  <span className="font-medium">
                    {h?.isOpen === false
                      ? "Closed"
                      : h
                        ? `${hhmm(h.openTime)} – ${hhmm(h.closeTime)}`
                        : "—"}
                  </span>
                </div>
              );
            })}
          </EditableCard>

          {/* Delivery Charges */}
          <EditableCard
            title="Delivery Charges"
            editing={editingDelivery}
            saving={update.isPending}
            onEdit={() => setEditingDelivery(true)}
            onCancel={() => setEditingDelivery(false)}
            onSave={() =>
              update.mutate(
                { delivery: deliveryForm },
                { onSuccess: () => setEditingDelivery(false) },
              )
            }
            editChildren={
              <>
                <div className="space-y-1.5">
                  <Label>Radius (km)</Label>
                  <Input
                    type="number"
                    value={deliveryForm.radiusKm ?? ""}
                    onChange={(e) =>
                      setDeliveryForm((f) => ({
                        ...f,
                        radiusKm: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Base Charge</Label>
                  <Input
                    type="number"
                    value={deliveryForm.baseCharge ?? ""}
                    onChange={(e) =>
                      setDeliveryForm((f) => ({
                        ...f,
                        baseCharge: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Free Threshold</Label>
                  <Input
                    type="number"
                    value={deliveryForm.freeThreshold ?? ""}
                    onChange={(e) =>
                      setDeliveryForm((f) => ({
                        ...f,
                        freeThreshold: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estimated Minutes</Label>
                  <Input
                    type="number"
                    value={deliveryForm.estimatedMinutes ?? ""}
                    onChange={(e) =>
                      setDeliveryForm((f) => ({
                        ...f,
                        estimatedMinutes: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </>
            }
          >
            <Field label="Radius (km)" value={store.delivery?.radiusKm} />
            <Field label="Base Charge" value={store.delivery?.baseCharge} />
            <Field
              label="Free Threshold"
              value={store.delivery?.freeThreshold ?? "—"}
            />
            <Field
              label="Estimated Time"
              value={
                store.delivery?.estimatedMinutes
                  ? `${store.delivery.estimatedMinutes} mins`
                  : "—"
              }
            />
          </EditableCard>

          {/* Business Details */}
          <EditableCard
            title="Business Details"
            editing={editingBusiness}
            saving={update.isPending}
            onEdit={() => setEditingBusiness(true)}
            onCancel={() => setEditingBusiness(false)}
            onSave={() =>
              update.mutate(
                { settings: { ...store.settings, ...businessForm } },
                { onSuccess: () => setEditingBusiness(false) },
              )
            }
            editChildren={
              <>
                <div className="space-y-1.5">
                  <Label>Legal Entity Type</Label>
                  <Input
                    value={businessForm.legalEntityType ?? ""}
                    onChange={(e) =>
                      setBusinessForm((f) => ({
                        ...f,
                        legalEntityType: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Owner Name</Label>
                  <Input
                    value={businessForm.ownerName ?? ""}
                    onChange={(e) =>
                      setBusinessForm((f) => ({
                        ...f,
                        ownerName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>PAN Number</Label>
                  <Input
                    value={businessForm.panNumber ?? ""}
                    onChange={(e) =>
                      setBusinessForm((f) => ({
                        ...f,
                        panNumber: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            }
          >
            <Field
              label="Legal Entity Type"
              value={store.settings?.legalEntityType}
            />
            <Field label="Owner Name" value={store.settings?.ownerName} />
            <Field label="PAN Number" value={store.settings?.panNumber} />
          </EditableCard>

          {/* Licenses & Tax */}
          <EditableCard
            title="Licenses & Tax"
            editing={editingLicenses}
            saving={update.isPending}
            onEdit={() => setEditingLicenses(true)}
            onCancel={() => setEditingLicenses(false)}
            onSave={() =>
              update.mutate(
                { settings: { ...store.settings, ...licensesForm } },
                { onSuccess: () => setEditingLicenses(false) },
              )
            }
            editChildren={
              <>
                <div className="space-y-1.5">
                  <Label>GST Number</Label>
                  <Input
                    value={licensesForm.gstNumber ?? ""}
                    onChange={(e) =>
                      setLicensesForm((f) => ({
                        ...f,
                        gstNumber: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>GST %</Label>
                  <Input
                    type="number"
                    value={licensesForm.gstPercent ?? ""}
                    onChange={(e) =>
                      setLicensesForm((f) => ({
                        ...f,
                        gstPercent: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Health Permit / FSSAI ID</Label>
                  <Input
                    value={licensesForm.healthPermitId ?? ""}
                    onChange={(e) =>
                      setLicensesForm((f) => ({
                        ...f,
                        healthPermitId: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Registration No.</Label>
                  <Input
                    value={licensesForm.registrationNo ?? ""}
                    onChange={(e) =>
                      setLicensesForm((f) => ({
                        ...f,
                        registrationNo: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            }
          >
            <Field label="GST Number" value={store.settings?.gstNumber} />
            <Field label="GST %" value={store.settings?.gstPercent} />
            <Field
              label="Health Permit / FSSAI ID"
              value={store.settings?.healthPermitId}
            />
            <Field
              label="Registration No."
              value={store.settings?.registrationNo}
            />
          </EditableCard>

          {/* Restaurant Information */}
          <EditableCard
            title="Restaurant Information"
            editing={editingProfile}
            saving={update.isPending}
            onEdit={() => setEditingProfile(true)}
            onCancel={() => setEditingProfile(false)}
            onSave={() =>
              update.mutate(
                {
                  name: profileForm.name,
                  description: profileForm.description,
                  cuisineTypes: profileForm.cuisineTypes
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  address: {
                    street: profileForm.street,
                    city: profileForm.city,
                    state: profileForm.state,
                    pincode: profileForm.pincode,
                  },
                },
                { onSuccess: () => setEditingProfile(false) },
              )
            }
            editChildren={
              <>
                <div className="space-y-1.5">
                  <Label>Restaurant Name</Label>
                  <Input
                    value={profileForm.name ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Cuisine Types (comma separated)</Label>
                  <Input
                    value={profileForm.cuisineTypes ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        cuisineTypes: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={profileForm.description ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Street</Label>
                  <Input
                    value={profileForm.street ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, street: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={profileForm.city ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, city: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Input
                    value={profileForm.state ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, state: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pincode</Label>
                  <Input
                    value={profileForm.pincode ?? ""}
                    onChange={(e) =>
                      setProfileForm((f) => ({ ...f, pincode: e.target.value }))
                    }
                  />
                </div>
              </>
            }
          >
            <Field label="Restaurant Name" value={store.name} />
            <Field
              label="Cuisine Types"
              value={(store.cuisineTypes ?? []).join(", ") || "—"}
            />
            <div className="sm:col-span-2">
              <Field label="Description" value={store.description || "—"} />
            </div>
            <div className="sm:col-span-2">
              <Field
                label="Store Address"
                value={
                  [
                    store.address?.street,
                    store.address?.city,
                    store.address?.state,
                    store.address?.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"
                }
              />
            </div>
          </EditableCard>
        </div>

        <div className="space-y-4">
          {/* Documents */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold">
                Documents Submitted{" "}
                <span className="font-normal text-muted-foreground">
                  {
                    (store.documents ?? []).filter(
                      (d) => d.status === "verified",
                    ).length
                  }
                  /{store.documents?.length ?? 0} verified
                </span>
              </h2>
              <div className="mt-3 space-y-2.5">
                {(store.documents ?? []).map((doc) => (
                  <div
                    key={doc._id ?? doc.type}
                    className="flex items-center justify-between rounded-xl border border-brand-cream/70 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold capitalize">
                        {doc.type?.replace(/_/g, " ")}
                      </p>
                      <Badge
                        variant={
                          doc.status === "verified"
                            ? "ok"
                            : doc.status === "rejected"
                              ? "danger"
                              : "warn"
                        }
                        className="mt-1 capitalize"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-brand-orange"
                        >
                          View
                        </a>
                      ) : null}
                      <button
                        type="button"
                        title="Verify"
                        onClick={() =>
                          verifyDoc.mutate({
                            docId: doc._id,
                            status: "verified",
                          })
                        }
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#E8F5EC] text-[#2E7D32]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Reject"
                        onClick={() =>
                          verifyDoc.mutate({
                            docId: doc._id,
                            status: "rejected",
                          })
                        }
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#FCE9E4] text-[#B11226]"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {(store.documents ?? []).length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No documents uploaded.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold">Admin Notes</h2>
              <div className="mt-3 space-y-3">
                {(store.adminNotes ?? [])
                  .slice()
                  .reverse()
                  .map((n, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-brand-cream/20 px-3 py-2.5"
                    >
                      <p className="text-sm">{n.note}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatDate(n.addedAt)}
                      </p>
                    </div>
                  ))}
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about this store…"
                />
                <Button
                  type="button"
                  disabled={!note.trim() || addNote.isPending}
                  onClick={() =>
                    addNote.mutate(note.trim(), {
                      onSuccess: () => setNote(""),
                    })
                  }
                  className="w-full bg-brand-gradient text-white hover:brightness-105"
                >
                  {addNote.isPending ? "Saving…" : "Save Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <ConfirmDialog
        open={rejectOpen}
        title="Reject this store"
        description="This will move the store to Rejected status. Provide a reason — it's shown to the owner."
        requireReason
        reasonLabel="Rejection reason"
        confirmLabel="Reject Store"
        confirmVariant="destructive"
        loading={reject.isPending}
        onCancel={() => setRejectOpen(false)}
        onConfirm={(reason) =>
          reject.mutate(reason, { onSuccess: () => setRejectOpen(false) })
        }
      />

      <ConfirmDialog
        open={removeOpen}
        title="Remove this store"
        description="This soft-deletes the store (sets it inactive). Order and bill history is preserved. This action does not change the approval status."
        confirmLabel="Remove Store"
        confirmVariant="destructive"
        loading={remove.isPending}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={() =>
          remove.mutate(undefined, { onSuccess: () => navigate("/stores") })
        }
      />
    </AdminLayout>
  );
}
