function safeRead(key, fallback) {
try {
const raw = localStorage.getItem(key);
return raw ? JSON.parse(raw) : fallback;
} catch (e) { return fallback; }
}
function safeWrite(key, val) {
try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}
const savedRegion = safeRead(STORAGE_KEYS.region, null);
const initialRegionId = savedRegion || 'hafar';
const initialBranch = BRANCHES.find((b) => b.regionId === initialRegionId) || BRANCHES[0];
const state = {
regionChosen: Boolean(savedRegion),
activeRegionId: initialRegionId,
activeBranchId: initialBranch.id,
activeCategory: 'all',
searchQuery: '',
fulfillment: 'pickup',
paymentMethod: 'mada',
deliveryCoords: null,
cartTab: 'current',
cart: [],
user: safeRead(STORAGE_KEYS.user, null),
pendingAuth: null,
orders: safeRead(STORAGE_KEYS.orders, []),
activeOrderId: null,
customizer: null,
pendingCheckoutAfterAuth: false,
};
let syncChannel = null;
try {
syncChannel = new BroadcastChannel('pizza_today_ksa_orders');
syncChannel.onmessage = (ev) => {
if (ev.data && ev.data.type === 'ORDERS_UPDATED') {
state.orders = safeRead(STORAGE_KEYS.orders, state.orders);
renderAll();
}
};
} catch (e) {}
window.addEventListener('storage', (ev) => {
if (ev.key === STORAGE_KEYS.orders) {
state.orders = safeRead(STORAGE_KEYS.orders, []);
renderAll();
}
});
function persistOrders() {
safeWrite(STORAGE_KEYS.orders, state.orders);
if (syncChannel) {
try { syncChannel.postMessage({ type: 'ORDERS_UPDATED' }); } catch (e) {}
}
}
function startAdaptiveSplash() {
const splash = document.getElementById('splashScreen');
const mask = document.getElementById('splashLiquidMask');
const wave = document.getElementById('splashWaveSvg');
const bar = document.getElementById('splashProgressBar');
const pctEl = document.getElementById('splashPercent');
const statusEl = document.getElementById('splashStatusText');
const speedEl = document.getElementById('splashSpeedBadge');
const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const eff = conn && conn.effectiveType ? conn.effectiveType : '4g';
const dl = conn && typeof conn.downlink === 'number' ? conn.downlink : 10;
let speedFactor = 1.0;
let speedLabel = 'اتصال سريع — تحميل فوري';
if (eff === '2g' || eff === 'slow-2g' || dl < 1.5) {
speedFactor = 0.42;
speedLabel = 'اتصال بطيء — جاري التحميل بهدوء';
} else if (eff === '3g' || dl < 4) {
speedFactor = 0.72;
speedLabel = 'اتصال متوسط — جاري تجهيز التطبيق';
}
speedEl.textContent = speedLabel;
let progress = 0;
let pageLoaded = document.readyState === 'complete';
window.addEventListener('load', () => { pageLoaded = true; });
const timer = setInterval(() => {
const cap = pageLoaded ? 100 : 88;
progress = Math.min(cap, progress + (pageLoaded ? 7.2 : 3.4) * speedFactor + Math.random() * 2.2);
const r = Math.round(progress);
mask.style.clipPath = `inset(${100 - r}% 0 0 0)`;
wave.style.top = `${Math.max(0, 100 - r - 6)}%`;
bar.style.width = `${r}%`;
pctEl.textContent = `${r}%`;
if (r < 35) statusEl.textContent = 'جاري تجهيز العجينة الطازجة...';
else if (r < 75) statusEl.textContent = 'جاري تحميل فروع المملكة والمنيو...';
else statusEl.textContent = 'الفرن جاهز — أهلاً بك في بيتزا اليوم';
if (r >= 100) {
clearInterval(timer);
setTimeout(() => {
splash.classList.add('splash-done');
setTimeout(() => {
splash.classList.add('hidden');
if (!state.regionChosen) openRegionGate();
}, 480);
}, 180);
}
}, 42);
}
function openRegionGate() {
const grid = document.getElementById('regionGateGrid');
grid.innerHTML = REGIONS.map((reg) => {
const active = reg.id === state.activeRegionId;
return `
<button type="button" data-select-region="${reg.id}" class="p-4 rounded-2xl border text-start cursor-pointer transition-all flex items-center justify-between gap-3 ${active ? 'bg-chalk text-charcoal border-chalk' : 'bg-charcoal border-white/15 text-chalk hover:border-parchment/50'}">
<div>
<p class="text-sm sm:text-base font-black">${reg.name}</p>
<p class="text-xs mt-0.5 ${active ? 'text-neutral-700' : 'text-ashMuted'}">${reg.subtitle}</p>
</div>
<i data-lucide="chevron-left" class="w-5 h-5 shrink-0 ${active ? 'text-charcoal' : 'text-parchment'}"></i>
</button>
`;
}).join('');
document.getElementById('regionGateModal').classList.remove('hidden');
if (window.lucide) window.lucide.createIcons();
}
function selectRegion(regionId) {
state.activeRegionId = regionId;
state.regionChosen = true;
safeWrite(STORAGE_KEYS.region, regionId);
const firstBranch = BRANCHES.find((b) => b.regionId === regionId) || BRANCHES[0];
state.activeBranchId = firstBranch.id;
document.getElementById('regionGateModal').classList.add('hidden');
const reg = REGIONS.find((r) => r.id === regionId);
if (reg) showToast(`تم تحديد ${reg.name}`);
renderAll();
}
let deliveryMap = null;
let deliveryMarker = null;
function initOrMoveMiniMap(lat, lng) {
const wrap = document.getElementById('deliveryMiniMapWrap');
wrap.classList.remove('hidden');
if (!deliveryMap && window.L) {
deliveryMap = L.map('deliveryMiniMap', { zoomControl: true }).setView([lat, lng], 14);
L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Esri',
maxZoom: 19,
}).addTo(deliveryMap);
deliveryMarker = L.marker([lat, lng], { draggable: true }).addTo(deliveryMap);
deliveryMarker.on('dragend', () => {
const pos = deliveryMarker.getLatLng();
setDeliveryCoords(pos.lat, pos.lng);
});
deliveryMap.on('click', (e) => {
deliveryMarker.setLatLng(e.latlng);
setDeliveryCoords(e.latlng.lat, e.latlng.lng);
});
} else if (deliveryMap && deliveryMarker) {
deliveryMap.setView([lat, lng], 15);
deliveryMarker.setLatLng([lat, lng]);
}
setDeliveryCoords(lat, lng);
setTimeout(() => { if (deliveryMap) deliveryMap.invalidateSize(); }, 180);
}
function setDeliveryCoords(lat, lng) {
state.deliveryCoords = { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
document.getElementById('mapCoordsReadout').textContent = `تم تحديد موقعك بدقة: ${state.deliveryCoords.lat}, ${state.deliveryCoords.lng}`;
}
function handleAutoLocate() {
const reg = REGIONS.find((r) => r.id === state.activeRegionId) || REGIONS[0];
const fallbackLat = reg.center[0];
const fallbackLng = reg.center[1];
if (navigator.geolocation) {
showToast('جاري تحديد موقعك الحالي...');
navigator.geolocation.getCurrentPosition(
(pos) => {
initOrMoveMiniMap(pos.coords.latitude, pos.coords.longitude);
showToast('تم تحديد موقعك على الخريطة');
},
() => {
initOrMoveMiniMap(fallbackLat, fallbackLng);
showToast('اختر موقعك مباشرة بالضغط على الخريطة');
},
{ timeout: 6000 }
);
} else {
initOrMoveMiniMap(fallbackLat, fallbackLng);
}
}
let toastTimer = null;
function showToast(msg) {
const banner = document.getElementById('toastBanner');
document.getElementById('toastMessage').textContent = msg;
banner.classList.remove('hidden');
banner.classList.add('inline-flex');
clearTimeout(toastTimer);
toastTimer = setTimeout(() => {
banner.classList.add('hidden');
banner.classList.remove('inline-flex');
}, 2600);
}
function openCustomizer(itemId) {
const item = MENU_ITEMS.find((m) => m.id === itemId);
if (!item) return;
state.customizer = {
item,
size: SIZE_OPTIONS[0].id,
crust: CRUST_OPTIONS[0].id,
cut: CUT_OPTIONS[0].id,
extras: [],
qty: 1,
};
document.getElementById('custThumb').src = item.img;
document.getElementById('custThumb').alt = item.name;
document.getElementById('custTitle').textContent = item.name;
document.getElementById('custDesc').textContent = `${item.desc} (${item.cal} سعرة)`;
document.getElementById('custNoteInput').value = '';
renderCustomizerOptions();
document.getElementById('customizerModal').classList.remove('hidden');
if (window.lucide) window.lucide.createIcons();
}
function computeCustomizerUnitPrice() {
const c = state.customizer;
if (!c) return 0;
const s = SIZE_OPTIONS.find((x) => x.id === c.size)?.extra || 0;
const cr = CRUST_OPTIONS.find((x) => x.id === c.crust)?.extra || 0;
const ex = c.extras.reduce((sum, id) => sum + (EXTRA_OPTIONS.find((e) => e.id === id)?.extra || 0), 0);
return c.item.price + s + cr + ex;
}
function renderCustomizerOptions() {
const c = state.customizer;
if (!c) return;
document.getElementById('custSizeOptions').innerHTML = SIZE_OPTIONS.map((opt) => `
<button type="button" data-cust-size="${opt.id}" class="p-3 rounded-xl border text-start cursor-pointer transition-all ${c.size === opt.id ? 'bg-chalk text-charcoal border-chalk font-black' : 'bg-charcoal text-chalk border-white/15 font-bold'}">
<span class="block text-xs sm:text-sm">${opt.label}</span>
<span class="block text-[11px] mt-0.5 ${c.size === opt.id ? 'text-neutral-700' : 'text-parchment'}">${opt.extra > 0 ? `+${opt.extra} ر.س` : 'مشمول'}</span>
</button>
`).join('');
document.getElementById('custCrustOptions').innerHTML = CRUST_OPTIONS.map((opt) => `
<button type="button" data-cust-crust="${opt.id}" class="p-3 rounded-xl border text-start cursor-pointer transition-all ${c.crust === opt.id ? 'bg-chalk text-charcoal border-chalk font-black' : 'bg-charcoal text-chalk border-white/15 font-bold'}">
<span class="block text-xs sm:text-sm">${opt.label}</span>
<span class="block text-[11px] mt-0.5 ${c.crust === opt.id ? 'text-neutral-700' : 'text-parchment'}">${opt.extra > 0 ? `+${opt.extra} ر.س` : 'مجاناً'}</span>
</button>
`).join('');
document.getElementById('custCutOptions').innerHTML = CUT_OPTIONS.map((opt) => `
<button type="button" data-cust-cut="${opt.id}" class="p-3 rounded-xl border text-center text-xs sm:text-sm cursor-pointer transition-all ${c.cut === opt.id ? 'bg-chalk text-charcoal border-chalk font-black' : 'bg-charcoal text-chalk border-white/15 font-bold'}">
${opt.label}
</button>
`).join('');
document.getElementById('custExtraOptions').innerHTML = EXTRA_OPTIONS.map((opt) => {
const active = c.extras.includes(opt.id);
return `
<button type="button" data-cust-extra="${opt.id}" class="p-2.5 rounded-xl border text-start cursor-pointer transition-all flex items-center justify-between gap-2 ${active ? 'bg-parchment/20 border-parchment text-chalk font-extrabold' : 'bg-charcoal border-white/10 text-ashMuted font-semibold'}">
<span class="text-xs">${opt.label}</span>
<span class="text-[11px] text-parchment shrink-0">${opt.extra > 0 ? `+${opt.extra}` : 'مجاناً'}</span>
</button>
`;
}).join('');
document.getElementById('custQtyVal').textContent = c.qty;
document.getElementById('custFinalPrice').textContent = `${computeCustomizerUnitPrice() * c.qty} ر.س`;
}
function commitCustomItemToCart() {
const c = state.customizer;
if (!c) return;
const unitPrice = computeCustomizerUnitPrice();
const sizeLabel = SIZE_OPTIONS.find((s) => s.id === c.size)?.label || '';
const crustLabel = CRUST_OPTIONS.find((cr) => cr.id === c.crust)?.label || '';
const cutLabel = CUT_OPTIONS.find((cu) => cu.id === c.cut)?.label || '';
const extraLabels = c.extras.map((id) => EXTRA_OPTIONS.find((e) => e.id === id)?.label).filter(Boolean);
const note = document.getElementById('custNoteInput').value.trim();
const key = `${c.item.id}|${c.size}|${c.crust}|${c.cut}|${c.extras.slice().sort().join(',')}|${note}`;
const existing = state.cart.find((l) => l.key === key);
if (existing) existing.qty += c.qty;
else state.cart.push({ key, itemId: c.item.id, name: c.item.name, img: c.item.img, unitPrice, qty: c.qty, sizeLabel, crustLabel, cutLabel, extraLabels, note });
document.getElementById('customizerModal').classList.add('hidden');
state.customizer = null;
showToast(`تمت إضافة "${c.item.name}" للسلة`);
renderAll();
}
function getCartStats() {
let count = 0;
let total = 0;
state.cart.forEach((l) => { count += l.qty; total += l.unitPrice * l.qty; });
return { count, total };
}
function getItemCountInCart(itemId) {
return state.cart.filter((l) => l.itemId === itemId).reduce((s, l) => s + l.qty, 0);
}
function updateCartLineQty(key, delta) {
const idx = state.cart.findIndex((l) => l.key === key);
if (idx === -1) return;
state.cart[idx].qty += delta;
if (state.cart[idx].qty <= 0) state.cart.splice(idx, 1);
renderAll();
}
function placeDirectOrder() {
if (state.cart.length === 0) { showToast('أضف بيتزا واحدة على الأقل أولاً'); return; }
if (!state.user) {
state.pendingCheckoutAfterAuth = true;
closeCart();
openAuthModal();
showToast('سجّل دخولك أولاً لإرسال الطلب ومتابعته');
return;
}
const branch = BRANCHES.find((b) => b.id === state.activeBranchId) || BRANCHES[0];
const reg = REGIONS.find((r) => r.id === branch.regionId) || REGIONS[0];
const addressText = document.getElementById('deliveryAddressInput').value.trim();
if (state.fulfillment === 'delivery' && !addressText && !state.deliveryCoords) {
showToast('حدّد موقعك على الخريطة أو اكتب عنوان التوصيل');
return;
}
const { total } = getCartStats();
const payLabel = PAYMENT_METHODS.find((p) => p.id === state.paymentMethod)?.label || 'مدى';
const notes = document.getElementById('cartNotesInput').value.trim();
const now = new Date();
const isoDate = now.toISOString().slice(0, 10);
const orderNum = `PT-${Math.floor(1000 + Math.random() * 9000)}`;
const newOrder = {
id: orderNum,
isoDate,
year: now.getFullYear(),
month: now.getMonth() + 1,
createdAt: now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
regionId: reg.id,
regionName: reg.name,
branchId: branch.id,
branchName: branch.name,
customerName: state.user.name,
customerPhone: state.user.phone,
customerEmail: state.user.email || '',
fulfillment: state.fulfillment,
address: state.fulfillment === 'delivery' ? (addressText || 'موقع محدد على الخريطة') : 'استلام من الفرع',
coords: state.fulfillment === 'delivery' ? state.deliveryCoords : null,
payment: payLabel,
notes,
items: state.cart.map((l) => ({ ...l })),
total,
status: 'new',
};
state.orders.unshift(newOrder);
state.activeOrderId = newOrder.id;
state.cart = [];
persistOrders();
closeCart();
renderAll();
openTrackerModal(newOrder.id);
showToast(`تم إرسال الطلب #${newOrder.id} للفرع بنجاح`);
}
function openAuthModal() {
const modal = document.getElementById('authModal');
const profileDiv = document.getElementById('authProfileState');
const step1 = document.getElementById('authStep1Form');
const step2 = document.getElementById('authStep2Form');
if (state.user) {
document.getElementById('authModalTitle').textContent = 'حسابك في بيتزا اليوم';
document.getElementById('authModalSub').textContent = 'بياناتك محفوظة للطلب السريع وسجل طلباتك.';
document.getElementById('profileAvatarInitial').textContent = state.user.name.charAt(0);
document.getElementById('profileNameText').textContent = state.user.name;
document.getElementById('profilePhoneText').textContent = state.user.phone;
document.getElementById('profileEmailText').textContent = state.user.email || '';
profileDiv.classList.remove('hidden');
step1.classList.add('hidden');
step2.classList.add('hidden');
} else {
document.getElementById('authModalTitle').textContent = 'تسجيل الدخول بالتحقق';
document.getElementById('authModalSub').textContent = 'يُرسل رمز التحقق (OTP) مباشرة عبر Resend إلى بريدك الإلكتروني خارج الموقع.';
profileDiv.classList.add('hidden');
step1.classList.remove('hidden');
step2.classList.add('hidden');
document.getElementById('authStep1Error').classList.add('hidden');
}
modal.classList.remove('hidden');
}
async function sendResendOtp(name, phone, email) {
const code = String(Math.floor(1000 + Math.random() * 9000));
const webhookUrl = safeRead(STORAGE_KEYS.resendWebhook, '');
let deliveredExternally = false;
if (webhookUrl && webhookUrl.startsWith('https://')) {
try {
const res = await fetch(webhookUrl, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ to: email, name, phone, code, brand: 'Pizza Today KSA' }),
});
if (res.ok) deliveredExternally = true;
} catch (err) {
deliveredExternally = false;
}
}
state.pendingAuth = { name, phone, email, code, deliveredExternally };
document.getElementById('otpTargetEmail').textContent = email;
document.getElementById('otpDeliveryNote').textContent = deliveredExternally
? 'تم إرسال الرمز إلى بريدك الإلكتروني عبر Resend — تفقد صندوق الوارد.'
: 'جاهز للربط مع خادم Resend OTP من إعدادات الكاشير (للتجربة الفورية أدخل أي 4 أرقام).';
document.getElementById('otpInput').value = '';
document.getElementById('otpError').classList.add('hidden');
document.getElementById('authStep1Form').classList.add('hidden');
document.getElementById('authStep2Form').classList.remove('hidden');
document.getElementById('otpInput').focus();
}
function openTrackerModal(orderId) {
const order = state.orders.find((o) => o.id === (orderId || state.activeOrderId));
if (!order) return;
state.activeOrderId = order.id;
renderTrackerContent(order);
document.getElementById('trackerModal').classList.remove('hidden');
if (window.lucide) window.lucide.createIcons();
}
function renderTrackerContent(order) {
const statusMeta = ORDER_STATUSES.find((s) => s.id === order.status) || ORDER_STATUSES[0];
document.getElementById('trackerOrderTitle').textContent = `طلب رقم #${order.id}`;
const steps = ORDER_STATUSES.filter((s) => s.step > 0);
document.getElementById('trackerModalBody').innerHTML = `
<div class="rounded-2xl bg-charcoal border border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
<div>
<p class="text-xs text-ashMuted">${order.regionName} • ${order.isoDate}</p>
<p class="text-sm font-extrabold text-chalk">${order.branchName}</p>
</div>
<span class="px-3 py-1 rounded-full border text-xs font-extrabold ${statusMeta.color}">${statusMeta.label}</span>
</div>
${order.status === 'cancelled' ? `
<div class="rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-center text-sm font-bold text-rose-300">
تم إلغاء هذا الطلب. تم نقله تلقائياً إلى سجل الطلبات داخل السلة.
</div>
` : `
<div class="space-y-2.5">
${steps.map((st) => {
const done = statusMeta.step >= st.step;
const current = statusMeta.step === st.step;
return `
<div class="flex items-center gap-3 p-3 rounded-2xl border ${current ? 'bg-parchment/15 border-parchment/45' : done ? 'bg-charcoal border-emerald-500/30' : 'bg-charcoal/50 border-white/10 opacity-50'}">
<span class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-chalk text-charcoal' : 'bg-slateLight text-ashMuted'}">
<i data-lucide="${done ? 'check' : 'clock'}" class="w-4 h-4"></i>
</span>
<div class="flex-1">
<p class="text-sm font-extrabold ${done ? 'text-chalk' : 'text-ashMuted'}">${st.label}</p>
</div>
</div>
`;
}).join('')}
</div>
`}
<div class="rounded-2xl bg-charcoal border border-white/10 p-4 space-y-2">
<div class="flex justify-between text-xs text-ashMuted">
<span>الأصناف (${order.items.reduce((s, i) => s + i.qty, 0)})</span>
<span>${order.createdAt}</span>
</div>
${order.items.map((it) => `
<div class="text-xs border-t border-white/10 pt-2">
<div class="flex justify-between font-bold text-chalk">
<span>${it.qty} × ${it.name}</span>
<span class="text-parchment">${it.unitPrice * it.qty} ر.س</span>
</div>
<p class="text-[11px] text-ashMuted mt-0.5">${it.sizeLabel} • ${it.crustLabel} • ${it.cutLabel}${it.extraLabels.length ? ' • ' + it.extraLabels.join('، ') : ''}</p>
</div>
`).join('')}
<div class="flex justify-between pt-2 border-t border-white/10 text-sm font-black">
<span class="text-ashMuted">الإجمالي (${order.payment})</span>
<span class="text-parchment">${order.total} ر.س</span>
</div>
</div>
`;
}