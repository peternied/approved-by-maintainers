"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
function run() {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const token = core_1.default.getInput('token', { required: true });
        if (!token) {
            core_1.default.setFailed(`Input parameter 'token' is required`);
            return;
        }
        const minRequiredStr = core_1.default.getInput('min-required', { required: true });
        if (!minRequiredStr) {
            core_1.default.setFailed(`Input parameter 'min-required' is required`);
            return;
        }
        const minRequired = parseInt(minRequiredStr);
        const pullRequestId = (_a = github_1.default.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
        if (!pullRequestId) {
            core_1.default.setFailed(`Unable to find associated pull request from the context: ${JSON.stringify(github_1.default.context)}`);
            return;
        }
        const requiredApprovers = ((_b = core_1.default.getInput('required-approvers-list', { required: false })) === null || _b === void 0 ? void 0 : _b.split(',').map(s => s.trim())) || [];
        const mockApprovers = ((_c = core_1.default.getInput('mock-approvers', { required: false })) === null || _c === void 0 ? void 0 : _c.split(' ')) || [];
        let pullRequestApprovers = mockApprovers;
        if (!pullRequestApprovers) {
            const client = github_1.default.getOctokit(token);
            const { data: reviewers } = yield client.rest.pulls.listReviews({
                pull_number: pullRequestId,
                owner: github_1.default.context.repo.owner,
                repo: github_1.default.context.repo.repo
            });
            const approvers = reviewers
                .filter(reviewer => { var _a; return reviewer.state === 'APPROVED' && ((_a = reviewer.user) === null || _a === void 0 ? void 0 : _a.login); })
                .map(reviewer => reviewer.user.login);
            pullRequestApprovers = approvers;
        }
        const acceptedApprovers = [];
        pullRequestApprovers.forEach(approver => {
            if (!requiredApprovers || requiredApprovers.filter(required => required === approver).length != 0) {
                acceptedApprovers.push(approver);
            }
        });
        core_1.default.info(`Found approvals from ${acceptedApprovers.join(', ')}`);
        if (acceptedApprovers.length < minRequired) {
            core_1.default.setFailed(`Not enough approvals; has ${acceptedApprovers.length} where ${minRequired} approvals are required.`);
        }
        else {
            core_1.default.info(`Meets  minimum number of approvals requirement with ${acceptedApprovers.length} approvals`);
        }
    });
}
run();
