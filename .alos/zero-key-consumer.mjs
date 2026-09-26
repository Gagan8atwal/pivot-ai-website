export const ALOS_PROJECT_KEY="pivot-ai-website";
export const ALOS_PROJECT_NAME="Pivot AI Website";
export const ALOS_REPOSITORY="Gagan8atwal/pivot-ai-website";
export const ALOS_BRANCH="alos/native-core-integration-20260925";
export const ALOS_ZERO_KEY_MODE="deterministic-zero-key";
export const ALOS_BROWSER_OWNER_SHA256="822cc19669d7d1000063e6a380bb73e1d91440f5067eae44d110a4df061b4159";
export const ALOS_ADMISSION_SCHEMA="alos.project-admission.v1";
export const ALOS_OWNER_RESULT_SCHEMA="alos.project-owner-result.v1";

const TOOLS=Object.freeze(["browser.read","browser.interact"]);
const ID=/^[A-Za-z0-9._:-]{1,192}$/;
const need=(condition,message)=>{if(!condition)throw new Error("ALOS_CONSUMER_REJECTED: "+message)};
const valid=value=>typeof value==="string"&&ID.test(value);

export function buildAlosAdmissionRequest({projectId,taskId,agentId,correlationId}) {
  for (const [key,value] of Object.entries({projectId,taskId,agentId,correlationId})) {
    need(valid(value),key+" is required");
  }
  return Object.freeze({
    schema:ALOS_ADMISSION_SCHEMA,
    projectKey:ALOS_PROJECT_KEY,
    projectName:ALOS_PROJECT_NAME,
    repository:ALOS_REPOSITORY,
    branch:ALOS_BRANCH,
    projectId,taskId,agentId,correlationId,
    requiredAllowedTools:TOOLS,
    inference:Object.freeze({
      mode:ALOS_ZERO_KEY_MODE,
      provider:null,
      model:null,
      providerCredentialRequired:false,
      externalModelCalls:0,
      maxPaidCostUsd:0,
      serverOwnedDeterministicPlanner:true
    }),
    browser:Object.freeze({
      ownerSha256:ALOS_BROWSER_OWNER_SHA256,
      requireNonRoot:true,
      requireNoNewPrivs:true,
      forbidSandboxOverride:true,
      managedPolicyMustRemainUnchanged:true
    }),
    mintsExecutionIdentity:false,
    mintsPermissionGrant:false,
    acceptsModelAuthorization:false
  });
}

export function consumeAlosOwnerResult(result) {
  need(result&&typeof result==="object"&&!Array.isArray(result),"result object required");
  need(result.schema===ALOS_OWNER_RESULT_SCHEMA,"wrong schema");
  need(result.projectKey===ALOS_PROJECT_KEY,"wrong project");
  need(result.repository===ALOS_REPOSITORY,"wrong repository");
  need(result.status==="SUCCEEDED","execution did not succeed");
  for (const field of ["projectId","taskId","agentId","executionId","correlationId","resultId"]) {
    need(valid(result[field]),field+" missing or invalid");
  }
  need(Array.isArray(result.allowedTools)&&TOOLS.every(tool=>result.allowedTools.includes(tool)),"browser permissions mismatch");
  need(result.persistedAllowedToolsEnforced===true,"persisted permissions not enforced");
  need(result.actualAgentRun===true&&result.runAgentExecuted===true&&result.toolExecutorExecuted===true&&result.orchestratorExecuted===true,"shared Agent path not proven");
  need(result.sameOwnerBrowser===true&&result.sameOwnerConsumed===true,"same owner Browser/consumer not proven");

  const inference=result.inference;
  need(inference?.mode===ALOS_ZERO_KEY_MODE&&inference?.serverOwnedDeterministicPlanner===true,"wrong inference mode");
  for (const field of ["provider","model","requestedModel","endpoint"]) need(inference?.[field]===null,field+" must be null");
  need(Array.isArray(inference?.providerReceipts)&&inference.providerReceipts.length===0,"provider receipts forbidden");
  need(inference?.externalModelCalls===0&&inference?.externalApiCalls===0&&inference?.paidCostUsd===0,"external calls/cost detected");

  const browser=result.browser;
  need(browser?.ownerSha256===ALOS_BROWSER_OWNER_SHA256,"wrong Browser owner hash");
  need(browser?.security?.uid>0&&browser?.security?.gid>0&&browser?.security?.noNewPrivs===true&&browser?.security?.sandboxOverride===false&&browser?.security?.managedPolicyUnchanged===true,"Browser security mismatch");
  need(result.verifier?.invoked===true&&result.verifier?.rawEvidence===true&&result.verifier?.sameOwner===true,"raw verifier evidence missing");

  need(Array.isArray(result.runs)&&result.runs.length>=2,"two bounded runs required");
  const executions=new Set(),sessions=new Set();
  for (const run of result.runs) {
    need(run?.status==="SUCCEEDED"&&run?.actualAgentRun===true,"bounded run failed");
    need(run?.inferenceMode===ALOS_ZERO_KEY_MODE&&run?.modelInference===false,"bounded inference mismatch");
    need(valid(run?.executionId)&&!executions.has(run.executionId),"duplicate execution");
    need(valid(run?.sessionId)&&!sessions.has(run.sessionId),"duplicate session");
    executions.add(run.executionId); sessions.add(run.sessionId);
    need(Array.isArray(run?.actions)&&run.actions.length>0,"Browser actions missing");
    need(Array.isArray(run?.evidence)&&run.evidence.length>=run.actions.length,"correlated evidence missing");
    need(run?.duplicateSideEffects===0,"duplicate side effects");
  }
  need(result.reliability?.retryProof===true||result.reliability?.reopenProof===true,"retry/reopen proof required");
  need(result.reliability?.duplicateSideEffects===0,"duplicate side effects");

  return Object.freeze({
    accepted:true,
    projectKey:ALOS_PROJECT_KEY,
    projectId:result.projectId,
    executionIds:Object.freeze([...executions]),
    inferenceMode:ALOS_ZERO_KEY_MODE,
    browserOwnerSha256:ALOS_BROWSER_OWNER_SHA256,
    paidCostUsd:0
  });
}
