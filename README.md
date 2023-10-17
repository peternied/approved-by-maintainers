# approved-by-maintainers
Github action to verify that maintainers have approved this PR

```yaml
inputs:
  token:
    description: "GitHub token used for authentication"
    required: true
  maintainers-file:
    description: 'The file where the maintainers are listed, defaults to MAINTAINERS.md'
    required: false
  min-required:
    description: 'The minimum number of maintainers required to approve, e.g. 2'
    required: true
```

## Usage:

```yaml
on:
  pull_request_review:
    types: [approved]
  pull_request_target:
    types: [opened, reopened]
...
steps:
- uses: peternied/approved-by-maintainers@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    min-required: 1
```

# Changelog

## v1
- Initial Release