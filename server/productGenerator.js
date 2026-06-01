// Programmatic product generator for AI Smart Commerce
// Generates exactly 520 realistic products spanning 5 categories and 20 subcategories.

// Helper to generate a random number within range
const randomRange = (min, max, decimals = 0) => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

// Unsplash high-quality images mapped by subcategory
const unsplashImages = {
  // Electronics
  Smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1565849906660-afc86cd77449?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?auto=format&fit=crop&q=80&w=800'
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1496181130204-7552cc1454a4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'
  ],
  Audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608156639585-b3a032ef9689?auto=format&fit=crop&q=80&w=800'
  ],
  Smartwatches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517502884422-41eaaced0168?auto=format&fit=crop&q=80&w=800'
  ],

  // Fashion
  MensWear: [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=800'
  ],
  WomensWear: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800'
  ],
  Footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800'
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1627124762836-0d86892504b0?auto=format&fit=crop&q=80&w=800'
  ],

  // Home & Kitchen
  KitchenAppliances: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=800'
  ],
  Cookware: [
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1599615358055-1d9e227ecc22?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
  ],
  HomeDecor: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
  ],
  SmartHome: [
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1563161431-74189958e8e5?auto=format&fit=crop&q=80&w=800'
  ],

  // Books
  Fiction: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&q=80&w=800'
  ],
  SelfHelp: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
  ],
  Biographies: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
  ],
  SciFi: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1618666012174-83b441c0bc76?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
  ],

  // Beauty
  Skincare: [
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'
  ],
  Haircare: [
    'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800'
  ],
  Fragrances: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&q=80&w=800'
  ],
  GroomingTools: [
    'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
  ]
};

// Generates an array of specifications depending on subcategory
const getSpecsForSubcategory = (subcat, brand, modelName, variantIndex) => {
  switch (subcat) {
    case 'Smartphones':
      const ram = ['8 GB', '12 GB', '16 GB'][variantIndex % 3];
      const storage = ['128 GB', '256 GB', '512 GB', '1 TB'][variantIndex % 4];
      return [
        { key: 'Model Name', value: modelName },
        { key: 'RAM', value: ram },
        { key: 'Storage', value: storage },
        { key: 'Network', value: '5G Supported' },
        { key: 'Warranty', value: '1 Year Manufacturer' }
      ];
    case 'Laptops':
      const cpu = ['Intel Core i5', 'Intel Core i7', 'Apple M3 Chip', 'AMD Ryzen 7'][variantIndex % 4];
      const laptopRam = ['8 GB', '16 GB', '32 GB'][variantIndex % 3];
      const ssd = ['512 GB SSD', '1 TB SSD'][variantIndex % 2];
      return [
        { key: 'Processor', value: cpu },
        { key: 'RAM', value: laptopRam },
        { key: 'Storage Capacity', value: ssd },
        { key: 'Operating System', value: brand === 'Apple' ? 'macOS' : 'Windows 11 Home' },
        { key: 'Display Size', value: '14 Inches' }
      ];
    case 'Audio':
      return [
        { key: 'Connectivity Type', value: 'Wireless Bluetooth' },
        { key: 'Battery Charging Time', value: '2 Hours' },
        { key: 'Noise Cancellation', value: variantIndex % 2 === 0 ? 'Yes (Active NC)' : 'No' },
        { key: 'Playback Time', value: ['20 Hours', '30 Hours', '40 Hours'][variantIndex % 3] }
      ];
    case 'Smartwatches':
      return [
        { key: 'Dial Shape', value: variantIndex % 2 === 0 ? 'Rectangle' : 'Round' },
        { key: 'Water Resistance', value: 'IP68 Certified' },
        { key: 'Compatible OS', value: 'Android & iOS' },
        { key: 'Sensors', value: 'Heart Rate, SpO2, Sleep Tracker' }
      ];
    case 'MensWear':
    case 'WomensWear':
      return [
        { key: 'Material Composition', value: ['100% Cotton', 'Polyester Blend', 'Pure Linen', 'Denim'][variantIndex % 4] },
        { key: 'Fit Type', value: ['Regular Fit', 'Slim Fit', 'Oversized Fit'][variantIndex % 3] },
        { key: 'Wash Care Instruction', value: 'Machine Wash Cold, Do Not Bleach' },
        { key: 'Pattern Type', value: ['Solid Solid', 'Checkered Pattern', 'Floral Printed', 'Striped'][variantIndex % 4] }
      ];
    case 'Footwear':
      return [
        { key: 'Outer Material', value: ['Mesh & Textile', 'Synthetic Leather', 'Genuine Leather', 'Canvas'][variantIndex % 4] },
        { key: 'Sole Type', value: 'Durable Anti-Skid Rubber' },
        { key: 'Closure Type', value: variantIndex % 3 === 0 ? 'Slip-On' : 'Lace-Up' },
        { key: 'Ideal Use-Case', value: ['Sports & Running', 'Casual Daily Wear', 'Formal Gatherings'][variantIndex % 3] }
      ];
    case 'Accessories':
      return [
        { key: 'Material', value: ['High-Grade Polycarbonate', 'Genuine Leather', 'Alloy Metal', 'Faux Leather'][variantIndex % 4] },
        { key: 'Warranty Period', value: '6 Months Manufacturer' }
      ];
    case 'KitchenAppliances':
      return [
        { key: 'Power Usage', value: ['750 Watts', '1200 Watts', '1500 Watts', '2000 Watts'][variantIndex % 4] },
        { key: 'Body Material', value: 'Premium Stainless Steel' },
        { key: 'Control Buttons', value: variantIndex % 2 === 0 ? 'Digital Touch Screen' : 'Manual Rotational Dial' }
      ];
    case 'Cookware':
      return [
        { key: 'Dishwasher Safe', value: 'Yes' },
        { key: 'Induction Friendly', value: variantIndex % 2 === 0 ? 'Yes' : 'No' },
        { key: 'Non-Stick Coating', value: 'PFOA-Free Teflon' }
      ];
    case 'HomeDecor':
      return [
        { key: 'Primary Material', value: ['Microfiber Polyester', 'Teak Hardwood', 'Ceramic Clay', 'Alloy Steel'][variantIndex % 4] },
        { key: 'Product Weight', value: ['500 Grams', '1.2 Kilograms', '3.5 Kilograms'][variantIndex % 3] }
      ];
    case 'SmartHome':
      return [
        { key: 'Smart App Control', value: 'Yes (WiFi & Bluetooth)' },
        { key: 'Voice Compatibility', value: 'Amazon Alexa & Google Assistant' },
        { key: 'Energy Efficiency', value: '5-Star BEE Rated' }
      ];
    case 'Fiction':
    case 'SelfHelp':
    case 'Biographies':
    case 'SciFi':
      return [
        { key: 'Binding Format', value: ['Paperback Edition', 'Hardcover Special', 'Deluxe Boxset'][variantIndex % 3] },
        { key: 'Print Language', value: 'English (US/UK)' },
        { key: 'Page Count', value: ['280 Pages', '350 Pages', '420 Pages', '510 Pages'][variantIndex % 4] }
      ];
    case 'Skincare':
    case 'Haircare':
      return [
        { key: 'Target Skin/Hair Type', value: ['All Types', 'Dry Skin/Hair', 'Oily / Sensitive'][variantIndex % 3] },
        { key: 'Ingredients list', value: 'Paraben-Free, Organic Active Extracts, Cruelty-Free' },
        { key: 'Item Volume', value: ['50 ml', '100 ml', '250 ml', '400 ml'][variantIndex % 4] }
      ];
    case 'Fragrances':
      return [
        { key: 'Fragrance Classification', value: ['Eau De Parfum (EDP)', 'Eau De Toilette (EDT)', 'Body Spray'][variantIndex % 3] },
        { key: 'Primary Fragrance Notes', value: ['Citrus & Woody', 'Spicy Oriental', 'Fresh Aquatic', 'Musk'][variantIndex % 4] },
        { key: 'Volume', value: ['50 ml', '100 ml', '150 ml'][variantIndex % 3] }
      ];
    case 'GroomingTools':
      return [
        { key: 'Battery Run Time', value: ['45 Minutes', '60 Minutes', '90 Minutes', '120 Minutes'][variantIndex % 4] },
        { key: 'Charging Standard', value: 'USB Fast Charging' },
        { key: 'Blade Material', value: 'Self-Sharpening Stainless Steel' }
      ];
    default:
      return [{ key: 'Generic Key', value: 'Generic Quality Value' }];
  }
};

