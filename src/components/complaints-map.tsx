"use client";

import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import type { Complaint, ComplaintCategory } from "@/lib/types";
import { useMemo } from "react";
import { Skeleton } from "./ui/skeleton";

interface ComplaintsMapProps {
    complaints: Complaint[];
}

const categoryColors: Record<ComplaintCategory, string> = {
    "Infrastructure": "#FF5733", // Vibrant Orange
    "Utility": "#33CFFF", // Bright Sky Blue
    "Health": "#FF33A8", // Hot Pink
    "Environment": "#33FF57", // Lime Green
    "Water Department": "#3357FF", // Royal Blue
    "Road Department": "#A833FF", // Deep Purple
    "Electricity": "#FFFF33", // Electric Yellow
    "Other": "#B0B0B0" // Medium Gray
};

export function ComplaintsMap({ complaints }: ComplaintsMapProps) {
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
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border flex items-center justify-center bg-destructive/10 text-destructive">
                <p>Error loading maps. Please check your API key.</p>
            </div>
        );
    }
    
    if (!isLoaded) {
        return (
             <Skeleton className="w-full aspect-video rounded-lg" />
        );
    }

    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={center}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {complaints.filter(c => c.location).map((complaint) => {
                    const color = categoryColors[complaint.category] || categoryColors.Other;
                    return (
                        <MarkerF
                            key={complaint._id}
                            position={{
                                lat: complaint.location!.coordinates[1],
                                lng: complaint.location!.coordinates[0],
                            }}
                            title={complaint.title}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: color,
                                fillOpacity: 1,
                                strokeColor: "white",
                                strokeWeight: 1,
                                scale: 8
                            }}
                        />
                    )
                })}
            </GoogleMap>
        </div>
    );
}
