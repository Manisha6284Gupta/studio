import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { ComplaintLocation } from "@/lib/types";
import Image from "next/image";

interface ComplaintsMapProps {
    locations: ComplaintLocation[];
}

export function ComplaintsMap({ locations }: ComplaintsMapProps) {
    const mapImage = PlaceHolderImages.find(p => p.id === 'complaint-map-1');
    
    // This is a simplified mapping of lon/lat to pixels.
    // In a real app, you would use a library to handle map projections.
    const getPosition = (coords: [number, number]) => {
        const [lon, lat] = coords;
        // Example mapping to a 1200x800 image
        const x = ((lon - (-125)) / ((-65) - (-125))) * 100;
        const y = ((lat - 24) / (50 - 24)) * 100;
        return { left: `${x}%`, top: `${y}%`};
    }

    if (!mapImage) return <div>Map not available.</div>;

    return (
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
            <Image 
                src={mapImage.imageUrl}
                data-ai-hint={mapImage.imageHint}
                alt="Complaint Locations Map"
                fill
                className="object-cover"
            />
            {locations.map((location, index) => {
                 const pos = getPosition(location.coordinates);
                 return (
                    <div 
                        key={index}
                        className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 border-2 border-white"
                        style={{ left: pos.left, top: pos.top }}
                        title={`Complaint location ${index + 1}`}
                    />
                 )
            })}
        </div>
    )
}
