import { useState, useCallback, useMemo } from 'react';
import { LatLng } from '../types';
import * as turf from '@turf/turf';
import * as Haptics from 'expo-haptics';

export type EditorMode = 'draw' | 'edit' | 'view';

export const usePolygonEditor = (initialVertices: LatLng[] = []) => {
  const [vertices, setVertices] = useState<LatLng[]>(initialVertices);
  const [mode, setMode] = useState<EditorMode>('draw');
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<LatLng[][]>([]);
  const [redoStack, setRedoStack] = useState<LatLng[][]>([]);

  const pushToUndo = useCallback((currentVertices: LatLng[]) => {
    setUndoStack((prev) => [currentVertices, ...prev].slice(0, 20));
    setRedoStack([]);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const [prev, ...rest] = undoStack;
    setRedoStack((prevRedo) => [vertices, ...prevRedo]);
    setVertices(prev);
    setUndoStack(rest);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [undoStack, vertices]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const [next, ...rest] = redoStack;
    setUndoStack((prevUndo) => [vertices, ...prevUndo]);
    setVertices(next);
    setRedoStack(rest);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [redoStack, vertices]);

  const addVertex = useCallback((latlng: LatLng) => {
    pushToUndo(vertices);
    setVertices((prev) => [...prev, latlng]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [vertices, pushToUndo]);

  const deleteVertex = useCallback((index: number) => {
    if (vertices.length <= 3 && mode === 'edit') {
      Haptics.notificationAsync(Haptics.NotificationType.Error);
      return;
    }
    pushToUndo(vertices);
    setVertices((prev) => prev.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [vertices, mode, pushToUndo]);

  const updateVertex = useCallback((index: number, latlng: LatLng) => {
    // We don't push to undo during every drag event, usually call this on drag end
    setVertices((prev) => {
      const next = [...prev];
      next[index] = latlng;
      return next;
    });
  }, []);

  const insertVertex = useCallback((index: number, latlng: LatLng) => {
    pushToUndo(vertices);
    setVertices((prev) => {
      const next = [...prev];
      next.splice(index, 0, latlng);
      return next;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [vertices, pushToUndo]);

  const clearAll = useCallback(() => {
    pushToUndo(vertices);
    setVertices([]);
    setMode('draw');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, [vertices, pushToUndo]);

  const area = useMemo(() => {
    if (vertices.length < 3) return 0;
    const coords = vertices.map(v => [v.longitude, v.latitude]);
    coords.push(coords[0]);
    return turf.area(turf.polygon([coords])) / 10000;
  }, [vertices]);

  const perimeter = useMemo(() => {
    if (vertices.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < vertices.length; i++) {
        const nextIdx = (i + 1) % vertices.length;
        if (nextIdx === 0 && mode === 'draw') continue; // Don't close perimeter if drawing
        const from = turf.point([vertices[i].longitude, vertices[i].latitude]);
        const to = turf.point([vertices[nextIdx].longitude, vertices[nextIdx].latitude]);
        dist += turf.distance(from, to, { units: 'meters' });
    }
    return dist;
  }, [vertices, mode]);

  return {
    vertices,
    mode,
    setMode,
    selectedVertexIndex,
    setSelectedVertexIndex,
    addVertex,
    deleteVertex,
    updateVertex,
    insertVertex,
    clearAll,
    undo,
    redo,
    pushToUndo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    area,
    perimeter,
  };
};
