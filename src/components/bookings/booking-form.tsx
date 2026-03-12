"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createBooking } from "@/lib/actions/bookings";
import { formatCurrency } from "@/lib/utils/format";

interface ServiceOption {
  id: string;
  price: number | null;
  price_unit: string;
  services: {
    id: string;
    name: string;
    category: string;
  };
}

interface BookingFormProps {
  contractorId: string;
  contractorServices: ServiceOption[];
}

export function BookingForm({
  contractorId,
  contractorServices,
}: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const selectedSvc = contractorServices.find(
    (cs) => cs.services.id === selectedService
  );

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    formData.set("contractor_id", contractorId);
    if (selectedSvc?.price) {
      formData.set("quoted_price", selectedSvc.price.toString());
    }

    const result = await createBooking(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Booking request sent!");
      router.push("/dashboard");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Service selection */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Select a service
        </label>
        <div className="space-y-2">
          {contractorServices.map((cs) => (
            <label
              key={cs.services.id}
              className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-all ${
                selectedService === cs.services.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="service_id"
                  value={cs.services.id}
                  checked={selectedService === cs.services.id}
                  onChange={() => setSelectedService(cs.services.id)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  required
                />
                <span className="font-medium text-gray-900">
                  {cs.services.name}
                </span>
              </div>
              {cs.price && (
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(cs.price)}/{cs.price_unit}
                </span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="scheduled_date"
          name="scheduled_date"
          type="date"
          label="Date"
          required
          min={new Date().toISOString().split("T")[0]}
        />
        <Input
          id="scheduled_time"
          name="scheduled_time"
          type="time"
          label="Preferred time"
        />
      </div>

      {/* Address */}
      <Input
        id="address"
        name="address"
        type="text"
        label="Service address"
        placeholder="123 Main St, City, State"
        required
      />

      {/* Notes */}
      <div className="space-y-1">
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700"
        >
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          placeholder="Any details about the job..."
        />
      </div>

      {/* Summary */}
      {selectedSvc?.price && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Estimated price</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(selectedSvc.price)}
            </span>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Send Booking Request
      </Button>
    </form>
  );
}
