const REGIONS = [
      { id: 'hafar', name: 'منطقة حفر الباطن', subtitle: 'المنطقة الشرقية — 4 فروع', center: [28.4328, 45.9708] },
      { id: 'riyadh', name: 'منطقة الرياض', subtitle: 'العاصمة — 3 فروع', center: [24.6877, 46.7745] },
      { id: 'riyadh_gov', name: 'محافظات الرياض', subtitle: 'الزلفي، المزاحمية، الدوادمي — 5 فروع', center: [26.2995, 44.8156] },
      { id: 'qassim', name: 'منطقة القصيم', subtitle: 'محافظة الرس — فرع واحد', center: [25.8694, 43.4973] },
    ];

    const BRANCHES = [
      // Hafar Al Batin (4)
      { id: 'hafar-khalidiyah', regionId: 'hafar', name: 'فرع حي الخالدية — حفر الباطن', address: '3878 طريق علي بن أبي طالب، حي الخالدية، حفر الباطن 39953', hours: 'يومياً: 4:00 م – 1:15 ص', phoneDisplay: '050 662 2966', phoneHref: '+966506622966', rating: '4.1', reviewsCount: 469, mapsUrl: 'https://maps.app.goo.gl/6kWFf6BQXsXycoTr7?g_st=ic', services: ['توصيل سريع', 'استلام من الفرع', 'محلي', 'مدى / Apple Pay'] },
      { id: 'hafar-muhammadiyah', regionId: 'hafar', name: 'فرع حي المحمدية — حفر الباطن', address: 'طريق أبو بكر الصديق، حي المحمدية، حفر الباطن 39911', hours: 'يومياً: 4:00 م – 1:30 ص', phoneDisplay: '053 944 4567', phoneHref: '+966539444567', rating: '3.7', reviewsCount: 406, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+المحمدية+حفر+الباطن', services: ['توصيل سريع', 'استلام من الفرع', 'خيارات نباتية', 'مواقف مجانية'] },
      { id: 'hafar-wadi', regionId: 'hafar', name: 'فرع حي الوادي — حفر الباطن', address: '2150 طريق الملك عبدالعزيز، حي الوادي، حفر الباطن 39511', hours: 'يومياً: 3:30 م – 12:50 ص', phoneDisplay: '055 433 4414', phoneHref: '+966554334414', rating: '3.9', reviewsCount: 187, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+الوادي+حفر+الباطن', services: ['توصيل سريع', 'استلام من الفرع', 'مناسب للعائلات', 'مواقف مجانية'] },
      { id: 'hafar-rabwah', regionId: 'hafar', name: 'فرع حي الربوة — حفر الباطن', address: '8246 طريق الأمير سلطان بن عبدالعزيز، حي الربوة، حفر الباطن 39954', hours: 'يومياً: 4:00 م – 1:15 ص', phoneDisplay: '055 356 2299', phoneHref: '+966553562299', rating: '4.1', reviewsCount: 145, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+الربوة+حفر+الباطن', services: ['توصيل سريع', 'استلام من الفرع', 'جلسات هادئة', 'مواقف مجانية'] },

      // Riyadh City (3)
      { id: 'riyadh-fayha', regionId: 'riyadh', name: 'فرع حي الفيحاء — الرياض', address: '3921 شارع البيان، حي الفيحاء، الرياض 14254', hours: 'يومياً: 12:30 م – 3:00 ص', phoneDisplay: '057 002 9557', phoneHref: '+966570029557', rating: '4.1', reviewsCount: 702, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+الفيحاء+الرياض', services: ['توصيل سريع', 'استلام من السيارة', 'محلي', 'مدى / Apple Pay'] },
      { id: 'riyadh-rawabi', regionId: 'riyadh', name: 'فرع حي الروابي — الرياض', address: 'شارع الزبير بن العوام، حي الروابي، الرياض 14215', hours: 'يومياً: 12:30 م – 3:00 ص', phoneDisplay: '011 208 0841', phoneHref: '+966112080841', rating: '4.0', reviewsCount: 538, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+الروابي+الرياض', services: ['توصيل سريع', 'استلام من الفرع', 'محلي', 'مواقف مجانية'] },
      { id: 'riyadh-naseem', regionId: 'riyadh', name: 'فرع النسيم الشرقي — الرياض', address: 'شارع حسان بن ثابت، حي النسيم الشرقي، الرياض 14245', hours: 'يومياً: 12:00 م – 4:00 ص', phoneDisplay: '053 006 0939', phoneHref: '+966530060939', rating: '4.2', reviewsCount: 242, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+النسيم+الشرقي+الرياض', services: ['توصيل سريع', 'ساعات متأخرة حتى 4 ص', 'استلام من الفرع'] },

      // Riyadh Governorates (5)
      { id: 'zulfi-khalidiyah', regionId: 'riyadh_gov', name: 'فرع الزلفي — حي الخالدية', address: 'حي الخالدية، محافظة الزلفي 15941', hours: 'يومياً: 12:00 م – 1:30 ص', phoneDisplay: '053 773 7222', phoneHref: '+966537737222', rating: '4.4', reviewsCount: 470, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+الخالدية+الزلفي', services: ['توصيل سريع', 'استلام من الفرع', 'أعلى تقييم 4.4'] },
      { id: 'zulfi-quds', regionId: 'riyadh_gov', name: 'فرع الزلفي — حي القدس', address: '6385 شارع خالد بن الوليد، حي القدس، الزلفي 15971', hours: 'يومياً: 11:00 ص – 2:00 ص', phoneDisplay: '016 422 9997', phoneHref: '+966164229997', rating: '4.3', reviewsCount: 323, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+حي+القدس+الزلفي', services: ['توصيل سريع', 'استلام من الفرع', 'مواقف مجانية'] },
      { id: 'zulfi-tahlia', regionId: 'riyadh_gov', name: 'فرع الزلفي — التحلية (الصديق)', address: '8162 طريق الملك عبدالله جنوب، حي الصديق، الزلفي 15942', hours: 'يومياً: 1:00 م – 2:00 ص', phoneDisplay: '016 422 9998', phoneHref: '+966164229998', rating: '4.2', reviewsCount: 391, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+التحلية+الزلفي', services: ['توصيل سريع', 'استلام من الفرع', 'محلي'] },
      { id: 'muzahmiyah-hada', regionId: 'riyadh_gov', name: 'فرع المزاحمية — حي الهدا', address: 'طريق الإمام سعود بن عبدالعزيز، حي الهدا، المزاحمية 19651', hours: 'يومياً: 1:00 م – 3:00 ص', phoneDisplay: '011 523 0353', phoneHref: '+966115230353', rating: '4.1', reviewsCount: 707, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+المزاحمية', services: ['توصيل سريع', 'مناسب للعائلات', 'استلام من الفرع'] },
      { id: 'duwadimi-dira', regionId: 'riyadh_gov', name: 'فرع الدوادمي — حي الدرع', address: '2688 طريق الملك عبدالعزيز، حي الدرع، الدوادمي 17463', hours: 'يومياً: 1:00 م – 3:00 ص', phoneDisplay: '055 421 8864', phoneHref: '+966554218864', rating: '4.0', reviewsCount: 275, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+الدوادمي', services: ['توصيل سريع', 'استلام من الفرع', 'محلي'] },

      // Qassim (1)
      { id: 'rass-zahra', regionId: 'qassim', name: 'فرع الرس — حي الزهرة', address: 'طريق الملك فهد، حي الزهرة، محافظة الرس 58883', hours: 'يومياً: 1:30 م – 2:00 ص', phoneDisplay: '050 103 4644', phoneHref: '+966501034644', rating: '4.3', reviewsCount: 296, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=بيتزا+اليوم+الرس+القصيم', services: ['توصيل سريع', 'تجهيز خلال 10 دقائق', 'استلام من الفرع'] },
    ];

    const MENU_ITEMS = [
      { id: 'dynamite-chicken', name: 'داينمايت الدجاج', en: 'Dynamite Chicken', desc: 'دجاج مشوي، موزاريلا، شرائح الجبن، فلفل أخضر، وصلصة الداينمايت', price: 23, cal: 184, category: 'chicken', spicy: true, featured: true, badge: 'الأكثر طلباً', img: 'assets/menu/dynamite-chicken.webp' },
      { id: 'chicken-breast', name: 'صدور الدجاج', en: 'Chicken Breast BBQ & Ranch', desc: 'شرائح صدور الدجاج المشوي بالبصل مع صوص الرانش والباربكيو', price: 23, cal: 190, category: 'chicken', spicy: false, featured: true, badge: 'ترشيح الزبائن', img: 'assets/menu/chicken-breast.webp' },
      { id: 'muhammara', name: 'محمرة', en: 'Muhammara', desc: 'صلصة المحمرة الخاصة بجبنة الموزاريلا الطازجة', price: 10, cal: 128, category: 'classic', spicy: true, featured: true, badge: 'سعر مميز', img: 'assets/menu/muhammara.webp' },
      { id: 'chicken-burger', name: 'برجر دجاج', en: 'Chicken Burger', desc: 'قطع برجر الدجاج بالفلفل الأخضر والزيتون والطماطم', price: 12, cal: 147, category: 'chicken', spicy: false, featured: true, badge: 'مفضل الزبائن', img: 'assets/menu/chicken-burger.webp' },

      { id: 'shawarma-chicken', name: 'شاورما الدجاج', en: 'Chicken Shawarma', desc: 'جبنة موزاريلا، شاورما دجاج مشوية، هلابينو، وصلصة الثوم', price: 23, cal: 184, category: 'chicken', spicy: true, featured: false, img: 'assets/menu/shawarma-chicken.webp' },
      { id: 'chicken-pieces', name: 'قطع دجاج', en: 'Grilled Chicken Pieces', desc: 'قطع الدجاج المشوي بالخضار الطازجة', price: 23, cal: 205, category: 'chicken', spicy: false, featured: false, img: 'assets/menu/chicken-pieces.webp' },
      { id: 'chicken-curry', name: 'دجاج كاري', en: 'Chicken Curry', desc: 'جبنة تشدر السائلة، موزاريلا، دجاج كاري، وبقدونس', price: 23, cal: 196, category: 'chicken', spicy: false, featured: false, img: 'assets/menu/chicken-curry.webp' },
      { id: 'jalapeno-chicken', name: 'هلابينو دجاج', en: 'Jalapeno Chicken', desc: 'دجاج، صلصة حارة، موزاريلا، فلفل، طماطم، وهلابينو', price: 23, cal: 151, category: 'chicken', spicy: true, featured: false, img: 'assets/menu/jalapeno-chicken.webp' },
      { id: 'tuna', name: 'تونة', en: 'Oven Grilled Tuna Fish', desc: 'سمك تونة المشوي بالفرن مع الخضار والجبن', price: 23, cal: 166, category: 'meat', spicy: false, featured: false, img: 'assets/menu/tuna.webp' },

      { id: 'pepperoni', name: 'بيبروني', en: 'Beef Pepperoni', desc: 'شرائح البيبروني البقري مع جبنة الموزاريلا الغنية', price: 17, cal: 132, category: 'meat', spicy: false, featured: false, img: 'assets/menu/pepperoni.webp' },
      { id: 'mixed', name: 'مشكل', en: 'Mixed Meat & Chicken', desc: 'لحم ودجاج مفروم بالفطر والفلفل والخضار الطازجة', price: 17, cal: 165, category: 'meat', spicy: false, featured: false, img: 'assets/menu/mixed.webp' },
      { id: 'three-cheese', name: 'ثلاثة أجبان', en: 'Three Cheese', desc: 'شرائح جبنة التشدر، جبن سائل، وجبنة الموزاريلا', price: 17, cal: 182, category: 'classic', spicy: false, featured: false, img: 'assets/menu/three-cheese.webp' },
      { id: 'liquid-cheese', name: 'جبن سائل', en: 'Rich Liquid Cheese', desc: 'الجبنة الغنية السائلة مع جبنة الموزاريلا', price: 17, cal: 139, category: 'classic', spicy: false, featured: false, img: 'assets/menu/liquid-cheese.webp' },
      { id: 'ash-albulbul', name: 'عش البلبل', en: 'Ash Al-Bulbul', desc: 'اللبنة الطبيعية بجبنة الموزاريلا مع العسل الصافي', price: 17, cal: 155, category: 'classic', spicy: false, featured: false, img: 'assets/menu/ash-albulbul.webp' },
      { id: 'potato-wedges', name: 'بطاطس ودجز بالخضار', en: 'Potato Wedges Veggie', desc: 'بطاطس ودجز بالفلفل الأخضر والزيتون والطماطم', price: 17, cal: 155, category: 'classic', spicy: false, featured: false, img: 'assets/menu/potato-wedges.webp' },
      { id: 'jalapeno', name: 'هلابينو', en: 'Spicy Jalapeno', desc: 'صلصة حارة، موزاريلا، فلفل، طماطم، وهلابينو', price: 17, cal: 123, category: 'classic', spicy: true, featured: false, img: 'assets/menu/jalapeno.webp' },

      { id: 'minced-chicken', name: 'دجاج مفروم', en: 'Minced Chicken', desc: 'دجاج مفروم بالفلفل الأخضر والزيتون والطماطم', price: 12, cal: 152, category: 'chicken', spicy: false, featured: false, img: 'assets/menu/minced-chicken.webp' },
      { id: 'minced-beef', name: 'لحم مفروم', en: 'Minced Beef', desc: 'لحم مفروم بالفلفل الأخضر والزيتون والطماطم', price: 12, cal: 168, category: 'meat', spicy: false, featured: false, img: 'assets/menu/minced-beef.webp' },
      { id: 'beef-burger', name: 'برجر لحم', en: 'Beef Burger', desc: 'برجر اللحم بالفلفل الأخضر والزيتون والطماطم', price: 12, cal: 153, category: 'meat', spicy: false, featured: false, img: 'assets/menu/beef-burger.webp' },
      { id: 'sausage', name: 'نقانق', en: 'Chicken Sausage', desc: 'نقانق الدجاج بالفلفل الأخضر والزيتون والطماطم', price: 12, cal: 164, category: 'meat', spicy: false, featured: false, img: 'assets/menu/sausage.webp' },

      { id: 'omelette', name: 'أومليت البيض', en: 'Eggs Omelette', desc: 'بيض مخفوق الأومليت بجبنة الموزاريلا الغنية', price: 10, cal: 127, category: 'classic', spicy: false, featured: false, img: 'assets/menu/omelette.webp' },
      { id: 'veggie', name: 'خضار', en: 'Vegetables', desc: 'جبنة موزاريلا بالفلفل الأخضر والزيتون والطماطم', price: 10, cal: 137, category: 'classic', spicy: false, featured: false, img: 'assets/menu/veggie.webp' },
      { id: 'cheese', name: 'جبن', en: 'Classic Cheese', desc: 'طبقة غنية من جبنة الموزاريلا الخالصة', price: 10, cal: 114, category: 'classic', spicy: false, featured: false, img: 'assets/menu/cheese.webp' },
      { id: 'cheese-zaatar', name: 'جبن بالزعتر', en: 'Cheese & Oregano', desc: 'جبنة الموزاريلا بالزعتر البري', price: 10, cal: 130, category: 'classic', spicy: false, featured: false, img: 'assets/menu/cheese-zaatar.webp' },
    ];

    const CATEGORIES = [
      { id: 'all', label: 'الكل (24)' },
      { id: 'chicken', label: 'تشكيلة الدجاج' },
      { id: 'classic', label: 'الأجبان والكلاسيك' },
      { id: 'meat', label: 'اللحوم والتونة' },
      { id: 'spicy', label: 'حار وهلابينو' },
      { id: 'budget', label: '10 - 12 ريال' },
    ];

    const PAYMENT_METHODS = [
      { id: 'mada', label: 'مدى' },
      { id: 'apple_pay', label: 'Apple Pay' },
      { id: 'samsung_pay', label: 'Samsung Pay' },
      { id: 'stc_pay', label: 'STC Pay' },
      { id: 'visa_mc', label: 'Visa / Master' },
      { id: 'cod', label: 'عند الاستلام' },
    ];

    const SIZE_OPTIONS = [
      { id: 'medium', label: 'وسط (الأساسي)', extra: 0 },
      { id: 'large', label: 'كبير (عائلي)', extra: 7 },
    ];

    const CRUST_OPTIONS = [
      { id: 'classic', label: 'كلاسيك هشة', extra: 0 },
      { id: 'thin', label: 'رقيقة ومقرمشة', extra: 0 },
      { id: 'thick', label: 'سميكة فاخرة', extra: 3 },
      { id: 'stuffed', label: 'أطراف محشوة جبن', extra: 5 },
    ];

    const CUT_OPTIONS = [
      { id: 'triangles', label: 'مثلثات كلاسيك' },
      { id: 'squares', label: 'مربعات للجمعات' },
    ];

    const EXTRA_OPTIONS = [
      { id: 'extra-cheese', label: 'جبن موزاريلا إضافي', extra: 4 },
      { id: 'dynamite-sauce', label: 'صوص داينمايت', extra: 3 },
      { id: 'ranch-sauce', label: 'صوص رانش', extra: 2 },
      { id: 'bbq-sauce', label: 'صوص باربكيو', extra: 2 },
      { id: 'extra-jalapeno', label: 'هلابينو زيادة', extra: 2 },
      { id: 'no-onion', label: 'بدون بصل', extra: 0 },
    ];

    const ORDER_STATUSES = [
      { id: 'new', label: 'تم استلام الطلب', short: 'طلب جديد', color: 'text-amber-400 bg-amber-400/15 border-amber-400/35', step: 1 },
      { id: 'preparing', label: 'قيد التحضير والخبز بالفرن', short: 'قيد التحضير', color: 'text-sky-400 bg-sky-400/15 border-sky-400/35', step: 2 },
      { id: 'ready', label: 'جاهز للاستلام / خرج للتوصيل', short: 'جاهز', color: 'text-violet-300 bg-violet-400/15 border-violet-400/35', step: 3 },
      { id: 'completed', label: 'تم التسليم بالعافية', short: 'مكتمل', color: 'text-emerald-400 bg-emerald-400/15 border-emerald-400/35', step: 4 },
      { id: 'cancelled', label: 'تم إلغاء الطلب', short: 'ملغي', color: 'text-rose-400 bg-rose-400/15 border-rose-400/35', step: 0 },
    ];

    const STORAGE_KEYS = {
      user: 'pt_ksa_user_v2',
      orders: 'pt_ksa_orders_v2',
      region: 'pt_ksa_region_v2',
      resendWebhook: 'pt_ksa_resend_webhook_v2',
    };
