import axios from "axios";
import TreeRenderer from "components/Pages/Tree/TreeRenderer";
import { useLoaderData } from "react-router-dom";
import OwnersList, { ownersLoader } from "./OwnersList";
import OwnerRepos, { ownerReposLoader } from "./OwnerRepos";

export const treeRoutes = [
  {
    path: "tree",
    element: <OwnersList />,
    loader: ownersLoader,
  },
  {
    path: "tree/:owner",
    element: <OwnerRepos />,
    loader: ownerReposLoader,
  },
  {
    path: "tree/:owner/:repo",
    element: <Tree />,
    loader: loader,
  },
  {
    path: "tree/:owner/:repo/*",
    element: <Tree />,
    loader: loader,
  }
]

export async function loader({ params }) {
  const { owner, repo } = params;
  const branch = params['*'] || null;

  const { data } = await axios.get(`/api/v1/tree/${owner}/${repo}`, {
    params: branch ? { branch } : {}
  });

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
