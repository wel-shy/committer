# conventional-committer

[![Build Status](https://travis-ci.com/wel-shy/committer.svg?branch=master)](https://travis-ci.com/wel-shy/committer)
[![codecov](https://codecov.io/gh/wel-shy/committer/branch/master/graph/badge.svg)](https://codecov.io/gh/wel-shy/committer)

Git commit manager, format commits to meet the Conventional Commit format, but also include
an emoji for enhanced visual grepping.

## Install

```
npm install -g conventional-committer
```

## Use

To commit, run

```
conventional-committer
```

### Options

- Auto add untracked changes with a `-a` flag.
- Sign commits with `-s`, requires setting a gpg key for git.

## Test

```
npm run test
```
