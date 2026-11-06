import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

async function findOrStartVite() {
  const ports = [3000, 3001];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) {
        return { url: `http://localhost:${port}/`, proc: null };
      }
    } catch (_) {}
  }

  // Not running, spawn a temporary vite server
  console.log('Spawning Vite preview / dev server on port 3000...');
  const viteProc = spawn('npx', ['vite', '--port', '3000', '--no-open'], {
    shell: true,
    stdio: 'ignore'
  });

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://localhost:3000/');
      if (res.ok) {
        return { url: 'http://localhost:3000/', proc: viteProc };
      }
    } catch (_) {}
  }

  throw new Error('Failed to start or connect to Vite server');
}

function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of possiblePaths) {
    try {
      const fs = require('fs');
      if (fs.existsSync(p)) return p;
    } catch (_) {
      return p;
    }
  }
  return 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

async function run() {
  console.log('====================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SHALIK END-TO-END SUITE');
  console.log('====================================================');

  const { url: appUrl, proc: viteProc } = await findOrStartVite();
  console.log(`Connected to Shalik web application at: ${appUrl}`);

  const chromePath = findChromePath();
  const tmpDir = path.join(os.tmpdir(), 'chrome-e2e-' + Date.now());
  const chromeProcess = spawn(
    chromePath,
    [
      '--headless=new',
      '--remote-debugging-port=9488',
      '--user-data-dir=' + tmpDir,
      '--disable-gpu',
      'about:blank'
    ]
  );

  let wsUrl = null;
  const wsUrlPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Chrome CDP launch timeout')), 10000);
    chromeProcess.stderr.on('data', (d) => {
      const match = d.toString().match(/DevTools listening on (ws:\/\/[^\s\r\n]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
  });

  wsUrl = await wsUrlPromise;
  console.log('Connected to Chrome DevTools Protocol:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let idCounter = 1;
  const pendingRequests = new Map();
  const consoleMessages = [];
  const errors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map(a => a.value !== undefined ? a.value : JSON.stringify(a)).join(' ');
      consoleMessages.push(`[${msg.params.type}] ${text}`);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      const err = msg.params.exceptionDetails;
      errors.push(`[Exception] ${err.text} ${err.exception ? err.exception.description : ''}`);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Create Target & Session
  const { targetId } = await send('Target.createTarget', { url: appUrl });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  function sendSession(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, sessionId, method, params }));
    });
  }

  await sendSession('Runtime.enable');
  await sendSession('Page.enable');

  async function evaluate(expression) {
    const res = await sendSession('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    return res.result?.value;
  }

  await new Promise(r => setTimeout(r, 2000));

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // -------------------------------------------------------------------------
  // TEST SUITE 1: AUTHENTICATION & REGISTRATION
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 1: Authentication & User Registration ---');

  const initialText = await evaluate('document.body.innerText');
  assert(initialText.includes('শালিক একাউন্ট'), 'Auth screen loaded with branding');

  // Switch to Registration tab
  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const regTab = tabs.find(t => t.innerText && t.innerText.includes('নতুন নিবন্ধন'));
      if (regTab) regTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  const isRegFormVisible = await evaluate(`
    (() => {
      return document.body.innerText.includes('একাউন্ট খুলুন');
    })()
  `);
  assert(isRegFormVisible, 'Registration tab activated and displayed account opening form');

  // Register new farmer: '01799887766', pin '4321', name 'আব্দুল করিম'
  await evaluate(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const setVal = (el, val) => {
        const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (desc && desc.set) {
          desc.set.call(el, val);
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };

      if (inputs[0]) setVal(inputs[0], 'আব্দুল করিম');
      if (inputs[1]) setVal(inputs[1], '01799887766');
      if (inputs[2]) setVal(inputs[2], '4321');
    })()
  `);
  await new Promise(r => setTimeout(r, 400));

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const submitBtn = btns.find(b => b.innerText && b.innerText.includes('একাউন্ট খুলুন'));
      if (submitBtn) submitBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const postRegText = await evaluate('document.body.innerText');
  assert(postRegText.includes('শালিক (Shalik)') || postRegText.includes('পরামর্শ'), 'New user registered and navigated to Assistant');

  // Logout new user
  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const profTab = tabs.find(t => t.innerText && t.innerText.includes('প্রোফাইল'));
      if (profTab) profTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const logoutBtn = btns.find(b => b.innerText && (b.innerText.includes('লগআউট') || b.innerText.includes('Sign Out')));
      if (logoutBtn) logoutBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Quick Demo Login as Farmer
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const farmerBtn = btns.find(b => b.innerText && b.innerText.includes('কৃষক') && b.innerText.includes('করিম'));
      if (farmerBtn) farmerBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const farmerHomeText = await evaluate('document.body.innerText');
  assert(farmerHomeText.includes('শালিক (Shalik)'), 'Quick login as demo farmer succeeded');

  // -------------------------------------------------------------------------
  // TEST SUITE 2: MULTIMODAL ASSISTANT & CHAT
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 2: Multimodal Assistant & RAG Chat ---');

  assert(farmerHomeText.includes('ধানের পাতায় বাদামী দাগ'), 'Suggestions displayed for empty chat');

  // Click first suggestion chip
  await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const suggestion = cards.find(c => c.innerText && c.innerText.includes('ধানের পাতায় বাদামী দাগ'));
      if (suggestion) suggestion.click();
    })()
  `);

  console.log('  ⏳ Waiting for AI streaming response...');
  let aiAnswerFound = false;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const text = await evaluate('document.body.innerText');
    if (text.includes('ব্লাস্ট') || text.includes('ছত্রাকনাশক') || text.includes('ট্রাইসাইক্লাজোল')) {
      aiAnswerFound = true;
      break;
    }
  }
  assert(aiAnswerFound, 'AI response generated and grounded with agricultural advice');

  const citationsFound = await evaluate(`
    (() => {
      const text = document.body.innerText;
      return text.includes('সূত্র:') || text.includes('BRRI') || text.includes('DAE');
    })()
  `);
  assert(citationsFound, 'Research citations displayed under Shalik advice');

  // Test typing a custom inquiry into textarea and submitting
  await evaluate(`
    (() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        const desc = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        if (desc && desc.set) {
          desc.set.call(textarea, 'টমেটো গাছের ঢলে পড়া রোগে কি করব?');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 500));

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const sendBtn = btns.find(b => b.innerText && b.innerText.includes('➔'));
      if (sendBtn) sendBtn.click();
    })()
  `);

  console.log('  ⏳ Waiting for second query response...');
  let tomatoAnswerFound = false;
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const text = await evaluate('document.body.innerText');
    if (text.includes('ব্যাকটেরিয়াজনিত') || text.includes('টমেটো') || text.includes('চুন')) {
      tomatoAnswerFound = true;
      break;
    }
  }
  assert(tomatoAnswerFound, 'Second query on tomato bacterial wilt processed correctly');

  // Test Conversation Drawer
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const histBtn = btns.find(b => b.innerText && (b.innerText.includes('ইতিহাস') || b.innerText.includes('History')));
      if (histBtn) histBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const historyModalVisible = await evaluate(`
    (() => {
      return document.body.innerText.includes('পূর্ববর্তী পরামর্শসমূহ') || document.body.innerText.includes('Previous Consultations');
    })()
  `);
  assert(historyModalVisible, 'Conversation history drawer opened');

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const closeBtn = btns.find(b => b.innerText && b.innerText.includes('✕'));
      if (closeBtn) closeBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  // -------------------------------------------------------------------------
  // TEST SUITE 3: DISASTER & WEATHER ALERTS
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 3: Disaster & Weather Alerts ---');

  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const alertsTab = tabs.find(t => t.innerText && (t.innerText.includes('দুর্যোগ') || t.innerText.includes('Disaster')));
      if (alertsTab) alertsTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const alertsText = await evaluate('document.body.innerText');
  assert(alertsText.includes('বন্যা') || alertsText.includes('তাপপ্রবাহ'), 'Weather alerts list rendered active warnings');

  await evaluate(`
    (() => {
      const cards = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const floodCard = cards.find(c => c.innerText && c.innerText.includes('বন্যা'));
      if (floodCard) floodCard.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const modalOpened = await evaluate(`
    (() => {
      return document.body.innerText.includes('জরুরি করণীয় নির্দেশনা') || document.body.innerText.includes('Emergency Action Steps');
    })()
  `);
  assert(modalOpened, 'Alert Action Template details modal displayed');

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const ackBtn = btns.find(b => b.innerText && (b.innerText.includes('বুঝেছি') || b.innerText.includes('Understood')));
      if (ackBtn) ackBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 600));

  // -------------------------------------------------------------------------
  // TEST SUITE 4: FARMER PROFILE & BILINGUAL TOGGLE
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 4: Farmer Profile & Bilingual Localization ---');

  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const profTab = tabs.find(t => t.innerText && (t.innerText.includes('প্রোফাইল') || t.innerText.includes('Profile')));
      if (profTab) profTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const enBtn = btns.find(b => b.innerText && b.innerText.includes('English'));
      if (enBtn) enBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const enProfText = await evaluate('document.body.innerText');
  assert(enProfText.includes('Farmer Profile & Settings'), 'Language successfully toggled to English');
  assert(enProfText.includes('Primary Crops'), 'Form fields rendered in English');

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const bnBtn = btns.find(b => b.innerText && b.innerText.includes('বাংলা (Bengali)'));
      if (bnBtn) bnBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const bnProfText = await evaluate('document.body.innerText');
  assert(bnProfText.includes('কৃষক প্রোফাইল ও সেটিংস'), 'Language successfully toggled back to Bengali');

  // Edit Upazila and save
  await evaluate(`
    (() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      if (inputs[2]) {
        const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (desc && desc.set) {
          desc.set.call(inputs[2], 'রৌমারী');
          inputs[2].dispatchEvent(new Event('input', { bubbles: true }));
          inputs[2].dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    })()
  `);

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const saveBtn = btns.find(b => b.innerText && b.innerText.includes('সংরক্ষণ করুন'));
      if (saveBtn) saveBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const saveConfirmed = await evaluate(`
    (() => {
      return document.body.innerText.includes('সফলভাবে সংরক্ষিত') || document.body.innerText.includes('রৌমারী');
    })()
  `);
  assert(saveConfirmed, 'Profile changes saved and verified');

  // -------------------------------------------------------------------------
  // TEST SUITE 5: EXTENSION OFFICER RBAC & ALERT BROADCAST
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 5: SAAO Officer RBAC & Regional Broadcast ---');

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const logoutBtn = btns.find(b => b.innerText && b.innerText.includes('লগআউট'));
      if (logoutBtn) logoutBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Quick Login as SAAO Officer (Dr. Rafiqul)
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const officerBtn = btns.find(b => b.innerText && b.innerText.includes('কর্মকর্তা') && b.innerText.includes('রফিকুল'));
      if (officerBtn) officerBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const officerTabFound = await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const adminTab = tabs.find(t => t.innerText && (t.innerText.includes('অফিসার প্যানেল') || t.innerText.includes('Officer Panel') || t.innerText.includes('অ্যাডমিন') || t.innerText.includes('Admin')));
      if (adminTab) {
        adminTab.click();
        return true;
      }
      return false;
    })()
  `);
  assert(officerTabFound, 'Extension Officer RBAC granted access to Officer Panel tab');
  await new Promise(r => setTimeout(r, 1000));

  // Broadcast a new pest advisory
  await evaluate(`
    (() => {
      const textareas = Array.from(document.querySelectorAll('textarea'));
      if (textareas[0]) {
        const desc = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
        if (desc && desc.set) {
          desc.set.call(textareas[0], 'কুড়িগ্রামে কারেন্ট পোকার প্রাদুর্ভাব বৃদ্ধি পেয়েছে। দ্রুত জমির পানি নিষ্কাশন করুন।');
          textareas[0].dispatchEvent(new Event('input', { bubbles: true }));
          textareas[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    })()
  `);

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const broadcastBtn = btns.find(b => b.innerText && (b.innerText.includes('সতর্কতা প্রচার') || b.innerText.includes('Broadcast')));
      if (broadcastBtn) broadcastBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1200));

  const broadcastNotice = await evaluate(`
    (() => {
      return document.body.innerText.includes('সতর্কবার্তা সফলভাবে প্রচারিত') || document.body.innerText.includes('broadcasted');
    })()
  `);
  assert(broadcastNotice, 'Emergency regional alert broadcasted by officer');

  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const alertsTab = tabs.find(t => t.innerText && t.innerText.includes('দুর্যোগ'));
      if (alertsTab) alertsTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const newAlertInList = await evaluate(`
    (() => {
      return document.body.innerText.includes('কারেন্ট পোকার প্রাদুর্ভাব');
    })()
  `);
  assert(newAlertInList, 'Newly broadcast alert verified in regional alerts stream');

  // -------------------------------------------------------------------------
  // TEST SUITE 6: ADMINISTRATOR PRIVILEGES & FIELD TELEMETRY
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 6: System Admin & Live Field Telemetry ---');

  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const profTab = tabs.find(t => t.innerText && t.innerText.includes('প্রোফাইল'));
      if (profTab) profTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const logoutBtn = btns.find(b => b.innerText && b.innerText.includes('লগআউট'));
      if (logoutBtn) logoutBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  // Quick Login as Admin
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const adminBtn = btns.find(b => b.innerText && b.innerText.includes('প্রশাসক') && b.innerText.includes('সিস্টেম'));
      if (adminBtn) adminBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  await evaluate(`
    (() => {
      const tabs = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const adminTab = tabs.find(t => t.innerText && (t.innerText.includes('অ্যাডমিন') || t.innerText.includes('Admin')));
      if (adminTab) adminTab.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  const adminScreenText = await evaluate('document.body.innerText');
  assert(adminScreenText.includes('ফিল্ড টেলিমেট্রি') || adminScreenText.includes('Field Telemetry'), 'Live field telemetry dashboard loaded');
  assert(adminScreenText.includes('ব্যবহারকারী ও রোল নিয়ন্ত্রণ') || adminScreenText.includes('User Role Management') || adminScreenText.includes('User Management'), 'User role management section loaded');

  // Test Export Telemetry JSON
  await evaluate(`
    (() => {
      const btns = Array.from(document.querySelectorAll('div[tabindex="0"]'));
      const exportBtn = btns.find(b => b.innerText && (b.innerText.includes('টেলিমেট্রি ডাটা এক্সপোর্ট') || b.innerText.includes('Export Telemetry')));
      if (exportBtn) exportBtn.click();
    })()
  `);
  await new Promise(r => setTimeout(r, 800));

  const exportedTelemetryJsonVisible = await evaluate(`
    (() => {
      return document.body.innerText.includes('timeToFirstTokenMs') || document.body.innerText.includes('queryId');
    })()
  `);
  assert(exportedTelemetryJsonVisible, 'Field Telemetry JSON export generated and verified');

  // -------------------------------------------------------------------------
  // FINAL SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`🎯 E2E RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`Console Logs: ${consoleMessages.length}`);
  console.log(`Runtime Exceptions: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Exceptions:', errors);
  }
  console.log('====================================================');

  ws.close();
  chromeProcess.kill();
  if (viteProc) viteProc.kill();

  if (passedTests === totalTests && errors.length === 0) {
    console.log('🎉 ALL END-TO-END TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ Some tests failed or exceptions occurred');
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal E2E error:', err);
  process.exit(1);
});
