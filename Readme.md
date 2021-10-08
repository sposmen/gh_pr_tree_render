# Github PR hierarchy tree

### Pre-Requisites
- NodeJS
- [GraphViz](https://graphviz.org/) ([Brew](https://formulae.brew.sh/formula/graphviz))

### Install dependencies

Run `yarn` to install dependencies

### Configure

Copy `.env.example` as `.env` and set the configurations accordingly

### Run

`node index.js`

### Result

The result will be a `svg` file based on the `graphs/<GH_OWNER>.<GH_REPO>.pr_tree.svg` path
that could be open in browser