// Generates exactly 26 products per subcategory (20 subcategories * 26 = 520 products total)
export const generateAllProducts = () => {
  const categoriesList = [
    {
      categoryName: 'Electronics',
      subcategories: [
        {
          name: 'Smartphones',
          brands: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi'],
          baseItems: [
            { name: 'iPhone 15 Pro', desc: 'Experience the ultimate power with A17 Pro chip, aerospace titanium structure, and dynamic island notifications.', price: 134900 },
            { name: 'Galaxy S24 Ultra', desc: 'Equipped with Galaxy AI features, high-resolution 200MP camera, Snapdragon 8 Gen 3, and integrated S-Pen stylus.', price: 129900 },
            { name: 'OnePlus 12', desc: 'Premium flagship experience offering Snapdragon 8 Gen 3, Hasselblad Triple Camera System, and 100W SuperVOOC flash charging.', price: 64999 },
            { name: 'Pixel 8 Pro', desc: 'The helpful phone engineered by Google with advanced AI computational camera, Tensor G3 processor, and pure Android.', price: 109999 },
            { name: 'Redmi Note 13 Pro Plus', desc: 'Supercharged mid-ranger featuring a crystal-clear 200MP OIS camera, 1.5K AMOLED curved display, and massive 120W charging.', price: 31999 },
            { name: 'Nothing Phone 2', desc: 'Stand out from the crowd with the iconic Glyph LED Interface, Nothing OS, and custom sleek transparent back design.', price: 44999 },
            { name: 'Galaxy A55 5G', desc: 'Premium metal design with Nightography cameras, robust IP67 water protection, and immersive 120Hz display.', price: 39999 }
          ]
        },
        {
          name: 'Laptops',
          brands: ['HP', 'Dell', 'Lenovo', 'Apple', 'Asus'],
          baseItems: [
            { name: 'MacBook Air M3', desc: 'Stunningly thin laptop carrying the powerful M3 chip, delivering up to 18 hours of outstanding battery life.', price: 114900 },
            { name: 'Dell XPS 13', desc: 'Immersive borderless InfinityEdge FHD display, Intel Core i7 processor, and gorgeous aluminum unibody.', price: 124900 },
            { name: 'HP Pavilion 15', desc: 'Reliable daily driver with AMD Ryzen 7 processor, high-speed RAM, backlit keyboard, and vibrant micro-edge screen.', price: 68900 },
            { name: 'Lenovo ThinkPad X1 Carbon', desc: 'The ultimate business companion built with ultra-durable carbon fiber chassis, legendary keyboard, and privacy guards.', price: 154900 },
            { name: 'Asus ROG Zephyrus G14', desc: 'Ultra-thin powerful gaming laptop powered by AMD Ryzen 9 and Nvidia RTX 4060 graphics, with AniMe Matrix.', price: 139900 },
            { name: 'Asus Vivobook 16', desc: 'Vibrant 16-inch display, powerful Intel Core i5 processor, lightweight body, and standard numeric keypad.', price: 49900 },
            { name: 'Lenovo IdeaPad Slim 3', desc: 'Dependable computing featuring Intel Core i3, fast SSD storage, privacy shutter, and robust battery.', price: 35900 }
          ]
        },
        {
          name: 'Audio',
          brands: ['Sony', 'boAt', 'JBL', 'Sennheiser', 'OnePlus'],
          baseItems: [
            { name: 'WH-1000XM5 Wireless Headphones', desc: 'Industry-leading smart noise cancelling overhead headphones with exceptional sound clarity, 30H battery, and multipoint.', price: 29990 },
            { name: 'Rockerz 450 On-Ear Headphones', desc: 'Wireless comfort boasting massive 40mm dynamic drivers, padded earcups, and up to 15 hours of endless audio playback.', price: 3990 },
            { name: 'JBL Tune 760NC Noise Cancelling', desc: 'Punchy Pure Bass Sound with active noise cancellation, lightweight foldable design, and seamless dual-connection.', price: 7999 },
            { name: 'Sennheiser HD 450SE Bluetooth', desc: 'Immersive sound with deep dynamic bass, Active Noise Cancellation, and specialized voice assistant access key.', price: 14990 },
            { name: 'OnePlus Buds Pro 2 ANC Earbuds', desc: 'Audiophile-grade co-created acoustic drivers, smart adaptive noise cancellation, and high-fidelity spatial audio.', price: 11999 },
            { name: 'boAt Airdopes 131 Earbuds', desc: 'True wireless experience with Insta Wake N Pair technology, 13mm drivers, and sleek pocket-sized charging case.', price: 2990 },
            { name: 'JBL Flip 6 Waterproof Speaker', desc: '2-way speaker system delivering loud, crystal-clear sound with powerful deep bass. IP67 waterproof and dustproof.', price: 9999 }
          ]
        },
        {
          name: 'Smartwatches',
          brands: ['Apple', 'Samsung', 'Fitbit', 'boAt', 'Noise'],
          baseItems: [
            { name: 'Apple Watch Series 9 GPS', desc: 'Brighter Always-On Retina display, crash detection capabilities, advanced health metrics tracking, and double-tap gestures.', price: 41900 },
            { name: 'Galaxy Watch 6 Bluetooth', desc: 'Sleek aluminum frame, personalized sleep coaching, heart-rate zones monitoring, and customizable modern faces.', price: 29999 },
            { name: 'Fitbit Charge 6 Fitness Tracker', desc: 'Built-in GPS mapping, real-time activity tracker, heart rhythm assessment, stress management, and YouTube music controls.', price: 14999 },
            { name: 'boAt Wave Sigma Smartwatch', desc: 'Large high-definition display, seamless Bluetooth calling, multi-sports tracking, and battery backup up to 7 days.', price: 4999 },
            { name: 'Noise ColorFit Pro 5 Call', desc: 'Stunning premium AMOLED display, metallic chassis design, customizable widgets, and advanced health suite.', price: 5999 },
            { name: 'Samsung Galaxy Watch FE', desc: 'Essential premium features including fitness analytics, sleep monitoring, and sleek aesthetic design at a great value.', price: 19999 },
            { name: 'Noise Pulse 2 Max Smartwatch', desc: 'Value-oriented Bluetooth calling watch with large screen, bright visibility, and active fitness tracking.', price: 3999 }
          ]
        }
      ]
    },
    {
      categoryName: 'Fashion',
      subcategories: [
        {
          name: 'MensWear',
          brands: ["Levi's", "U.S. Polo Assn.", "Tommy Hilfiger", "Jack & Jones", "Roadster"],
          baseItems: [
            { name: '511 Slim Fit Jeans', desc: 'Classic modern denim pants styled with a slim fit through the seat and thigh. Durable stretch fabric for all-day comfort.', price: 4299 },
            { name: 'Polo Neck Cotton T-Shirt', desc: 'Timeless solid design featuring the signature embroidered logo, regular fit, and comfortable breathable pique cotton.', price: 1999 },
            { name: 'Casual Slim Fit Linen Shirt', desc: 'Lightweight and airy pure linen shirt featuring a button-down collar, curved hem, and stylish long sleeves.', price: 2999 },
            { name: 'Classic Denim Trucker Jacket', desc: 'A staple wardrobe layer designed with button closures, chest pockets, adjustable tabs, and premium rigid denim.', price: 4999 },
            { name: 'Crew Neck Cotton Sweatshirt', desc: 'Ultra-soft fleece inner lining, regular relaxed fit, ribbed cuffs, and minimal logo chest print for stylish winter layering.', price: 2499 },
            { name: 'Roadster Checked Casual Shirt', desc: 'Trendy casual check pattern shirt featuring dual chest pockets, soft flannel material, and premium stitch styling.', price: 1599 },
            { name: 'Jack & Jones Slim Fit Chinos', desc: 'Premium stretch twill cotton chinos designed with a clean flat front, slant pockets, and versatile solid shades.', price: 3299 }
          ]
        },
        {
          name: 'WomensWear',
          brands: ['Zara', 'H&M', 'Only', 'Vero Moda', 'Biba'],
          baseItems: [
            { name: 'Floral Printed Summer Dress', desc: 'Charming flowy georgette dress designed with a flattering V-neck, cinched waist, ruffle sleeves, and beautiful floral prints.', price: 3999 },
            { name: 'High-Waist Skinny Fit Jeans', desc: 'Super-stretch denim fabric that accentuates curves while providing comfortable flexibility, with double button closure.', price: 2999 },
            { name: 'Oversized Knit Pullover Sweater', desc: 'Cozy and relaxed fit knit sweater woven with chunky acrylic yarn, dropped shoulders, and classic ribbed trim.', price: 2499 },
            { name: 'Traditional Anarkali Printed Kurta', desc: 'Ethnic festive flared cotton kurta highlighted with intricate gold foil prints, round neck, and elegant keyhole back.', price: 3499 },
            { name: 'Casual Satin Office Wear Blouse', desc: 'Smooth premium satin fabric blouse styled with a elegant band collar, front gathers, and cuffed long sleeves.', price: 1999 },
            { name: 'Only Solid Shift Mini Dress', desc: 'Minimalist chic silhouette shift dress made of breathable fabric with a simple round neckline and rear zipper.', price: 2799 },
            { name: 'Vero Moda Pleated Midi Skirt', desc: 'Flowy accordion-pleated midi length skirt highlighted by a comfortable elasticized waistband and soft inner lining.', price: 2299 }
          ]
        },
        {
          name: 'Footwear',
          brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Bata'],
          baseItems: [
            { name: 'Air Max Sports Running Shoes', desc: 'Engineered mesh upper for high breathability, signature responsive air unit cushioning, and durable traction waffle outsole.', price: 9999 },
            { name: 'Ultraboost Lifestyle Sneakers', desc: 'Responsive energy return boost midsole, snug primeknit upper wrap, and flexible stretchweb outsole.', price: 14999 },
            { name: 'Smash v2 Classic Casual Shoes', desc: 'Retro tennis-inspired casual shoe updated with clean synthetic leather upper, padded collar, and cupsole stitching.', price: 4999 },
            { name: 'Classic Leather Derby Formal Shoes', desc: 'Elegantly crafted genuine full-grain leather dress shoes styled with a clean round toe, lace closures, and cushioned insoles.', price: 3999 },
            { name: 'Floatride Energy Workout Shoes', desc: 'Lightweight, ultra-responsive athletic shoes designed with high-density foam cushioning for running and intensive gym training.', price: 7999 },
            { name: 'Bata Cushioned Daily Sandals', desc: 'Super soft footbed technology, adjustable synthetic strap closures, and robust slip-resistant polyurethane outer sole.', price: 1499 },
            { name: 'Puma Streetwear Canvas Sneakers', desc: 'Classic minimal low-cut canvas sneaker with iconic brand formstrip, flat cotton laces, and vulcanized rubber sole.', price: 2999 }
          ]
        },
        {
          name: 'Accessories',
          brands: ['Ray-Ban', 'Fossil', 'Baggit', 'Caprese', 'Wildhorn'],
          baseItems: [
            { name: 'Aviator Classic Unisex Sunglasses', desc: 'Iconic teardrop metal frames featuring green classic G-15 mineral glass lenses with 100% UV protection and comfort nosepads.', price: 8990 },
            { name: 'Genuine Leather Minimalist Wallet', desc: 'Slim bifold design styled with multiple card slots, clear ID window, secure currency compartments, and advanced RFID blocking.', price: 1990 },
            { name: 'Faux Leather Structured Tote Bag', desc: 'Spacious fashion handbag structured with dual top handles, main zipper compartment, interior organizer pockets, and gold trim.', price: 2990 },
            { name: 'Fossil Chronograph Quartz Watch', desc: 'Timeless luxury analog watch styled with a stainless steel case, multi-dial chronograph performance, and premium leather strap.', price: 12995 },
            { name: 'Caprese Women Designer Clutch', desc: 'Stylish compact evening clutch accented with structured textured design, detachable metallic chain strap, and magnetic lock.', price: 1890 },
            { name: 'Wildhorn Premium Leather Belt', desc: 'Crafted from 100% genuine full-grain leather, featuring a heavy-duty gunmetal finish buckle and adjustable fit sizing.', price: 1290 },
            { name: 'Baggit Sleek Utility Backpack', desc: 'Compact lightweight travel backpack designed with water-resistant fabric, multi-zipped pockets, and padded shoulder straps.', price: 2490 }
          ]
        }
      ]
    },
    {
      categoryName: 'Home & Kitchen',
      subcategories: [
        {
          name: 'KitchenAppliances',
          brands: ['Philips', 'Prestige', 'Pigeon', 'Kent', 'Bajaj'],
          baseItems: [
            { name: 'Digital Air Fryer 4.2L', desc: 'Healthier frying using Rapid Air Technology to cook with up to 90% less oil, featuring a clear touch screen control.', price: 9999 },
            { name: 'Stainless Steel Mixer Grinder 750W', desc: 'Heavy-duty motor performance accompanied by three high-quality stainless steel jars with flow breakers and lock lids.', price: 4599 },
            { name: 'Induction Cooktop with Touch Control', desc: 'Fast energy efficient induction cooker designed with preset Indian cooking menus, auto-off timer, and durable glass panel.', price: 3499 },
            { name: 'Multi-Utility Electric Kettle 1.8L', desc: 'Cordless rapid boil water boiler engineered with food-grade stainless steel body, auto shut-off, and boil-dry safety protection.', price: 1999 },
            { name: 'Kent Cold Press Slow Juicer', desc: 'Advanced low-speed squeezing process that retains natural nutrients, fiber, and original fruit taste with quiet motor technology.', price: 11999 },
            { name: 'Bajaj 20L Solo Microwave Oven', desc: 'Compact reliable cooking appliance with multi-power levels, tactile jog dials, standard defrost function, and easy clean cavity.', price: 6499 },
            { name: 'Philips 2-Slice Pop-Up Toaster', desc: 'Compact modern toaster with 8 browning options, integrated bun warming rack, cancel button, and easy slide-out crumb tray.', price: 2299 }
          ]
        },
        {
          name: 'Cookware',
          brands: ['Borosil', 'Prestige', 'Wonderchef', 'Milton'],
          baseItems: [
            { name: 'Non-Stick Induction Cookware Set', desc: 'Premium 3-piece set comprising kadhai with glass lid, fry pan, and flat tawa, featuring scratch-resistant PFOA-free coating.', price: 3999 },
            { name: 'Glass Leakproof Lunch Box Set', desc: 'Set of 3 borosilicate glass containers with air-tight snap lock lids, microwave safe, oven proof, and convenient carry bag.', price: 1499 },
            { name: 'Thermosteel Hot & Cold Water Bottle', desc: 'Vacuum insulated double-walled stainless steel bottle that keeps beverages hot or cold for up to 24 hours without sweating.', price: 1299 },
            { name: 'Hard Anodized Pressure Cooker 5L', desc: 'Highly durable heavy-gauge pressure cooker designed with a metallic safety valve, inner-lid fitting, and cool-touch handles.', price: 2999 },
            { name: 'Wonderchef Granite Frying Pan', desc: 'Designer die-cast aluminum cookware styled with healthy non-stick granite coating, wooden finish handle, and sleek look.', price: 1899 },
            { name: 'Milton Steel Casserole Set', desc: 'Pack of 3 insulated hotpot casseroles designed to keep food warm and fresh, featuring double-walled stainless steel inner.', price: 2499 },
            { name: 'Borosil Glass Mixing Bowls', desc: 'Set of 2 heat-resistant borosilicate glass mixing bowls that do not absorb stains or odors, oven and microwave safe.', price: 999 }
          ]
        },
        {
          name: 'HomeDecor',
          brands: ['Solimo', 'Sleepwell', 'AmazonBasics', 'IKEA'],
          baseItems: [
            { name: 'Sheesham Wood Compact Coffee Table', desc: 'Sturdy solid hardwood coffee table boasting a beautiful natural grain finish, minimalist square design, and easy self-assembly.', price: 5999 },
            { name: 'Memory Foam Orthopedic Mattress', desc: 'Orthopedic posture support mattress constructed with high-density pressure-relieving memory foam and breathable fabric cover.', price: 14999 },
            { name: 'Microfiber Bed Pillows (Pair of 2)', desc: 'Fluffy down-alternative microfiber filled sleeping pillows offering medium firmness, breathable fabric shell, and hypoallergenic.', price: 1299 },
            { name: 'Blackout Window Curtains (Pair)', desc: 'Thick triple-weave polyester room darkening curtains equipped with metal eyelet rings, blocking 90% of sunlight and heat.', price: 1999 },
            { name: 'Metal Multi-Tier Shoe Rack Organizer', desc: 'Sturdy anti-corrosive metal tube shoe shelves holding up to 15 pairs of shoes, lightweight modular freestanding setup.', price: 1599 },
            { name: 'IKEA Sleek Desk Lamp', desc: 'Minimalist powder-coated steel study table lamp featuring adjustable flexible neck arm and standard focus illumination.', price: 1499 },
            { name: 'AmazonBasics Microfiber Bedsheet Set', desc: 'Soft wrinkle-resistant double size bedsheet with two matching pillow covers, featuring a smooth finish and durable wash fabric.', price: 1199 }
          ]
        },
        {
          name: 'SmartHome',
          brands: ['Dyson', 'Philips', 'Eufy', 'Xiaomi'],
          baseItems: [
            { name: 'V12 Cordless Vacuum Cleaner', desc: 'Powerful Dyson Hyperdymium motor suction, laser dust detection, intelligent LCD screen, and versatile attachments.', price: 49900 },
            { name: 'Smart Air Purifier H13 HEPA', desc: 'High-efficiency cylindrical HEPA H13 filtration capturing 99.97% of allergens, real-time AQI indicator, and smart app control.', price: 12999 },
            { name: 'RoboVac Smart Robotic Vacuum', desc: 'Intelligent robot vacuum equipped with advanced navigation, strong suction, self-charging dock, and seamless Alexa voice commands.', price: 19999 },
            { name: 'Smart LED Wi-Fi Bulb 9W', desc: 'Smart color changing bulb offering 16 million colors, dimming capabilities, scheduling, and standard B22 base (no hub needed).', price: 999 },
            { name: 'Xiaomi Security Camera 360', desc: 'Full HD 1080p smart IP camera providing full 360-degree panoramic coverage, infrared night vision, and motion detection alerts.', price: 2999 },
            { name: 'Philips Hue Smart Bridge', desc: 'The heart of your smart lighting system, connecting up to 50 smart bulbs for advanced scheduling, voice sync, and out-of-home control.', price: 4499 },
            { name: 'Xiaomi Smart Air Fryer 3.5L', desc: 'OLED smart screen display, custom schedule cooking up to 24 hours, healthy oil-free baking, and Mi Home application sync.', price: 6999 }
          ]
        }
      ]
    },
    {
      categoryName: 'Books',
      subcategories: [
        {
          name: 'Fiction',
          brands: ['Penguin', 'HarperCollins', 'Bloomsbury'],
          baseItems: [
            { name: 'The Alchemist (Paperback)', desc: 'The international bestseller following the story of Santiago, an Andalusian shepherd boy who journeys in search of worldly treasure.', price: 399 },
            { name: 'To Kill a Mockingbird', desc: 'Harper Lee\'s Pulitzer Prize-winning masterpiece exploring racial injustice, honor, and childhood innocence in the Deep South.', price: 499 },
            { name: '1984 (Deluxe Edition)', desc: 'George Orwell\'s terrifyingly prophetic dystopian classic about Big Brother, totalitarian surveillance, and truth manipulation.', price: 599 },
            { name: 'The Midnight Library', desc: 'Matt Haig\'s heartwarming novel about Nora Seed who finds herself in a mystical library containing books of lives she could have lived.', price: 450 },
            { name: 'Normal People (Paperback)', desc: 'Sally Rooney\'s exquisite contemporary novel detailing the complicated magnetic relationship between Connell and Marianne over the years.', price: 499 },
            { name: 'The Hobbit (Illustrated)', desc: 'J.R.R. Tolkien\'s timeless fantasy classic detailing Bilbo Baggins\' legendary adventure with dwarves to reclaim the lonely mountain.', price: 699 },
            { name: 'A Game of Thrones (Book 1)', desc: 'The epic fantasy narrative introducing the political intrigue, noble houses, and frozen threats in the lands of Westeros.', price: 599 }
          ]
        },
        {
          name: 'SelfHelp',
          brands: ['Penguin Publishing', 'Simon & Schuster', 'O\'Reilly'],
          baseItems: [
            { name: 'Atomic Habits', desc: 'James Clear\'s definitive guide to breaking bad habits and building good ones in tiny steps using proven behavioral science.', price: 799 },
            { name: 'Rich Dad Poor Dad', desc: 'Robert Kiyosaki\'s iconic personal finance classic detailing crucial lessons about money, investing, and building assets.', price: 499 },
            { name: 'The Psychology of Money', desc: 'Morgan Housel\'s highly acclaimed book sharing nineteen short stories exploring the strange ways people think about wealth and greed.', price: 599 },
            { name: 'Deep Work: Focused Success', desc: 'Cal Newport\'s structured rules for cultivating intense focus in a distracted world to produce exceptional cognitive results.', price: 650 },
            { name: 'How to Win Friends & Influence People', desc: 'Dale Carnegie\'s legendary bestseller offering practical strategies to build trust, win cooperation, and lead effectively.', price: 399 },
            { name: 'The 5 AM Club', desc: 'Robin Sharma\'s revolutionary morning routine formula designed to optimize productivity, health, and personal growth.', price: 499 },
            { name: 'Thinking, Fast and Slow', desc: 'Daniel Kahneman\'s masterpiece explaining the two systems that drive our decisions—fast intuitive thinking and slow logical analysis.', price: 899 }
          ]
        },
        {
          name: 'Biographies',
          brands: ['Penguin', 'Vintage', 'Random House'],
          baseItems: [
            { name: 'Steve Jobs: The Biography', desc: 'Walter Isaacson\'s exclusive riveting biography based on years of interviews with the visionary Apple co-founder, family, and rivals.', price: 999 },
            { name: 'Sapiens: A Brief History', desc: 'Yuval Noah Harari\'s groundbreaking work charting the bold history of humankind from early hunter-gatherers to the present day.', price: 899 },
            { name: 'Elon Musk: Walter Isaacson', desc: 'The astonishingly intimate biography detailing the triumphs, failures, and driving madness of the modern technology mogul.', price: 1199 },
            { name: 'The Diary of a Young Girl', desc: 'Anne Frank\'s deeply moving and historic personal diary written while hiding from the Nazis in occupied Amsterdam during WWII.', price: 399 },
            { name: 'Wings of Fire (Autobiography)', desc: 'The inspiring life story of Dr. A.P.J. Abdul Kalam, detailing his journey from a modest town to becoming India\'s missile man and President.', price: 450 },
            { name: 'Becoming by Michelle Obama', desc: 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States, charting her personal and public life.', price: 799 },
            { name: 'Shoe Dog by Phil Knight', desc: 'The captivating memoir by the Nike creator, sharing the inside story of the startup\'s early struggles and evolution into a global brand.', price: 699 }
          ]
        },
        {
          name: 'SciFi',
          brands: ['HarperCollins', 'Orbit', 'Del Rey'],
          baseItems: [
            { name: 'Dune (Deluxe Hardcover)', desc: 'Frank Herbert\'s epic science fiction masterpiece set on the desert planet Arrakis, exploring politics, religion, and survival.', price: 999 },
            { name: 'Project Hail Mary', desc: 'Andy Weir\'s gripping survival thriller detailing an astronaut\'s desperate, lone mission to save Earth from an extinction threat.', price: 799 },
            { name: 'Neuromancer (Paperback)', desc: 'William Gibson\'s Hugo Award-winning cyberpunk novel that defined virtual reality, cyberspace matrix, and hacker themes.', price: 599 },
            { name: 'Foundation (Book 1)', desc: 'Isaac Asimov\'s monumental sci-fi classic detailing a mathematician\'s plan to preserve human knowledge across galactic collapses.', price: 499 },
            { name: 'The Hitchhiker\'s Guide to the Galaxy', desc: 'Douglas Adams\' hilarious cosmic adventure following Arthur Dent\'s journey across space after Earth\'s demolition.', price: 450 },
            { name: 'Hyperion (Paperback)', desc: 'Dan Simmons\' mind-bending Hugo Award-winner combining epic space opera and personal tales on the eve of galactic war.', price: 599 },
            { name: 'Ready Player One', desc: 'Ernest Cline\'s immersive pop-culture laden adventure set in a virtual reality gaming world where users hunt for a hidden fortune.', price: 499 }
          ]
        }
      ]
    },
    {
      categoryName: 'Beauty',
      subcategories: [
        {
          name: 'Skincare',
          brands: ['Cetaphil', 'Neutrogena', 'L\'Oreal', 'Mamaearth', 'Plum'],
          baseItems: [
            { name: 'Gentle Skin Cleanser', desc: 'Dermatologist recommended non-foaming gentle cleanser that hydrates, cleanses, and soothes sensitive skin without stripping.', price: 499 },
            { name: 'Ultra Sheer Sunscreen SPF 50', desc: 'Broad spectrum dry-touch non-greasy sunscreen protection that leaves a clean, matte finish on the face.', price: 675 },
            { name: 'Hyaluronic Acid Hydrating Serum', desc: 'Enriched with pure hyaluronic acid to lock in moisture, plumping up fine lines and restoring skin radiance.', price: 999 },
            { name: 'Vitamin C Brightening Face Wash', desc: 'Infused with natural active Vitamin C and antioxidant extracts to gently cleanse and brighten dull skin tone.', price: 349 },
            { name: 'Green Tea Alcohol-Free Toner', desc: 'Refreshing toner designed to tighten enlarged pores, control excess oil production, and clarify acne-prone skin.', price: 390 },
            { name: 'Cetaphil Moisturizing Cream', desc: 'Intense 24-hour hydration cream fortified with almond oil and essential skin vitamins for dry, sensitive skin patches.', price: 550 },
            { name: 'Neutrogena Hydro Boost Water Gel', desc: 'Unique oil-free water gel moisturizer containing hyaluronic acid, instantly absorbing to provide continuous deep hydration.', price: 1150 }
          ]
        },
        {
          name: 'Haircare',
          brands: ['L\'Oreal', 'Tresemme', 'Mamaearth', 'WOW Skin Science'],
          baseItems: [
            { name: 'Total Repair 5 Hair Shampoo', desc: 'Advanced shampoo formula that combats five visible signs of hair damage: hair fall, dryness, roughness, dullness, and split ends.', price: 450 },
            { name: 'Keratin Smooth Conditioner', desc: 'Infused with high-quality keratin proteins and argan oil to provide frizz control for up to 3 days, making hair sleek.', price: 499 },
            { name: 'Onion Hair Oil for Hair Fall Control', desc: 'Formulated with onion seed oil and redensyl to strengthen hair roots, reduce hair breakage, and promote healthy growth.', price: 399 },
            { name: 'Apple Cider Vinegar Shampoo', desc: 'Clarifying organic shampoo that cleanses build-up, balances scalp pH, and restores premium silkiness and natural gloss.', price: 499 },
            { name: 'L\'Oreal Hair Spa Nourishing Cream', desc: 'Professional hair spa treatment cream enriched with water lily extracts to deeply nourish hair fibers inside and out.', price: 699 },
            { name: 'Tresemme Hair Fall Defense Shampoo', desc: 'Specially formulated with advanced Keratin proteins to reinforce hair strength and prevent breakage caused by brushing.', price: 399 },
            { name: 'WOW Coconut Milk Hair Conditioner', desc: 'Enriched with pure coconut milk extract and wheat protein to intensely moisturize dry strands, reviving natural luster.', price: 449 }
          ]
        },
        {
          name: 'Fragrances',
          brands: ['Titan Skinn', 'Denver', 'Park Avenue', 'Axe', 'Fogg'],
          baseItems: [
            { name: 'Skinn Raw Perfume for Men', desc: 'A premium, long-lasting Eau De Parfum highlighted by a fresh, citrusy top note, warm woody heart, and musky undertones.', price: 1895 },
            { name: 'Fogg Royal No Gas Body Spray', desc: 'Seductive, refreshing deodorant that provides effective all-day sweat protection with zero gas and maximum sprays.', price: 299 },
            { name: 'Denver Hamilton Eau De Parfum', desc: 'Classy elegant fragrance crafted with a unique blend of spicy cardamom, rich amber, and fresh citrus for a masculine charm.', price: 499 },
            { name: 'Park Avenue Voyage Deodorant', desc: 'Signature strong fragrance boasting amber notes mixed with fresh citrus wood to keep you smelling confident all day.', price: 249 },
            { name: 'Skinn Celeste Perfume for Women', desc: 'Delightfully sweet floral-fruity Eau De Parfum combined with refreshing peach, white floral bouquets, and warm vanilla.', price: 1895 },
            { name: 'Axe Signature Gold Dark Vanilla Deodorant', desc: 'Premium dry matte body spray infused with a warm blend of rich dark vanilla and woody cedarwood, for refined freshness.', price: 349 },
            { name: 'Fogg Marco Body Spray Deodorant', desc: 'Invigorating all-over body spray carrying high-intensity crisp aquatic notes to provide active freshness after workouts.', price: 299 }
          ]
        },
        {
          name: 'GroomingTools',
          brands: ['Philips', 'Braun', 'Nova'],
          baseItems: [
            { name: 'OneBlade Hybrid Beard Trimmer', desc: 'Revolutionary electric grooming technology that can trim, edge, and shave any length of facial hair without skin irritation.', price: 2299 },
            { name: 'Cordless Hair Clipper & Trimmer', desc: 'Ultra-quiet heavy-duty hair clipper equipped with self-sharpening stainless steel blades and multiple comb attachments.', price: 1499 },
            { name: 'Braun Series 3 Electric Shaver', desc: 'Triple Action cutting system, 100% waterproof construction, and flexible foil heads that adapt smoothly to facial contours.', price: 3999 },
            { name: 'Compact Foldable Hair Dryer 1200W', desc: 'Lightweight styling companion featuring dual heat speed settings, narrow concentrator nozzle, and convenient folding handle.', price: 899 },
            { name: 'Philips Selfie Straightener', desc: 'Selfie-ready straight hair in minutes. Smooth ceramic plates infused with keratin, heating up quickly to 210°C.', price: 1299 },
            { name: 'Braun Silk-epil 3 Epilator', desc: 'Gently removes hair from the root for long-lasting smooth skin up to 4 weeks, featuring smartlight to reveal fine hairs.', price: 3299 },
            { name: 'Nova multi-styling Hair Curler', desc: 'Professional curling tong with ceramic coated barrel, heat-insulated tip, and quick heat technology for beautiful curls.', price: 999 }
          ]
        }
      ]
    }
  ];

  const generatedProductsList = [];

  // Loop through all categories, subcategories and generate exactly 26 products for each
  categoriesList.forEach((catObj) => {
    const categoryName = catObj.categoryName;

    catObj.subcategories.forEach((subcatObj) => {
      const subcatName = subcatObj.name;
      const brands = subcatObj.brands;
      const baseItems = subcatObj.baseItems;
      const imagesList = unsplashImages[subcatName] || unsplashImages['Smartphones'];

      // We need exactly 26 products per subcategory. We will loop 26 times.
      for (let i = 0; i < 26; i++) {
        // Pick base item and brand sequentially using modulo
        const baseItem = baseItems[i % baseItems.length];
        const brand = brands[i % brands.length];

        // Unique variations: 1st copy is original, subsequent ones are variations (e.g. Colors, Sizes, Editions)
        const variantNum = Math.floor(i / baseItems.length);
        let nameSuffix = '';
        let priceMultiplier = 1.0;
        let imageIndex = (i + variantNum) % imagesList.length;

        // Apply distinct variants based on categories to simulate real e-commerce choices
        if (categoryName === 'Electronics') {
          const colors = ['Titanium Black', 'Pearl Silver', 'Emerald Green', 'Cobalt Blue', 'Sleek White'];
          const color = colors[i % colors.length];
          if (subcatName === 'Smartphones') {
            const storages = ['128GB', '256GB', '512GB'];
            const storage = storages[variantNum % storages.length];
            nameSuffix = ` (${storage}, ${color})`;
            priceMultiplier = 1.0 + (variantNum * 0.12);
          } else if (subcatName === 'Laptops') {
            const specs = ['8GB/512GB SSD', '16GB/512GB SSD', '16GB/1TB SSD'];
            const spec = specs[variantNum % specs.length];
            nameSuffix = ` (${spec}, ${color})`;
            priceMultiplier = 1.0 + (variantNum * 0.15);
          } else {
            nameSuffix = ` - ${color} Edition`;
            priceMultiplier = 1.0 + (variantNum * 0.05);
          }
        } else if (categoryName === 'Fashion') {
          const sizes = ['S', 'M', 'L', 'XL'];
          const colors = ['Classic Navy', 'Charcoal Grey', 'Olive Green', 'Deep Black', 'Rich Maroon'];
          const size = sizes[i % sizes.length];
          const color = colors[variantNum % colors.length];
          nameSuffix = ` (${color}, Size ${size})`;
          priceMultiplier = 1.0 + (variantNum * 0.03); // Slight premium for colors
        } else if (categoryName === 'Home & Kitchen') {
          if (subcatName === 'Cookware') {
            const capacities = ['2-Piece Set', '3-Piece Set', 'Jumbo Size'];
            nameSuffix = ` - ${capacities[variantNum % capacities.length]}`;
            priceMultiplier = 1.0 + (variantNum * 0.20);
          } else if (subcatName === 'HomeDecor') {
            const packSizes = ['Pack of 1', 'Pack of 2', 'Pack of 4'];
            nameSuffix = ` (${packSizes[variantNum % packSizes.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.80);
          } else {
            const colors = ['Standard Steel', 'Metallic Red', 'Matte Black'];
            nameSuffix = ` (${colors[variantNum % colors.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.08);
          }
        } else if (categoryName === 'Books') {
          const bindings = ['Paperback', 'Hardcover', 'Deluxe Collector\'s Edition'];
          nameSuffix = ` (${bindings[variantNum % bindings.length]})`;
          priceMultiplier = 1.0 + (variantNum * 0.35);
        } else if (categoryName === 'Beauty') {
          const volumes = ['50ml', '100ml', '200ml', 'Pack of 2'];
          nameSuffix = ` (${volumes[variantNum % volumes.length]})`;
          priceMultiplier = 1.0 + (variantNum * 0.60);
        }

        const calculatedPrice = Math.round(baseItem.price * priceMultiplier);
        // Random discount between 10% and 35%, ensuring we do not violate constraints
        const discountPercentage = randomRange(10, 35, 0);
        const discountPrice = Math.round(calculatedPrice * (1 - discountPercentage / 100));

        const productName = `${brand} ${baseItem.name}${nameSuffix}`;

        // Build list of specs
        const specs = getSpecsForSubcategory(subcatName, brand, baseItem.name, i);

        // Generate standard product object matching models/Product.js
        const product = {
          name: productName,
          brand: brand,
          category: categoryName, // Seeding maps name to database category names
          description: `${baseItem.desc} authentic top-rated product, highly available on popular Indian platforms like Amazon and Flipkart. Features premium specifications, top quality manufacturing, and durable warranty support.`,
          price: calculatedPrice,
          discountPrice: discountPrice,
          stock: randomRange(15, 120, 0),
          images: [
            imagesList[imageIndex],
            imagesList[(imageIndex + 1) % imagesList.length]
          ],
          rating: randomRange(3.9, 4.9, 1),
          specifications: specs
        };

        generatedProductsList.push(product);
      }
    });
  });

  return generatedProductsList;
};
