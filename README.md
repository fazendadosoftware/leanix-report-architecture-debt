# leanix-report-architecture-debt

> LeanIX custom report build with Vue.js.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# upload report to LeanIX
npm run upload

# load the workspace with a demo dataset (warning: will delete all pre-existing workspace factsheets!!!)
npm run setupDevWorkspace
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Workspace configuration
This report requires that a tag group named "Opportunity costs" (case insensitive) exists on the workspace.

This tag group is intended to be used on "Project" factsheets and should be configured as "Single" mode.

Moreover, this tag group must contain the a set of 4 tags named "low", "medium", "high" and "very high".

A test dataset can be loaded on a develoment workspace by running the ```npm run setupDevWorkspace``` command.
