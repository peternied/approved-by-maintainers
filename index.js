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

  const requiredApprovers = core.getInput('required-approvers-list', { required: true })?.split(',').map(s => s.trim()).filter(a => a.length != 0);
  const mockApproversString = core.getInput('mock-approvers', { required: false, trimWhitespace: false });

  let pullRequestApprovers;
  if (mockApproversString.length == 0) {
    const client = github.getOctokit(token);
    const allReviews = await client.paginate.iterator(client.rest.pulls.listReviews, {
        pull_number: pullRequestId,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        per_page: 100,
    });

    let approvers = [];
    for await (const { data: reviews } of allReviews) {
      console.debug(`listReviews paged response response:\n ${JSON.stringify(reviews)}`);
      for (const review of reviews) {
        if (review => review.state === 'APPROVED' && review.user?.login) {
          approvers.push(review.user?.login)
        }
      }
    }

    console.log(`filtered to approvers:\n ${JSON.stringify(approvers)}`);

    pullRequestApprovers = approvers;
  } else {
    pullRequestApprovers = mockApproversString.split(' ');
  }

  const acceptedApprovers = [];
  pullRequestApprovers.forEach(approver => {
    if (!requiredApprovers || !requiredApprovers.length || requiredApprovers.filter(required => required === approver).length != 0) {
        acceptedApprovers.push(approver);
    }
  });
  core.info(`Found approvals from ${acceptedApprovers.join(', ')}`)

  if (acceptedApprovers.length < minRequired) {
    core.setFailed(`Not enough approvals; has ${acceptedApprovers.length} where ${minRequired} approvals are required.`);
  } else {
    core.info(`Meets minimum number of approvals requirement with ${acceptedApprovers.length} approvals`);
  }
}

async function getAllReviews(pullRequestId, owner, repo) {


  
}

run();
