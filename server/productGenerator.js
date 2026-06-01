// Programmatic product generator for AI Smart Commerce
// Generates exactly 2000 unique products spanning 5 core categories and 40 subcategories (50 items per subcategory)

// Helper to generate a random number within range
const randomRange = (min, max, decimals = 0) => {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
};

// Unsplash high-quality image URLs mapped by subcategory
const unsplashImages = {
  // Electronics
  Smartphones: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1565849906660-afc86cd77449?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800'
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1496181130204-7552cc1454a4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1484788984921-03950022c9ef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=800'
  ],
  Audio: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'
  ],
  Smartwatches: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=800'
  ],
  Chargers: [
    'https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&q=80&w=800'
  ],
  PowerBanks: [
    'https://images.unsplash.com/photo-1609592424109-dd825be54238?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1619086303291-0ef7b4140da3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1593642702821-c8da445f1b5b?auto=format&fit=crop&q=80&w=800'
  ],
  ComputerAccessories: [
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&q=80&w=800'
  ],
  Storage: [
    'https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1628557118391-768ff5f9e802?auto=format&fit=crop&q=80&w=800'
  ],

  // Fashion
  MensApparel: [
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=800'
  ],
  WomensApparel: [
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&q=80&w=800'
  ],
  Footwear: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800'
  ],
  Watches: [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&q=80&w=800'
  ],
  Sunglasses: [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=800'
  ],
  Bags: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1627124762836-0d86892504b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800'
  ],
  WalletsBelts: [
    'https://images.unsplash.com/photo-1627124762836-0d86892504b0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1614187337613-2d2c187f54c9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1564594736624-def7a10ab047?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1524282745852-a463fa495967?auto=format&fit=crop&q=80&w=800'
  ],
  KidsWear: [
    'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1471286174243-e7a4d9aa2e41?auto=format&fit=crop&q=80&w=800'
  ],

  // Home & Kitchen
  KitchenAppliances: [
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=800'
  ],
  Cookware: [
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1599615358055-1d9e227ecc22?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
  ],
  HomeDecor: [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800'
  ],
  SmartHome: [
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1563161431-74189958e8e5?auto=format&fit=crop&q=80&w=800'
  ],
  Furniture: [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505693395951-c3c8376e5304?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'
  ],
  Bedding: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'
  ],
  Tableware: [
    'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=800'
  ],
  StorageOrganizers: [
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1532372320978-9b4d6a3a854c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'
  ],

  // Books
  BooksGeneral: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800'
  ],

  // Beauty
  Skincare: [
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=800'
  ],
  Haircare: [
    'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800'
  ],
  Fragrances: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800'
  ],
  GroomingTools: [
    'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
  ],
  Makeup: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800'
  ],
  BathBody: [
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1607006342411-9a910c64b6a8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800'
  ],
  MensGrooming: [
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1605497746444-ac9dbd39f4a5?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=800'
  ],
  NailCare: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800'
  ]
};

