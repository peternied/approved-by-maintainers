# required-approval
Github action to verify the kinds of approvals on this PR.  Useful to work around CODEOWNERS and min approvers settings that are typically only visible to project admins. 

```yaml
inputs:
  token:
    description: "GitHub token used for authentication"
    required: true
  required-approvers-list:
    description: 'The list of specific users that can approve the request, comma seperated. '
    required: true
  min-required:
    description: 'The minimum number of approvals, e.g. 2'
    required: true

outputs:
  specific-approvals:
    description: "The list of users that approved"
    value: ${{ steps.approval-check.outputs.approvers }}
```

## Usage:

```yaml
on:
  pull_request_review:
...
steps:
- id: list-maintainers
  run: echo "maintainers='danny, ricky, bobby'" >> $GITHUB_ENV

- uses: peternied/required-approval@v1.2
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    min-required: 1
    required-approvers-list: ${{ steps.list-maintainers.outputs.maintainers }}
```

# Changelog

## v1
- Initial Release
