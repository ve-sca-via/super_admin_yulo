import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, FileText, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import EditableCard from "@/components/admin/EditableCard";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  useDeliveryPartner,
  useRemoveDeliveryPartner,
  useUpdateDeliveryPartner,
} from "@/hooks/admin/useDeliveryPartners";
import AdminLayout, { formatDate, formatNumber } from "../AdminLayout";

const STATUS_VARIANT = {
  active: "ok",
  busy: "warn",
  inactive: "muted",
  suspended: "danger",
};

const DOC_LABELS = {
  aadhar_card: "Aadhaar Card",
  driving_license: "Driving License",
  vehicle_rc: "Vehicle RC",
  insurance_document: "Insurance Document",
  profile_photo: "Profile Photo",
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

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value ?? "—"}</p>
    </div>
  );
}

export default function PartnerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: partner, isLoading, error } = useDeliveryPartner(id);
  const update = useUpdateDeliveryPartner(id);
  const remove = useRemoveDeliveryPartner();

  const [removeOpen, setRemoveOpen] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [personalForm, setPersonalForm] = useState({});
  const [editingVehicle, setEditingVehicle] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({});
  const [editingBank, setEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({});

  useEffect(() => {
    if (!partner) return;
    setPersonalForm({
      fullName: partner.fullName ?? "",
      phone: partner.phone ?? "",
      emergencyPhone: partner.emergencyPhone ?? "",
      aadharNumber: partner.aadharNumber ?? "",
      panNumber: partner.panNumber ?? "",
    });
    setVehicleForm(partner.vehicle ?? {});
    setBankForm(partner.bankDetails ?? {});
  }, [partner]);

  if (isLoading) {
    return (
      <AdminLayout breadcrumb="Delivery Partners" title="Loading…">
        <p className="text-sm text-muted-foreground">
          Loading delivery partner…
        </p>
      </AdminLayout>
    );
  }
  if (error || !partner) {
    return (
      <AdminLayout breadcrumb="Delivery Partners" title="Partner not found">
        <p className="text-sm text-brand-maroon">
          {error?.message ?? "This delivery partner could not be found."}
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumb="Delivery Partners > Partner Details"
      title={
        <span className="flex items-center gap-3">
          {partner.fullName}
          <Badge
            variant={STATUS_VARIANT[partner.status] ?? "muted"}
            className="capitalize"
          >
            {partner.status}
          </Badge>
        </span>
      }
      subtitle={`ID: ${partner._id.slice(-6).toUpperCase()} · ${partner.email}`}
      action={
        <div className="flex items-center gap-2">
          <Select
            value={partner.status}
            onValueChange={(v) => update.mutate({ status: v })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["active", "busy", "inactive", "suspended"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setRemoveOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-brand-maroon/40 px-3 py-2 text-xs font-semibold text-brand-maroon hover:bg-brand-maroon/5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      }
    >
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-5 p-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-brand-gradient text-lg font-semibold text-white">
                {initials(partner.fullName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold">{partner.fullName}</p>
              <p className="text-sm text-muted-foreground">{partner.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3">
            <Field
              label="Joined On"
              value={formatDate(partner.joinedOn ?? partner.createdAt)}
            />
            <Field
              label="Total Deliveries"
              value={formatNumber(partner.totalDeliveries)}
            />
            <Field
              label="Average Rating"
              value={`★ ${partner.rating?.toFixed?.(1) ?? "—"}`}
            />
          </div>
        </CardContent>
      </Card>

      <EditableCard
        title="Personal Information"
        editing={editingPersonal}
        saving={update.isPending}
        onEdit={() => setEditingPersonal(true)}
        onCancel={() => setEditingPersonal(false)}
        onSave={() =>
          update.mutate(personalForm, {
            onSuccess: () => setEditingPersonal(false),
          })
        }
        editChildren={
          <>
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={personalForm.fullName ?? ""}
                onChange={(e) =>
                  setPersonalForm((f) => ({ ...f, fullName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input
                value={personalForm.phone ?? ""}
                onChange={(e) =>
                  setPersonalForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Emergency Phone</Label>
              <Input
                value={personalForm.emergencyPhone ?? ""}
                onChange={(e) =>
                  setPersonalForm((f) => ({
                    ...f,
                    emergencyPhone: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Aadhar Number</Label>
              <Input
                value={personalForm.aadharNumber ?? ""}
                onChange={(e) =>
                  setPersonalForm((f) => ({
                    ...f,
                    aadharNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>PAN Number</Label>
              <Input
                value={personalForm.panNumber ?? ""}
                onChange={(e) =>
                  setPersonalForm((f) => ({ ...f, panNumber: e.target.value }))
                }
              />
            </div>
          </>
        }
      >
        <Field label="Full Name" value={partner.fullName} />
        <Field label="Email Address" value={partner.email} />
        <Field label="Phone Number" value={partner.phone} />
        <Field
          label="Date of Birth"
          value={partner.dateOfBirth ? formatDate(partner.dateOfBirth) : "—"}
        />
        <Field
          label="Gender"
          value={
            partner.gender ? (
              <span className="capitalize">{partner.gender}</span>
            ) : (
              "—"
            )
          }
        />
        <Field label="Emergency Phone" value={partner.emergencyPhone} />
        <Field label="Aadhar Number" value={partner.aadharNumber} />
        <Field label="PAN Number" value={partner.panNumber} />
      </EditableCard>

      <EditableCard
        title="Vehicle Information"
        editing={editingVehicle}
        saving={update.isPending}
        onEdit={() => setEditingVehicle(true)}
        onCancel={() => setEditingVehicle(false)}
        onSave={() =>
          update.mutate(
            { vehicle: vehicleForm },
            { onSuccess: () => setEditingVehicle(false) },
          )
        }
        editChildren={
          <>
            <div className="space-y-1.5">
              <Label>Vehicle Model</Label>
              <Input
                value={vehicleForm.model ?? ""}
                onChange={(e) =>
                  setVehicleForm((f) => ({ ...f, model: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Number</Label>
              <Input
                value={vehicleForm.number ?? ""}
                onChange={(e) =>
                  setVehicleForm((f) => ({ ...f, number: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select
                value={vehicleForm.type ?? ""}
                onValueChange={(v) =>
                  setVehicleForm((f) => ({ ...f, type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2_wheeler">2 Wheeler</SelectItem>
                  <SelectItem value="ev_2_wheeler">EV 2 Wheeler</SelectItem>
                  <SelectItem value="non_rto_2_wheeler">
                    Non-RTO 2 Wheeler
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>RC Number</Label>
              <Input
                value={vehicleForm.rcNumber ?? ""}
                onChange={(e) =>
                  setVehicleForm((f) => ({ ...f, rcNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Insurance Provider</Label>
              <Input
                value={vehicleForm.insuranceProvider ?? ""}
                onChange={(e) =>
                  setVehicleForm((f) => ({
                    ...f,
                    insuranceProvider: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Insurance Number</Label>
              <Input
                value={vehicleForm.insuranceNumber ?? ""}
                onChange={(e) =>
                  setVehicleForm((f) => ({
                    ...f,
                    insuranceNumber: e.target.value,
                  }))
                }
              />
            </div>
          </>
        }
      >
        <Field label="Vehicle Model" value={partner.vehicle?.model} />
        <Field label="Vehicle Number" value={partner.vehicle?.number} />
        <Field
          label="Vehicle Type"
          value={
            partner.vehicle?.type ? (
              <span className="capitalize">
                {partner.vehicle.type.replace(/_/g, " ")}
              </span>
            ) : (
              "—"
            )
          }
        />
        <Field label="RC Number" value={partner.vehicle?.rcNumber} />
        <Field
          label="Insurance Provider"
          value={partner.vehicle?.insuranceProvider}
        />
        <Field
          label="Insurance Validity"
          value={
            partner.vehicle?.insuranceValidTill
              ? formatDate(partner.vehicle.insuranceValidTill)
              : "—"
          }
        />
      </EditableCard>

      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-base font-bold">Document Information</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {(partner.documents ?? []).map((doc) => (
            <div
              key={doc.type}
              className="rounded-xl border border-brand-cream/70 p-3"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-cream/30 text-brand-orange">
                <FileText className="h-4 w-4" />
              </span>
              <p className="mt-2 text-sm font-semibold">
                {DOC_LABELS[doc.type] ?? doc.type}
              </p>
              <p className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                {formatDate(doc.uploadedAt)}
                {doc.url ? (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-orange"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </p>
            </div>
          ))}
          {(partner.documents ?? []).length === 0 ? (
            <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
              No documents uploaded.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <EditableCard
        title="Bank Details"
        editing={editingBank}
        saving={update.isPending}
        onEdit={() => setEditingBank(true)}
        onCancel={() => setEditingBank(false)}
        onSave={() =>
          update.mutate(
            { bankDetails: bankForm },
            { onSuccess: () => setEditingBank(false) },
          )
        }
        editChildren={
          <>
            <div className="space-y-1.5">
              <Label>Bank Name</Label>
              <Input
                value={bankForm.bankName ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({ ...f, bankName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Account Holder Name</Label>
              <Input
                value={bankForm.accountHolderName ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({
                    ...f,
                    accountHolderName: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Account Number</Label>
              <Input
                value={bankForm.accountNumber ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({ ...f, accountNumber: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>IFSC Code</Label>
              <Input
                value={bankForm.ifscCode ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({ ...f, ifscCode: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Branch Name</Label>
              <Input
                value={bankForm.branchName ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({ ...f, branchName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>UPI ID</Label>
              <Input
                value={bankForm.upiId ?? ""}
                onChange={(e) =>
                  setBankForm((f) => ({ ...f, upiId: e.target.value }))
                }
              />
            </div>
          </>
        }
      >
        <Field label="Bank Name" value={partner.bankDetails?.bankName} />
        <Field
          label="Account Holder Name"
          value={partner.bankDetails?.accountHolderName}
        />
        <Field
          label="Account Number"
          value={partner.bankDetails?.accountNumber}
        />
        <Field label="IFSC Code" value={partner.bankDetails?.ifscCode} />
        <Field label="Branch Name" value={partner.bankDetails?.branchName} />
        <Field label="UPI ID" value={partner.bankDetails?.upiId} />
      </EditableCard>

      <ConfirmDialog
        open={removeOpen}
        title="Remove this delivery partner"
        description="This permanently deletes the partner record — this cannot be undone."
        confirmLabel="Remove Permanently"
        confirmVariant="destructive"
        loading={remove.isPending}
        onCancel={() => setRemoveOpen(false)}
        onConfirm={() =>
          remove.mutate(id, { onSuccess: () => navigate("/delivery-partners") })
        }
      />
    </AdminLayout>
  );
}
