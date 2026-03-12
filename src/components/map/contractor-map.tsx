"use client";

import { useState, useCallback } from "react";
import { Map } from "@vis.gl/react-google-maps";
import { ContractorMarker } from "./contractor-marker";
import { MapInfoWindow } from "./map-info-window";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/lib/utils/constants";
import type { NearbyContractor } from "@/types";

interface ContractorMapProps {
  contractors: NearbyContractor[];
  center?: { lat: number; lng: number };
  selectedId?: string | null;
  onMarkerClick?: (contractor: NearbyContractor) => void;
  onBoundsChanged?: (bounds: google.maps.LatLngBoundsLiteral) => void;
  className?: string;
}

export function ContractorMap({
  contractors,
  center,
  selectedId,
  onMarkerClick,
  onBoundsChanged,
  className = "h-full w-full",
}: ContractorMapProps) {
  const [infoContractor, setInfoContractor] =
    useState<NearbyContractor | null>(null);

  const handleMarkerClick = useCallback(
    (contractor: NearbyContractor) => {
      setInfoContractor(contractor);
      onMarkerClick?.(contractor);
    },
    [onMarkerClick]
  );

  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  return (
    <div className={className}>
      <Map
        defaultCenter={center || DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        mapId={mapId || "DEMO_MAP_ID"}
        gestureHandling="greedy"
        disableDefaultUI={false}
        zoomControl={true}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        onBoundsChanged={(ev) => {
          const bounds = ev.map.getBounds();
          if (bounds && onBoundsChanged) {
            onBoundsChanged(bounds.toJSON());
          }
        }}
      >
        {contractors.map((c) => (
          <ContractorMarker
            key={c.id}
            contractor={c}
            isSelected={selectedId === c.id}
            onClick={() => handleMarkerClick(c)}
          />
        ))}

        {infoContractor && (
          <MapInfoWindow
            contractor={infoContractor}
            onClose={() => setInfoContractor(null)}
          />
        )}
      </Map>
    </div>
  );
}
