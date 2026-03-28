"use client";

import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import type { ComplaintLocation } from "@/lib/types";
import { useMemo } from "react";
import { Skeleton } from "./ui/skeleton";

interface ComplaintsMapProps {
    locations: ComplaintLocation[];
}

export function ComplaintsMap({ locations }: ComplaintsMapProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const center = useMemo(() => ({ lat: 30.9010, lng: 75.8573 }), []);

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
    };

    if (loadError) {
        return (
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border flex items-center justify-center bg-destructive/10 text-destructive">
                <p>Error loading maps. Please check your API key.</p>
            </div>
        );
    }
    
    if (!isLoaded) {
        return (
             <Skeleton className="w-full aspect-[4/3] rounded-lg" />
        );
    }

    return (
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={center}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {locations.map((location, index) => (
                    <MarkerF
                        key={index}
                        position={{
                            lat: location.coordinates[1],
                            lng: location.coordinates[0],
                        }}
                        title={`Complaint location ${index + 1}`}
                    />
                ))}
            </GoogleMap>
        </div>
    );
}
