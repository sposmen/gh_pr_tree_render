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

Note: `ignored` are those full links strings that must be ignored to avoid extra data. 

### Run

`node index.js`

### Result

The result will be a `svg` file based on the `graphs/<GH_OWNER>.<GH_REPO>.pr_tree.svg` path
that could be open in browser
