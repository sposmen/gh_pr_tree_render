import '@xyflow/react/dist/style.css';
import { Background, Controls, Panel, ReactFlow } from '@xyflow/react';
import GraphViewport from './GraphViewport';
import { useTheme } from '../../Theme';
import DownloadButton from "components/Pages/Tree/DownloadButton";
import RefreshButton from "components/Pages/Tree/RefreshButton";
import branchDelimiter from "components/Pages/Tree/helpers/branchDelimiter";
import dagreSolver from "components/Pages/Tree/helpers/dagreSolver";
import nodeReducer from "components/Pages/Tree/helpers/nodeReducer";
import './styles/index.scss';
import { PRNode } from "components/Pages/Tree/PRNode";
import { useEffect, useMemo, useRef, useState } from "react";
import { filterGraph, filterSuggestions } from './helpers/prFilters';
import { useLocation, useParams, useSearchParams } from "react-router-dom";

const defaultViewport = { x: 0, y: 0, zoom: 1 };

export default function TreeRenderer({ rawNodes }) {
  const { repo, '*': branch } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const pendingQuery = useRef(null);

  // Navigation (including Back/Forward) wins over any pending edit.
  useEffect(() => {
    clearTimeout(pendingQuery.current);
    setQuery(new URLSearchParams(location.search).get('q') || '');
    return () => clearTimeout(pendingQuery.current);
  }, [location]);

  function updateQuery(value, immediate = false) {
    setQuery(value);
    clearTimeout(pendingQuery.current);
    const commit = () => {
      const next = new URLSearchParams(searchParams);
      if (value) next.set('q', value);
      else next.delete('q');
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { preventScrollReset: true });
      }
    };
    if (immediate) commit();
    else pendingQuery.current = setTimeout(commit, 400);
  }
  const { theme } = useTheme();
  const graph = useMemo(() => {
    const { nodes } = rawNodes.reduce(nodeReducer, { nodes: {}, edges: [] });
    return branchDelimiter(nodes, branch);
  }, [rawNodes, branch]);
  const { nodes, edges, count } = useMemo(() => {
    const filtered = filterGraph(graph.nodes, graph.edges, query);
    return { ...filtered, nodes: dagreSolver(filtered.nodes, filtered.edges) };
  }, [graph, query]);
  const suggestions = useMemo(() => filterSuggestions(rawNodes, query), [rawNodes, query]);

  const nodeTypes = useMemo(
    () => (
      {
        prNode: PRNode
      }
    ), []);

  return (
    <div id="app">
      <ReactFlow
        forceColorMode={theme}
        nodes={nodes}
        edges={edges}
        defaultViewport={defaultViewport}
        minZoom={0.01}
        defaultEdgeOptions={{ animated: true, type: 'smoothstep', }}
        attributionPosition="bottom-left"
        className="download-image"
        nodeTypes={nodeTypes}
        nodesDraggable={false}
      >
        <Panel position="top-left" className="pr-filter nodrag nopan nowheel">
          <label htmlFor="pr-filter-input">Filter pull requests</label>
          <div className="pr-filter-input">
            <input id="pr-filter-input" type="search" list="pr-filter-suggestions"
              value={query} onChange={event => updateQuery(event.target.value)}
              placeholder="Title, author:, label:, base:, draft:…"
              aria-describedby="pr-filter-help" autoComplete="off" />
            <button type="button" onClick={() => updateQuery('', true)} disabled={!query}>Clear</button>
          </div>
          <datalist id="pr-filter-suggestions">
            {suggestions.map(value => <option key={value} value={value} />)}
          </datalist>
          <small id="pr-filter-help">
            Spaces = AND. Use OR for alternatives: author:ana OR label:bug.
            <br />Quote values with spaces: label:&quot;needs review&quot;.
            <br />Only loaded open PRs (up to 100). Ancestors remain dimmed.
          </small>
          <div role="status" aria-live="polite">
            {count ? `${count} matching PRs` : 'No matching PRs'}
          </div>
        </Panel>
        <GraphViewport nodes={nodes} />
        <Controls />
        <Background gap={15} />
        <Panel position="top-right" className="tree-actions">
          <RefreshButton />
          <DownloadButton fileNameBase={`${repo}.${branch}`} />
        </Panel>
      </ReactFlow>
    </div>
  );
}
