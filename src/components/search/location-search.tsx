"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader2, X, Navigation } from "lucide-react";
import { clsx } from "clsx";

interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  onCurrentLocation?: () => void;
  placeholder?: string;
  className?: string;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function LocationSearch({
  onLocationSelect,
  onCurrentLocation,
  placeholder = "Search by city, zip, or address...",
  className,
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      autocompleteService.current = new google.maps.places.AutocompleteService();
      // PlacesService needs a dummy div
      const div = document.createElement("div");
      placesService.current = new google.maps.places.PlacesService(div);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService.current || input.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    autocompleteService.current.getPlacePredictions(
      {
        input,
        types: ["geocode"],
        componentRestrictions: { country: "us" },
      },
      (results, status) => {
        setLoading(false);
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          setPredictions(results as unknown as Prediction[]);
          setIsOpen(true);
        } else {
          setPredictions([]);
        }
      }
    );
  }, []);

  function handleInputChange(value: string) {
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchPredictions(value);
    }, 300);
  }

  function handleSelect(prediction: Prediction) {
    if (!placesService.current) return;

    setQuery(prediction.description);
    setIsOpen(false);
    setLoading(true);

    placesService.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["geometry", "formatted_address"],
      },
      (place, status) => {
        setLoading(false);
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          onLocationSelect({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || prediction.description,
          });
        }
      }
    );
  }

  function handleClear() {
    setQuery("");
    setPredictions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div className={clsx("relative", className)}>
      {/* Search Input */}
      <div
        className={clsx(
          "flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-all",
          focused
            ? "border-emerald-400 ring-2 ring-emerald-100 shadow-sm"
            : "border-gray-200 hover:border-gray-300"
        )}
      >
        {loading ? (
          <Loader2 size={18} className="shrink-0 animate-spin text-emerald-500" />
        ) : (
          <Search size={18} className="shrink-0 text-gray-400" />
        )}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (predictions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
        />

        {query && (
          <button
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}

        {onCurrentLocation && (
          <button
            onClick={onCurrentLocation}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
            title="Use current location"
          >
            <Navigation size={16} />
          </button>
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg shadow-gray-200/60"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
            >
              <MapPin size={16} className="shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {prediction.structured_formatting?.main_text || prediction.description}
                </p>
                {prediction.structured_formatting?.secondary_text && (
                  <p className="truncate text-xs text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
