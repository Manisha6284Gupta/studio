"use client";

import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import type { Complaint, ComplaintCategory, ComplaintLocation } from "@/lib/types";
import { useMemo, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import Link from "next/link";

interface ComplaintsMapProps {
    complaints: Complaint[];
    interactive?: boolean;
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

export function ComplaintsMap({ complaints, interactive = false }: ComplaintsMapProps) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });
    
    const [selectedPlace, setSelectedPlace] = useState<{ lat: number, lng: number } | null>(null);

    const onMapClick = (e: google.maps.MapMouseEvent) => {
        if (!interactive) return;
        if (e.latLng) {
            setSelectedPlace({
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            });
        }
    };

    const center = useMemo(() => {
        if (complaints.length === 1 && complaints[0].location) {
            return { lat: complaints[0].location.coordinates[1], lng: complaints[0].location.coordinates[0] };
        }
        return { lat: 30.9010, lng: 75.8573 }
    }, [complaints]);

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
                zoom={complaints.length === 1 ? 15 : 12}
                center={center}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
                onClick={onMapClick}
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

                {selectedPlace && (
                    <MarkerF
                        position={selectedPlace}
                    />
                )}

                {selectedPlace && (
                    <InfoWindowF
                        position={selectedPlace}
                        onCloseClick={() => {
                            setSelectedPlace(null);
                        }}
                    >
                        <div className="p-2">
                            <h3 className="font-semibold text-foreground mb-2">Report an issue here?</h3>
                            <Button asChild size="sm">
                                <Link href={`/dashboard/citizen/complaints/new?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}`}>
                                    Create Complaint
                                </Link>
                            </Button>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    );
}