// Generates an array of specifications depending on subcategory
const getSpecsForSubcategory = (subcat, brand, modelName, variantIndex) => {
  switch (subcat) {
    case 'Smartphones':
      return [
        { key: 'Model Name', value: modelName },
        { key: 'RAM', value: ['8 GB', '12 GB', '16 GB'][variantIndex % 3] },
        { key: 'Storage', value: ['128 GB', '256 GB', '512 GB', '1 TB'][variantIndex % 4] },
        { key: 'Network', value: '5G LTE' },
        { key: 'Warranty', value: '1 Year Manufacturer' }
      ];
    case 'Laptops':
      return [
        { key: 'Processor', value: ['Intel Core i5', 'Intel Core i7', 'Apple M3 Chip', 'AMD Ryzen 7'][variantIndex % 4] },
        { key: 'RAM', value: ['8 GB', '16 GB', '32 GB'][variantIndex % 3] },
        { key: 'Storage Capacity', value: ['512 GB SSD', '1 TB SSD'][variantIndex % 2] },
        { key: 'Display Size', value: '14 Inches' }
      ];
    case 'Audio':
      return [
        { key: 'Connectivity Type', value: 'Wireless Bluetooth' },
        { key: 'Noise Cancellation', value: variantIndex % 2 === 0 ? 'Yes (Active NC)' : 'No' },
        { key: 'Playback Time', value: ['20 Hours', '30 Hours', '40 Hours'][variantIndex % 3] }
      ];
    case 'Smartwatches':
      return [
        { key: 'Water Resistance', value: 'IP68 Certified' },
        { key: 'Compatible OS', value: 'Android & iOS' },
        { key: 'Sensors', value: 'Heart Rate, SpO2, Sleep Tracker' }
      ];
    case 'Chargers':
      return [
        { key: 'Output Port', value: ['USB Type-C', 'Dual Port (C+A)', 'Triple USB'][variantIndex % 3] },
        { key: 'Charging Speed', value: ['20W Fast Charge', '33W SuperVOOC', '65W GaN Charger', '100W Max'][variantIndex % 4] },
        { key: 'Cable Included', value: variantIndex % 2 === 0 ? 'Yes (1.2m)' : 'No' }
      ];
    case 'PowerBanks':
      return [
        { key: 'Battery Capacity', value: ['10000 mAh', '20000 mAh', '30000 mAh'][variantIndex % 3] },
        { key: 'Output Wattage', value: ['18W Fast Charging', '22.5W Power Delivery', '45W Turbo'][variantIndex % 3] },
        { key: 'Built-in Protection', value: 'Over-Charge, Short-Circuit Protection' }
      ];
    case 'ComputerAccessories':
      return [
        { key: 'Device Category', value: ['Wireless Mouse', 'Mechanical Keyboard', 'Webcam 1080p', 'USB Hub'][variantIndex % 4] },
        { key: 'Connectivity', value: variantIndex % 2 === 0 ? 'Wireless 2.4GHz & BT' : 'USB Wired' },
        { key: 'Warranty', value: '1 Year Brand Warranty' }
      ];
    case 'Storage':
      return [
        { key: 'Storage Standard', value: ['USB 3.2 Flash Drive', 'Portable External SSD', 'MicroSD XC Card'][variantIndex % 3] },
        { key: 'Capacity', value: ['64 GB', '128 GB', '512 GB', '1 TB', '2 TB'][variantIndex % 5] },
        { key: 'Read Speed', value: ['150 MB/s', '520 MB/s', '1050 MB/s', '2000 MB/s'][variantIndex % 4] }
      ];
    case 'MensApparel':
    case 'WomensApparel':
    case 'KidsWear':
      return [
        { key: 'Material Composition', value: ['100% Pure Organic Cotton', 'Premium Linen Blend', 'Polyester Spandex', 'Denim Fabric'][variantIndex % 4] },
        { key: 'Fit Type', value: ['Regular Fit', 'Slim Modern Fit', 'Oversized Relaxed Fit'][variantIndex % 3] },
        { key: 'Wash Care Instruction', value: 'Machine Wash Cold, Dry Flat' }
      ];
    case 'Footwear':
      return [
        { key: 'Outer Material', value: ['Breathable Mesh', 'Genuine Full-Grain Leather', 'Faux Leather', 'Canvas Fabric'][variantIndex % 4] },
        { key: 'Sole Type', value: 'Anti-Skid Rubber Traction Sole' },
        { key: 'Closure Type', value: variantIndex % 3 === 0 ? 'Slip-On' : 'Lace-Up' }
      ];
    case 'Watches':
      return [
        { key: 'Movement Type', value: ['Japanese Quartz Movement', 'Automatic Self-Winding', 'Chronograph'][variantIndex % 3] },
        { key: 'Strap Material', value: ['Genuine Croco Leather', 'Stainless Steel Mesh', 'Sleek Metal Chain'][variantIndex % 3] },
        { key: 'Dial Diameter', value: '42 mm' }
      ];
    case 'Sunglasses':
      return [
        { key: 'Lens Technology', value: ['Polarized Glass Lenses', '100% UV400 Protective', 'Anti-Glare coating'][variantIndex % 3] },
        { key: 'Frame Shape', value: ['Aviator Teardrop', 'Wayfarer Classic', 'Round Retro', 'Rectangular Geometric'][variantIndex % 4] },
        { key: 'Frame Material', value: 'Lightweight Alloy Metal' }
      ];
    case 'Bags':
      return [
        { key: 'Compartments count', value: ['2 Main Compartments', '3 Multi-Zipper Chambers', 'Single Roomy Space'][variantIndex % 3] },
        { key: 'Water Resistant', value: variantIndex % 2 === 0 ? 'Yes' : 'No' },
        { key: 'Storage Volume', value: ['15 Liters', '28 Liters', '35 Liters'][variantIndex % 3] }
      ];
    case 'WalletsBelts':
      return [
        { key: 'Primary Material', value: '100% Genuine Veg-Tanned Leather' },
        { key: 'RFID Protection', value: variantIndex % 2 === 0 ? 'Yes (Active Shield)' : 'No' }
      ];
    case 'KitchenAppliances':
      return [
        { key: 'Power rating', value: ['500 Watts', '750 Watts', '1200 Watts', '1800 Watts'][variantIndex % 4] },
        { key: 'Control panel', value: variantIndex % 2 === 0 ? 'Smart Digital Touch' : 'Manual Mechanical Dials' }
      ];
    case 'Cookware':
    case 'Tableware':
      return [
        { key: 'Dishwasher Safe', value: 'Yes (Highly Recommended)' },
        { key: 'MicroWave Oven Safe', value: variantIndex % 2 === 0 ? 'Yes' : 'No' },
        { key: 'Base Material', value: ['Tempered Borosilicate Glass', 'Food-Grade Stainless Steel', 'Hard Anodized Aluminum'][variantIndex % 3] }
      ];
    case 'HomeDecor':
      return [
        { key: 'Primary Material', value: ['Teak Wood', 'Ceramic Clay', 'Polished Metal', 'Wrought Iron'][variantIndex % 4] },
        { key: 'Weight', value: ['800 Grams', '1.5 Kilograms', '4.2 Kilograms'][variantIndex % 3] }
      ];
    case 'SmartHome':
      return [
        { key: 'Voice Compatibility', value: 'Amazon Alexa & Google Home assistant' },
        { key: 'Wireless Sync', value: 'WiFi 2.4GHz & Bluetooth LE' }
      ];
    case 'Furniture':
      return [
        { key: 'Frame Material', value: ['Solid Sheesham Wood', 'Premium Engineered Wood', 'Reinforced Carbon Steel'][variantIndex % 3] },
        { key: 'Assembly required', value: variantIndex % 3 === 0 ? 'No (Pre-Assembled)' : 'Yes (Self-DIY Kit)' }
      ];
    case 'Bedding':
      return [
        { key: 'Thread Count', value: ['200 TC', '300 TC', '400 TC Premium'][variantIndex % 3] },
        { key: 'Fabric Standard', value: '100% Sustainable Cotton Yarn' }
      ];
    case 'StorageOrganizers':
      return [
        { key: 'Storage Capacity', value: ['10 Liters', '25 Liters', '40 Liters', '60 Liters'][variantIndex % 4] },
        { key: 'Feature highlights', value: ['Foldable Space-Saving', 'Stackable interlocking', 'Clear visual window'][variantIndex % 3] }
      ];
    case 'Fiction':
    case 'SelfHelp':
    case 'Biographies':
    case 'SciFi':
      return [
        { key: 'Print format', value: ['Paperback Edition', 'Hardcover Special', 'Deluxe Classic Edition'][variantIndex % 3] },
        { key: 'Language', value: 'English (US & India)' },
        { key: 'Page Count', value: ['290 Pages', '360 Pages', '450 Pages', '620 Pages'][variantIndex % 4] }
      ];
    case 'Skincare':
    case 'Haircare':
    case 'BathBody':
    case 'MensGrooming':
      return [
        { key: 'Suitable skin type', value: ['All Skin Types', 'Sensitive Skin', 'Dry / Dehydrated'][variantIndex % 3] },
        { key: 'Ingredients check', value: 'Paraben-Free, Sulphate-Free, Vegan Formula' },
        { key: 'Item Volume', value: ['50 ml', '100 ml', '250 ml', '500 ml'][variantIndex % 4] }
      ];
    case 'Fragrances':
      return [
        { key: 'Fragrance classification', value: ['Eau De Parfum (EDP)', 'Eau De Toilette (EDT)', 'Refreshing Body Spray'][variantIndex % 3] },
        { key: 'Volume', value: ['50 ml', '100 ml', '150 ml'][variantIndex % 3] }
      ];
    case 'GroomingTools':
      return [
        { key: 'Blade composition', value: 'Self-Sharpening Stainless Steel Blades' },
        { key: 'Battery run-time', value: ['60 Minutes', '90 Minutes', '120 Minutes'][variantIndex % 3] }
      ];
    case 'Makeup':
    case 'NailCare':
      return [
        { key: 'Shade / Color tone', value: ['Nude Coral', 'Crimson Red', 'Classic Pink', 'Midnight Mauve', 'Gloss Transparent'][variantIndex % 5] },
        { key: 'Cruelty-Free Status', value: 'Yes (100% PETA Certified Vegan)' }
      ];
    default:
      return [{ key: 'Quality Standard', value: 'Premium Grade Quality' }];
  }
};

