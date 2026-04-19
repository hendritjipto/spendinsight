// ⚠️ AI-GENERATED SCRIPT - REQUIRES MANUAL REVIEW ⚠️
// k6-assistant-provenance: {"sources":["github"],"github_repository_url":"https://github.com/hendritjipto/spendinsight"}
// Source: hendritjipto/spendinsight
// Account data: data/faker/userdatasample.json

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import tempo from 'https://jslib.k6.io/http-instrumentation-tempo/1.0.0/index.js';
import pyroscope from 'https://jslib.k6.io/http-instrumentation-pyroscope/1.0.1/index.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

// Real account numbers from data/faker/userdatasample.json (100 accounts)
const BANK_ACCOUNTS = [
  '6320646010', '6320422320', '6320348992', '6320336491', '6320849796',
  '6320102235', '6320568852', '6320763151', '6320949029', '6320714382',
  '6320754539', '6320410533', '6320790883', '6320316703', '6320752676',
  '6320297231', '6320749231', '6320634566', '6320986476', '6320960886',
  '6320646669', '6320258826', '6320402880', '6320366262', '6320519857',
  '6320200674', '6320925068', '6320197103', '6320472827', '6320269384',
  '6320386729', '6320878196', '6320610478', '6320731295', '6320564947',
  '6320768839', '6320971361', '6320715675', '6320171147', '6320222859',
  '6320599554', '6320593507', '6320384212', '6320590476', '6320822731',
  '6320213253', '6320919835', '6320477858', '6320164718', '6320754607',
  '6320134589', '6320672717', '6320268280', '6320174763', '6320661225',
  '6320375256', '6320894020', '6320162923', '6320344871', '6320440414',
  '6320532094', '6320798199', '6320302041', '6320988116', '6320137667',
  '6320546864', '6320100997', '6320216175', '6320438495', '6320358042',
  '6320869342', '6320623376', '6320306475', '6320155301', '6320144410',
  '6320776558', '6320835960', '6320913683', '6320361691', '6320211354',
  '6320869861', '6320466102', '6320225239', '6320716023', '6320517309',
  '6320739276', '6320202135', '6320423594', '6320457080', '6320391138',
  '6320365287', '6320509977', '6320485791', '6320716993', '6320427326',
  '6320521733', '6320123082', '6320290850', '6320885825', '6320177179',
];

const MONTHS = ['2025-02-01', '2025-03-01'];

export const options = {
  scenarios: {
    spendinsight_load: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
    // Side-by-side latency comparison: MongoDB vs PostgreSQL
    'http_req_duration{name:GET /api/transaction by account+month}': ['p(95)<1000'],
    'http_req_duration{name:GET /api/transaction/pg}': ['p(95)<1000'],
  },
};

// Distributed tracing — links k6 requests to Tempo traces
tempo.instrumentHTTP({ propagator: 'w3c' });

// Continuous profiling — links k6 runs to Pyroscope CPU/memory profiles
pyroscope.instrumentHTTP();

export default function () {
  // Pick a random account + month per VU iteration for realistic distribution
  const account = BANK_ACCOUNTS[Math.floor(Math.random() * BANK_ACCOUNTS.length)];
  const month   = MONTHS[Math.floor(Math.random() * MONTHS.length)];

  // ── User endpoints ────────────────────────────────────────────────────────
  group('User endpoints', function () {

    const spendRes = http.get(`${BASE_URL}/api/users/spend`, {
      tags: { name: 'GET /api/users/spend' },
    });
    check(spendRes, {
      'users/spend: status 200':     (r) => r.status === 200,
      'users/spend: body not empty': (r) => r.body.length > 0,
      'users/spend: < 1000ms':       (r) => r.timings.duration < 1000,
    });
    sleep(0.5);

    const profileRes = http.get(
      `${BASE_URL}/api/users/profile?bankAccountNumber=${account}`,
      { tags: { name: 'GET /api/users/profile' } }
    );
    check(profileRes, {
      'users/profile: status 200': (r) => r.status === 200,
      'users/profile: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);
  });

  // ── Insight endpoints ─────────────────────────────────────────────────────
  group('Insight endpoints', function () {

    // Default — returns first document (no params)
    const insightDefaultRes = http.get(`${BASE_URL}/api/insight`, {
      tags: { name: 'GET /api/insight' },
    });
    check(insightDefaultRes, {
      'insight default: status 200': (r) => r.status === 200,
      'insight default: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);

    // By account
    const insightAccountRes = http.get(
      `${BASE_URL}/api/insight?bankAccountNumber=${account}`,
      { tags: { name: 'GET /api/insight by account' } }
    );
    check(insightAccountRes, {
      'insight by account: status 200': (r) => r.status === 200,
      'insight by account: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);

    // By account + month — controller returns 404 when no data for that month
    const insightMonthRes = http.get(
      `${BASE_URL}/api/insight?bankAccountNumber=${account}&month=${month}`,
      { tags: { name: 'GET /api/insight by account+month' } }
    );
    check(insightMonthRes, {
      'insight by month: 200 or 404': (r) => r.status === 200 || r.status === 404,
      'insight by month: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);
  });

  // ── Transaction endpoints — MongoDB ───────────────────────────────────────
  group('Transaction endpoints (MongoDB)', function () {

    // Default — returns first user's transactions
    const txDefaultRes = http.get(`${BASE_URL}/api/transaction`, {
      tags: { name: 'GET /api/transaction' },
    });
    check(txDefaultRes, {
      'transaction default: status 200': (r) => r.status === 200,
      'transaction default: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);

    // By account
    const txAccountRes = http.get(
      `${BASE_URL}/api/transaction?bankAccountNumber=${account}`,
      { tags: { name: 'GET /api/transaction by account' } }
    );
    check(txAccountRes, {
      'transaction by account: status 200': (r) => r.status === 200,
      'transaction by account: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);

    // By account + month
    const txMonthRes = http.get(
      `${BASE_URL}/api/transaction?bankAccountNumber=${account}&month=${month}`,
      { tags: { name: 'GET /api/transaction by account+month' } }
    );
    check(txMonthRes, {
      'transaction by month: status 200': (r) => r.status === 200,
      'transaction by month: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(0.5);
  });

  // ── Transaction endpoints — PostgreSQL ────────────────────────────────────
  group('Transaction endpoints (PostgreSQL)', function () {

    // Tagged separately so p95 can be compared against MongoDB above
    const txPgRes = http.get(
      `${BASE_URL}/api/transaction/pg?bankAccountNumber=${account}&month=${month}`,
      { tags: { name: 'GET /api/transaction/pg' } }
    );
    check(txPgRes, {
      'transaction/pg: status 200': (r) => r.status === 200,
      'transaction/pg: < 1000ms':   (r) => r.timings.duration < 1000,
    });
    sleep(1);
  });
}
