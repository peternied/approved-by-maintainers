# required-approval
Github action to verify the kinds of approvals on this PR.  Useful to work around CODEOWNERS and min approvers settings that are typically only visible to project admins. 

```yaml
inputs:
  token:
    description: "GitHub token used for authentication"
    required: true
  specific-approvers:
    description: 'The list of specific users that can approve the request, comma seperated.'
    required: false
  min-required:
    description: 'The minimum number of approvals, e.g. 2'
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
- id: list-maintainers
  run: echo "maintainers='danny, ricky, bobby'" >> $GITHUB_ENV

- uses: peternied/required-approval@v1
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    min-required: 1
    specific-approvers: ${{ steps.list-maintainers.outputs.maintainers }}
```

# Changelog

## v1
- Initial Release
