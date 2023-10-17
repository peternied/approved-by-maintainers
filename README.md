# approved-by-maintainers
Github action to verify that maintainers have approved this PR

```yaml
inputs:
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
    min-required: 1
```

# Changelog

## v1
- Initial Release