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
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        width: 'min(420px, calc(100% - 24px))',
      }}
    />
  );
}

function ReverseGeocoder({ position, onAddressFound }) {
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
          const address = response.results[0].formatted_address;

          console.log('Address found:', address);

          onAddressFoundRef.current(address);
        } else {
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

function MapContent({ position, onLocationChange, onAddressFound }) {
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
        position: 'relative',
        width: '100%',
        height: '400px',
      }}
    >
      <LocationSearch
        onPlaceSelect={onLocationChange}
      />

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
      />
    </div>
  );
}

const ComplaintLocationMap = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
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
      <div>
        Google Maps API key is not configured.
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={['places', 'geocoding']}
    >
      <div
        style={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <MapContent
          position={position}
          onLocationChange={handleLocationChange}
          onAddressFound={handleAddressFound}
        />
      </div>

      <button
        type="button"
        onClick={handleUseMyLocation}
        style={{
          marginTop: '12px',
          padding: '10px 16px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          background: '#f1f3f5',
        }}
      >
        📍 Use My Location
      </button>

      {position && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem',
            background: '#f8f9fb',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}
        >
          <strong>Selected Location</strong>

          <div>
            Latitude: {position.lat.toFixed(6)}
          </div>

          <div>
            Longitude: {position.lng.toFixed(6)}
          </div>
        </div>
      )}
    </APIProvider>
  );
};

export default ComplaintLocationMap;