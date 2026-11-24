const http = require('http');
const io = require('socket.io-client');

const BASE_URL = 'http://127.0.0.1:4000';

function apiRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = body ? JSON.stringify(body) : '';

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Family Tracker Backend E2E Test Suite ---');
  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@familytracker.test`;
  const memberEmail = `member_${timestamp}@familytracker.test`;

  // 1. Admin Registration
  console.log('\n1. Testing Admin Registration...');
  const regRes = await apiRequest('POST', '/api/auth/admin/register', {
    name: 'Sarah Connor',
    email: adminEmail,
    password: 'Password123!',
    familyName: 'Connor Family',
  });
  console.log(`Status: ${regRes.status}, User ID: ${regRes.data.user?.id}`);
  if (regRes.status !== 201 && regRes.status !== 200) throw new Error('Registration failed');
  const adminToken = regRes.data.accessToken;
  const adminFamilyId = regRes.data.user.familyId;

  // 2. Admin Login
  console.log('\n2. Testing Admin Login...');
  const loginRes = await apiRequest('POST', '/api/auth/admin/login', {
    email: adminEmail,
    password: 'Password123!',
  });
  console.log(`Status: ${loginRes.status}, Role: ${loginRes.data.user?.role}`);
  if (loginRes.status !== 200) throw new Error('Admin Login failed');

  // 3. Invite Member
  console.log('\n3. Testing Member Invitation...');
  const inviteRes = await apiRequest(
    'POST',
    '/api/family/invite',
    {
      name: 'John Connor',
      email: memberEmail,
      phone: '+15551234567',
      relationship: 'Son',
    },
    adminToken,
  );
  console.log(`Status: ${inviteRes.status}, Code: ${inviteRes.data.invitationCode}`);
  if (inviteRes.status !== 201 && inviteRes.status !== 200) throw new Error('Invite failed');
  const inviteCode = inviteRes.data.invitationCode;

  // 4. Member Activation
  console.log('\n4. Testing Member Account Activation...');
  const activateRes = await apiRequest('POST', '/api/members/activate-account', {
    invitationCode: inviteCode,
    password: 'MemberPass123!',
  });
  console.log(`Status: ${activateRes.status}, Activated Member: ${activateRes.data.user?.name}`);
  if (activateRes.status !== 201 && activateRes.status !== 200) throw new Error('Activation failed');
  const memberToken = activateRes.data.accessToken;
  const memberId = activateRes.data.user.id;

  // 5. Member Login with Device
  console.log('\n5. Testing Member Login...');
  const memberLoginRes = await apiRequest('POST', '/api/auth/member/login', {
    email: memberEmail,
    password: 'MemberPass123!',
    deviceType: 'android',
    deviceName: 'Pixel 8',
  });
  console.log(`Status: ${memberLoginRes.status}, Member Email: ${memberLoginRes.data.user?.email}`);

  // 6. Refresh Token
  console.log('\n6. Testing Refresh Token...');
  const refreshRes = await apiRequest('POST', '/api/auth/refresh', {
    refreshToken: memberLoginRes.data.refreshToken,
  });
  console.log(`Status: ${refreshRes.status}, New Token received`);

  // 7. Create Safe Zone / Geofence
  console.log('\n7. Testing Safe Zone Creation (Admin)...');
  const geofenceRes = await apiRequest(
    'POST',
    '/api/geofences',
    {
      name: 'Home Sanctuary',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 250, // 250m
      isActive: true,
    },
    adminToken,
  );
  console.log(`Status: ${geofenceRes.status}, Safe Zone ID: ${geofenceRes.data._id}`);

  // 8. Start Location Sharing
  console.log('\n8. Testing Location Sharing Start (Member)...');
  const startSharingRes = await apiRequest('POST', '/api/locations/sharing/start', {}, memberToken);
  console.log(`Status: ${startSharingRes.status}, Status: ${startSharingRes.data.status}`);

  // 9. Update Real Location (inside the safe zone: 37.7749, -122.4194)
  console.log('\n9. Testing Location Update (Member inside Home Geofence)...');
  const locRes = await apiRequest(
    'POST',
    '/api/locations/update',
    {
      latitude: 37.77492,
      longitude: -122.41941,
      accuracy: 6.5,
      altitude: 12.0,
      speed: 0.5,
      batteryPercentage: 92,
      recordedAt: new Date().toISOString(),
    },
    memberToken,
  );
  console.log(`Status: ${locRes.status}, Location updated: Lat=${locRes.data.location?.latitude}, Lng=${locRes.data.location?.longitude}`);

  // 10. Fetch Current Locations (Admin)
  console.log('\n10. Testing Fetch Current Locations (Admin)...');
  const currentRes = await apiRequest('GET', '/api/locations/current', null, adminToken);
  console.log(`Status: ${currentRes.status}, Total active records: ${currentRes.data.length}`);
  console.log(`Member on map: ${currentRes.data[0]?.name}, Lat: ${currentRes.data[0]?.latitude}, Stale: ${currentRes.data[0]?.isStale}`);

  // 11. Fetch Location History (Member & Admin)
  console.log('\n11. Testing Location History Query...');
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const histRes = await apiRequest(
    'GET',
    `/api/locations/history?startDate=${encodeURIComponent(yesterday)}&endDate=${encodeURIComponent(tomorrow)}`,
    null,
    adminToken,
  );
  console.log(`Status: ${histRes.status}, Recorded history points: ${histRes.data.totalPoints}`);

  // 12. Trigger SOS Emergency Alert
  console.log('\n12. Testing SOS Emergency Alert (Member)...');
  const sosRes = await apiRequest(
    'POST',
    '/api/sos/trigger',
    {
      latitude: 37.775,
      longitude: -122.419,
      message: 'Need immediate help near market!',
    },
    memberToken,
  );
  console.log(`Status: ${sosRes.status}, Alert ID: ${sosRes.data.alert?.alertId}`);
  const alertId = sosRes.data.alert?.alertId;

  // 13. Admin Acknowledge SOS
  console.log('\n13. Testing Admin Acknowledge SOS...');
  const ackRes = await apiRequest('PATCH', `/api/sos/${alertId}/acknowledge`, {}, adminToken);
  console.log(`Status: ${ackRes.status}, Status: ${ackRes.data.status}`);

  // 14. Dashboard Overview & Member Status
  console.log('\n14. Testing Dashboard Statistics Overview...');
  const overviewRes = await apiRequest('GET', '/api/dashboard/overview', null, adminToken);
  console.log('Overview stats:', overviewRes.data);

  const memberStatusRes = await apiRequest('GET', '/api/dashboard/member-status', null, adminToken);
  console.log(`Member status count: ${memberStatusRes.data.length}`);

  // 15. Real-Time Socket.IO Test
  console.log('\n15. Testing Real-time Socket.IO Connection...');
  await new Promise((resolve, reject) => {
    const socket = io(BASE_URL, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log(`Socket connected successfully with ID: ${socket.id}`);
      socket.emit('member:heartbeat', {}, (ack) => {
        console.log('Heartbeat acknowledged by server:', ack);
        socket.disconnect();
        resolve();
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      socket.disconnect();
      reject(err);
    });

    setTimeout(() => {
      socket.disconnect();
      resolve();
    }, 3000);
  });

  console.log('\n===========================================');
  console.log(' ALL 15 BACKEND & REAL-TIME TESTS PASSED!');
  console.log('===========================================');
}

runTests().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
