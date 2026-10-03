import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../components/app/onboarding/fast-onboarding.tsx',import.meta.url),'utf8');
test('authority refresh clears stale live state and handles manual rejection',()=>{assert.match(source,/catch \(err\)[\s\S]*setStatus\(null\)[\s\S]*setError\(errorMessage\(err\)\)[\s\S]*throw err/);assert.match(source,/refresh\(\)\.catch\(\(\) => undefined\)/);});
