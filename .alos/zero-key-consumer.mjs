export const ALOS_PROJECT_KEY = "pivot-ai-website";
export const ALOS_PROJECT_NAME = "Pivot AI Website";
export const ALOS_REPOSITORY = "Gagan8atwal/pivot-ai-website";
export const ALOS_BRANCH = "build/unified-saas-v3-pivot-sidecar-20260930";
export const ALOS_ZERO_KEY_MODE = "deterministic-zero-key";
export const ALOS_BROWSER_OWNER_SHA256 = "9f76e0dbb2b5d7dc1ce0c6fc172ad1204b7795adcb423d7a27c7f6bdbf090f56";
export const ALOS_ADMISSION_SCHEMA = "alos.project-admission.v1";
export const ALOS_OWNER_RESULT_SCHEMA = "alos.project-owner-result.v1";

const TOOLS = Object.freeze(["browser.read", "browser.interact"]);
const ID = /^[A-Za-z0-9._:-]{1,192}$/;
const REVISION = /^[0-9a-f]{40,64}$/i;
const need = (condition, message) => { if (!condition) throw new Error(`ALOS_CONSUMER_REJECTED: ${message}`); };
const valid = (value) => typeof value === "string" && ID.test(value);
const validRevision = (value) => typeof value === "string" && REVISION.test(value);
const exactTools = (actual) => Array.isArray(actual) && actual.length === TOOLS.length && new Set(actual).size === TOOLS.length && TOOLS.every((tool) => actual.includes(tool));
const actionIdentity = (action) => typeof action === "string" ? action : action?.actionId ?? action?.id;

export function buildAlosAdmissionRequest({ projectId, taskId, agentId, correlationId, sourceRevision }) {
  for (const [key, value] of Object.entries({ projectId, taskId, agentId, correlationId })) need(valid(value), `${key} is required`);
  need(validRevision(sourceRevision), "sourceRevision must be an exact git revision");
  return Object.freeze({
    schema: ALOS_ADMISSION_SCHEMA,
    projectKey: ALOS_PROJECT_KEY,
    projectName: ALOS_PROJECT_NAME,
    repository: ALOS_REPOSITORY,
    branch: ALOS_BRANCH,
    sourceRef: ALOS_BRANCH,
    sourceRevision,
    projectId, taskId, agentId, correlationId,
    requiredAllowedTools: TOOLS,
    inference: Object.freeze({ mode: ALOS_ZERO_KEY_MODE, provider: null, model: null, providerCredentialRequired: false, externalModelCalls: 0, maxPaidCostUsd: 0, serverOwnedDeterministicPlanner: true }),
    browser: Object.freeze({ ownerSha256: ALOS_BROWSER_OWNER_SHA256, requireNonRoot: true, requireNoNewPrivs: true, forbidSandboxOverride: true }),
    mintsExecutionIdentity: false,
    mintsPermissionGrant: false,
    acceptsModelAuthorization: false,
  });
}

