import * as turf from '@turf/turf';
import { LatLng } from '../types';

export const calculateArea = (coordinates: LatLng[]): number => {
  if (coordinates.length < 3) return 0;

  // Turf expects the first and last point to be the same for a polygon
  const coords = coordinates.map((c) => [c.longitude, c.latitude]);
  if (
    coords[0][0] !== coords[coords.length - 1][0] ||
    coords[0][1] !== coords[coords.length - 1][1]
  ) {
    coords.push(coords[0]);
  }

  const polygon = turf.polygon([coords]);
  const areaSqMeters = turf.area(polygon);
  
  // Convert square meters to hectares (1 hectare = 10,000 square meters)
  return areaSqMeters / 10000;
};

export const formatHectares = (hectares: number): string => {
  return hectares.toFixed(2);
};

export function computeCentroid(
  vertices: { latitude: number; longitude: number }[]
): { latitude: number; longitude: number } {
  if (vertices.length === 0) return { latitude: 0, longitude: 0 };
  
  const coords = vertices.map(v => [v.longitude, v.latitude]);
  // Turf polygon requires at least 4 coordinates (last one same as first)
  if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
    coords.push(coords[0]);
  }
  
  const polygon = turf.polygon([coords]);
  const center  = turf.centroid(polygon);
  return {
    latitude:  center.geometry.coordinates[1],
    longitude: center.geometry.coordinates[0],
  };
}
