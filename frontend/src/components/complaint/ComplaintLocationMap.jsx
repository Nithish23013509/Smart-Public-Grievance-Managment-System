import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';

const DEFAULT_CENTER = {
  lat: 11.1271,
  lng: 78.6569,
};

function LocationSearch({ onPlaceSelect }) {
  const map = useMap();
  const placesLibrary = useMapsLibrary('places');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!map || !placesLibrary || !containerRef.current) return;

    const autocomplete =
      new placesLibrary.PlaceAutocompleteElement();
      
    autocomplete.classList.add('custom-autocomplete');

    autocomplete.includedRegionCodes = ['in'];
    autocomplete.placeholder = 'Search location in India...';

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(autocomplete);

    const handleSelect = async ({ placePrediction }) => {
      if (!placePrediction) return;

      const place = placePrediction.toPlace();

      await place.fetchFields({
        fields: [
          'displayName',
          'formattedAddress',
          'location',
          'viewport',
        ],
      });

      if (!place.location) return;

      const lat = place.location.lat();
      const lng = place.location.lng();

      if (place.viewport) {
        map.fitBounds(place.viewport);
      } else {
        map.setCenter({ lat, lng });
        map.setZoom(17);
      }

      onPlaceSelect({
        lat,
        lng,
        address: place.formattedAddress || '',
      });
    };

    autocomplete.addEventListener('gmp-select', handleSelect);

    return () => {
      autocomplete.removeEventListener(
        'gmp-select',
        handleSelect
      );

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [map, placesLibrary, onPlaceSelect]);

  return (
    <div style={{ width: '100%', marginBottom: '12px' }}>
      <div ref={containerRef} style={{ width: '100%' }} />
    </div>
  );
}

function ReverseGeocoder({ position, onAddressFound, onDistrictDetected }) {
  const geocodingLibrary = useMapsLibrary('geocoding');

  const onAddressFoundRef = useRef(onAddressFound);

  useEffect(() => {
    onAddressFoundRef.current = onAddressFound;
  }, [onAddressFound]);

  const lat = position?.lat;
  const lng = position?.lng;

  useEffect(() => {
    if (!geocodingLibrary || lat == null || lng == null) {
      return;
    }

    let cancelled = false;

    const geocoder = new geocodingLibrary.Geocoder();

    const reverseGeocode = async () => {
      try {
        console.log('Reverse geocoding:', { lat, lng });

        const response = await geocoder.geocode({
          location: {
            lat: Number(lat),
            lng: Number(lng),
          },
          region: 'IN',
          language: 'en',
        });

        if (cancelled) return;

        if (response.results?.length > 0) {
    const result = response.results[0];
    const districtComponent = result.address_components?.find(
  component =>
    component.types.includes('administrative_area_level_3')
);

const detectedDistrict = districtComponent?.long_name || '';

console.log('Detected District:', detectedDistrict);

if (detectedDistrict) {
  onDistrictDetected?.(detectedDistrict);
}

    console.log('Formatted address:', result.formatted_address);
    console.table(
  result.address_components.map(component => ({
    name: component.long_name,
    types: component.types.join(', ')
  }))
);

    const address = result.formatted_address;

    onAddressFoundRef.current(address);
}
        else {
          console.warn('No address found');

          onAddressFoundRef.current('');
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Reverse geocoding failed:', error);
          onAddressFoundRef.current('');
        }
      }
    };

    reverseGeocode();

    return () => {
      cancelled = true;
    };
  }, [geocodingLibrary, lat, lng]);

  return null;
}

