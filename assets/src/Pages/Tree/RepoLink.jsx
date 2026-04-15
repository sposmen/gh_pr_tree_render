import { Link } from "react-router-dom";

export function RepoLink({ owner, repo, children }) {
  const to = repo ? `/tree/${owner}/${repo}` : `/tree/${owner}`;
  return <Link to={to}>{children ?? (repo ? `${owner}/${repo}` : owner)}</Link>;
}

export default RepoLink;