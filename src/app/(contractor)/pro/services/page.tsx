"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { updateContractorServices } from "@/lib/actions/contractors";
import type { ServiceCategory } from "@/types";

interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
}

interface SelectedService {
  service_id: string;
  price: number | null;
  price_unit: string;
}

export default function ContractorServicesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [selected, setSelected] = useState<SelectedService[]>([]);
  const [contractorId, setContractorId] = useState<string>("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: contractor } = await supabase
        .from("contractors")
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!contractor) return;
      setContractorId(contractor.id);

      const { data: services } = await supabase
        .from("services")
        .select("*")
        .order("category")
        .order("name");

      const { data: existing } = await supabase
        .from("contractor_services")
        .select("service_id, price, price_unit")
        .eq("contractor_id", contractor.id);

      setAllServices(services || []);
      setSelected(
        existing?.map((e) => ({
          service_id: e.service_id,
          price: e.price,
          price_unit: e.price_unit,
        })) || []
      );
      setLoading(false);
    }
    load();
  }, []);

  function toggleService(serviceId: string) {
    setSelected((prev) => {
      const exists = prev.find((s) => s.service_id === serviceId);
      if (exists) {
        return prev.filter((s) => s.service_id !== serviceId);
      }
      return [...prev, { service_id: serviceId, price: null, price_unit: "flat" }];
    });
  }

  function updatePrice(serviceId: string, price: string) {
    setSelected((prev) =>
      prev.map((s) =>
        s.service_id === serviceId
          ? { ...s, price: price ? parseFloat(price) : null }
          : s
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateContractorServices(contractorId, selected);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Services updated!");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-64 rounded-xl bg-gray-200" />
    </div>;
  }

  const categories = ["pool", "landscaping", "maid"] as ServiceCategory[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <Button onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>

      {categories.map((cat) => (
        <Card key={cat} className="mt-6">
          <CardHeader>
            <Badge variant={cat} className="text-sm">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {allServices
              .filter((s) => s.category === cat)
              .map((service) => {
                const isSelected = selected.some(
                  (s) => s.service_id === service.id
                );
                const selectedSvc = selected.find(
                  (s) => s.service_id === service.id
                );

                return (
                  <div
                    key={service.id}
                    className={`rounded-lg border p-4 transition-all ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-gray-200"
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleService(service.id)}
                        className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {service.name}
                        </span>
                        {service.description && (
                          <p className="text-sm text-gray-500">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </label>
                    {isSelected && (
                      <div className="mt-3 flex items-center gap-2 pl-7">
                        <span className="text-sm text-gray-600">$</span>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={selectedSvc?.price ?? ""}
                          onChange={(e) =>
                            updatePrice(service.id, e.target.value)
                          }
                          placeholder="Price"
                          className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <select
                          value={selectedSvc?.price_unit || "flat"}
                          onChange={(e) =>
                            setSelected((prev) =>
                              prev.map((s) =>
                                s.service_id === service.id
                                  ? { ...s, price_unit: e.target.value }
                                  : s
                              )
                            )
                          }
                          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="flat">Flat</option>
                          <option value="hourly">Hourly</option>
                          <option value="sqft">Per sqft</option>
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
