# Github PR Tree renderer

## Requirements
- NodeJS
- Yarn

## Steps to use it
- Clone the repo: `git clone git@github.com:sposmen/gh_pr_tree_render.git`
- Go to the directory `cd gh_pr_tree_render`
- Install node dependencies with  `yarn`
- Build the assets `yarn run build:prod`
- Start the app `yarn run start-app`
- [Open the app](http://localhost:1337)
- In the config set your [github token](https://github.com/settings/tokens)

## The convention to open a Tree is like

### `http://localhost:1337/<OWNER>/<REPO>/<BRANCH: Optional>`

## This is how it looks

<p align="center">
  <img alt="Image Result" width="400" src="https://raw.githubusercontent.com/sposmen/gh_pr_tree_render/2ad6e45237b7b5d7799a124bb3c6d0603ca3a8cd/assets/images/gh_tree_example.png">
</p>


Powered By [SailsJS](https://sailsjs.com) and [React](https://react.dev/)
