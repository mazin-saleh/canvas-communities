import Image from "next/image";

type GeoPoint = {
  lat: number;
  lng: number;
};

type VenueMapEmbedProps = {
  locationName: string;
  coordinates?: GeoPoint;
  className?: string;
  zoom?: number;
};

/**
 * Renders a static map tile image from OpenStreetMap.
 * No iframe, no controls, no attribution footer — just a clean map image
 * with a pin overlay centered on the coordinates.
 */
export default function VenueMapEmbed({
  locationName,
  coordinates,
  className,
  zoom = 16,
}: VenueMapEmbedProps) {
  if (!coordinates) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-xs text-gray-400 ${className || ""}`}
      >
        No map
      </div>
    );
  }

  const tileUrl = buildTileUrl(coordinates, zoom);

  return (
    <div className={`relative bg-gray-100 ${className || ""}`}>
      {/* Static tile image */}
      <Image
        src={tileUrl}
        alt={`Map of ${locationName}`}
        fill
        sizes="300px"
        className="object-cover"
        unoptimized
      />
      {/* Pin overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          width="24"
          height="32"
          viewBox="0 0 24 32"
          fill="none"
          className="drop-shadow-md"
        >
          <path
            d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20c0-6.627-5.373-12-12-12z"
            fill="#1a1a1a"
          />
          <circle cx="12" cy="12" r="5" fill="white" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Converts lat/lng + zoom into a single OSM tile URL.
 * Uses the standard raster tile endpoint.
 */
function buildTileUrl(coordinates: GeoPoint, zoom: number): string {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((coordinates.lng + 180) / 360) * n);
  const latRad = (coordinates.lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );

  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
