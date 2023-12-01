import core from "@actions/core";
import github from "@actions/github";

async function run() {
  const token = core.getInput('token', { required: true });
  const pullRequest: number = github.context.payload.pull_request?.number || -1;
  const minRequiredApprovals: number = core.getInput('min-required', { required: true });

  const requiredApprovers: string[] = core.getInput('required-approvers-list', { required: false })?.split(',').map(s => s.trim()) || [];
  const mockApprovers: string[] = core.getInput('mock-approvers', { required: false })?.split(' ') || [];

  if (pullRequest == -1) {
    core.setFailed(`Unable to find associated pull request from the context: ${JSON.stringify(github.context)}`);
    return;    
  }

  const pullRequestApprovers = mockApprovers ? mockApprovers : await (async () => {
    const client = github.getOctokit(token);
    const { data: reviewers } = await client.rest.pulls.listReviews({
        pull_number: pullRequest,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
    });

    const approvers: string[] = reviewers
        .filter(reviewer => reviewer.state == 'APPROVED')
        .map(reviewer => reviewer.user?.login || "TODO: FIX THIS??")

    return approvers;
    })();

  const acceptedApprovers: string[] = [];
  pullRequestApprovers.forEach(approver => {
    if (!requiredApprovers || requiredApprovers.filter(required => required === approver).length != 0) {
        acceptedApprovers.push(approver);
    }
  });
  core.info(`Found approvals from ${acceptedApprovers.join(', ')}`)

  if (acceptedApprovers.length < minRequiredApprovals) {
    core.setFailed(`Not enough approvals; has ${acceptedApprovers.length} where ${minRequiredApprovals} approvals are required.`);
  } else {
    core.info(`Meets  minimum number of approvals requirement with ${acceptedApprovers.length} approvals`);
  }
}

run();