// Main generator method producing exactly 2000 products:
// 5 categories * 8 subcategories * 50 products = 2000 total items
export const generateAllProducts = () => {
  const categoriesDefinition = [
    {
      categoryName: 'Electronics',
      subcategories: [
        {
          name: 'Smartphones',
          brands: ['Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi'],
          baseItems: [
            { name: 'iPhone 15 Pro', desc: 'Sleek lightweight titanium construction carrying the raw performance of A17 Pro chip and immersive dynamic island notifications.', price: 134900 },
            { name: 'Galaxy S24 Ultra', desc: 'Powerful workhorse running computational Galaxy AI, 200MP zoom camera, Snapdragon 8 Gen 3, and integrated S-Pen stylus.', price: 129900 },
            { name: 'OnePlus 12 Flagship', desc: 'High-speed flagship smartphone featuring Hasselblad cameras, crystal 2K AMOLED screen, and ultra 100W flash charging.', price: 64999 },
            { name: 'Pixel 8 Pro AI', desc: 'Pure smart smartphone engineered by Google, backed by intelligent Tensor G3 and advanced photography capabilities.', price: 109999 },
            { name: 'Redmi Note 13 Pro Plus', desc: 'Excellent mid-range flagship phone highlighted by curved 1.5K AMOLED screen, 200MP camera, and rapid 120W charging.', price: 31999 }
          ]
        },
        {
          name: 'Laptops',
          brands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
          baseItems: [
            { name: 'MacBook Air M3', desc: 'Stunningly slim design with standard silent operation, M3 CPU power, and long 18H battery capability.', price: 114900 },
            { name: 'Dell XPS 13 Ultrabook', desc: 'Premium InfinityEdge almost borderless visual screen, Intel Core i7 processor, and beautiful silver aluminum casing.', price: 124900 },
            { name: 'HP Pavilion 15', desc: 'Reliable multi-tasking companion with AMD Ryzen 7 processor, high-speed SSD storage, and micro-edge screen.', price: 68900 },
            { name: 'Lenovo ThinkPad X1', desc: 'Durable carbon-fiber enterprise computer housing the legendary tactile keyboard, high-security features, and robust battery.', price: 154900 },
            { name: 'Asus ROG Zephyrus G14', desc: 'Premium gaming powerhouse configured with high refresh display, AMD Ryzen 9, and Nvidia RTX 4060 graphics cards.', price: 139900 }
          ]
        },
        {
          name: 'Audio',
          brands: ['Sony', 'boAt', 'JBL', 'Sennheiser', 'OnePlus'],
          baseItems: [
            { name: 'WH-1000XM5 ANC Headphones', desc: 'Overhead smart wireless headphones packing best-in-class active noise cancellation and crystal-clear sound quality.', price: 29990 },
            { name: 'Rockerz 450 Wireless Headset', desc: 'Ergonomic comfortable design running deep 40mm dynamic drivers, padded earcups, and robust 15 hours battery.', price: 3990 },
            { name: 'JBL Tune 760NC Headphones', desc: 'Deep signature JBL Pure Bass audio with wireless active noise cancellation in a convenient folding frame.', price: 7999 },
            { name: 'HD 450SE Bluetooth Headphones', desc: 'Immersive sound quality offering advanced digital codecs, Active NC, and quick access voice assistant control buttons.', price: 14990 },
            { name: 'Buds Pro 2 Spatial Earbuds', desc: 'High-fidelity audio spatial sound, smart adaptive noise cancellation, and comfortable secure-fit silicone tips.', price: 11999 }
          ]
        },
        {
          name: 'Smartwatches',
          brands: ['Apple', 'Samsung', 'Fitbit', 'boAt', 'Noise'],
          baseItems: [
            { name: 'Watch Series 9 GPS', desc: 'Always-On premium Retina display, critical health analytics sensors, crash detection, and smart double tap gesture control.', price: 41900 },
            { name: 'Galaxy Watch 6 Classic', desc: 'Premium rotating bezel, customized sleep coaching software, active heart rate monitoring, and rugged metal casing.', price: 29999 },
            { name: 'Fitbit Charge 6 Tracker', desc: 'Slim fitness band containing integrated GPS, continuous activity tracker, stress analytics, and heart rate monitor.', price: 14999 },
            { name: 'Wave Sigma Smart Watch', desc: 'Budget-friendly large crisp display watch offering convenient Bluetooth calling, active sports modes, and long battery.', price: 4999 },
            { name: 'ColorFit Pro 5 AMOLED', desc: 'Vibrant color AMOLED visual panel, premium alloy metal casing, customizable dials, and active health tracker suite.', price: 5999 }
          ]
        },
        {
          name: 'Chargers',
          brands: ['Anker', 'Portronics', 'Mi', 'Belkin', 'Ambrane'],
          baseItems: [
            { name: '65W GaN Fast Charger', desc: 'Next-gen Gallium Nitride technology packing extreme fast charging for laptops and smartphones in a compact pocket size.', price: 2999 },
            { name: '20W USB-C Power Adapter', desc: 'Fast power adapter designed for quick juice ups, certified safe multi-protection technology for standard device health.', price: 999 },
            { name: '3-in-1 Wireless Charging Dock', desc: 'Clean desk space-saving charger capable of wireless fast charging smartphones, watch, and compatible earbuds simultaneously.', price: 3999 },
            { name: 'Adapto 22.5W Charger Adapter', desc: 'Dual-port USB fast charger with intelligent power distribution, protecting against over-current and heat surges.', price: 799 },
            { name: 'Type-C Braided Fast Charging Cable', desc: 'Ultra-durable nylon braided cable supporting high current delivery and rapid data transmission, 1.5m standard length.', price: 499 }
          ]
        },
        {
          name: 'PowerBanks',
          brands: ['Anker', 'Ambrane', 'Mi', 'Urbn', 'Portronics'],
          baseItems: [
            { name: '20000mAh Power Delivery Powerbank', desc: 'High-density heavy battery backup supporting fast charging protocols, dual input/output ports for multi device utility.', price: 2499 },
            { name: '10000mAh Ultra-Slim Powerbank', desc: 'Pocketable lightweight design, premium matte metal outer shell, safe lithium-polymer battery cells with smart indicators.', price: 1299 },
            { name: '15W Magnetic Wireless Powerbank', desc: 'Snap on wireless charging bank matching magnetic ring standard, compact design for easy handling during phone use.', price: 3499 },
            { name: '30000mAh Heavy Duty Powerbank', desc: 'Massive capacity battery bank perfect for trekking and long travel, supporting multiple simultaneous charges.', price: 4499 },
            { name: 'PowerPort 10W Mini Powerbank', desc: 'Compact emergency battery charger, convenient keychain hook design, single output port for instant top-ups.', price: 899 }
          ]
        },
        {
          name: 'ComputerAccessories',
          brands: ['Logitech', 'Dell', 'HP', 'Lenovo', 'Zebronics'],
          baseItems: [
            { name: 'MX Master 3S Wireless Mouse', desc: 'Top ergonomics high precision mouse featuring smart scroll wheel, silent click switches, and multi-computer flow control.', price: 9995 },
            { name: 'Mechanical Wired Keyboard', desc: 'Tactile blue switches providing satisfying typing audio click feedback, customizable RGB backlighting, and heavy-duty frame.', price: 3499 },
            { name: 'Pro Stream 1080p Webcam', desc: 'Crisp Full HD webcam with integrated dual noise-reducing microphones, light correction, and privacy slide shutter.', price: 4999 },
            { name: 'Wireless Silent Keyboard Mouse Combo', desc: 'Clean desk space-saving low profile keyboard and silent click mouse operating on a single high-speed USB dongle.', price: 2499 },
            { name: '7-in-1 Multi USB-C Hub adapter', desc: 'Expand laptop connectivity instantly with HDMI 4K output, high speed USB 3.0 ports, and SD card reader slots.', price: 1999 }
          ]
        },
        {
          name: 'Storage',
          brands: ['SanDisk', 'Kingston', 'Samsung', 'Crucial', 'HP'],
          baseItems: [
            { name: 'Ultra Fit USB 3.2 Pen Drive', desc: 'Ultra-small low profile flash drive providing fast read speeds up to 150MB/s, secure password file protection vault.', price: 899 },
            { name: 'T7 Portable External SSD', desc: 'Supercharged shock-resistant external solid state drive delivering blazing fast transfer rates up to 1050MB/s.', price: 9999 },
            { name: 'Extreme MicroSDXC Memory Card', desc: 'High-speed storage card perfect for action cameras, smartphones, and 4K video recording, Class 10 certified.', price: 1499 },
            { name: 'Crucial BX500 Internal SSD', desc: 'Upgrade laptop performance with reliable internal 2.5 inch SATA solid state drive, running advanced boot speeds.', price: 4299 },
            { name: 'Dual OTG Drive Luxe Type-C', desc: 'All-metal 2-in-1 flash drive featuring reversible USB Type-C and traditional Type-A connectors for easy file swap.', price: 1599 }
          ]
        }
      ]
    },
    {
      categoryName: 'Fashion',
      subcategories: [
        {
          name: 'MensApparel',
          brands: ["Levi's", "U.S. Polo Assn.", "Tommy Hilfiger", "Jack & Jones", "Roadster"],
          baseItems: [
            { name: '511 Slim Stretch Jeans', desc: 'Classic modern denim pants tailored with a slim fit. Premium stretch fabric for comfortable all-day durability.', price: 4299 },
            { name: 'Pique Cotton Polo T-Shirt', desc: 'Timeless casual wear featuring the signature brand logo, comfortable ribbed polo neck, and regular breathable fit.', price: 1999 },
            { name: 'Casual Linen Long Sleeve Shirt', desc: 'Lightweight linen fabric shirt styled with a button-down collar, round hem, and comfortable relaxed sleeves.', price: 2999 },
            { name: 'Original Denim Trucker Jacket', desc: 'Classic rugged layering piece crafted with high-durability rigid cotton denim, standard chest pockets, and button tabs.', price: 4999 },
            { name: 'Cotton Fleece Casual Sweatshirt', desc: 'Ultra-soft fleece sweat top detailed with ribbed crew neck, snug cuffs, and minimal aesthetic front logo print.', price: 2499 }
          ]
        },
        {
          name: 'WomensApparel',
          brands: ['Zara', 'H&M', 'Only', 'Vero Moda', 'Biba'],
          baseItems: [
            { name: 'Floral Flare Summer Dress', desc: 'Beautiful flowy georgette midi dress featuring a romantic V-neck, comfortable cinched waist, and elegant flared sleeves.', price: 3999 },
            { name: 'High-Rise Skinny Denim Jeans', desc: 'Super-stretch shape retaining denim pants designed to contour beautifully while ensuring comfortable flexibility.', price: 2999 },
            { name: 'Chunky Knit Oversized Sweater', desc: 'Cozy relaxed fit knitted sweater styled with dropped shoulders, warm acrylic wool, and ribbed cuffs.', price: 2499 },
            { name: 'Anarkali Festive Printed Kurta', desc: 'Intricate ethnic printed cotton flared kurta detailed with gorgeous gold accents, ideal for wedding and festive occasions.', price: 3499 },
            { name: 'Elegant Satin Office Blouse', desc: 'High-quality smooth satin fabric top featuring an elegant band collar, front pleats, and cuffed long sleeves.', price: 1999 }
          ]
        },
        {
          name: 'Footwear',
          brands: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Bata'],
          baseItems: [
            { name: 'Air Max Athletic Running Shoes', desc: 'Engineered mesh fabric upper, signature responsive air unit cushioning, and heavy-duty waffle rubber grip sole.', price: 9999 },
            { name: 'Ultraboost Responsive Sneakers', desc: 'High energy-return boost cushion midsole, snug knit upper foot wrap, and durable flexible stretchweb traction.', price: 14999 },
            { name: 'Classic Smash Leather Sneakers', desc: 'Retro tennis-inspired minimal shoes styled with a clean synthetic leather upper, padded collar, and durable cupsole.', price: 4999 },
            { name: 'Genuine Derby Dress Shoes', desc: 'Handcrafted premium full-grain leather formal dress shoes detailed with a round toe and cushioned leather insoles.', price: 3999 },
            { name: 'Floatride Workout Trainer Shoes', desc: 'Featherlight athletic training shoes engineered with dense foam cushion, supporting intense gym workouts.', price: 7999 }
          ]
        },
        {
          name: 'Watches',
          brands: ['Fossil', 'Casio', 'Titan', 'Tommy Hilfiger', 'Daniel Wellington'],
          baseItems: [
            { name: 'Minimalist Slim Analog Watch', desc: 'Gorgeous ultra-thin luxury watch styled with a clean dial, classic indices, and comfortable premium leather strap.', price: 8995 },
            { name: 'Edifice Multi-Dial Chronograph', desc: 'Robust sporty analog watch featuring high-precision stopwatch dials, stainless steel bezel, and water resistance.', price: 12995 },
            { name: 'Vintage Digital Steel Watch', desc: 'Iconic retro design Casio timepiece featuring daily alarm, auto calendar, amber backlighting, and metal link band.', price: 2995 },
            { name: 'Smart Hybrid Smartwatch', desc: 'Classic mechanical hands hiding a smart digital display for step counting, heart analytics, and phone notifications.', price: 14999 },
            { name: 'Classy Gold Chain Watch', desc: 'Feminine designer watch accented with crystal indices, luxury gold plated link strap, and secure jewelry clasp.', price: 9999 }
          ]
        },
        {
          name: 'Sunglasses',
          brands: ['Ray-Ban', 'Fastrack', 'Vincent Chase', 'Oakley', 'Polaroid'],
          baseItems: [
            { name: 'Aviator Classic Sunglasses', desc: 'Iconic pilot metal wire sunglasses featuring classic G-15 mineral glass lenses with 100% UV solar protection.', price: 8990 },
            { name: 'Wayfarer Sporty Sunglasses', desc: 'Chunky casual polycarbonate frames featuring polarized lenses that cut glare off water and reflective surfaces.', price: 1990 },
            { name: 'Clubmaster Retro Sunglasses', desc: 'Half-rim vintage design sunglasses highlighted by golden metallic bridges and dark protective lenses.', price: 2990 },
            { name: 'Hexagonal Modern Sunglasses', desc: 'Trendy geometric thin metal frame sunglasses suited for contemporary styling, lightweight nose pads.', price: 3490 },
            { name: 'Rectangle Minimal Sunglasses', desc: 'Slim rectangular sunglasses perfect for daily commuting, highly durable impact-resistant frame build.', price: 1290 }
          ]
        },
        {
          name: 'Bags',
          brands: ['Baggit', 'Caprese', 'American Tourister', 'Skybags', 'Wildcraft'],
          baseItems: [
            { name: 'Structured Faux Leather Tote', desc: 'Spacious womens handbag styled with double handles, secure main zipper, and organized interior pockets.', price: 2990 },
            { name: 'Casual Collage School Backpack', desc: 'Lightweight travel backpack featuring triple zipper chambers, side mesh bottles holders, and padded shoulders.', price: 1890 },
            { name: 'Hardshell Cabin Luggage Bag', desc: 'Highly durable polycarbonate hard case suitcase, featuring 360 spinner wheels and integrated TSA lock.', price: 5999 },
            { name: 'Designer Crossbody Sling Bag', desc: 'Compact stylish evening purse with long adjustable metallic chain strap and front metallic lock clasp.', price: 1990 },
            { name: 'Rugged Outdoor Trekking Backpack', desc: 'Ergonomic heavy-duty camping rucksack designed with rain cover, sleeping bag loops, and robust hip belt support.', price: 3490 }
          ]
        },
        {
          name: 'WalletsBelts',
          brands: ['Wildhorn', 'Tommy Hilfiger', "Levi's", 'Fossil', 'Allen Solly'],
          baseItems: [
            { name: 'Bifold Genuine Leather Wallet', desc: 'Slim leather men\'s wallet with multiple card slots, easy currency chambers, and integrated RFID block shield.', price: 999 },
            { name: 'Reversible Leather Dress Belt', desc: 'Smart vegetable-tanned leather belt featuring a swiveling metallic buckle, ideal for brown or black dress matching.', price: 1299 },
            { name: 'Genuine Leather Gift Set', desc: 'Premium gift box containing a matched textured leather wallet and matching leather belt with heavy metal buckle.', price: 2499 },
            { name: 'Card Holder Slim Wallet', desc: 'Ultra-thin card sleeve designed with front quick access pull tab, ideal for cards and folded bills.', price: 699 },
            { name: 'Braided Canvas Casual Belt', desc: 'Stretchy woven canvas webbing belt detailed with leather trims and silver pin buckle, perfect for jeans.', price: 799 }
          ]
        },
        {
          name: 'KidsWear',
          brands: ['H&M', 'Max', 'U.S. Polo Assn. Kids', 'Mothercare', 'Gini & Jony'],
          baseItems: [
            { name: 'Cotton Printed Romper Set', desc: 'Pack of 3 ultra-soft organic cotton onesies featuring quick snap buttons for easy infant diaper change.', price: 1299 },
            { name: 'Denim Dungaree Set', desc: 'Classic denim overall dungarees paired with a comfortable striped cotton knit t-shirt, cute casual style.', price: 1999 },
            { name: 'Floral Girls Cotton Frock', desc: 'Breathable flared cotton summer frock decorated with cute sash bow tie, round neck, and back zip closure.', price: 1499 },
            { name: 'Boys Hooded Jacket Jeans Suit', desc: 'Trendy warm zip-up fleece hoodie paired with matching stretch denim jeans, ideal for active winter play.', price: 2499 },
            { name: 'Soft Knit Kids Pyjama Pack', desc: 'Set of 2 printed active lounge pants fitted with soft elastic drawcord waistbands, gentle on delicate skin.', price: 899 }
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
            { name: '4.2L Digital Air Fryer', desc: 'Cook delicious meals using Rapid Air technology with up to 90% less oil. Touch screen panel with presets.', price: 9999 },
            { name: '750W Mixer Grinder 3 Jars', desc: 'Heavy-duty commercial motor accompanied by three premium stainless steel liquidizing and dry grinding jars.', price: 4599 },
            { name: 'Smart Induction Cooktop', desc: 'Fast energy saving induction cooktop configured with preset Indian menus, automatic safety off, and cool panel.', price: 3499 },
            { name: 'Electric Kettle 1.8L', desc: 'Cordless rapid boil kettle designed with robust food-grade steel, auto shut-off, and boil-dry safety sensors.', price: 1999 },
            { name: 'Cold Press Slow Juicer', desc: 'Nutrient retaining masticating slow juicer extracting rich pulp-free juice from fruits and leafy greens.', price: 11999 }
          ]
        },
        {
          name: 'Cookware',
          brands: ['Borosil', 'Prestige', 'Wonderchef', 'Milton', 'Cello'],
          baseItems: [
            { name: 'Non-Stick Cookware 3pc Set', desc: 'Premium induction friendly fry pan, flat tawa, and deep kadhai with glass lid, PFOA-free coating.', price: 3999 },
            { name: 'Glass Leakproof Lunchbox Set', desc: 'Set of 3 leakproof borosilicate glass containers, safe for microwave oven reheating, convenient carry sleeve bag.', price: 1499 },
            { name: 'Thermosteel Insulated Bottle', desc: 'Double-walled vacuum insulated stainless steel flask that retains hot or cold liquid temperatures for 24 hours.', price: 1299 },
            { name: 'Hard Anodized Pressure Cooker 5L', desc: 'Highly durable heavy-gauge pressure cooker equipped with inner-fitting lid and heatproof safety handles.', price: 2999 },
            { name: 'Granite Cookware Frying Pan', desc: 'Healthy non-stick granite coating pan, thick die-cast aluminum core, comfortable wood-texture handles.', price: 1899 }
          ]
        },
        {
          name: 'HomeDecor',
          brands: ['Solimo', 'IKEA', 'Home Centre', 'Deco Window', 'ExclusiveLane'],
          baseItems: [
            { name: 'Teakwood Compact Coffee Table', desc: 'Sturdy solid hardwood table showing elegant natural grains, minimalist clean square lines for living room.', price: 5999 },
            { name: 'Memory Foam Posture Pillow', desc: 'Orthopedic memory foam pillow that aligns neck structure, reducing muscle strain during sleep.', price: 1299 },
            { name: 'Blackout Window Curtains (Pair)', desc: 'Thick triple-weave room darkening draperies blocking out 90% of solar heat and sunlight, metal grommets.', price: 1999 },
            { name: 'Metal Multi-Tier Shoe Shelf', desc: 'Robust anti-corrosive metal frame shoe storage rack capable of organizing up to 15 pairs of footwear.', price: 1599 },
            { name: 'Minimalist Desk Study Lamp', desc: 'Sleek metal reading lamp designed with a highly flexible gooseneck arm, providing focused study light.', price: 1499 }
          ]
        },
        {
          name: 'SmartHome',
          brands: ['Dyson', 'Eufy', 'Xiaomi', 'Philips', 'realme'],
          baseItems: [
            { name: 'Cordless Vacuum Cleaner', desc: 'Exceptional suction powered by high-speed digital motor, intelligent dust detection laser, and LCD screen.', price: 49900 },
            { name: 'HEPA H13 Smart Air Purifier', desc: 'Cylindrical filtration capturing 99.97% of PM2.5 particles, real-time air indicator display, and smart app control.', price: 12999 },
            { name: 'Robotic Vacuum Cleaner', desc: 'Smart autonomous vacuum cleaner navigating obstacles, automatic recharging, and smart Alexa voice commands.', price: 19999 },
            { name: 'WiFi Smart Bulb 9W B22', desc: 'Vibrant color changing light bulb supporting 16 million colors, dimming scheduling, and voice assistant sync.', price: 999 },
            { name: '360 Home Security Camera', desc: 'Full HD 1080p indoor pan-tilt security camera packing high infrared night vision and AI human motion alerts.', price: 2999 }
          ]
        },
        {
          name: 'Furniture',
          brands: ['Solimo', 'IKEA', 'DeckUp', 'Bluewud', 'Urban Cart'],
          baseItems: [
            { name: 'Engineered Wood TV Unit', desc: 'Modern TV entertainment console featuring storage cabinets, open shelves, and clean cable management slots.', price: 4999 },
            { name: 'Ergonomic Executive Office Chair', desc: 'Comfortable mesh high back chair detailed with adjustable lumbar support, 2D armrests, and robust gas lift.', price: 7999 },
            { name: '4-Tier Wooden Bookshelf', desc: 'Sturdy spacious vertical bookcase made of premium engineered wood, ideal for study rooms and libraries.', price: 3499 },
            { name: 'Foldable Wooden Study Table', desc: 'Space-saving study desk featuring a robust metal frame structure and high-quality wooden top plate.', price: 2499 },
            { name: '3-Door Large Wardrobe Closet', desc: 'Spacious clothing cupboard engineered with hanging rods, deep drawer chest, and lockable safety mirror door.', price: 14999 }
          ]
        },
        {
          name: 'Bedding',
          brands: ['Sleepwell', 'Solimo', 'Portico New York', 'Bombay Dyeing', 'Spaces'],
          baseItems: [
            { name: 'Cotton Double Bedsheet 300TC', desc: 'Luxuriously soft premium cotton sheet set matching two print pillow covers, smooth breathable texture.', price: 1899 },
            { name: 'Orthopedic Mattress Protector', desc: '100% waterproof terry cotton bed topper keeping mattresses safe from liquid spills, snug elastic fit.', price: 1199 },
            { name: 'Warm All-Season Microfiber Comforter', desc: 'Fluffy quilted dual-toned heavy duvet keeping you snug in air-conditioning and light winter climates.', price: 2299 },
            { name: 'Memory Foam Mattress Topper', desc: 'Add luxurious contouring comfort to old mattresses with high-density pressure-relieving foam layer.', price: 5499 },
            { name: 'Cotton Bath Towel Set (2 Pack)', desc: 'Heavy absorbency quick-dry combed cotton towels, highly durable ringspun weave for hotel luxury.', price: 999 }
          ]
        },
        {
          name: 'Tableware',
          brands: ['Borosil', 'Milton', 'Cello', 'La Opala', 'Corelle'],
          baseItems: [
            { name: 'Opalware Dinner Set 33pc', desc: 'Break-resistant elegant white opal glass dining set decorated with royal floral borders, microwave safe.', price: 3499 },
            { name: 'Borosilicate Glass Tumbler Pack', desc: 'Set of 6 lightweight double-walled clear glass tumblers perfect for serving hot tea or cold beverages.', price: 899 },
            { name: 'Stainless Steel Dinner Plates', desc: 'Pack of 6 rust-resistant premium steel thali plates, highly durable and ideal for everyday family dining.', price: 1499 },
            { name: 'Ceramic Serving Bowl Set', desc: 'Set of 3 handpainted ceramic pots with matching lids, adding classic artisan texture to your table.', price: 1299 },
            { name: 'Elegant Cutlery Set 24pc', desc: 'Stainless steel spoons, forks, and butter knives styled with a sleek mirror finish, convenient stand rack.', price: 999 }
          ]
        },
        {
          name: 'StorageOrganizers',
          brands: ['Solimo', 'IKEA', 'Cello', 'Signoraware', 'AmazonBasics'],
          baseItems: [
            { name: 'Plastic Modular Drawer Cabinet', desc: 'Sturdy 4-drawer modular desktop storage chest perfect for kids toys, cosmetics, and small office stationery.', price: 1599 },
            { name: 'Fabric Underbed Storage Bag', desc: 'Pack of 3 breathable non-woven clothes bags styled with transparent window panels and double zippers.', price: 999 },
            { name: 'Airtight Kitchen Container Set', desc: 'Set of 12 BPA-free plastic food dry jars with easy-open locking lids, ideal for pulses, sugar, and grains.', price: 1299 },
            { name: 'Bamboo Wooden Laundry Basket', desc: 'Natural sustainable wood hamper lined with a washable canvas fabric bag, space-saving foldable design.', price: 1799 },
            { name: 'Wall Mounted Key Holder Box', desc: 'Wooden key hooks organizer board featuring an integrated mail letter shelf, convenient entry wall mounts.', price: 499 }
          ]
        }
      ]
    },
    {
      categoryName: 'Books',
      subcategories: [
        {
          name: 'Fiction',
          brands: ['Penguin', 'HarperCollins', 'Bloomsbury', 'Vintage', 'Picador'],
          baseItems: [
            { name: 'The Alchemist Novel', desc: 'The magical bestseller telling the symbolic tale of Santiago, an Andalusian shepherd boy searching for treasure.', price: 399 },
            { name: 'To Kill a Mockingbird Book', desc: 'Pulitzer Prize-winning literary classic exploring racial divides, justice, and loss of innocence in southern America.', price: 499 },
            { name: '1984 Dystopian Classic', desc: 'Terrifyingly prophetic political narrative about surveillance, government manipulation, and absolute control.', price: 599 },
            { name: 'The Midnight Library novel', desc: 'Heartwarming fiction detailing Nora Seed who finds herself inside a magical library showing possible lives.', price: 450 },
            { name: 'Normal People Paperback', desc: 'Sally Rooney\'s modern romantic novel detailing the magnetic draw between two friends across different social circles.', price: 499 }
          ]
        },
        {
          name: 'SelfHelp',
          brands: ['Penguin Publishing', 'Simon & Schuster', 'O\'Reilly', 'Harper Business', 'Crown'],
          baseItems: [
            { name: 'Atomic Habits guide', desc: 'Clear guidelines detailing tiny habit changes that compile into monumental life transformations, using behavioral science.', price: 799 },
            { name: 'Rich Dad Poor Dad book', desc: 'Iconic guide detailing financial literacy, building investment assets, and breaking free from corporate rat races.', price: 499 },
            { name: 'The Psychology of Money book', desc: 'Fascinating collection of short stories exploring the human thoughts, greed, and behaviors driving wealth creation.', price: 599 },
            { name: 'Deep Work focus rules', desc: 'Practical habits to cultivate deep uninterrupted concentration to yield exceptional career cognitive results.', price: 650 },
            { name: 'How to Win Friends manual', desc: 'Timeless interpersonal classic providing easy advice to build strong trust, leadership, and influence.', price: 399 }
          ]
        },
        {
          name: 'Biographies',
          brands: ['Penguin', 'Vintage', 'Random House', 'Hodder & Stoughton', 'Little Brown'],
          baseItems: [
            { name: 'Steve Jobs Biography', desc: 'Intimate exclusive biography detailing the creative technology visionary, compiled through years of personal interviews.', price: 999 },
            { name: 'Sapiens Brief History', desc: 'Sweeping historic analysis charting the evolution of humankind from ancient stone age to modern computational era.', price: 899 },
            { name: 'Elon Musk: Isaacson', desc: 'Intimate profiling detailing the intense childhood, extreme drives, and grand space exploration visions of the tech mogul.', price: 1199 },
            { name: 'Anne Frank: Diary of a Girl', desc: 'Deeply personal historic diaries written while hiding from Nazi forces in an Amsterdam secret annex.', price: 399 },
            { name: 'Wings of Fire: Kalam', desc: 'Inspiring life history of India\'s beloved President Dr. Kalam, mapping his rise from a modest town.', price: 450 }
          ]
        },
        {
          name: 'SciFi',
          brands: ['HarperCollins', 'Orbit', 'Del Rey', 'Tor Books', 'Gollancz'],
          baseItems: [
            { name: 'Dune Space Opera', desc: 'Monumental science fiction epic detailing planetary political control over the resource-rich desert planet Arrakis.', price: 999 },
            { name: 'Project Hail Mary thriller', desc: 'High-stakes space survival tale about a lone surviving astronaut trying to save humanity from stellar doom.', price: 799 },
            { name: 'Neuromancer Cyberspace', desc: 'Hugo Award-winning novel that established virtual reality matrix, cybernetics, and computer hacking fiction.', price: 599 },
            { name: 'Foundation galactic empire', desc: 'Isaac Asimov\'s grand saga outlining a massive mathematical project designed to reduce galactic dark ages.', price: 499 },
            { name: 'Hitchhikers Guide to Galaxy', desc: 'Hilarious satirical cosmic journey detailing Arthur Dent who escapes Earth with an alien travel guide.', price: 450 }
          ]
        },
        {
          name: 'MysteryThriller',
          brands: ['Penguin', 'HarperCollins', 'Orion', 'Macmillan', 'Bantam'],
          baseItems: [
            { name: 'The Da Vinci Code', desc: 'High-speed historical mystery following symbolologist Robert Langdon tracking secret clues hidden in art.', price: 599 },
            { name: 'Gone Girl Paperback', desc: '心理 Thriller masterpiece detailing the mysterious disappearance of Amy Dunne and the media storm around her husband.', price: 499 },
            { name: 'The Silent Patient', desc: 'Intriguing psychological thriller investigating a woman who shoots her husband and never speaks another word.', price: 450 },
            { name: 'And Then There Were None', desc: 'Agatha Christie\'s legendary locked-room murder mystery where ten strangers are invited to an isolated island.', price: 399 },
            { name: 'Sherlock Holmes Complete', desc: 'The entire collection of short detective cases detailing the deduction methods of the famous Baker Street detective.', price: 899 }
          ]
        },
        {
          name: 'ChildrenBooks',
          brands: ['Scholastic', 'Puffin', 'HarperCollins Childrens', 'Disney', 'Ladybird'],
          baseItems: [
            { name: 'Harry Potter and Sorcerers Stone', desc: 'Introduce young readers to Hogwarts, detailing Harry\'s first year of magical learning and friendships.', price: 699 },
            { name: 'The Very Hungry Caterpillar', desc: 'Beautifully illustrated board book following a caterpillar eating through foods, classic child learning.', price: 399 },
            { name: 'Charlotte\'s Web Paperback', desc: 'Heartwarming kids tale detailing a pig named Wilbur and his brilliant spider friend Charlotte who saves him.', price: 299 },
            { name: 'Percy Jackson & Lightning Thief', desc: 'Thrilling mythological adventure following a young boy who discovers he is a modern demigod son of Poseidon.', price: 499 },
            { name: 'Grimm\'s Fairy Tales Illustrated', desc: 'Timeless collection of classic European fables including Cinderella, Hansel & Gretel, and Snow White.', price: 599 }
          ]
        },
        {
          name: 'AcademicTech',
          brands: ['O\'Reilly', 'McGraw Hill', 'Pearson', 'Oxford', 'Wiley'],
          baseItems: [
            { name: 'JavaScript: The Definitive Guide', desc: 'The ultimate programmer bible detailing JavaScript syntax, DOM manipulation, APIs, and modern ES6 standards.', price: 1499 },
            { name: 'Introduction to Algorithms CLRS', desc: 'Essential academic computer science textbook detailing sorting, search, graphs, and complex data structures.', price: 1299 },
            { name: 'Clean Code: Agile Software', desc: 'Robert C. Martin\'s guidelines on writing highly readable, maintainable, and robust program architecture.', price: 999 },
            { name: 'Concepts of Physics HC Verma', desc: 'Legendary Indian textbook detailing core physics mechanics, thermodynamics, and optics equations.', price: 690 },
            { name: 'Design Patterns Elements GoF', desc: 'Crucial engineering reference detailing 23 repeatable software solutions to common OOP architecture struggles.', price: 1199 }
          ]
        },
        {
          name: 'PoetryDrama',
          brands: ['Penguin Classics', 'Faber & Faber', 'Bloodaxe', 'Oxford', 'Yale'],
          baseItems: [
            { name: 'Shakespeare: Complete Works', desc: 'Anthology containing all iconic plays, sonnets, and tragic dramas like Hamlet, Macbeth, and Romeo & Juliet.', price: 999 },
            { name: 'Milk and Honey Rupi Kaur', desc: 'Contemporary minimalist poetry collection exploring themes of love, loss, trauma, healing, and femininity.', price: 399 },
            { name: 'The Odyssey of Homer', desc: 'Epic ancient Greek classic detailing Odysseus\' legendary ten-year voyage back home after the fall of Troy.', price: 499 },
            { name: 'Selected Poems: T.S. Eliot', desc: 'Modernist poetry masterpieces including the Waste Land, Prufrock, and other cerebral structural verses.', price: 450 },
            { name: 'Gitanjali: Song Offerings', desc: 'Rabindranath Tagore\'s Nobel prize-winning beautiful collection of spiritual and patriotic poetry.', price: 299 }
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
            { name: 'Gentle Facial Cleanser', desc: 'Recommended hydrating cleanser that cleanses and soothes sensitive dry skin without washing away oils.', price: 499 },
            { name: 'Dry Touch Sunscreen SPF50', desc: 'Broad spectrum matte-finish facial sun blocker, highly sweat-resistant and lightweight on skin.', price: 675 },
            { name: '1.5% Hyaluronic Acid Serum', desc: 'Highly concentrated hydrator serum that locks in moisture, leaving skin looking plump and glowing.', price: 999 },
            { name: 'Vitamin C Bright Face Wash', desc: 'Enriched with natural Vitamin C and glow extracts to clarify complexion and wash away dead cells.', price: 349 },
            { name: 'Green Tea Clean Toner', desc: 'Refreshing alcohol-free facial toner designed to minimize large pores and control excess forehead oils.', price: 390 }
          ]
        },
        {
          name: 'Haircare',
          brands: ['L\'Oreal', 'Tresemme', 'Mamaearth', 'WOW Skin Science', 'Garnier'],
          baseItems: [
            { name: 'Total Repair Damage Shampoo', desc: 'Advanced formula combating dryness, roughness, split ends, and hair fall by reinforcing hair fibers.', price: 450 },
            { name: 'Keratin Smooth Protein Conditioner', desc: 'Infused with active keratin proteins to tame dry frizzy hair, leaving it silky straight for 3 days.', price: 499 },
            { name: 'Onion Redensyl Hair Oil', desc: 'Aromatic non-sticky oil that strengthens roots, prevents styling damage, and encourages natural hair growth.', price: 399 },
            { name: 'Apple Cider Vinegar Shampoo', desc: 'Deeply cleanses chemical styling build-up, balances scalp pH, and boosts hair bounce and natural shine.', price: 499 },
            { name: 'Nourishing Hair Spa Mask', desc: 'Salon standard deep conditioning cream detailed with water lily extracts, nourishing dry follicles.', price: 699 }
          ]
        },
        {
          name: 'Fragrances',
          brands: ['Titan Skinn', 'Denver', 'Park Avenue', 'Axe', 'Fogg'],
          baseItems: [
            { name: 'Raw Eau De Parfum for Men', desc: 'Premium luxury perfume accented with fresh aquatic top notes, woody middle, and deep amber base.', price: 1895 },
            { name: 'Royal Fresh No-Gas Deodorant', desc: 'Effective long-lasting body spray featuring zero gas, maximizing spray count and sweat protection.', price: 299 },
            { name: 'Hamilton Signature Spray', desc: 'Rich cardamom and spicy leather blended masculine fragrance, ideal for evening parties and meetings.', price: 499 },
            { name: 'Voyage Citrus Body Spray', desc: 'Strong refreshing citrus and mint notes keeping you smelling clean during workouts and hot commutes.', price: 249 },
            { name: 'Celeste Sweet Perfume for Women', desc: 'Charming sweet fragrance combining fresh peaches, white jasmine bouquets, and base notes of vanilla.', price: 1895 }
          ]
        },
        {
          name: 'GroomingTools',
          brands: ['Philips', 'Braun', 'Nova', 'Syska', 'Havells'],
          baseItems: [
            { name: 'OneBlade Hybrid Face Trimmer', desc: 'Revolutionary electric blade shaving and styling tools, trims beard smoothly without cutting skin.', price: 2299 },
            { name: 'Cordless Steel Hair Clipper', desc: 'Professional level hair clipper housing high torque motor, multiple combs, and fast charging.', price: 1499 },
            { name: 'Series 3 Wet & Dry Shaver', desc: 'Close electric shaver featuring flexible foil heads that adjust to jawline contours, waterproof.', price: 3999 },
            { name: '1200W Foldable Hair Dryer', desc: 'Lightweight salon styling blow dryer featuring dual speed hot options and convenient travel folding arm.', price: 899 },
            { name: 'Keratin Ceramic Hair Straightener', desc: 'Quick heating plates with smooth ceramic coating that glides through hair strands without burning.', price: 1299 }
          ]
        },
        {
          name: 'Makeup',
          brands: ['Lakme', 'Maybelline', 'L\'Oreal', 'Colorbar', 'Sugar'],
          baseItems: [
            { name: 'Matte Liquid Lipstick', desc: 'Highly pigmented velvety liquid lip color that provides absolute 16-hour smudgeproof matte transfer.', price: 499 },
            { name: 'Waterproof Volumizing Mascara', desc: 'Gives lashes bold dramatic volume and length with a unique lash-doubling brush, clump-free formula.', price: 399 },
            { name: 'Matte Liquid Foundation SPF 20', desc: 'Ultra-blendable lightweight face makeup that matches Indian skin tones, providing a flawless poreless finish.', price: 599 },
            { name: 'Black Kajal Eye Definer', desc: 'Super black dermatologically tested kajal stick, smooth gel texture that stays smudgeproof for 24H.', price: 299 },
            { name: 'Glow Powder Face Highlighter', desc: 'Fine shimmery powder compact that catches the light, illuminating cheekbones and brow arches.', price: 450 }
          ]
        },
        {
          name: 'BathBody',
          brands: ['Nivea', 'Dettol', 'Dove', 'Pears', 'Fiama'],
          baseItems: [
            { name: 'Cocoa Butter Deep Moisture Lotion', desc: 'Intense dry skin body moisturizer enriched with cocoa butter and coconut oil, locks in moisture for 48H.', price: 399 },
            { name: 'Refreshing Peach Shower Gel', desc: 'Skin softening bubble body wash infused with natural peach extracts and gentle exfoliating beads.', price: 249 },
            { name: 'Nourishing Bathing Soap (Pack of 3)', desc: 'Contains 1/4 moisturizing cream to gently cleanse skin while leaving it touchably soft and smooth.', price: 199 },
            { name: 'Gentle Glycerin Pure Soap', desc: 'Hypoallergenic clear glycerin soap that keeps skin hydrated and prevents irritation, ideal for kids.', price: 149 },
            { name: 'Antibacterial Liquid Hand Wash', desc: 'Daily protective soap wash enriched with pine extracts, clinically tested to kill 99.9% of germs.', price: 120 }
          ]
        },
        {
          name: 'MensGrooming',
          brands: ['Beardo', 'The Man Company', 'Bombay Shaving Co', 'Gillette', 'Ustraa'],
          baseItems: [
            { name: 'Beard Growth Oil (Redensyl)', desc: 'Specifically formulated with Redensyl and natural oils to boost beard thickness, softness, and shine.', price: 399 },
            { name: 'Charcoal Deep Clean Face Wash', desc: 'Activated charcoal cleanser pulling out deep dust, pollution soot, and blackheads from male pores.', price: 299 },
            { name: 'Pre-Shave Styling Foam (Menthol)', desc: 'Thick rich protective lather infused with cool menthol, lubricating shaver blades for close shaves.', price: 199 },
            { name: 'Mach 3 Turbo Razor Shaver', desc: 'Legendary 3-blade manual razor featuring thinner turbo blades and long-lasting lubrication strip.', price: 349 },
            { name: 'Hair styling Clay Matte Hold', desc: 'Strong grip styling wax giving hair clean textured volume with a smart zero-shine matte look.', price: 399 }
          ]
        },
        {
          name: 'NailCare',
          brands: ['Lakme', 'Colorbar', 'Sugar', 'Nykaa', 'Faces Canada'],
          baseItems: [
            { name: 'Gel Stylist Premium Nail Polish', desc: 'Long-lasting high gloss gel nail lacquer delivering intense color payoff in a single smooth coat.', price: 299 },
            { name: 'Quick Clean Acetone-Free Remover', desc: 'Gentle nourishing nail paint wipes enriched with Vitamin E, prevents dry cuticles and nails.', price: 149 },
            { name: 'Nail Strength growth serum', desc: 'Nourishing base coat formula enriched with calcium to fortify brittle nails, preventing chipping.', price: 199 },
            { name: 'Fast Dry Clear Top Coat', desc: 'Glossy sealing top coat that dries in 60 seconds, extending manicure shine and protection.', price: 249 },
            { name: 'Glitter Shimmer Nail Lacquer', desc: 'Playful party nail polish loaded with dense reflective micro-glitter particles for stunning looks.', price: 199 }
          ]
        }
      ]
    }
  ];

  const generatedProductsList = [];

  // Loop through categories, subcategories and generate exactly 50 products for each
  categoriesDefinition.forEach((catObj) => {
    const categoryName = catObj.categoryName;

    catObj.subcategories.forEach((subcatObj) => {
      const subcatName = subcatObj.name;
      const brands = subcatObj.brands;
      const baseItems = subcatObj.baseItems;
      const imagesList = unsplashImages[subcatName] || unsplashImages['Smartphones'] || unsplashImages['BooksGeneral'];

      // Generate exactly 50 items per subcategory
      for (let i = 0; i < 50; i++) {
        // Pick base item and brand sequentially using modulo
        const baseItem = baseItems[i % baseItems.length];
        const brand = brands[i % brands.length];

        const variantNum = Math.floor(i / baseItems.length); // 0 to 9
        let nameSuffix = '';
        let priceMultiplier = 1.0;
        let imageIndex = (i + variantNum) % imagesList.length;

        // Apply dynamic variants to scale prices and generate completely unique product names
        if (categoryName === 'Electronics') {
          const colors = ['Titanium Gray', 'Ocean Blue', 'Midnight Black', 'Platinum Silver', 'Alpine Green'];
          const color = colors[i % colors.length];

          if (subcatName === 'Smartphones') {
            const storages = ['128GB', '256GB', '512GB', '1TB'];
            const storage = storages[variantNum % storages.length];
            nameSuffix = ` (${storage}, ${color})`;
            priceMultiplier = 1.0 + (variantNum * 0.12);
          } else if (subcatName === 'Laptops') {
            const specs = ['8GB/512GB SSD', '16GB/512GB SSD', '16GB/1TB SSD', '32GB/2TB SSD'];
            const spec = specs[variantNum % specs.length];
            nameSuffix = ` (${spec}, ${color})`;
            priceMultiplier = 1.0 + (variantNum * 0.18);
          } else if (subcatName === 'Storage') {
            const capacities = ['64GB', '128GB', '256GB', '512GB', '1TB'];
            nameSuffix = ` - ${capacities[variantNum % capacities.length]}`;
            priceMultiplier = 1.0 + (variantNum * 0.70);
          } else if (subcatName === 'Chargers' || subcatName === 'PowerBanks') {
            const features = ['Fast Charging', 'MagSafe Supported', 'GaN Compact', 'Multi-Port Pro'];
            nameSuffix = ` (${color}, ${features[variantNum % features.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.10);
          } else {
            nameSuffix = ` (${color} Edition)`;
            priceMultiplier = 1.0 + (variantNum * 0.05);
          }
        } else if (categoryName === 'Fashion') {
          const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
          const colors = ['Deep Navy', 'Jet Black', 'Crimson Red', 'Olive Green', 'Classic White'];
          const size = sizes[i % sizes.length];
          const color = colors[variantNum % colors.length];

          if (subcatName === 'Footwear') {
            const shoeSizes = ['UK 7', 'UK 8', 'UK 9', 'UK 10'];
            nameSuffix = ` (${color}, Size ${shoeSizes[variantNum % shoeSizes.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.02);
          } else {
            nameSuffix = ` (${color}, Size ${size})`;
            priceMultiplier = 1.0 + (variantNum * 0.04);
          }
        } else if (categoryName === 'Home & Kitchen') {
          if (subcatName === 'Cookware' || subcatName === 'Tableware') {
            const packSizes = ['2-Piece Set', '3-Piece Set', 'Set of 6', 'Family Dining Set'];
            nameSuffix = ` - ${packSizes[variantNum % packSizes.length]}`;
            priceMultiplier = 1.0 + (variantNum * 0.35);
          } else if (subcatName === 'Bedding') {
            const sheetSizes = ['Single Bed', 'Double Queen Bed', 'King Luxury Size'];
            nameSuffix = ` (${sheetSizes[variantNum % sheetSizes.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.40);
          } else if (subcatName === 'StorageOrganizers') {
            const capacities = ['Medium Size', 'Jumbo 30L', 'Super 60L Pack of 3'];
            nameSuffix = ` - ${capacities[variantNum % capacities.length]}`;
            priceMultiplier = 1.0 + (variantNum * 0.50);
          } else {
            const finishes = ['Classic Matte', 'Brushed Steel', 'Teak Wood Finish'];
            nameSuffix = ` (${finishes[variantNum % finishes.length]})`;
            priceMultiplier = 1.0 + (variantNum * 0.08);
          }
        } else if (categoryName === 'Books') {
          const conditions = ['Paperback', 'Hardcover Library Edition', 'Collector\'s Deluxe Boxset'];
          nameSuffix = ` (${conditions[variantNum % conditions.length]})`;
          priceMultiplier = 1.0 + (variantNum * 0.30);
        } else if (categoryName === 'Beauty') {
          const packSizes = ['50ml', '100ml', 'Combo Set', 'Family Saver Pack'];
          nameSuffix = ` (${packSizes[variantNum % packSizes.length]})`;
          priceMultiplier = 1.0 + (variantNum * 0.55);
        }

        const calculatedPrice = Math.round(baseItem.price * priceMultiplier);
        // Random discount between 10% and 35%, ensuring we do not violate constraints
        const discountPercentage = randomRange(10, 35, 0);
        const discountPrice = Math.round(calculatedPrice * (1 - discountPercentage / 100));

        const productName = `${brand} ${baseItem.name}${nameSuffix}`;
        const specs = getSpecsForSubcategory(subcatName, brand, baseItem.name, i);

        const product = {
          name: productName,
          brand: brand,
          category: categoryName,
          description: `${baseItem.desc} high-quality item, highly available on top e-commerce platforms like Amazon and Flipkart. Features premium grade material composition, robust performance standards, and complete brand warranty support.`,
          price: calculatedPrice,
          discountPrice: discountPrice,
          stock: randomRange(10, 150, 0),
          images: [
            imagesList[imageIndex],
            imagesList[(imageIndex + 1) % imagesList.length]
          ],
          rating: randomRange(3.8, 4.9, 1),
          specifications: specs
        };

        generatedProductsList.push(product);
      }
    });
  });

  return generatedProductsList;
};
