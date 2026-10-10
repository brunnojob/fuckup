import assert from 'node:assert/strict';
import {summarize} from '../lib/insights.mjs';
const result=summarize({name:'proof',stargazers_count:0,forks_count:0,open_issues_count:0},[{created_at:'2026-01-01T00:00:00Z',closed_at:'2026-01-03T00:00:00Z',state:'closed'},{created_at:'2026-01-01T00:00:00Z',closed_at:'2026-01-05T00:00:00Z',state:'closed'}],[],[],[{name:'README.md'}],{Java:1000,C:100});
assert.equal(result.metrics.medianIssueDays,3);
console.log(JSON.stringify(result));
