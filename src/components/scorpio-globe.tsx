"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export function ScorpioGlobe() {
	const { theme, systemTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const isDark = theme === "dark" || (theme === "system" && systemTheme === "dark");

	return (
		<div className="flex items-center justify-center w-full h-full cursor-grab active:cursor-grabbing">
			<Globe
				width={400}
				height={400}
				backgroundColor="rgba(0,0,0,0)"
				globeImageUrl={
					isDark
						? "//unpkg.com/three-globe/example/img/earth-night.jpg"
						: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
				}
				bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
				atmosphereColor={isDark ? "#ffffff" : "#444444"}
				atmosphereAltitude={0.15}
				pointsData={[
					{ lat: 38.9072, lng: -77.0369, location: "Washington, D.C." }, // IAD1
					{ lat: 37.7749, lng: -122.4194, location: "San Francisco" }, // SFO1
					{ lat: 50.1109, lng: 8.6821, location: "Frankfurt" }, // FRA1
					{ lat: 51.5074, lng: -0.1278, location: "London" }, // LHR1
					{ lat: 1.3521, lng: 103.8198, location: "Singapore" }, // SIN1
					{ lat: 35.6762, lng: 139.6503, location: "Tokyo" }, // HND1
					{ lat: -33.8688, lng: 151.2093, location: "Sydney" }, // SYD1
					{ lat: -23.5505, lng: -46.6333, location: "São Paulo" }, // GRU1
					{ lat: 19.076, lng: 72.8777, location: "Mumbai" }, // BOM1
				]}
				pointColor={() => (isDark ? "#10b981" : "#ef4444")}
				pointAltitude={0.01}
				pointRadius={0.8}
				ringsData={[
					{ lat: 38.9072, lng: -77.0369 },
					{ lat: 37.7749, lng: -122.4194 },
					{ lat: 50.1109, lng: 8.6821 },
					{ lat: 51.5074, lng: -0.1278 },
					{ lat: 1.3521, lng: 103.8198 },
					{ lat: 35.6762, lng: 139.6503 },
					{ lat: -33.8688, lng: 151.2093 },
					{ lat: -23.5505, lng: -46.6333 },
					{ lat: 19.076, lng: 72.8777 },
				]}
				ringColor={() => (isDark ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.4)")}
				ringMaxRadius={4}
				ringPropagationSpeed={2}
				ringRepeatPeriod={1200}
			/>
		</div>
	);
}
