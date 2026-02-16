#!/usr/bin/env node
/* eslint-disable no-console */
const { spawn } = require('child_process');
const assert = require('assert/strict');

const PORT = Number(process.env.ADMIN_TEST_PORT || 4105);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const ADMIN_EMAIL = process.env.ADMIN_TEST_EMAIL || 'admin.test@cazi.local';
const ADMIN_PASSWORD = process.env.ADMIN_TEST_PASSWORD || 'admin-test-pass';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForHealth(retries = 80) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(`${BASE_URL}/health`);
      if (response.ok) return;
    } catch (_error) {
      // keep retrying
    }
    await wait(250);
  }
  throw new Error('Timed out waiting for server health endpoint');
}

async function jsonRequest(path, init = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });
  const body = await response.json();
  return { response, body };
}

async function main() {
  const server = spawn(process.execPath, ['server/index.js'], {
    env: {
      ...process.env,
      API_PORT: String(PORT),
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
      ADMIN_ROLE: 'super_admin',
      AUTO_SEED_MOCK: process.env.AUTO_SEED_MOCK || 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let logs = '';
  server.stdout.on('data', (chunk) => { logs += chunk.toString(); });
  server.stderr.on('data', (chunk) => { logs += chunk.toString(); });

  try {
    await waitForHealth();

    const unauthorized = await jsonRequest('/admin/users');
    assert.equal(unauthorized.response.status, 401, 'Unauthorized admin/users should return 401');

    const login = await jsonRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert.equal(login.response.status, 200, 'Admin login should return 200');
    const token = login.body?.data?.token;
    assert.ok(token, 'Admin login should return a token');

    const authHeader = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const usersList = await jsonRequest('/admin/users?page=1&pageSize=5&sortBy=createdAt&sortDir=desc', {
      headers: authHeader,
    });
    assert.equal(usersList.response.status, 200, 'admin/users should return 200');
    assert.ok(Array.isArray(usersList.body?.data?.items), 'admin/users should return paginated items array');

    const ordersList = await jsonRequest('/admin/orders?page=1&pageSize=1', { headers: authHeader });
    assert.equal(ordersList.response.status, 200, 'admin/orders should return 200');
    const firstOrder = ordersList.body?.data?.items?.[0];
    assert.ok(firstOrder?.id, 'admin/orders should have at least one order for audit test');

    const nextStatus = firstOrder.status === 'confirmed' ? 'preparing' : 'confirmed';
    const updateStatus = await jsonRequest(`/admin/orders/${encodeURIComponent(firstOrder.id)}/status`, {
      method: 'PUT',
      headers: authHeader,
      body: JSON.stringify({ status: nextStatus }),
    });
    if (updateStatus.response.status !== 200) {
      console.error('Unexpected update response body:', updateStatus.body);
    }
    assert.equal(updateStatus.response.status, 200, 'admin order status update should return 200');

    const auditLogs = await jsonRequest('/admin/audit-logs?entityType=order&page=1&pageSize=20', {
      headers: authHeader,
    });
    assert.equal(auditLogs.response.status, 200, 'admin/audit-logs should return 200');
    const hasOrderAudit = (auditLogs.body?.data?.items || []).some((item) => item.action === 'order.status.update' && item.entityId === firstOrder.id);
    assert.ok(hasOrderAudit, 'order status update should create an audit log');

    console.log('✅ Admin API tests passed');
  } catch (error) {
    console.error('❌ Admin API tests failed');
    console.error(error);
    console.error('\n--- server logs ---\n' + logs);
    process.exitCode = 1;
  } finally {
    server.kill('SIGTERM');
    await wait(300);
    if (!server.killed) server.kill('SIGKILL');
  }
}

main();
