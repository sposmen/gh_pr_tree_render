import axios from "axios";
import TreeRenderer from "components/Pages/Tree/TreeRenderer";
import { useLoaderData } from "react-router-dom";

export const treeRoutes = [
  {
    path: "tree",
    element: <Tree />,
    loader: loader,
  },
  {
    path: "tree/:owner",
    element: <Tree />,
    loader: loader,
  },
  {
    path: "tree/:owner/:repo",
    element: <Tree />,
    loader: loader,
  },
  {
    path: "tree/:owner/:repo/:branch",
    element: <Tree />,
    loader: loader,
  }
]

export async function loader({ params: { owner, repo, branch = null } }) {
  if (!repo) return {};

  let url = `/api/v1/tree/${owner}/${repo}`;
  if (branch) url += `/${branch}`;

  const { data } = await axios.get(url);

  return { ...data, branch }
}

function Tree() {
  const { nodes: rawNodes, error, branch } = useLoaderData();

  return (
    <>
      {error && `${error}`}
      {!rawNodes && 'Nothing to show'}
      {rawNodes && (
        <>
          <TreeRenderer rawNodes={rawNodes}/>
        </>
      )}
    </>
  )
}

export default Tree;
