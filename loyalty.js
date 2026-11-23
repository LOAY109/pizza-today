/* Pizza Today KSA — Tamper-Resistant VIP Loyalty & Barcode Engine */
(function (global) {
  const LOYALTY_KEY = 'pt_ksa_loyalty_ledger_v1';
  const INTEGRITY_PEPPER = 'PT_KSA_LOYALTY_2026_V1_SALT#91A7';

  function fnv1aHex(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(16).padStart(8, '0');
  }

  function computeTxSig(tx) {
    const payload = [
      tx.txId, tx.phone, tx.memberCode, String(tx.delta), tx.type, tx.orderId || '', String(tx.ts), INTEGRITY_PEPPER,
    ].join('|');
    return fnv1aHex(payload) + fnv1aHex(payload.split('').reverse().join(''));
  }

  function makeMemberCode(phone) {
    const clean = String(phone || '').replace(/\D/g, '');
    if (!clean) return 'PTM-00000000';
    const tail = clean.slice(-8).padStart(8, '0');
    const chk = fnv1aHex(clean + INTEGRITY_PEPPER).slice(0, 3).toUpperCase();
    return `PTM-${tail}-${chk}`;
  }

  function verifyMemberCode(code) {
    const m = /^PTM-(\d{8})-([A-F0-9]{3})$/i.exec(String(code || '').trim());
    if (!m) return null;
    const phone = '05' + m[1];
    const expected = makeMemberCode(phone);
    if (expected.toUpperCase() !== String(code).trim().toUpperCase()) return null;
    return { phone, memberCode: expected };
  }

  function calculateOrderPoints(totalSar) {
    const amt = Math.max(0, Number(totalSar) || 0);
    if (amt <= 0) return { base: 0, bonus: 0, total: 0, tierNote: '' };
    const base = Math.floor(amt * 2);
    let bonus = 0;
    let tierNote = '';
    if (amt >= 150) { bonus = 100; tierNote = 'مكافأة الطلب الكبير (+100 نقطة)'; }
    else if (amt >= 100) { bonus = 50; tierNote = 'مكافأة الطلب المميز (+50 نقطة)'; }
    else if (amt >= 50) { bonus = 20; tierNote = 'مكافأة إضافية (+20 نقطة)'; }
    return { base, bonus, total: base + bonus, tierNote };
  }

  function getVipTier(lifetimeEarned) {
    const pts = Math.max(0, Number(lifetimeEarned) || 0);
    if (pts >= 3500) return { id: 'diamond', name: 'عضو ماسي VIP', nextAt: null, color: 'text-sky-300 border-sky-400/40 bg-sky-400/15' };
    if (pts >= 1500) return { id: 'gold', name: 'عميل ذهبي', nextAt: 3500, color: 'text-amber-300 border-amber-400/40 bg-amber-400/15' };
    if (pts >= 500) return { id: 'silver', name: 'عميل فضي', nextAt: 1500, color: 'text-slate-200 border-slate-300/40 bg-slate-300/15' };
    return { id: 'bronze', name: 'عميل مميز', nextAt: 500, color: 'text-parchment border-parchment/40 bg-parchment/15' };
  }

  function readLedger() {
    try {
      const raw = localStorage.getItem(LOYALTY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      return arr.filter((tx) => tx && typeof tx === 'object' && tx.sig === computeTxSig(tx));
    } catch (e) { return []; }
  }

  function writeLedger(arr) {
    try { localStorage.setItem(LOYALTY_KEY, JSON.stringify(arr)); } catch (e) {}
  }

  function getCustomerSummary(phone) {
    const clean = String(phone || '').replace(/\D/g, '');
    const memberCode = makeMemberCode(clean);
    const all = readLedger().filter((tx) => tx.phone === clean);
    let balance = 0, lifetimeEarned = 0, lifetimeRedeemed = 0;
    all.forEach((tx) => {
      balance += tx.delta;
      if (tx.delta > 0) lifetimeEarned += tx.delta;
      if (tx.delta < 0) lifetimeRedeemed += Math.abs(tx.delta);
    });
    balance = Math.max(0, balance);
    return {
      phone: clean, memberCode, balance, sarValue: Math.floor(balance / 100),
      lifetimeEarned, lifetimeRedeemed, tier: getVipTier(lifetimeEarned),
      history: all.slice().sort((a, b) => b.ts - a.ts),
    };
  }

  function hasOrderTransaction(orderId, type) {
    if (!orderId) return false;
    return readLedger().some((tx) => tx.orderId === orderId && tx.type === type);
  }

  function recordTransaction({ phone, customerName, delta, type, orderId, reason }) {
    const clean = String(phone || '').replace(/\D/g, '');
    if (!clean || !delta) return { ok: false, error: 'بيانات غير مكتملة' };
    if (orderId && (type === 'earn_delivery' || type === 'earn_pickup' || type === 'refund_redeem')) {
      if (hasOrderTransaction(orderId, type)) return { ok: false, duplicate: true, error: 'تم تسجيل نقاط هذا الطلب مسبقاً' };
    }
    if (delta < 0 && Math.abs(delta) > getCustomerSummary(clean).balance) {
      return { ok: false, error: 'رصيد النقاط غير كافٍ' };
    }
    const ledger = readLedger();
    const ts = Date.now();
    const tx = {
      txId: `TX-${ts.toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      phone: clean, customerName: customerName || '', memberCode: makeMemberCode(clean),
      delta: Math.trunc(delta), type, orderId: orderId || '', reason: reason || '',
      isoDate: new Date(ts).toISOString().slice(0, 10),
      timeStr: new Date(ts).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      ts,
    };
    tx.sig = computeTxSig(tx);
    ledger.unshift(tx);
    writeLedger(ledger);
    return { ok: true, tx, summary: getCustomerSummary(clean) };
  }

  const C39 = {
    '0': 'nnnwwnwnn', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
    '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
    'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw', 'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn',
    'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
    'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww', 'O': 'wnnnwnnwn',
    'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
    'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn',
    'Z': 'nwwnwnnnn', '-': 'nwnnnnwnw', '*': 'nwnnwnwnn',
  };

  function renderBarcodeSvg(code) {
    const text = `*${String(code || 'PTM-00000000').toUpperCase()}*`;
    let x = 12;
    const rects = [];
    for (let i = 0; i < text.length; i++) {
      const pat = C39[text[i]] || C39['-'];
      for (let j = 0; j < pat.length; j++) {
        const w = pat[j] === 'w' ? 5 : 2;
        if (j % 2 === 0) rects.push(`<rect x="${x}" y="8" width="${w}" height="58" fill="#0A0A0A"/>`);
        x += w;
      }
      x += 2;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x + 12} 74" class="w-full h-16 bg-white rounded-xl p-1" role="img" aria-label="باركود العميل ${code}">${rects.join('')}</svg>`;
  }

  global.PizzaLoyalty = {
    LOYALTY_KEY, makeMemberCode, verifyMemberCode, calculateOrderPoints, getVipTier,
    readLedger, getCustomerSummary, hasOrderTransaction, recordTransaction, renderBarcodeSvg,
  };
})(window);