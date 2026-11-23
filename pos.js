/* Pizza Today KSA — Complete Cashier POS with 24-Item Menu, Flexible QR Points Discount & Mada Terminal */
(function (global) {
  function getBranches() { return typeof BRANCHES !== 'undefined' ? BRANCHES : (global.BRANCHES || []); }
  function getRegions() { return typeof REGIONS !== 'undefined' ? REGIONS : (global.REGIONS || []); }
  function getMenuItems() { return typeof MENU_ITEMS !== 'undefined' ? MENU_ITEMS : (global.MENU_ITEMS || []); }
  function getSizeOptions() { return typeof SIZE_OPTIONS !== 'undefined' ? SIZE_OPTIONS : (global.SIZE_OPTIONS || []); }
  function getCrustOptions() { return typeof CRUST_OPTIONS !== 'undefined' ? CRUST_OPTIONS : (global.CRUST_OPTIONS || []); }

  const posState = {
    branchId: '', category: 'all', search: '', sizeId: 'medium', crustId: 'classic',
    cart: [], linkedCustomer: null, redeemPoints: 0, paymentMethod: 'مدى (صرافة)',
    camActive: false, qrScanner: null,
  };
  function ensureBranch() { const brs = getBranches(); if (!posState.branchId && brs.length) posState.branchId = brs[0].id; }
  function getPosSubtotal() { return posState.cart.reduce((s, l) => s + l.unitPrice * l.qty, 0); }
  function computePosTotals() {
    const subtotal = getPosSubtotal();
    let availPts = 0, maxRedeemPts = 0, redeemPts = 0, discountSar = 0;
    if (posState.linkedCustomer && global.PizzaLoyalty) {
      const sum = PizzaLoyalty.getCustomerSummary(posState.linkedCustomer.phone);
      availPts = sum.balance;
      maxRedeemPts = Math.floor(Math.min(availPts, Math.floor(subtotal) * 100) / 100) * 100;
      if (posState.redeemPoints > maxRedeemPts) posState.redeemPoints = maxRedeemPts;
      redeemPts = Math.max(0, Math.floor(posState.redeemPoints / 100) * 100);
      discountSar = Math.floor(redeemPts / 100);
    } else posState.redeemPoints = 0;
    const netTotal = Math.max(0, subtotal - discountSar);
    const earnCalc = (posState.linkedCustomer && global.PizzaLoyalty && netTotal > 0) ? PizzaLoyalty.calculateOrderPoints(netTotal) : { total: 0 };
    return { subtotal, availPts, maxRedeemPts, redeemPts, discountSar, netTotal, earnPts: earnCalc.total };
  }
  function addPosItem(itemId) {
    const item = getMenuItems().find((m) => m.id === itemId); if (!item) return;
    const sizeObj = getSizeOptions().find((s) => s.id === posState.sizeId) || { id: 'medium', label: 'وسط (الأساسي)', extra: 0 };
    const crustObj = getCrustOptions().find((c) => c.id === posState.crustId) || { id: 'classic', label: 'كلاسيك هشة', extra: 0 };
    const unitPrice = item.price + (sizeObj.extra || 0) + (crustObj.extra || 0);
    const key = `${item.id}|${sizeObj.id}|${crustObj.id}`;
    const existing = posState.cart.find((l) => l.key === key);
    if (existing) existing.qty += 1;
    else posState.cart.push({ key, itemId: item.id, name: item.name, img: item.img, unitPrice, qty: 1, sizeLabel: sizeObj.label, crustLabel: crustObj.label, cutLabel: 'مثلثات كلاسيك', extraLabels: [], note: '' });
    renderPosPanel();
  }
  function updatePosQty(key, delta) {
    const idx = posState.cart.findIndex((l) => l.key === key); if (idx === -1) return;
    posState.cart[idx].qty += delta;
    if (posState.cart[idx].qty <= 0) posState.cart.splice(idx, 1);
    renderPosPanel();
  }
  function stopPosCamera() {
    if (posState.qrScanner && posState.camActive) {
      posState.qrScanner.stop().catch(() => {}).finally(() => {
        posState.camActive = false;
        const wrap = document.getElementById('posCameraWrap'), lbl = document.getElementById('posCamBtnLabel');
        if (wrap) wrap.classList.add('hidden');
        if (lbl) lbl.textContent = 'تصوير QR';
      });
    }
  }
  function linkPosCustomer(rawCode) {
    const val = String(rawCode || '').trim(), fb = document.getElementById('posScanStatus');
    if (!val || !global.PizzaLoyalty) return;
    let phone = null;
    const ver = PizzaLoyalty.verifyMemberCode(val);
    if (ver) phone = ver.phone;
    else if (/^05\d{8}$/.test(val.replace(/\s+/g, ''))) phone = val.replace(/\s+/g, '');
    else { if (fb) { fb.textContent = 'رمز QR أو رقم غير صالح — تأكد من مسح QR العميل الرسمي.'; fb.className = 'rounded-xl p-2.5 text-xs font-bold bg-rose-500/15 border border-rose-500/35 text-rose-300'; fb.classList.remove('hidden'); } return; }
    const existingOrders = (typeof global.getCashierOrders === 'function' ? global.getCashierOrders() : []);
    const foundOrd = existingOrders.find((o) => o.customerPhone === phone);
    const sum = PizzaLoyalty.getCustomerSummary(phone);
    const name = (foundOrd && foundOrd.customerName) || (sum.history[0] && sum.history[0].customerName) || 'عميل التطبيق';
    posState.linkedCustomer = { phone, name, memberCode: sum.memberCode };
    posState.redeemPoints = 0;
    renderPosPanel();
  }
  function showMadaModal(order, madaRef) {
    const modal = document.getElementById('madaTerminalModal'), body = document.getElementById('madaTerminalBody');
    if (!modal || !body) return;
    modal.classList.remove('hidden');
    body.innerHTML = `<div class="text-center space-y-4 py-4"><div class="w-16 h-16 mx-auto rounded-2xl bg-sky-400/15 border border-sky-400/35 text-sky-400 flex items-center justify-center animate-pulse"><i data-lucide="credit-card" class="w-8 h-8"></i></div><div><p class="text-xs font-bold text-ashMuted">جاري إرسال المبلغ إلى جهاز الصرافة (${order.payment})</p><p class="text-4xl font-black text-chalk mt-2 tabular-nums">${order.total.toFixed(2)} <span class="text-base text-parchment">ر.س</span></p>${order.pointsDiscountSar > 0 ? `<p class="text-xs text-emerald-400 font-bold mt-1">بعد خصم النقاط (-${order.pointsDiscountSar} ر.س من أصل ${order.subtotal} ر.س)</p>` : ''}</div></div>`;
    if (global.lucide) global.lucide.createIcons();
    setTimeout(() => {
      body.innerHTML = `<div class="text-center space-y-4 py-3"><div class="w-16 h-16 mx-auto rounded-2xl bg-emerald-400/15 border border-emerald-400/40 text-emerald-400 flex items-center justify-center"><i data-lucide="check-circle-2" class="w-9 h-9"></i></div><div class="space-y-1"><h4 class="text-xl font-black text-emerald-400">تمت العملية وحُفظ الطلب بنجاح</h4><p class="text-xs text-ashMuted">رقم الطلب: <strong class="text-chalk">#${order.id}</strong> • مرجع الصرافة: <strong dir="ltr" class="text-parchment">${madaRef}</strong></p></div><div class="rounded-2xl bg-charcoal border border-white/10 p-4 text-xs space-y-1.5 text-start"><div class="flex justify-between"><span class="text-ashMuted">المبلغ المدفوع بالصرافة:</span><strong class="text-chalk">${order.total.toFixed(2)} ر.س</strong></div>${order.pointsDiscountSar > 0 ? `<div class="flex justify-between"><span class="text-ashMuted">خصم نقاط العميل:</span><strong class="text-emerald-400">-${order.pointsDiscountSar} ر.س (${order.pointsRedeemed} نقطة)</strong></div>` : ''}<div class="flex justify-between"><span class="text-ashMuted">تسجيل الطلب:</span><strong class="text-parchment">${order.customerPhone !== 'walkin' ? `مسجل بحساب العميل (+${order.pointsAwardedAmount} نقطة)` : 'عميل مباشر بدون تطبيق (سجل الكاشير فقط)'}</strong></div></div><button id="closeMadaDoneBtn" type="button" class="w-full py-3 rounded-xl bg-chalk hover:bg-neutral-200 text-charcoal font-black text-sm cursor-pointer">إغلاق</button></div>`;
      if (global.lucide) global.lucide.createIcons();
      const btn = document.getElementById('closeMadaDoneBtn'); if (btn) btn.onclick = () => modal.classList.add('hidden');
    }, 800);
  }
  function submitPosOrder() {
    if (posState.cart.length === 0) return;
    ensureBranch();
    const { subtotal, redeemPts, discountSar, netTotal, earnPts } = computePosTotals();
    const branch = getBranches().find((b) => b.id === posState.branchId) || { id: 'hafar-khalidiyah', regionId: 'hafar', name: 'فرع حي الخالدية — حفر الباطن' };
    const reg = getRegions().find((r) => r.id === branch.regionId) || { id: 'hafar', name: 'منطقة حفر الباطن' };
    const now = new Date(), isoDate = now.toISOString().slice(0, 10);
    const orderNum = `POS-${Math.floor(1000 + Math.random() * 9000)}`, madaRef = `MD-${Math.floor(100000 + Math.random() * 900000)}`;
    const hasApp = Boolean(posState.linkedCustomer), custPhone = hasApp ? posState.linkedCustomer.phone : 'walkin', custName = hasApp ? posState.linkedCustomer.name : 'عميل مباشر (كاشير)';
    if (hasApp && redeemPts > 0 && global.PizzaLoyalty) {
      const rtx = PizzaLoyalty.recordTransaction({ phone: custPhone, customerName: custName, delta: -redeemPts, type: 'redeem', orderId: orderNum, reason: `خصم QR كاشير #${orderNum} (-${discountSar} ر.س)` });
      if (!rtx.ok) { alert(rtx.error || 'تعذر خصم النقاط'); return; }
    }
    let awarded = 0;
    if (hasApp && earnPts > 0 && global.PizzaLoyalty) {
      const etx = PizzaLoyalty.recordTransaction({ phone: custPhone, customerName: custName, delta: earnPts, type: 'earn_pickup', orderId: orderNum, reason: `نقاط طلب كاشير #${orderNum} (${netTotal} ر.س)` });
      if (etx.ok) awarded = earnPts;
    }
    const newOrder = {
      id: orderNum, source: 'pos', madaRef, isoDate, year: now.getFullYear(), month: now.getMonth() + 1,
      createdAt: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      regionId: reg.id, regionName: reg.name, branchId: branch.id, branchName: branch.name,
      customerName: custName, customerPhone: custPhone, customerEmail: '', memberCode: hasApp ? posState.linkedCustomer.memberCode : '',
      fulfillment: 'pickup', address: 'طلب مباشر بالكاشير', coords: null, payment: posState.paymentMethod, notes: `مرجع الصرافة: ${madaRef}`,
      items: posState.cart.map((l) => ({ ...l })), subtotal, pointsRedeemed: redeemPts, pointsDiscountSar: discountSar,
      expectedPoints: earnPts, pointsAwarded: awarded > 0, pointsAwardedAmount: awarded, total: netTotal, status: 'completed',
    };
    if (typeof global.appendCashierOrder === 'function') global.appendCashierOrder(newOrder);
    posState.cart = []; posState.linkedCustomer = null; posState.redeemPoints = 0; stopPosCamera();
    renderPosPanel(); showMadaModal(newOrder, madaRef);
  }
  function renderPosPanel() {
    const host = document.getElementById('posPanel'), allItems = getMenuItems();
    if (!host) return;
    ensureBranch();
    const { subtotal, availPts, maxRedeemPts, redeemPts, discountSar, netTotal, earnPts } = computePosTotals();
    const q = posState.search.trim().toLowerCase();
    const items = allItems.filter((it) => (posState.category === 'all' || it.category === posState.category) && (!q || `${it.name} ${it.en}`.toLowerCase().includes(q)));
    const branchesHtml = getBranches().map((b) => `<option value="${b.id}" ${b.id === posState.branchId ? 'selected' : ''}>${b.name}</option>`).join('');
    const sizesHtml = getSizeOptions().map((s) => `<button type="button" data-pos-size="${s.id}" class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${posState.sizeId === s.id ? 'bg-chalk text-charcoal' : 'bg-charcoal border border-white/15 text-ashMuted'}">${s.label}${s.extra ? ' +' + s.extra : ''}</button>`).join('');
    const crustsHtml = getCrustOptions().map((c) => `<button type="button" data-pos-crust="${c.id}" class="px-3 py-1.5 rounded-lg text-[11px] font-extrabold cursor-pointer ${posState.crustId === c.id ? 'bg-parchment text-charcoal' : 'bg-charcoal border border-white/15 text-ashMuted'}">${c.label}${c.extra ? ' +' + c.extra : ''}</button>`).join('');
    host.innerHTML = `<div class="grid lg:grid-cols-12 gap-5 items-start">
      <div class="lg:col-span-7 card-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2.5">
          <div><h2 class="text-base sm:text-lg font-black text-chalk">نقطة البيع — تسجيل طلب مباشر بالكاشير</h2><p class="text-xs text-ashMuted">اختر الأصناف لأي عميل (سواء عنده تطبيق ورمز QR أو بدون تطبيق).</p></div>
          <select id="posBranchSelect" class="px-3 py-2 rounded-xl bg-charcoal border border-white/15 text-xs font-bold text-chalk max-w-[230px]">${branchesHtml}</select>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input id="posSearchInput" type="search" value="${posState.search}" placeholder="بحث سريع في المنيو (24 صنف)..." class="flex-1 min-w-[180px] px-3.5 py-2 rounded-xl bg-charcoal border border-white/15 text-xs text-chalk" />
          <div class="flex flex-wrap gap-1.5">${[{id:'all',l:'الكل'},{id:'chicken',l:'دجاج'},{id:'classic',l:'أجبان'},{id:'meat',l:'لحوم'}].map((c) => `<button type="button" data-pos-cat="${c.id}" class="px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer ${posState.category === c.id ? 'bg-chalk text-charcoal' : 'bg-charcoal border border-white/10 text-ashMuted'}">${c.l}</button>`).join('')}</div>
        </div>
        <div class="rounded-2xl bg-charcoal/80 border border-white/10 p-3 flex flex-wrap items-center gap-2"><span class="text-[11px] font-bold text-ashMuted">خيار الإضافة:</span><div class="flex flex-wrap gap-1.5">${sizesHtml}</div><div class="flex flex-wrap gap-1.5">${crustsHtml}</div></div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[520px] overflow-y-auto pe-1">${items.map((it) => `<button type="button" data-pos-add="${it.id}" class="p-3 rounded-2xl bg-charcoal hover:bg-slateLight border border-white/10 hover:border-parchment/45 text-start transition-all cursor-pointer flex flex-col justify-between gap-2"><div class="flex items-center gap-2.5"><img src="${it.img}" alt="${it.name}" class="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10" /><span class="text-xs font-extrabold text-chalk leading-snug line-clamp-2">${it.name}</span></div><div class="flex items-center justify-between pt-1 border-t border-white/5"><span class="text-sm font-black text-parchment">${it.price} ر.س</span><span class="w-6 h-6 rounded-lg bg-chalk text-charcoal flex items-center justify-center font-black text-xs">+</span></div></button>`).join('')}</div>
      </div>
      <div class="lg:col-span-5 card-panel rounded-3xl p-4 sm:p-5 space-y-4">
        <div class="flex items-center justify-between"><h3 class="text-base font-black text-chalk">الفاتورة الحالية</h3>${posState.cart.length ? `<button id="posClearCartBtn" type="button" class="text-xs text-rose-400 font-bold cursor-pointer">مسح الفاتورة</button>` : ''}</div>
        <div class="rounded-2xl bg-charcoal border ${posState.linkedCustomer ? 'border-emerald-400/45' : 'border-white/10'} p-3.5 space-y-3">
          <div class="flex items-center justify-between gap-2"><span class="text-xs font-black text-chalk">هل لدى العميل تطبيق؟ (اختياري)</span>${posState.linkedCustomer ? `<button id="posUnlinkCustBtn" type="button" class="text-[11px] font-bold text-rose-400 cursor-pointer">إزالة العميل</button>` : `<button id="posCamBtn" type="button" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 text-charcoal text-[11px] font-black cursor-pointer"><i data-lucide="camera" class="w-3.5 h-3.5"></i><span id="posCamBtnLabel">تصوير QR</span></button>`}</div>
          <div id="posCameraWrap" class="hidden rounded-xl overflow-hidden border border-parchment/30 bg-black p-1"><div id="posCameraReader" class="w-full min-h-[180px]"></div></div>
          ${posState.linkedCustomer ? `<div class="space-y-2.5"><div class="flex items-center justify-between text-xs"><div><p class="font-black text-emerald-400">${posState.linkedCustomer.name}</p><p dir="ltr" class="text-[11px] text-ashMuted text-end">${posState.linkedCustomer.memberCode}</p></div><div class="text-end"><span class="block text-sm font-black text-amber-300 tabular-nums">${availPts} نقطة</span><span class="text-[11px] text-parchment">تساوي ${Math.floor(availPts / 100)} ر.س</span></div></div>${maxRedeemPts >= 100 ? `<div class="rounded-xl bg-emerald-400/10 border border-emerald-400/30 p-3 space-y-2.5"><div class="flex items-center justify-between text-xs"><span class="font-extrabold text-emerald-300">كم يبي العميل يستخدم من نقاطه؟</span><span class="font-black text-chalk tabular-nums">خصم ${discountSar} ر.س</span></div><div class="flex items-center gap-2"><button id="posPtsMinusBtn" type="button" class="w-8 h-8 rounded-lg bg-charcoal border border-white/15 text-chalk font-black cursor-pointer">-</button><input id="posPtsInput" type="number" min="0" max="${maxRedeemPts}" step="100" value="${redeemPts}" class="flex-1 px-2.5 py-1.5 rounded-lg bg-charcoal border border-white/15 text-center text-xs font-black text-chalk tabular-nums" /><button id="posPtsPlusBtn" type="button" class="w-8 h-8 rounded-lg bg-charcoal border border-white/15 text-chalk font-black cursor-pointer">+</button><button id="posPtsUseAllBtn" type="button" class="px-3 py-1.5 rounded-lg bg-emerald-400 text-charcoal text-[11px] font-black cursor-pointer whitespace-nowrap">استخدام الكل (${Math.floor(maxRedeemPts/100)} ر.س)</button></div></div>` : `<p class="text-[11px] text-ashMuted">الرصيد المتاح أقل من 100 نقطة — ستُضاف نقاط هذا الطلب لرصيده بعد الدفع.</p>`}</div>` : `<form id="posScanForm" class="flex gap-1.5"><input id="posScanInput" type="text" dir="ltr" placeholder="امسح QR / باركود أو اكتب الجوال..." class="flex-1 px-3 py-2 rounded-xl bg-slateWood border border-white/15 text-xs text-chalk text-end" /><button type="submit" class="px-3 py-2 rounded-xl bg-parchment text-charcoal text-xs font-black cursor-pointer">ربط</button></form><p class="text-[11px] text-ashMuted">إذا العميل ما عنده تطبيق، كمل الفاتورة مباشرة بدون مسح.</p>`}
          <div id="posScanStatus" class="hidden"></div>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto">${posState.cart.length === 0 ? `<div class="py-8 text-center text-xs text-ashMuted rounded-2xl bg-charcoal/60 border border-white/5">اختر الأصناف من القائمة لإنشاء الفاتورة</div>` : posState.cart.map((l) => `<div class="rounded-xl bg-charcoal border border-white/10 p-2.5 flex items-center justify-between gap-2 text-xs"><div class="min-w-0"><p class="font-extrabold text-chalk truncate">${l.name}</p><p class="text-[10px] text-ashMuted">${l.sizeLabel} • ${l.crustLabel}</p></div><div class="flex items-center gap-2 shrink-0"><span class="font-black text-parchment">${l.unitPrice * l.qty} ر.س</span><div class="inline-flex items-center gap-1 bg-slateWood rounded-lg p-0.5"><button type="button" data-pos-qty="1" data-pos-key="${encodeURIComponent(l.key)}" class="w-6 h-6 rounded bg-chalk text-charcoal font-black cursor-pointer">+</button><span class="min-w-[18px] text-center font-black text-chalk">${l.qty}</span><button type="button" data-pos-qty="-1" data-pos-key="${encodeURIComponent(l.key)}" class="w-6 h-6 rounded bg-slateLight text-chalk font-black cursor-pointer">-</button></div></div></div>`).join('')}</div>
        <div class="rounded-2xl bg-charcoal border border-parchment/30 p-4 space-y-3">
          <div class="grid grid-cols-3 gap-1.5">${['مدى (صرافة)', 'Apple Pay', 'كاش'].map((pm) => `<button type="button" data-pos-pay="${pm}" class="py-2 rounded-xl text-[11px] font-extrabold border cursor-pointer ${posState.paymentMethod === pm ? 'bg-parchment text-charcoal border-parchment' : 'bg-slateWood border-white/10 text-ashMuted'}">${pm}</button>`).join('')}</div>
          <div class="space-y-1 text-xs pt-1 border-t border-white/10">
            <div class="flex justify-between text-ashMuted"><span>المجموع قبل الخصم</span><span class="tabular-nums">${subtotal} ر.س</span></div>
            ${discountSar > 0 ? `<div class="flex justify-between text-emerald-400 font-extrabold"><span>خصم النقاط (${redeemPts} نقطة)</span><span class="tabular-nums">-${discountSar} ر.س</span></div>` : ''}
            ${posState.linkedCustomer && earnPts > 0 ? `<div class="flex justify-between text-amber-300 font-bold"><span>نقاط سيحصل عليها العميل</span><span>+${earnPts} نقطة</span></div>` : ''}
            <div class="flex items-center justify-between pt-2 border-t border-white/10"><span class="text-sm font-black text-chalk">المطلوب دفعه بالصرافة</span><span class="text-2xl font-black text-parchment tabular-nums">${netTotal.toFixed(2)} ر.س</span></div>
          </div>
          <button id="posSendMadaBtn" type="button" ${posState.cart.length === 0 ? 'disabled' : ''} class="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-charcoal font-black text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"><i data-lucide="credit-card" class="w-4 h-4"></i><span>إرسال ${netTotal.toFixed(2)} ر.س للصرافة وإتمام الطلب</span></button>
        </div>
      </div>
    </div>`;
    const brSel = document.getElementById('posBranchSelect'); if (brSel) brSel.onchange = (e) => { posState.branchId = e.target.value; };
    const srch = document.getElementById('posSearchInput'); if (srch) srch.oninput = (e) => { posState.search = e.target.value; renderPosPanel(); const n = document.getElementById('posSearchInput'); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } };
    const clr = document.getElementById('posClearCartBtn'); if (clr) clr.onclick = () => { posState.cart = []; renderPosPanel(); };
    const unlink = document.getElementById('posUnlinkCustBtn'); if (unlink) unlink.onclick = () => { posState.linkedCustomer = null; posState.redeemPoints = 0; renderPosPanel(); };
    const scanForm = document.getElementById('posScanForm'); if (scanForm) scanForm.onsubmit = (e) => { e.preventDefault(); linkPosCustomer(document.getElementById('posScanInput').value); };
    const ptsMinus = document.getElementById('posPtsMinusBtn'); if (ptsMinus) ptsMinus.onclick = () => { posState.redeemPoints = Math.max(0, posState.redeemPoints - 100); renderPosPanel(); };
    const ptsPlus = document.getElementById('posPtsPlusBtn'); if (ptsPlus) ptsPlus.onclick = () => { posState.redeemPoints = Math.min(maxRedeemPts, posState.redeemPoints + 100); renderPosPanel(); };
    const ptsAll = document.getElementById('posPtsUseAllBtn'); if (ptsAll) ptsAll.onclick = () => { posState.redeemPoints = maxRedeemPts; renderPosPanel(); };
    const ptsInput = document.getElementById('posPtsInput'); if (ptsInput) ptsInput.onchange = (e) => { posState.redeemPoints = Math.max(0, Math.min(maxRedeemPts, Math.floor(Number(e.target.value || 0) / 100) * 100)); renderPosPanel(); };
    const camBtn = document.getElementById('posCamBtn');
    if (camBtn) camBtn.onclick = () => {
      if (posState.camActive) { stopPosCamera(); return; }
      if (!global.Html5Qrcode) return;
      document.getElementById('posCameraWrap').classList.remove('hidden');
      if (!posState.qrScanner) posState.qrScanner = new Html5Qrcode('posCameraReader');
      posState.qrScanner.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 220, height: 140 } }, (txt) => { stopPosCamera(); linkPosCustomer(txt); }, () => {}).then(() => { posState.camActive = true; const lbl = document.getElementById('posCamBtnLabel'); if (lbl) lbl.textContent = 'إيقاف'; }).catch(() => { document.getElementById('posCameraWrap').classList.add('hidden'); });
    };
    const madaBtn = document.getElementById('posSendMadaBtn'); if (madaBtn) madaBtn.onclick = submitPosOrder;
    if (global.lucide) global.lucide.createIcons();
  }
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-pos-add]'); if (addBtn) { addPosItem(addBtn.getAttribute('data-pos-add')); return; }
    const qtyBtn = e.target.closest('[data-pos-qty]'); if (qtyBtn) { updatePosQty(decodeURIComponent(qtyBtn.getAttribute('data-pos-key')), Number(qtyBtn.getAttribute('data-pos-qty'))); return; }
    const catBtn = e.target.closest('[data-pos-cat]'); if (catBtn) { posState.category = catBtn.getAttribute('data-pos-cat'); renderPosPanel(); return; }
    const szBtn = e.target.closest('[data-pos-size]'); if (szBtn) { posState.sizeId = szBtn.getAttribute('data-pos-size'); renderPosPanel(); return; }
    const crBtn = e.target.closest('[data-pos-crust]'); if (crBtn) { posState.crustId = crBtn.getAttribute('data-pos-crust'); renderPosPanel(); return; }
    const payBtn = e.target.closest('[data-pos-pay]'); if (payBtn) { posState.paymentMethod = payBtn.getAttribute('data-pos-pay'); renderPosPanel(); return; }
  });
  global.PizzaPos = { renderPosPanel, stopPosCamera, showMadaModal };
})(window);