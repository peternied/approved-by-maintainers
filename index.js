const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  const token = core.getInput('token', { required: true });
  if (!token) {
    core.setFailed(`Input parameter 'token' is required`);
    return;
  }

  const minRequiredStr = core.getInput('min-required', { required: true })
  if (!minRequiredStr) {
    core.setFailed(`Input parameter 'min-required' is required`);
    return;
  }
  const minRequired = parseInt(minRequiredStr);

  const pullRequestId = github.context.payload.pull_request?.number || core.getInput('mock-pr-number', { required: false });
  if (!pullRequestId) {
    core.setFailed(`Unable to find associated pull request from the context: ${JSON.stringify(github.context)}`);
    return;
  }

  const requiredApprovers = core.getInput('required-approvers-list', { required: false })?.split(',').map(s => s.trim()) || [];
  const mockApprovers = core.getInput('mock-approvers', { required: false })?.split(' ') || [];

  let pullRequestApprovers = mockApprovers;
  if (!pullRequestApprovers) {
    const client = github.getOctokit(token);
    const { data: reviewers } = await client.rest.pulls.listReviews({
        pull_number: pullRequestId,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    const approvers = reviewers
        .filter(reviewer => reviewer.state === 'APPROVED' && reviewer.user?.login)
        .map(reviewer => reviewer.user?.login)

    pullRequestApprovers = approvers;
  }

  const acceptedApprovers = [];
  pullRequestApprovers.forEach(approver => {
    if (!requiredApprovers || requiredApprovers.filter(required => required === approver).length != 0) {
        acceptedApprovers.push(approver);
    }
  });
  core.info(`Found approvals from ${acceptedApprovers.join(', ')}`)

  if (acceptedApprovers.length < minRequired) {
    core.setFailed(`Not enough approvals; has ${acceptedApprovers.length} where ${minRequired} approvals are required.`);
  } else {
    core.info(`Meets  minimum number of approvals requirement with ${acceptedApprovers.length} approvals`);
  }
}

run();
