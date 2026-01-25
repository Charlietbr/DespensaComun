import React from "react";
import { useEffect, useState, useRef } from "react";
import './LocationPicker.css'

const LocationPicker = ({ value, onSelect }) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  //! REFERENCIA PARA EVITAR EL DESMADRE de los dos clicks
  const isSelecting = useRef(false);


  useEffect(() => {
    if (value !== query) {
        setQuery(value || "");
      }
    }, [value]);

  useEffect(() => {
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }

    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      search(query, controller.signal);
    }, 400); //! debounce???

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const search = async (text, signal) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          text
        )}`,
        { signal }
      );
      const data = await res.json();

      setResults(
        data.map((r) => ({
          name: r.display_name,
          lat: r.lat,
          lng: r.lon,
        }))
      );
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Geocoding error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (place) => {
    isSelecting.current = true;  //! para marcar que se está seleccionando <<<< ojocuidao
    setQuery(place.name);
    setResults([]);
    onSelect(place);
  };

  return (
    <div className="location-picker" >
      <input
        type="text"
        value={query}
        placeholder="Busca y haz click sobre una población..."
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div className="small-text">Buscando...</div>}

      {results.length > 0 && (
        <ul className="location-dropdown">
          {results.map((r, i) => (
            <li key={i} onMouseDown={() => handleSelect(r)}>
              {r.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationPicker;
