function renderFeatured() {
const grid = document.getElementById('featuredGrid');
grid.innerHTML = MENU_ITEMS.filter((i) => i.featured).map((item) => {
const inCart = getItemCountInCart(item.id);
return `
<div class="card-elevated rounded-2xl p-4 flex flex-col justify-between gap-3">
<div class="flex items-start gap-3">
<img src="${item.img}" alt="${item.name}" loading="lazy" class="w-20 h-20 rounded-2xl object-cover border border-white/10 shrink-0" />
<div class="min-w-0 space-y-1">
<span class="inline-block px-2 py-0.5 rounded-full bg-white/10 text-parchment text-[10px] font-bold">${item.badge}</span>
<h3 class="text-sm sm:text-base font-extrabold text-chalk truncate">${item.name}</h3>
<p class="text-[11px] text-ashMuted font-body line-clamp-2">${item.desc}</p>
</div>
</div>
<div class="flex items-center justify-between pt-2 border-t border-white/10">
<span class="text-base font-black text-parchment">${item.price} <span class="text-xs font-bold text-ashMuted">ر.س</span></span>
<button type="button" data-customize="${item.id}" class="inline-flex items-center gap-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-chalk hover:bg-chalkHover text-charcoal text-xs font-black cursor-pointer">
<i data-lucide="plus" class="w-3.5 h-3.5"></i>
<span>${inCart > 0 ? `إضافة (${inCart})` : 'تخصيص وإضافة'}</span>
</button>
</div>
</div>
`;
}).join('');
}
function renderCategoryFilters() {
document.getElementById('categoryFilters').innerHTML = CATEGORIES.map((cat) => `
<button type="button" role="tab" aria-selected="${state.activeCategory === cat.id}" data-cat="${cat.id}" class="px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap cursor-pointer transition-all ${state.activeCategory === cat.id ? 'bg-chalk text-charcoal shadow-lg' : 'bg-charcoal border border-white/15 text-ashMuted hover:text-chalk'}">
${cat.label}
</button>
`).join('');
}
function renderMenu() {
const grid = document.getElementById('menuGrid');
const empty = document.getElementById('emptyMenuState');
const q = state.searchQuery.trim().toLowerCase();
const items = MENU_ITEMS.filter((item) => {
if (state.activeCategory === 'spicy' && !item.spicy) return false;
if (state.activeCategory === 'budget' && item.price > 12) return false;
if (['chicken', 'classic', 'meat'].includes(state.activeCategory) && item.category !== state.activeCategory) return false;
if (q) return `${item.name} ${item.en} ${item.desc}`.toLowerCase().includes(q);
return true;
});
if (items.length === 0) {
grid.innerHTML = '';
empty.classList.remove('hidden');
return;
}
empty.classList.add('hidden');
grid.innerHTML = items.map((item) => {
const inCart = getItemCountInCart(item.id);
return `
<article class="card-elevated rounded-2xl p-4 flex flex-col justify-between gap-3.5">
<div class="flex items-start gap-3.5">
<img src="${item.img}" alt="${item.name}" loading="lazy" class="w-24 h-24 rounded-2xl object-cover border border-white/10 shrink-0 shadow-lg" />
<div class="min-w-0 flex-1 space-y-1">
<div class="flex items-start justify-between gap-1.5">
<h3 class="text-base font-extrabold text-chalk leading-snug">${item.name}</h3>
${item.spicy ? '<span class="px-1.5 py-0.5 rounded bg-white/10 text-parchment text-[10px] font-bold shrink-0">حار</span>' : ''}
</div>
<span class="block text-[11px] font-serif italic text-ashMuted/80">${item.en}</span>
<p class="text-xs text-ashMuted font-body leading-relaxed line-clamp-2">${item.desc}</p>
<span class="inline-flex items-center gap-1 text-[11px] font-bold text-ashMuted/90 pt-0.5">
<i data-lucide="flame" class="w-3 h-3 text-parchment"></i>
${item.cal} سعرة
</span>
</div>
</div>
<div class="flex items-center justify-between pt-3 border-t border-white/10">
<div class="flex items-baseline gap-1">
<span class="text-xl font-black text-parchment">${item.price}</span>
<span class="text-xs font-bold text-ashMuted">ريال</span>
</div>
<button type="button" data-customize="${item.id}" class="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-chalk hover:bg-chalkHover text-charcoal text-xs font-black cursor-pointer transition-colors">
<i data-lucide="plus" class="w-3.5 h-3.5"></i>
<span>${inCart > 0 ? `أضف آخر (${inCart})` : 'تخصيص وإضافة'}</span>
</button>
</div>
</article>
`;
}).join('');
}
function renderRegionsAndBranches() {
const reg = REGIONS.find((r) => r.id === state.activeRegionId) || REGIONS[0];
document.getElementById('navRegionLabel').textContent = reg.name.replace('منطقة ', '');
document.getElementById('mobileRegionText').textContent = reg.name.replace('منطقة ', '');
document.getElementById('heroRegionStatus').textContent = `${reg.name} • الطلب المباشر متاح الآن`;
document.getElementById('branchRegionTabs').innerHTML = REGIONS.map((r) => `
<button type="button" data-select-region="${r.id}" class="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold cursor-pointer transition-all ${r.id === state.activeRegionId ? 'bg-parchment text-charcoal' : 'bg-charcoal border border-white/15 text-ashMuted hover:text-chalk'}">
${r.name}
</button>
`).join('');
const regionBranches = BRANCHES.filter((b) => b.regionId === state.activeRegionId);
let branch = regionBranches.find((b) => b.id === state.activeBranchId);
if (!branch) {
branch = regionBranches[0] || BRANCHES[0];
state.activeBranchId = branch.id;
}
document.getElementById('branchTabs').innerHTML = regionBranches.map((b) => `
<button type="button" role="tab" aria-selected="${b.id === branch.id}" data-branch="${b.id}" class="px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all ${b.id === branch.id ? 'bg-chalk text-charcoal shadow-lg' : 'bg-charcoal border border-white/15 text-ashMuted hover:text-chalk'}">
${b.name}
</button>
`).join('');
document.getElementById('branchDetailCard').innerHTML = `
<div class="grid md:grid-cols-12 gap-6 items-center">
<div class="md:col-span-7 space-y-4">
<div class="flex flex-wrap items-center gap-2.5">
<h3 class="text-xl sm:text-2xl font-black text-chalk">${branch.name}</h3>
<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-parchment text-xs font-extrabold">
<i data-lucide="star" class="w-3.5 h-3.5 fill-parchment"></i>
${branch.rating} (${branch.reviewsCount} تقييم)
</span>
</div>
<div class="space-y-2.5 text-sm text-ashMuted font-body">
<div class="flex items-start gap-2.5"><i data-lucide="map-pin" class="w-4 h-4 text-parchment shrink-0 mt-1"></i><span class="text-chalk/90">${branch.address}</span></div>
<div class="flex items-center gap-2.5"><i data-lucide="clock" class="w-4 h-4 text-parchment shrink-0"></i><span>${branch.hours}</span></div>
<div class="flex items-center gap-2.5"><i data-lucide="phone" class="w-4 h-4 text-emerald-400 shrink-0"></i><span dir="ltr" class="font-bold text-chalk">${branch.phoneDisplay}</span></div>
</div>
<div class="flex flex-wrap gap-2 pt-1">
${branch.services.map((s) => `<span class="px-3 py-1 rounded-lg bg-charcoal border border-white/10 text-xs text-ashMuted">${s}</span>`).join('')}
</div>
</div>
<div class="md:col-span-5 flex flex-col gap-3">
<a href="tel:${branch.phoneHref}" class="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-chalk hover:bg-chalkHover text-charcoal font-extrabold text-sm transition-colors">
<i data-lucide="phone-call" class="w-4 h-4"></i>
<span>اتصال مباشر بالفرع</span>
</a>
<a href="${branch.mapsUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] rounded-xl bg-charcoal hover:bg-slateLight border border-white/20 text-chalk font-bold text-sm transition-colors">
<i data-lucide="navigation" class="w-4 h-4 text-parchment"></i>
<span>الاتجاهات عبر خرائط قوقل</span>
</a>
</div>
</div>
`;
document.getElementById('mobileCallBtn').href = `tel:${branch.phoneHref}`;
const select = document.getElementById('cartBranchSelect');
select.innerHTML = regionBranches.map((b) => `<option value="${b.id}" ${b.id === state.activeBranchId ? 'selected' : ''}>${b.name}</option>`).join('');
}
function renderCartAndHistory() {
const { count, total } = getCartStats();
document.getElementById('navCartCount').textContent = count;
document.getElementById('mobileCartLabel').textContent = count > 0 ? `السلة (${count}) • ${total} ر.س` : 'السلة (0)';
document.getElementById('cartTotalPrice').textContent = `${total} ر.س`;
const myOrders = state.user ? state.orders.filter((o) => o.customerPhone === state.user.phone) : state.orders;
document.getElementById('historyCountBadge').textContent = myOrders.length;
const curBtn = document.getElementById('tabCurrentCartBtn');
const hisBtn = document.getElementById('tabOrderHistoryBtn');
const curPanel = document.getElementById('cartCurrentTabPanel');
const hisPanel = document.getElementById('cartHistoryTabPanel');
if (state.cartTab === 'current') {
curBtn.className = 'py-2 rounded-lg text-xs font-black cursor-pointer bg-chalk text-charcoal';
hisBtn.className = 'py-2 rounded-lg text-xs font-bold cursor-pointer text-ashMuted hover:text-chalk';
curPanel.classList.remove('hidden');
hisPanel.classList.add('hidden');
} else {
hisBtn.className = 'py-2 rounded-lg text-xs font-black cursor-pointer bg-chalk text-charcoal';
curBtn.className = 'py-2 rounded-lg text-xs font-bold cursor-pointer text-ashMuted hover:text-chalk';
hisPanel.classList.remove('hidden');
curPanel.classList.add('hidden');
}
document.querySelectorAll('.fulfill-btn').forEach((btn) => {
const type = btn.getAttribute('data-fulfill');
const active = state.fulfillment === type;
btn.textContent = type === 'pickup' ? 'استلام من الفرع' : 'توصيل لموقعك';
btn.className = `fulfill-btn py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-colors border ${active ? 'bg-chalk text-charcoal border-chalk' : 'bg-slateLight text-ashMuted border-white/15 hover:text-chalk'}`;
});
document.getElementById('deliveryAddressWrap').classList.toggle('hidden', state.fulfillment !== 'delivery');
document.getElementById('paymentMethodsGrid').innerHTML = PAYMENT_METHODS.map((pm) => {
const active = state.paymentMethod === pm.id;
return `
<button type="button" data-payment="${pm.id}" class="py-2 px-1.5 rounded-xl border text-[11px] font-extrabold cursor-pointer transition-all text-center ${active ? 'bg-parchment text-charcoal border-parchment' : 'bg-slateLight border-white/10 text-ashMuted hover:text-chalk'}">
${pm.label}
</button>
`;
}).join('');
const container = document.getElementById('cartItemsContainer');
if (state.cart.length === 0) {
container.innerHTML = `
<div class="py-10 text-center space-y-2.5">
<span class="w-12 h-12 mx-auto rounded-2xl bg-slateLight border border-white/10 flex items-center justify-center text-ashMuted">
<i data-lucide="shopping-bag" class="w-5 h-5"></i>
</span>
<p class="text-sm text-chalk font-bold">سلتك فاضية حالياً</p>
<p class="text-xs text-ashMuted">اختر بيتزتك من المنيو وخصّص العجينة والإضافات.</p>
</div>
`;
} else {
container.innerHTML = state.cart.map((line) => `
<div class="rounded-2xl bg-charcoal border border-white/10 p-3 flex items-start gap-3">
<img src="${line.img}" alt="${line.name}" class="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0" />
<div class="flex-1 min-w-0 space-y-1">
<div class="flex items-start justify-between gap-2">
<h4 class="text-xs sm:text-sm font-extrabold text-chalk truncate">${line.name}</h4>
<span class="text-xs sm:text-sm font-black text-parchment shrink-0">${line.unitPrice * line.qty} ر.س</span>
</div>
<p class="text-[11px] text-ashMuted">${line.sizeLabel} • ${line.crustLabel} • ${line.cutLabel}</p>
${line.extraLabels.length ? `<p class="text-[11px] text-parchment">إضافات: ${line.extraLabels.join('، ')}</p>` : ''}
<div class="flex justify-end pt-1">
<div class="inline-flex items-center gap-1 bg-slateWood border border-white/15 rounded-lg p-0.5">
<button type="button" data-cart-action="add" data-key="${encodeURIComponent(line.key)}" aria-label="زيادة" class="w-6 h-6 rounded bg-chalk text-charcoal flex items-center justify-center cursor-pointer"><i data-lucide="plus" class="w-3 h-3"></i></button>
<span class="min-w-[20px] text-center text-xs font-extrabold text-chalk">${line.qty}</span>
<button type="button" data-cart-action="sub" data-key="${encodeURIComponent(line.key)}" aria-label="إنقاص" class="w-6 h-6 rounded bg-slateLight text-chalk flex items-center justify-center cursor-pointer"><i data-lucide="minus" class="w-3 h-3"></i></button>
</div>
</div>
</div>
</div>
`).join('');
}
if (myOrders.length === 0) {
hisPanel.innerHTML = `
<div class="py-14 text-center space-y-2.5">
<i data-lucide="history" class="w-8 h-8 text-ashMuted mx-auto"></i>
<p class="text-sm text-chalk font-bold">لا توجد طلبات سابقة بعد</p>
<p class="text-xs text-ashMuted">أي طلب ترسله أو يكتمل سيحفظ هنا مع تاريخه وحالته.</p>
</div>
`;
} else {
hisPanel.innerHTML = myOrders.map((ord) => {
const st = ORDER_STATUSES.find((s) => s.id === ord.status) || ORDER_STATUSES[0];
return `
<div class="rounded-2xl bg-charcoal border border-white/10 p-4 space-y-2.5">
<div class="flex items-center justify-between gap-2">
<div>
<span class="text-sm font-black text-chalk">#${ord.id}</span>
<span class="text-[11px] text-ashMuted ms-1.5">${ord.isoDate} • ${ord.createdAt}</span>
</div>
<span class="px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${st.color}">${st.short}</span>
</div>
<p class="text-xs text-parchment font-bold">${ord.branchName} • ${ord.payment}</p>
<p class="text-[11px] text-ashMuted">${ord.items.map((i) => `${i.qty}× ${i.name}`).join('، ')}</p>
<div class="flex items-center justify-between pt-2 border-t border-white/10">
<span class="text-sm font-black text-chalk">${ord.total} ر.س</span>
<button type="button" data-open-order="${ord.id}" class="text-xs font-extrabold text-parchment hover:text-chalk cursor-pointer">عرض التفاصيل</button>
</div>
</div>
`;
}).join('');
}
}
function renderAuthAndLiveBanner() {
document.getElementById('navUserLabel').textContent = state.user ? state.user.name.split(' ')[0] : 'تسجيل الدخول';
const myOrders = state.user ? state.orders.filter((o) => o.customerPhone === state.user.phone) : state.orders;
const inProgressOrder = myOrders.find((o) => ['new', 'preparing', 'ready'].includes(o.status));
const liveBanner = document.getElementById('liveOrderBanner');
if (inProgressOrder) {
state.activeOrderId = inProgressOrder.id;
const st = ORDER_STATUSES.find((s) => s.id === inProgressOrder.status) || ORDER_STATUSES[0];
liveBanner.classList.remove('hidden');
document.getElementById('liveBannerOrderId').textContent = `طلب #${inProgressOrder.id}`;
document.getElementById('liveBannerStatus').textContent = st.label;
} else {
liveBanner.classList.add('hidden');
}
if (!document.getElementById('trackerModal').classList.contains('hidden') && state.activeOrderId) {
const currentOrd = state.orders.find((o) => o.id === state.activeOrderId);
if (currentOrd) renderTrackerContent(currentOrd);
}
}
function renderAll() {
renderRegionsAndBranches();
renderFeatured();
renderCategoryFilters();
renderMenu();
renderCartAndHistory();
renderAuthAndLiveBanner();
if (window.lucide) window.lucide.createIcons();
}
document.addEventListener('click', (e) => {
const regBtn = e.target.closest('[data-select-region]');
if (regBtn) { selectRegion(regBtn.getAttribute('data-select-region')); return; }
const custBtn = e.target.closest('[data-customize]');
if (custBtn) { openCustomizer(custBtn.getAttribute('data-customize')); return; }
const custSize = e.target.closest('[data-cust-size]');
if (custSize && state.customizer) { state.customizer.size = custSize.getAttribute('data-cust-size'); renderCustomizerOptions(); return; }
const custCrust = e.target.closest('[data-cust-crust]');
if (custCrust && state.customizer) { state.customizer.crust = custCrust.getAttribute('data-cust-crust'); renderCustomizerOptions(); return; }
const custCut = e.target.closest('[data-cust-cut]');
if (custCut && state.customizer) { state.customizer.cut = custCut.getAttribute('data-cust-cut'); renderCustomizerOptions(); return; }
const custExtra = e.target.closest('[data-cust-extra]');
if (custExtra && state.customizer) {
const id = custExtra.getAttribute('data-cust-extra');
const idx = state.customizer.extras.indexOf(id);
if (idx >= 0) state.customizer.extras.splice(idx, 1);
else state.customizer.extras.push(id);
renderCustomizerOptions();
return;
}
const cartAct = e.target.closest('[data-cart-action]');
if (cartAct) { updateCartLineQty(decodeURIComponent(cartAct.getAttribute('data-key')), cartAct.getAttribute('data-cart-action') === 'add' ? 1 : -1); return; }
const fulfillBtn = e.target.closest('[data-fulfill]');
if (fulfillBtn) { state.fulfillment = fulfillBtn.getAttribute('data-fulfill'); renderCartAndHistory(); if (window.lucide) window.lucide.createIcons(); return; }
const payBtn = e.target.closest('[data-payment]');
if (payBtn) { state.paymentMethod = payBtn.getAttribute('data-payment'); renderCartAndHistory(); if (window.lucide) window.lucide.createIcons(); return; }
const catBtn = e.target.closest('[data-cat]');
if (catBtn) { state.activeCategory = catBtn.getAttribute('data-cat'); renderCategoryFilters(); renderMenu(); if (window.lucide) window.lucide.createIcons(); return; }
const branchBtn = e.target.closest('[data-branch]');
if (branchBtn) { state.activeBranchId = branchBtn.getAttribute('data-branch'); renderRegionsAndBranches(); if (window.lucide) window.lucide.createIcons(); return; }
const openOrdBtn = e.target.closest('[data-open-order]');
if (openOrdBtn) { closeCart(); openTrackerModal(openOrdBtn.getAttribute('data-open-order')); return; }
});
document.getElementById('openRegionBtn').addEventListener('click', openRegionGate);
document.getElementById('heroChangeRegionBtn').addEventListener('click', openRegionGate);
document.getElementById('mobileRegionBtn').addEventListener('click', openRegionGate);
document.getElementById('autoLocateBtn').addEventListener('click', handleAutoLocate);
document.getElementById('tabCurrentCartBtn').addEventListener('click', () => { state.cartTab = 'current'; renderCartAndHistory(); if (window.lucide) window.lucide.createIcons(); });
document.getElementById('tabOrderHistoryBtn').addEventListener('click', () => { state.cartTab = 'history'; renderCartAndHistory(); if (window.lucide) window.lucide.createIcons(); });
document.getElementById('closeCustomizerBtn').addEventListener('click', () => document.getElementById('customizerModal').classList.add('hidden'));
document.getElementById('customizerModal').addEventListener('click', (e) => { if (e.target.id === 'customizerModal') document.getElementById('customizerModal').classList.add('hidden'); });
document.getElementById('custQtyPlus').addEventListener('click', () => { if (state.customizer) { state.customizer.qty += 1; renderCustomizerOptions(); } });
document.getElementById('custQtyMinus').addEventListener('click', () => { if (state.customizer) { state.customizer.qty = Math.max(1, state.customizer.qty - 1); renderCustomizerOptions(); } });
document.getElementById('confirmCustomAddBtn').addEventListener('click', commitCustomItemToCart);
document.getElementById('menuSearchInput').addEventListener('input', (e) => { state.searchQuery = e.target.value; renderMenu(); if (window.lucide) window.lucide.createIcons(); });
document.getElementById('resetFiltersBtn').addEventListener('click', () => { state.activeCategory = 'all'; state.searchQuery = ''; document.getElementById('menuSearchInput').value = ''; renderCategoryFilters(); renderMenu(); if (window.lucide) window.lucide.createIcons(); });
const cartOverlay = document.getElementById('cartOverlay');
function openCart() { cartOverlay.classList.remove('hidden'); }
function closeCart() { cartOverlay.classList.add('hidden'); }
document.getElementById('openCartBtn').addEventListener('click', openCart);
document.getElementById('mobileCartBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', (e) => { if (e.target === cartOverlay) closeCart(); });
document.getElementById('cartBranchSelect').addEventListener('change', (e) => { state.activeBranchId = e.target.value; renderRegionsAndBranches(); if (window.lucide) window.lucide.createIcons(); });
document.getElementById('placeDirectOrderBtn').addEventListener('click', placeDirectOrder);
document.getElementById('clearCartBtn').addEventListener('click', () => { state.cart = []; renderAll(); showToast('تم إفراغ السلة'); });
document.getElementById('copyOrderBtn').addEventListener('click', () => {
if (state.cart.length === 0) { showToast('أضف صنف واحد على الأقل أولاً'); return; }
const branch = BRANCHES.find((b) => b.id === state.activeBranchId) || BRANCHES[0];
const { total } = getCartStats();
const text = [`طلب بيتزا اليوم (${branch.name}):`, ...state.cart.map((l) => `- ${l.qty} × ${l.name} [${l.sizeLabel}، ${l.crustLabel}] (${l.unitPrice * l.qty} ر.س)`), `الإجمالي: ${total} ر.س`].join('\n');
if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => showToast('تم نسخ ملخص الطلب')).catch(() => fallbackCopy(text));
else fallbackCopy(text);
});
function fallbackCopy(text) {
const ta = document.createElement('textarea');
ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
document.body.appendChild(ta); ta.select();
try { document.execCommand('copy'); showToast('تم نسخ ملخص الطلب'); } catch (err) {}
document.body.removeChild(ta);
}
document.getElementById('openAuthBtn').addEventListener('click', openAuthModal);
document.getElementById('closeAuthBtn').addEventListener('click', () => { state.pendingCheckoutAfterAuth = false; document.getElementById('authModal').classList.add('hidden'); });
document.getElementById('authModal').addEventListener('click', (e) => { if (e.target.id === 'authModal') { state.pendingCheckoutAfterAuth = false; document.getElementById('authModal').classList.add('hidden'); } });
document.getElementById('authStep1Form').addEventListener('submit', async (e) => {
e.preventDefault();
const name = document.getElementById('authNameInput').value.trim();
const phone = document.getElementById('authPhoneInput').value.replace(/\s+/g, '');
const email = document.getElementById('authEmailInput').value.trim();
const errEl = document.getElementById('authStep1Error');
if (!/^05\d{8}$/.test(phone)) {
errEl.textContent = 'أدخل رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام)';
errEl.classList.remove('hidden');
return;
}
errEl.classList.add('hidden');
await sendResendOtp(name, phone, email);
});
document.getElementById('authStep2Form').addEventListener('submit', (e) => {
e.preventDefault();
const entered = document.getElementById('otpInput').value.trim();
if (!state.pendingAuth || !/^\d{4}$/.test(entered) || (state.pendingAuth.deliveredExternally && entered !== state.pendingAuth.code)) {
document.getElementById('otpError').classList.remove('hidden');
return;
}
state.user = { name: state.pendingAuth.name, phone: state.pendingAuth.phone, email: state.pendingAuth.email };
safeWrite(STORAGE_KEYS.user, state.user);
state.pendingAuth = null;
document.getElementById('authModal').classList.add('hidden');
showToast(`حياك الله يا ${state.user.name}`);
renderAll();
if (state.pendingCheckoutAfterAuth) { state.pendingCheckoutAfterAuth = false; openCart(); }
});
document.getElementById('backToStep1Btn').addEventListener('click', () => {
document.getElementById('authStep2Form').classList.add('hidden');
document.getElementById('authStep1Form').classList.remove('hidden');
});
document.getElementById('logoutBtn').addEventListener('click', () => {
state.user = null;
safeWrite(STORAGE_KEYS.user, null);
document.getElementById('authModal').classList.add('hidden');
showToast('تم تسجيل الخروج');
renderAll();
});
document.getElementById('bannerOpenTrackerBtn').addEventListener('click', () => openTrackerModal());
document.getElementById('closeTrackerBtn').addEventListener('click', () => document.getElementById('trackerModal').classList.add('hidden'));
document.getElementById('trackerModal').addEventListener('click', (e) => { if (e.target.id === 'trackerModal') document.getElementById('trackerModal').classList.add('hidden'); });
const menuPhotoModal = document.getElementById('menuPhotoModal');
document.getElementById('openMenuPhotoBtn').addEventListener('click', () => menuPhotoModal.classList.remove('hidden'));
document.getElementById('closeMenuPhotoBtn').addEventListener('click', () => menuPhotoModal.classList.add('hidden'));
menuPhotoModal.addEventListener('click', (e) => { if (e.target === menuPhotoModal) menuPhotoModal.classList.add('hidden'); });
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNavPanel = document.getElementById('mobileNavPanel');
mobileMenuBtn.addEventListener('click', () => {
const isHidden = mobileNavPanel.classList.toggle('hidden');
mobileMenuBtn.setAttribute('aria-expanded', String(!isHidden));
});
document.querySelectorAll('.mobile-nav-link').forEach((link) => {
link.addEventListener('click', () => { mobileNavPanel.classList.add('hidden'); mobileMenuBtn.setAttribute('aria-expanded', 'false'); });
});
document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
closeCart();
document.getElementById('customizerModal').classList.add('hidden');
document.getElementById('authModal').classList.add('hidden');
document.getElementById('trackerModal').classList.add('hidden');
menuPhotoModal.classList.add('hidden');
}
});
const observer = new IntersectionObserver((entries) => {
entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
renderAll();
startAdaptiveSplash();