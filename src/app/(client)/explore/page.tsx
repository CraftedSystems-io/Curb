"use client";

import { useState, useEffect, useCallback } from "react";
import { MapProvider } from "@/components/map/map-provider";
import { ContractorMap } from "@/components/map/contractor-map";
import { ContractorList } from "@/components/contractors/contractor-list";
import { ServiceFilter } from "@/components/contractors/service-filter";
import { LocationSearch } from "@/components/search/location-search";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useDebounce } from "@/hooks/use-debounce";
import { useUser } from "@/hooks/use-user";
import { DEFAULT_CENTER } from "@/lib/utils/constants";
import { createClient } from "@/lib/supabase/client";
import type { NearbyContractor, ServiceCategory } from "@/types";

type SortOption = "distance" | "rating" | "price_low" | "price_high" | "reviews";

export default function ExplorePage() {
  const { position, requestLocation } = useGeolocation();
  const { user } = useUser();
  const [contractors, setContractors] = useState<NearbyContractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("distance");
  const [searchCenter, setSearchCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [searchAddress, setSearchAddress] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const center = searchCenter || position || DEFAULT_CENTER;
  const debouncedCenter = useDebounce(center, 500);

  // Load user favorites
  useEffect(() => {
    if (!user) return;
    async function loadFavorites() {
      const supabase = createClient();
      const { data } = await supabase
        .from("favorites")
        .select("contractor_id")
        .eq("user_id", user!.id);
      if (data) {
        setFavoriteIds(new Set(data.map((f) => f.contractor_id)));
      }
    }
    loadFavorites();
  }, [user]);

  const fetchContractors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      lat: debouncedCenter.lat.toString(),
      lng: debouncedCenter.lng.toString(),
      radius: "80000",
    });
    if (category !== "all") {
      params.set("category", category);
    }

    try {
      const res = await fetch(`/api/contractors/nearby?${params}`);
      const data = await res.json();
      setContractors(data);
    } catch (err) {
      console.error("Failed to fetch contractors:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedCenter.lat, debouncedCenter.lng, category]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  function handleLocationSelect(location: {
    lat: number;
    lng: number;
    address: string;
  }) {
    setSearchCenter({ lat: location.lat, lng: location.lng });
    setSearchAddress(location.address);
  }

  function handleCurrentLocation() {
    setSearchCenter(null);
    setSearchAddress(null);
    requestLocation();
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col lg:flex-row">
      {/* Sidebar with filters and list */}
      <div className="flex w-full flex-col border-r border-gray-200 bg-white lg:w-[420px]">
        <div className="border-b border-gray-200 p-4">
          <h1 className="text-lg font-bold text-gray-900">Explore</h1>
          <p className="text-sm text-gray-500">
            {searchAddress || "Find service pros near you"}
          </p>
          <div className="mt-3">
            <LocationSearch
              onLocationSelect={handleLocationSelect}
              onCurrentLocation={handleCurrentLocation}
              placeholder="Search by city, zip, or address..."
            />
          </div>
          <div className="mt-3">
            <ServiceFilter value={category} onChange={setCategory} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ContractorList
            contractors={contractors}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            favoriteIds={user ? favoriteIds : undefined}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 min-h-[300px]">
        <MapProvider>
          <ContractorMap
            contractors={contractors}
            center={center}
            selectedId={selectedId}
            onMarkerClick={(c) => setSelectedId(c.id)}
          />
        </MapProvider>
      </div>
    </div>
  );
}
