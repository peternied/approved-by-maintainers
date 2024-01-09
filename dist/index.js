/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 389:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 977:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(389);
const github = __nccwpck_require__(977);

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
    for await (const { reviews: allReviews } of iterator) {
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

})();

module.exports = __webpack_exports__;
/******/ })()
;