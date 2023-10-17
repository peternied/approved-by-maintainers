# approved-by-maintainers
Github action to verify that maintainers have approved this PR

```yaml
inputs:
  token:
    description: "GitHub token used for authentication"
    required: true
  maintainers:
    description: 'The list of maintainers that can approve the request, space seperated'
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
- id: find-maintainers
  run: echo "maintainers=$(cat C:/Users/peter/Documents/GitHub/OpenSearch/MAINTAINERS.md | grep -oP '(?<=\[).+(?=\]\(http)' | tr '\n' ' ')" >> $GITHUB_ENV

- uses: peternied/approved-by-maintainers@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    min-required: 1
```

# Changelog

## v1
- Initial Release