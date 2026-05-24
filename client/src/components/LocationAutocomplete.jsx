import { useState, useRef, useEffect } from "react";
import { MapPin, Loader, CheckCircle } from "lucide-react";

const LocationAutocomplete = ({
  value,
  onChange,
  onLocationSelect,
  placeholder = "Type location name...",
  label = "Location",
  hint = "Type to search — or enter any name if not found in suggestions",
}) => {
  const [suggestions,   setSuggestions]   = useState([]);
  const [showDropdown,  setShowDropdown]  = useState(false);
  const [searching,     setSearching]     = useState(false);
  const [confirmed,     setConfirmed]     = useState(false);
  const [confirmedName, setConfirmedName] = useState("");
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (value && !confirmed) {
          geocodeSilent(value);
        }
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [value, confirmed]);

  // Silent geocode — saves coordinates but does NOT show confirmed name
  // and does NOT change input text
  const geocodeSilent = async (text) => {
    if (!text || text.length < 3) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text + ", Nepal")}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        // Save coordinates silently — no UI change
        onLocationSelect({ lat, lng });
      } else {
        onLocationSelect({ lat: null, lng: null });
      }
    } catch {
      onLocationSelect({ lat: null, lng: null });
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    onChange(text);
    setConfirmed(false);
    setConfirmedName("");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text + ", Nepal")}&format=json&limit=4&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        setSuggestions(data || []);
        setShowDropdown(data && data.length > 0);
      } catch {
        setSuggestions([]);
      }
      setSearching(false);
    }, 500);
  };

  const handleSelect = (item) => {
    const lat       = parseFloat(item.lat);
    const lng       = parseFloat(item.lon);
    const parts     = (item.display_name || "").split(",");
    const shortName = parts.slice(0, 3).join(",").trim();

    onLocationSelect({ lat, lng });
    setConfirmed(true);
    setConfirmedName(shortName);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-white pr-10"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          name="location-search-field"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {searching
            ? <Loader className="h-4 w-4 text-gray-400 animate-spin" />
            : confirmed
            ? <CheckCircle className="h-4 w-4 text-green-500" />
            : <MapPin className="h-4 w-4 text-gray-300" />
          }
        </div>
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((item, i) => {
            const parts   = (item.display_name || "").split(",");
            const name    = parts[0].trim();
            const address = parts.slice(1, 3).join(",").trim();
            return (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(item);
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                <MapPin className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{address}</p>
                </div>
              </button>
            );
          })}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Not in the list? Just keep typing your full address
            </p>
          </div>
        </div>
      )}

      {confirmed && confirmedName && (
        <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          {confirmedName}
        </p>
      )}

      {!confirmed && (
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
