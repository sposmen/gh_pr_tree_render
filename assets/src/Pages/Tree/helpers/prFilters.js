const tokenize = (query) => query.match(/(?:[^\s"]+|"[^"]*"?)+/g) || [];
const normalize = (value) => String(value || '').toLowerCase();
const quote = (value) => /\s/.test(value) ? `"${value}"` : value;

export function matchesPR(pr, query) {
  const tokens = tokenize(query);
  if (!tokens.length) { return true; }
  // OR separates AND groups. Quoted "OR" remains literal title text.
  const groups = [[]];
  tokens.forEach(token => {
    if (token === 'OR') { groups.push([]); }
    else { groups[groups.length - 1].push(token); }
  });
  // Ignore unfinished empty groups while typing, never treat them as matches.
  return groups.some(group => group.length > 0 && group.every((token) => {
    const separator = token.indexOf(':');
    const key = separator < 0 ? '' : normalize(token.slice(0, separator));
    const value = normalize((separator < 0 ? token : token.slice(separator + 1)).replaceAll('"', ''));
    switch (key) {
      case 'author': return normalize(pr.author?.login) === value;
      case 'label': return (pr.labels?.nodes || []).some(label => normalize(label.name) === value);
      case 'base': return normalize(pr.baseRefName) === value;
      case 'draft': return ['true', 'false'].includes(value) && Boolean(pr.isDraft) === (value === 'true');
      case 'review': return normalize(pr.reviewDecision) === value;
      case 'conflicts': return ['true', 'false'].includes(value) && (pr.mergeable === 'CONFLICTING') === (value === 'true');
      case '': return normalize(pr.title).includes(value);
      default: return false;
    }
  }));
}

export function filterGraph(nodes, edges, query) {
  const matches = nodes.filter(node => node.type === 'prNode' && matchesPR(node.data, query));
  if (!query.trim()) { return { nodes, edges, count: matches.length }; }
  const matched = new Set(matches.map(node => node.id));
  const visible = new Set(matched);
  const parents = new Map();
  edges.forEach(edge => parents.set(edge.target, [...(parents.get(edge.target) || []), edge.source]));
  const pending = [...matched];
  while (pending.length) {
    (parents.get(pending.pop()) || []).forEach(id => {
      if (!visible.has(id)) { visible.add(id); pending.push(id); }
    });
  }
  return {
    count: matches.length,
    nodes: nodes.filter(node => visible.has(node.id)).map(node => ({
      ...node,
      style: { ...node.style, opacity: matched.has(node.id) ? 1 : 0.35,
        boxShadow: matched.has(node.id) ? '0 0 0 2px #2563eb' : 'none' }
    })),
    edges: edges.filter(edge => visible.has(edge.source) && visible.has(edge.target))
  };
}

export function filterSuggestions(prs, query) {
  const tokens = tokenize(query);
  const current = /\s$/.test(query) ? '' : (tokens.pop() || '');
  const prefix = /\s$/.test(query) ? query : query.slice(0, query.length - current.length);
  const options = ['author:', 'label:', 'base:', 'draft:true', 'draft:false',
    'review:approved', 'review:changes_requested', 'review:review_required',
    'conflicts:true', 'conflicts:false'];
  if (tokens.length && tokens[tokens.length - 1] !== 'OR') { options.unshift('OR'); }
  prs.forEach(pr => {
    if (pr.author?.login) { options.push(`author:${quote(pr.author.login)}`); }
    options.push(`base:${quote(pr.baseRefName)}`);
    (pr.labels?.nodes || []).forEach(label => options.push(`label:${quote(label.name)}`));
  });
  return [...new Set(options)].filter(option => normalize(option).startsWith(normalize(current)))
    .slice(0, 50).map(option => prefix + option);
}
