import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../.alos/kaggle-cpu.json',import.meta.url),'utf8'));
test('Pivot Kaggle CPU lane is fixed, bounded, source-bound, and cannot deploy or mutate telecom',()=>{
  assert.equal(manifest.schema,'alos.kaggle-cpu-project.v1');
  assert.equal(manifest.projectKey,'pivot');
  assert.equal(manifest.repository,'Gagan8atwal/pivot-ai-website');
  assert.equal(manifest.runtime.gpu,false);
  assert.deepEqual(manifest.gates,[['npm','test'],['npm','run','typecheck'],['npm','run','build']]);
  assert.equal(manifest.limits.attempts,2);
  assert.ok(manifest.limits.timeoutMinutes<=40);
  assert.equal(manifest.isolation.sourceRevisionRequired,true);
  assert.equal(manifest.network.deploymentForbidden,true);
  assert.equal(manifest.network.telecomMutationForbidden,true);
  assert.equal(manifest.cost.paidFallback,false);
});