function MapContent({ position, onLocationChange, onAddressFound, onDistrictDetected }) {
  const map = useMap();

  const handleMapClick = useCallback(
    (event) => {
      if (!event.detail?.latLng) return;

      const lat = event.detail.latLng.lat();
      const lng = event.detail.latLng.lng();

      const location = {
        lat,
        lng,
      };

      onLocationChange(location);

      map?.panTo(location);
    },
    [map, onLocationChange]
  );

  return (
    <div
      style={{
        width: '100%',
        height: '400px',
      }}
    >
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={7}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        disableDefaultUI={false}
        onClick={handleMapClick}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {position && (
          <AdvancedMarker
            position={position}
            title="Complaint Location"
            draggable={true}
            onDragEnd={(event) => {
              const latLng = event.latLng;

              if (!latLng) return;

              const lat = latLng.lat();
              const lng = latLng.lng();

              onLocationChange({
                lat,
                lng,
              });
            }}
          />
        )}
      </Map>

      <ReverseGeocoder
        position={position}
        onAddressFound={onAddressFound}
        onDistrictDetected={onDistrictDetected}
      />
    </div>
  );
}

const ComplaintLocationMap = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  onDistrictDetected,
}) => {
  const [position, setPosition] = useState(
    latitude && longitude
      ? {
          lat: Number(latitude),
          lng: Number(longitude),
        }
      : null
  );

  useEffect(() => {
    if (latitude && longitude) {
      setPosition({
        lat: Number(latitude),
        lng: Number(longitude),
      });
    }
  }, [latitude, longitude]);

  const handleLocationChange = useCallback(
    (location) => {
      setPosition({
        lat: location.lat,
        lng: location.lng,
      });

      onLocationChange(location);

      if (location.address) {
        onAddressChange?.(location.address);
      }
    },
    [onLocationChange, onAddressChange]
  );

  const handleAddressFound = useCallback(
    (address) => {
      if (onAddressChange) {
        onAddressChange(address);
      }
    },
    [onAddressChange]
  );

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (location) => {
        const lat = location.coords.latitude;
        const lng = location.coords.longitude;

        handleLocationChange({
          lat,
          lng,
          address: '',
        });
      },
      (error) => {
        console.error('Geolocation error:', error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location permission was denied.');
            break;

          case error.POSITION_UNAVAILABLE:
            alert('Unable to determine your current location.');
            break;

          case error.TIMEOUT:
            alert('Location request timed out.');
            break;

          default:
            alert('Unable to get your current location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
        Google Maps API key is not configured.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['places', 'geocoding']}
    >
      <style>
        {`
          .custom-autocomplete {
            width: 100%;
            display: block;
            color-scheme: light;
            background: transparent;
            --pac-background-color: transparent;
          }
          .custom-autocomplete::part(input) {
            background-color: #ffffff;
            color: #1a1a2e;
            border: 1.5px solid #d4d7dd;
            padding: 12px 16px 12px 40px; /* Leave space for icon */
            border-radius: 10px;
            font-size: 0.95rem;
            width: 100%;
            transition: all 0.28s ease;
            font-family: inherit;
            box-sizing: border-box;
            margin: 0;
          }
          .custom-autocomplete::part(input):focus {
            outline: none;
            border-color: #a61416;
            box-shadow: 0 0 0 4px rgba(166,20,22,0.1);
          }
          .custom-autocomplete::part(icon) {
            color: #a61416;
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
          }
        `}
      </style>
      
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Search Bar outside of the Map completely */}
        <LocationSearch onPlaceSelect={handleLocationChange} />

        <div
          style={{
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '1rem'
          }}
        >
          <MapContent
            position={position}
            onLocationChange={handleLocationChange}
            onAddressFound={handleAddressFound}
            onDistrictDetected={onDistrictDetected}
          />
        </div>

        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleUseMyLocation}
            style={{
              width: '100%',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📍</span> Use My Current Location
          </button>

          {position && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem 1.25rem',
                background: 'rgba(166,20,22,0.04)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(166,20,22,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
                  Location Selected
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  <span style={{ fontWeight: 600 }}>Lat:</span> {position.lat.toFixed(6)} <span style={{ margin: '0 6px', color: 'rgba(0,0,0,0.1)' }}>|</span> <span style={{ fontWeight: 600 }}>Lng:</span> {position.lng.toFixed(6)}
                </div>
              </div>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', 
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-primary)'
              }}>
                ✓
              </div>
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  );
};

export default ComplaintLocationMap;