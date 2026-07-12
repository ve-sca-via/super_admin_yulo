import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin.api";

const partnerKeys = {
  all: ["admin", "delivery-partners"],
  list: (params) => ["admin", "delivery-partners", "list", params],
  detail: (id) => ["admin", "delivery-partners", "detail", id],
};

export function useDeliveryPartners(params = {}) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: () =>
      adminApi.listDeliveryPartners(params).then((r) => r.data.data),
    keepPreviousData: true,
  });
}

export function useDeliveryPartner(id) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () =>
      adminApi.getDeliveryPartner(id).then((r) => r.data.data.partner),
    enabled: !!id,
  });
}

export function useCreateDeliveryPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => adminApi.createDeliveryPartner(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: partnerKeys.all }),
  });
}

export function useUpdateDeliveryPartner(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminApi.updateDeliveryPartner(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      qc.invalidateQueries({ queryKey: partnerKeys.all });
    },
  });
}

export function useRemoveDeliveryPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.removeDeliveryPartner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: partnerKeys.all }),
  });
}
