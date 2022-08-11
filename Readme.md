# Github PR hierarchy tree

### Pre-Requisites
- NodeJS
- [GraphViz](https://graphviz.org/) ([Brew](https://formulae.brew.sh/formula/graphviz))

### Install dependencies

Run `yarn` to install dependencies

### Configure

Copy `.env.example` as `.env` and set the configurations accordingly.

Set your repositories configurations in `repositories.json`
```json
{
  "GITHUB_USER": {
    "REPO_NAME": {
      "mainBranch": "BRANCH_TO_RENDER",
      "ignored": []
    },
    "REPO_NAME2": {
      "mainBranch": "master",
      "ignored": []
    }
  }
}
```

Note: `ignored` are those full links strings array that must be ignored to avoid unwanted PR's. 

### Run

`node run.js`

### Result

The result will be a `svg` file based on the `graphs/<GITHUB_USER>.<REPO_NAME>.pr_tree.svg` path
that could be open in browser

#### Final SVG example

<p align="center">
  <img alt="Image Result" width="460" height="300" src="https://raw.githubusercontent.com/sposmen/gh_pr_tree_render/8033247e79dddcca67ca7d80e048e9d5864e0aeb/graphs/sposmen.gh_pr_tree_render.pr_tree.svg">
</p>
