import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import dagre from '@dagrejs/dagre';

// Frontend helpers are ESM in a CommonJS Sails project.
const source = await readFile(new URL('../assets/src/Pages/Tree/helpers/prFilters.js', import.meta.url), 'utf8');
const { matchesPR, filterGraph, filterSuggestions } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('combined PR filters and quoted labels', () => {
  const pr = { title: 'Fix login', author: { login: 'ana' }, isDraft: false, labels: { nodes: [{ name: 'needs review' }] } };
  assert.equal(matchesPR(pr, 'author:ana draft:false label:"needs review" login'), true);
  assert.equal(matchesPR(pr, 'draft:true'), false);
});

test('filter preserves ancestors and excludes unrelated branches', () => {
  const nodes = [
    { id: 'main', data: {} },
    { id: 'fix', type: 'prNode', data: { title: 'Fix login' } },
    { id: 'other', type: 'prNode', data: { title: 'Other' } },
  ];
  const edges = [{ source: 'main', target: 'fix' }, { source: 'main', target: 'other' }];
  const filtered = filterGraph(nodes, edges, 'login');
  assert.deepEqual(filtered.nodes.map(node => node.id), ['main', 'fix']);
  assert.equal(filtered.count, 1);
  assert.equal(filtered.edges.length, 1);
  assert.equal(filterGraph(nodes, edges, 'missing').nodes.length, 0);
});

test('OR alternatives with AND precedence', () => {
  const query = 'author:ana draft:false OR label:urgent';
  assert.equal(matchesPR({ author: { login: 'ana' }, isDraft: false }, query), true);
  assert.equal(matchesPR({ author: { login: 'ana' }, isDraft: true }, query), false);
  assert.equal(matchesPR({ author: { login: 'bob' }, isDraft: true, labels: { nodes: [{ name: 'urgent' }] } }, query), true);
  assert.equal(matchesPR({ author: { login: 'bob' } }, query), false);
  assert.equal(matchesPR({ title: 'third' }, 'first OR second OR third'), true);
});

test('quoted OR stays literal and unfinished groups do not match everything', () => {
  assert.equal(matchesPR({ title: 'either OR both' }, '"OR"'), true);
  assert.equal(matchesPR({ title: 'nothing' }, '"OR"'), false);
  assert.equal(matchesPR({ labels: { nodes: [{ name: 'bug OR feature' }] } }, 'label:"bug OR feature"'), true);
  assert.equal(matchesPR({ title: 'login' }, 'login OR'), true);
  assert.equal(matchesPR({ title: 'unrelated' }, 'login OR'), false);
  assert.equal(matchesPR({ title: 'anything' }, 'OR OR'), false);
  assert.equal(matchesPR({}, ''), true);
});

test('OR suggestions and graph union retain ancestors without duplicate nodes', () => {
  assert.ok(filterSuggestions([], 'author:ana ').includes('author:ana OR'));
  assert.ok(filterSuggestions([], 'author:ana O').includes('author:ana OR'));
  assert.ok(!filterSuggestions([], 'author:ana OR ').includes('author:ana OR OR'));
  const nodes = [
    { id: 'main', data: {} },
    { id: 'a', type: 'prNode', data: { title: 'login' } },
    { id: 'b', type: 'prNode', data: { title: 'search' } },
  ];
  const edges = [{ source: 'main', target: 'a' }, { source: 'main', target: 'b' }];
  const result = filterGraph(nodes, edges, 'login OR search OR login');
  assert.equal(result.count, 2);
  assert.deepEqual(result.nodes.map(node => node.id), ['main', 'a', 'b']);
  assert.equal(result.edges.length, 2);
});

test('Dagre API supports hierarchical layout after upgrade', () => {
  const graph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB' });
  graph.setNode('main', { width: 300, height: 60 });
  graph.setNode('feature', { width: 300, height: 60 });
  graph.setEdge('main', 'feature');
  dagre.layout(graph);
  assert.ok(Number.isFinite(graph.node('main').x));
  assert.ok(graph.node('feature').y > graph.node('main').y);
});
