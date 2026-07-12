import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDeliveryPartner } from "@/hooks/admin/useDeliveryPartners";
import AdminLayout from "../AdminLayout";

const MAX_FILE_MB = 5;

const FILE_FIELDS = [
  { key: "aadharCard", label: "Aadhaar Card" },
  { key: "drivingLicense", label: "Driving License" },
  { key: "vehicleRc", label: "Vehicle RC" },
  { key: "insuranceDocument", label: "Insurance Document" },
  { key: "profilePhoto", label: "Profile Photo" },
];

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  emergencyPhone: "",
  aadharNumber: "",
  panNumber: "",
  vehicleModel: "",
  vehicleNumber: "",
  vehicleType: "",
  vehicleRcNumber: "",
  insuranceProvider: "",
  insuranceNumber: "",
  insuranceValidTill: "",
  bankName: "",
  accountHolderName: "",
  accountNumber: "",
  accountType: "",
  ifscCode: "",
  branchName: "",
  upiId: "",
};

function TextField({ label, required, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
      />
    </div>
  );
}

export default function PartnerCreate() {
  const navigate = useNavigate();
  const create = useCreateDeliveryPartner();
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState({});
  const [error, setError] = useState("");

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setFile(key, file) {
    if (file && file.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`${key} exceeds ${MAX_FILE_MB}MB`);
      return;
    }
    setError("");
    setFiles((f) => ({ ...f, [key]: file }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.fullName || !form.email || !form.phone) {
      setError("Full name, email, and phone are required.");
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });
    Object.entries(files).forEach(([k, file]) => {
      if (file) fd.append(k, file);
    });

    try {
      const { data } = await create.mutateAsync(fd);
      navigate(`/delivery-partners/${data.data.partner._id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AdminLayout
      breadcrumb="Delivery Partners > Add New Delivery Partner"
      title="Add New Delivery Partner"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error ? <p className="text-sm text-brand-maroon">{error}</p> : null}

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold">Personal Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="Full Name"
              required
              value={form.fullName}
              onChange={(e) => setField("fullName", e.target.value)}
            />
            <TextField
              label="Email Address"
              required
              type="email"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
            <TextField
              label="Phone Number"
              required
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setField("dateOfBirth", e.target.value)}
            />
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={form.gender}
                onValueChange={(v) => setField("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TextField
              label="Emergency Phone Number"
              value={form.emergencyPhone}
              onChange={(e) => setField("emergencyPhone", e.target.value)}
            />
            <TextField
              label="Aadhar Number"
              value={form.aadharNumber}
              onChange={(e) => setField("aadharNumber", e.target.value)}
            />
            <TextField
              label="PAN Number"
              value={form.panNumber}
              onChange={(e) => setField("panNumber", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold">Vehicle Information</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="Vehicle Model"
              value={form.vehicleModel}
              onChange={(e) => setField("vehicleModel", e.target.value)}
            />
            <TextField
              label="Vehicle Number"
              value={form.vehicleNumber}
              onChange={(e) => setField("vehicleNumber", e.target.value)}
            />
            <div className="space-y-1.5">
              <Label>Vehicle Type</Label>
              <Select
                value={form.vehicleType}
                onValueChange={(v) => setField("vehicleType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
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
            <TextField
              label="RC Number"
              value={form.vehicleRcNumber}
              onChange={(e) => setField("vehicleRcNumber", e.target.value)}
            />
            <TextField
              label="Insurance Provider"
              value={form.insuranceProvider}
              onChange={(e) => setField("insuranceProvider", e.target.value)}
            />
            <TextField
              label="Insurance Number"
              value={form.insuranceNumber}
              onChange={(e) => setField("insuranceNumber", e.target.value)}
            />
            <TextField
              label="Insurance Valid Till"
              type="date"
              value={form.insuranceValidTill}
              onChange={(e) => setField("insuranceValidTill", e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <h2 className="text-base font-bold">Documents</h2>
            <p className="text-xs text-muted-foreground">
              Upload clear and valid documents (max {MAX_FILE_MB}MB each — PNG,
              JPG, or PDF)
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FILE_FIELDS.map((f) => (
              <label
                key={f.key}
                className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand-cream bg-brand-cream/10 p-4 text-center hover:bg-brand-cream/20"
              >
                <Upload className="h-5 w-5 text-brand-orange" />
                <span className="text-xs font-semibold">{f.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {files[f.key] ? files[f.key].name : "PNG, JPG or PDF"}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setFile(f.key, e.target.files?.[0] ?? null)}
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-base font-bold">Bank Details</h2>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TextField
              label="Bank Name"
              value={form.bankName}
              onChange={(e) => setField("bankName", e.target.value)}
            />
            <TextField
              label="Account Holder Name"
              value={form.accountHolderName}
              onChange={(e) => setField("accountHolderName", e.target.value)}
            />
            <TextField
              label="Account Number"
              value={form.accountNumber}
              onChange={(e) => setField("accountNumber", e.target.value)}
            />
            <div className="space-y-1.5">
              <Label>Account Type</Label>
              <Select
                value={form.accountType}
                onValueChange={(v) => setField("accountType", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TextField
              label="IFSC Code"
              value={form.ifscCode}
              onChange={(e) => setField("ifscCode", e.target.value)}
            />
            <TextField
              label="Branch Name"
              value={form.branchName}
              onChange={(e) => setField("branchName", e.target.value)}
            />
            <TextField
              label="UPI ID"
              value={form.upiId}
              onChange={(e) => setField("upiId", e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/delivery-partners")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={create.isPending}
            className="bg-brand-gradient text-white hover:brightness-105"
          >
            {create.isPending ? "Creating…" : "Create Delivery Partner"}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