export function consumeAlosOwnerResult(result, admission) {
  need(result && typeof result === "object" && !Array.isArray(result), "result object required");
  need(admission && typeof admission === "object" && !Array.isArray(admission), "admission object required");
  need(admission.schema === ALOS_ADMISSION_SCHEMA && admission.projectKey === ALOS_PROJECT_KEY && admission.repository === ALOS_REPOSITORY, "wrong admission");
  need(admission.branch === ALOS_BRANCH && admission.sourceRef === ALOS_BRANCH && validRevision(admission.sourceRevision), "wrong admission source");
  need(result.schema === ALOS_OWNER_RESULT_SCHEMA && result.projectKey === ALOS_PROJECT_KEY && result.repository === ALOS_REPOSITORY, "wrong owner result");
  need(result.branch === ALOS_BRANCH && result.sourceRef === ALOS_BRANCH && result.sourceRevision === admission.sourceRevision, "source mismatch");
  need(result.status === "SUCCEEDED", "execution did not succeed");
  for (const field of ["projectId","taskId","agentId","correlationId"]) { need(valid(result[field]) && result[field] === admission[field], `${field} mismatch`); }
  for (const field of ["executionId","resultId"]) need(valid(result[field]), `${field} missing`);
  need(exactTools(result.allowedTools), "browser permissions mismatch");
  need(result.persistedAllowedToolsEnforced === true, "persisted permissions not enforced");
  need(result.actualAgentRun === true && result.runAgentExecuted === true && result.toolExecutorExecuted === true && result.orchestratorExecuted === true && result.sameOwnerBrowser === true, "shared ALOS path not proven");
  need(result.agentExecution?.mode === "runAgent-internal-deterministic-browser-planner" && result.agentExecution?.externalInference === false && result.agentExecution?.provider === null && result.agentExecution?.model === null, "deterministic runAgent mismatch");
  const i=result.inference; need(i?.mode===ALOS_ZERO_KEY_MODE&&i?.serverOwnedDeterministicPlanner===true&&i?.provider===null&&i?.model===null&&i?.requestedModel===null&&i?.endpoint===null&&Array.isArray(i?.providerReceipts)&&i.providerReceipts.length===0&&i.externalModelCalls===0&&i.externalApiCalls===0&&i.paidCostUsd===0,"inference/cost mismatch");
  const b=result.browser; need(b?.ownerSha256===ALOS_BROWSER_OWNER_SHA256&&b?.security?.uid>0&&b?.security?.gid>0&&b?.security?.noNewPrivs===true&&b?.security?.sandboxOverride===false,"Browser security mismatch");
  need(result.verifier?.invoked===true&&result.verifier?.rawEvidence===true&&result.verifier?.sameOwner===true,"verifier evidence missing");
  need(Array.isArray(result.runs)&&result.runs.length===2,"exactly two runs required");
  const executions=new Set(),sessions=new Set();
  for(const run of result.runs){
    need(run?.status==="SUCCEEDED"&&run?.actualAgentRun===true&&run?.runAgentExecuted===true,"bounded run failed");
    need(run?.sourceRef===ALOS_BRANCH&&run?.sourceRevision===admission.sourceRevision,"bounded source mismatch");
    need(run?.inferenceMode===ALOS_ZERO_KEY_MODE&&run?.modelInference===false,"bounded inference mismatch");
    need(valid(run.executionId)&&!executions.has(run.executionId),"duplicate execution"); executions.add(run.executionId);
    need(Array.isArray(run.sessionIds)&&run.sessionIds.length>=2&&new Set(run.sessionIds).size===run.sessionIds.length,"bounded sessions missing");
    for(const sid of run.sessionIds){ need(valid(sid)&&!sessions.has(sid),"duplicate session"); sessions.add(sid); }
    need(Array.isArray(run.actions)&&run.actions.length>0&&Array.isArray(run.evidence),"browser evidence missing");
    const actionIds=run.actions.map(actionIdentity); need(actionIds.every(valid)&&new Set(actionIds).size===actionIds.length,"action identity invalid");
    for(const id of actionIds) need(run.evidence.some((e)=>e?.producedByExecution===run.executionId&&e?.producedByAction===id),"correlated evidence missing");
    need(run.duplicateSideEffects===0,"duplicate side effects");
  }
  need(result.reliability?.retryProof===true||result.reliability?.reopenProof===true,"retry/reopen proof required");
  need(result.reliability?.duplicateSideEffects===0,"duplicate side effects");
  return Object.freeze({accepted:true,projectKey:ALOS_PROJECT_KEY,projectId:result.projectId,sourceRef:ALOS_BRANCH,sourceRevision:admission.sourceRevision,executionIds:Object.freeze([...executions]),inferenceMode:ALOS_ZERO_KEY_MODE,browserOwnerSha256:ALOS_BROWSER_OWNER_SHA256,sameOwnerConsumed:true,paidCostUsd:0});
}
