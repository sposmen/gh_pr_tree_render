import { useEffect } from 'react';
import { getNodesBounds, useReactFlow, useNodesStore, useOptionsStore, useViewportStore } from '@xyflow/react';

// The DOM viewport is window-sized; the navigable graph space is finite.
export default function GraphViewport({ nodes }) {
  // In controlled flows the cached nodesInitialized flag can remain false
  // after ResizeObserver measures nodes, unless onNodesChange feeds them back.
  // Read the actual measurements from the store instead.
  const initialized = useNodesStore(state => nodes.every(node => {
    const internal = state.nodeLookup.get(node.id);
    return internal?.measured?.width > 0 && internal?.measured?.height > 0;
  }));
  const { getInternalNode, setViewport, viewportInitialized } = useReactFlow();
  const setTranslateExtent = useOptionsStore(state => state.setTranslateExtent);
  const width = useViewportStore(state => state.width);
  const height = useViewportStore(state => state.height);

  useEffect(() => {
    if (!viewportInitialized || !width || !height || (nodes.length && !initialized)) return;
    const timer = setTimeout(() => {
      const measured = new Map(nodes.map(node => [node.id, getInternalNode(node.id)]));
      const bounds = nodes.length ? getNodesBounds(nodes.map(node => ({
        ...node,
        width: measured.get(node.id)?.measured?.width || 300,
        height: measured.get(node.id)?.measured?.height || 60,
        measured: measured.get(node.id)?.measured,
      }))) : { x: 0, y: 0, width: 0, height: 0 };
      const margin = 40;
      const worldWidth = Math.max(width, bounds.width + margin * 2);
      const worldHeight = Math.max(height, bounds.height + margin * 2);
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      setTranslateExtent([
        [centerX - worldWidth / 2, centerY - worldHeight / 2],
        [centerX + worldWidth / 2, centerY + worldHeight / 2],
      ]);
      // Keep text readable instead of shrinking large graphs into the screen.
      setViewport({ x: width / 2 - centerX, y: height / 2 - centerY, zoom: 1 });
    }, 150);
    return () => clearTimeout(timer);
  }, [nodes, initialized, viewportInitialized, width, height, getInternalNode, setViewport, setTranslateExtent]);
  return null;
}
