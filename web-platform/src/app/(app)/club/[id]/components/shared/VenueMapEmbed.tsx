type GeoPoint = {
  lat: number;
  lng: number;
};

type VenueMapEmbedProps = {
  locationName: string;
  coordinates?: GeoPoint;
  className?: string;
  zoomPadding?: number;
};

export default function VenueMapEmbed({
  locationName,
  coordinates,
  className,
  zoomPadding = 0.005,
}: VenueMapEmbedProps) {
  const src = coordinates
    ? buildOpenStreetMapEmbed(coordinates, zoomPadding)
    : buildQueryMapEmbed(locationName);

  return (
    <div
      className={`overflow-hidden rounded-md border border-gray-200 shadow-sm ${className || ""}`}
    >
      <iframe
        title={`Map for ${locationName}`}
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
      />
    </div>
  );
}

function buildOpenStreetMapEmbed(coordinates: GeoPoint, zoomPadding: number) {
  const left = coordinates.lng - zoomPadding;
  const bottom = coordinates.lat - zoomPadding;
  const right = coordinates.lng + zoomPadding;
  const top = coordinates.lat + zoomPadding;

  const bbox = [left, bottom, right, top].map((n) => n.toFixed(6)).join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`;
}

function buildQueryMapEmbed(locationName: string) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}&z=15&output=embed`;
}