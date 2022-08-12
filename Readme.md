# Github Pull Request hierarchy tree renderer

## Pre-Requisites
- NodeJS
- [GraphViz](https://graphviz.org/) ([Brew](https://formulae.brew.sh/formula/graphviz))

## Install dependencies

Run `yarn` to install dependencies

## Configure

### Env variables
Copy `.env.example` as `.env` and set the environment configurations accordingly.
The only required one is `GITHUB_ACCESS_TOKEN` that could be created through https://github.com/settings/tokens 
and could be also set in your `sh/bash/zsh` configuration files as export option.

### Repos config
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

- `mainBranch`: is the branch you want to hierarchy render. All parents and leafs will happen based on it. 
If it is not set all PR's will be part of it 
- `ignored` are those full links strings array that must be ignored to avoid unwanted PR's. 

**_Note:_** All `dependabot*` named branches are ignored by default. 

### Run

`node run.js`

### Result

The result will be a `svg` file based on the `graphs/<GITHUB_USER>.<REPO_NAME>.<MAIN_BRANCH>.pr_tree.svg` path
that could be open in browser

#### Final SVG example

<p align="center">
  <img alt="Image Result" width="400" src="https://raw.githubusercontent.com/sposmen/gh_pr_tree_render/8033247e79dddcca67ca7d80e048e9d5864e0aeb/graphs/sposmen.gh_pr_tree_render.pr_tree.svg">
</p>
