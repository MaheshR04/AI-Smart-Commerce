import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

const realProducts = [
  // Electronics
  {
    name: "Apple MacBook Pro M3 (14-inch, 8-Core CPU, 10-Core GPU, 8GB Unified Memory, 512GB SSD)",
    brand: "Apple",
    category: "Electronics",
    price: 169900,
    discountPrice: 154900,
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Apple MacBook Pro M3 is a powerhouse laptop featuring an 8-core CPU and 10-core GPU. It boasts a brilliant Liquid Retina XDR display, advanced camera and audio setup, and up to 22 hours of battery life. Ideal for creators and professionals. Cloned from Amazon Best Sellers.",
    rating: 4.8,
    specifications: [
      { key: "Processor", value: "Apple M3 Chip" },
      { key: "RAM", value: "8 GB Unified" },
      { key: "Storage Capacity", value: "512 GB SSD" },
      { key: "Display Size", value: "14.2 Inches" },
      { key: "Battery Life", value: "Up to 22 Hours" }
    ]
  },
  {
    name: "Sony WH-1000XM5 Wireless Industry Leading Active Noise Cancelling Headphones",
    brand: "Sony",
    category: "Electronics",
    price: 29990,
    discountPrice: 24999,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Sony's premium WH-1000XM5 headphones rewrite the rules for distraction-free listening. Outfitted with two processors controlling eight microphones, they deliver best-in-class noise cancellation and exceptional call quality. Cloned from Flipkart Hot Deals.",
    rating: 4.7,
    specifications: [
      { key: "Connectivity Type", value: "Wireless Bluetooth 5.2" },
      { key: "Noise Cancellation", value: "Yes (Active NC)" },
      { key: "Playback Time", value: "30 Hours" },
      { key: "Voice Assistant", value: "Google Assistant & Alexa built-in" }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra 5G (Titanium Gray, 12GB RAM, 256GB Storage)",
    brand: "Samsung",
    category: "Electronics",
    price: 129900,
    discountPrice: 119900,
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Meet the Galaxy S24 Ultra, the ultimate form of Galaxy Ultra with a new titanium exterior and a 6.8-inch flat display. Powered by Galaxy AI, featuring a 200MP zoom camera system, and Snapdragon 8 Gen 3 for gaming excellence. Cloned from Amazon.",
    rating: 4.9,
    specifications: [
      { key: "Model Name", value: "Galaxy S24 Ultra" },
      { key: "RAM", value: "12 GB" },
      { key: "Storage", value: "256 GB" },
      { key: "Primary Camera", value: "200 MP + 50 MP + 12 MP" },
      { key: "Network", value: "5G LTE" }
    ]
  },
  {
    name: "Sony PlayStation 5 Console (Slim Edition) with 1TB SSD",
    brand: "Sony",
    category: "Electronics",
    price: 54990,
    discountPrice: 49990,
    images: [
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Experience lightning-fast loading speeds on the PlayStation 5 Slim with an ultra-high speed SSD, deeper immersion with haptic feedback support, adaptive triggers, 3D Audio, and an all-new generation of incredible PlayStation games. Cloned from Flipkart.",
    rating: 4.8,
    specifications: [
      { key: "Console Type", value: "Home Console" },
      { key: "Storage Capacity", value: "1TB Custom SSD" },
      { key: "Resolution Support", value: "Up to 4K UHD @ 120fps" },
      { key: "Ray Tracing", value: "Yes (Hardware accelerated)" }
    ]
  },
  {
    name: "Amazon Kindle Paperwhite (16 GB) – 6.8\" Display and Adjustable Warm Light",
    brand: "Amazon",
    category: "Electronics",
    price: 14999,
    discountPrice: 13999,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The Amazon Kindle Paperwhite features a flush-front design and 300 ppi glare-free display that reads like real paper, even in bright sunlight. Outfitted with adjustable warm light and waterproof chassis. Cloned from Amazon Best Sellers.",
    rating: 4.6,
    specifications: [
      { key: "Display Size", value: "6.8 Inches" },
      { key: "Storage Capacity", value: "16 GB" },
      { key: "Water Resistance", value: "IPX8 Waterproof" },
      { key: "Battery Life", value: "Up to 10 Weeks" }
    ]
  },
  {
    name: "DJI Mini 4 Pro Drone Fly More Combo with RC 2 Smart Controller",
    brand: "DJI",
    category: "Electronics",
    price: 95000,
    discountPrice: 89900,
    images: [
      "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Fly safer and further with the DJI Mini 4 Pro. Weighing under 249g, this drone does not require registration in many countries. Features Omnidirectional Obstacle Sensing, 4K/60fps HDR video, and 34 minutes of flight time. Cloned from Amazon.",
    rating: 4.8,
    specifications: [
      { key: "Weight", value: "249 grams" },
      { key: "Video Resolution", value: "4K HDR @ 60fps" },
      { key: "Flight Time", value: "34 Minutes" },
      { key: "Camera Resolution", value: "48 MP" }
    ]
  },

  // Fashion
  {
    name: "Nike Air Max Alpha Trainer 5 Men's Workout & Training Shoes",
    brand: "Nike",
    category: "Fashion",
    price: 7495,
    discountPrice: 5995,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Bring power and stability to the gym floor with the Nike Air Max Alpha Trainer 5. Features a wide, flat rubber base for enhanced traction, supportive Max Air cushioning in the heel, and a durable breathable mesh upper. Cloned from Amazon.",
    rating: 4.4,
    specifications: [
      { key: "Outer Material", value: "Breathable Mesh" },
      { key: "Sole Type", value: "Anti-Skid Rubber Traction Sole" },
      { key: "Closure Type", value: "Lace-Up" }
    ]
  },
  {
    name: "Levi's Men's 501 Original Regular Fit Straight Leg Denim Jeans",
    brand: "Levi's",
    category: "Fashion",
    price: 3999,
    discountPrice: 2999,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The original blue jean since 1873. The Levi's 501 features a classic straight leg fit, regular rise, and a signature button fly closure. Crafted in premium non-stretch organic cotton denim. Cloned from Flipkart.",
    rating: 4.5,
    specifications: [
      { key: "Material Composition", value: "100% Pure Organic Cotton" },
      { key: "Fit Type", value: "Regular Fit" },
      { key: "Closure", value: "Button Fly" }
    ]
  },
  {
    name: "Adidas Originals Men's Ultraboost 1.0 Athletic Running Shoes",
    brand: "Adidas",
    category: "Fashion",
    price: 17999,
    discountPrice: 14399,
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Run on clouds. The Adidas Ultraboost 1.0 combines a foot-hugging Primeknit upper with a full-length BOOST midsole for premium energy return, cushioning comfort, and standard durability. Cloned from Amazon.",
    rating: 4.7,
    specifications: [
      { key: "Outer Material", value: "Primeknit Textile Upper" },
      { key: "Sole Type", value: "Continental Rubber Outsole" },
      { key: "Cushioning", value: "BOOST Midsole" }
    ]
  },
  {
    name: "Tommy Hilfiger Men's Custom Fit Cotton Pique Polo Shirt",
    brand: "Tommy Hilfiger",
    category: "Fashion",
    price: 3299,
    discountPrice: 2499,
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800"
    ],
    description: "A signature wardrobe staple, this Tommy Hilfiger polo is cut from breathable cotton pique for a comfortable, custom fit. Highlighted by the iconic brand flag chest logo. Cloned from Amazon.",
    rating: 4.3,
    specifications: [
      { key: "Material Composition", value: "100% Pique Cotton" },
      { key: "Fit Type", value: "Regular Fit" },
      { key: "Wash Care Instruction", value: "Machine Wash Cold" }
    ]
  },

  // Home & Kitchen
  {
    name: "Dyson V15 Detect Cordless Vacuum Cleaner with Laser Dust Detection",
    brand: "Dyson",
    category: "Home & Kitchen",
    price: 65900,
    discountPrice: 59900,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800"
    ],
    description: "The most powerful, intelligent cordless vacuum cleaner. Outfitted with laser dust detection that reveals invisible microscopic particles on hard floors, adjusting suction automatically. Cloned from Amazon.",
    rating: 4.8,
    specifications: [
      { key: "Power rating", value: "240 AW Suction Power" },
      { key: "Run Time", value: "Up to 60 Minutes" },
      { key: "Control panel", value: "LCD Screen with Real-time Count" }
    ]
  },
  {
    name: "Instant Pot Duo 7-in-1 Smart Electric Pressure Cooker (5.7 Liters)",
    brand: "Instant Pot",
    category: "Home & Kitchen",
    price: 11999,
    discountPrice: 8999,
    images: [
      "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=800"
    ],
    description: "America's most loved multi-cooker. Replaces 7 kitchen appliances including a pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and food warmer. Cloned from Amazon.",
    rating: 4.6,
    specifications: [
      { key: "Capacity", value: "5.7 Liters" },
      { key: "Power rating", value: "1000 Watts" },
      { key: "Base Material", value: "Food-Grade Stainless Steel" }
    ]
  },
  {
    name: "Philips Digital Air Fryer HD9252/90 with Touch Panel",
    brand: "Philips",
    category: "Home & Kitchen",
    price: 9999,
    discountPrice: 7999,
    images: [
      "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Indulge in healthy fried food. Rapid Air Technology circulates hot air around a metal mesh cooking basket, requiring little or no oil to fry, bake, and grill. Digital touch screen preset menus. Cloned from Flipkart.",
    rating: 4.5,
    specifications: [
      { key: "Capacity", value: "4.1 Liters" },
      { key: "Power rating", value: "1400 Watts" },
      { key: "Control panel", value: "Smart Digital Touch" }
    ]
  },
  {
    name: "IKEA Kallax Shelving Unit (Black-Brown, 77x147 cm)",
    brand: "IKEA",
    category: "Home & Kitchen",
    price: 6999,
    discountPrice: 5999,
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800"
    ],
    description: "A simple, clean shelving unit that adapts to your space. The Kallax can be placed vertically or horizontally, serving as a display rack, storage unit, or sideboard divider. Cloned from Amazon.",
    rating: 4.4,
    specifications: [
      { key: "Frame Material", value: "Premium Engineered Wood" },
      { key: "Dimensions", value: "77 x 147 cm" },
      { key: "Assembly required", value: "Yes (Self-DIY Kit)" }
    ]
  },

  // Books
  {
    name: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones",
    brand: "Penguin",
    category: "Books",
    price: 499,
    discountPrice: 349,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800"
    ],
    description: "No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies to form good habits. Cloned from Amazon Best Sellers.",
    rating: 4.8,
    specifications: [
      { key: "Print format", value: "Paperback Edition" },
      { key: "Author", value: "James Clear" },
      { key: "Page Count", value: "320 Pages" },
      { key: "Language", value: "English" }
    ]
  },
  {
    name: "Sapiens: A Brief History of Humankind by Yuval Noah Harari",
    brand: "Vintage",
    category: "Books",
    price: 599,
    discountPrice: 399,
    images: [
      "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Yuval Noah Harari spans the whole of human history, from the first humans to walk the earth to modern day scientific breakthroughs, questioning how we came to dominate the planet. Cloned from Amazon.",
    rating: 4.7,
    specifications: [
      { key: "Print format", value: "Paperback Edition" },
      { key: "Author", value: "Yuval Noah Harari" },
      { key: "Page Count", value: "512 Pages" }
    ]
  },
  {
    name: "The Alchemist: A Fable About Following Your Dream by Paulo Coelho",
    brand: "HarperOne",
    category: "Books",
    price: 299,
    discountPrice: 199,
    images: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure, teaching us to listen to our hearts. Cloned from Flipkart.",
    rating: 4.6,
    specifications: [
      { key: "Print format", value: "Paperback Edition" },
      { key: "Author", value: "Paulo Coelho" },
      { key: "Page Count", value: "163 Pages" }
    ]
  },

  // Beauty
  {
    name: "Cetaphil Moisturizing Cream for Dry to Very Dry Sensitive Skin (250g)",
    brand: "Cetaphil",
    category: "Beauty",
    price: 950,
    discountPrice: 850,
    images: [
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"
    ],
    description: "Formulated with sweet almond oil and skin-essential vitamins, Cetaphil's rich cream is clinically proven to provide intense, 48-hour hydration and restore skin's moisture barrier. Cloned from Amazon.",
    rating: 4.5,
    specifications: [
      { key: "Suitable skin type", value: "Dry to Very Dry Sensitive Skin" },
      { key: "Item Volume", value: "250 g" },
      { key: "Ingredients check", value: "Paraben-Free, Fragrance-Free" }
    ]
  },
  {
    name: "Olaplex No. 3 Hair Perfector repairing treatment (100ml)",
    brand: "Olaplex",
    category: "Beauty",
    price: 2950,
    discountPrice: 2650,
    images: [
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&q=80&w=800"
    ],
    description: "A global best-seller, Olaplex No. 3 is a concentrated take-home treatment that repairs broken bonds in damaged hair strands, reducing breakage and visibly strengthening hair. Cloned from Amazon.",
    rating: 4.6,
    specifications: [
      { key: "Hair Type", value: "All Hair Types / Damaged" },
      { key: "Item Volume", value: "100 ml" },
      { key: "Cruelty-Free Status", value: "100% Vegan & Cruelty-Free" }
    ]
  },
  {
    name: "Clinique Moisture Surge 100H Auto-Replenishing Hydrator (50ml)",
    brand: "Clinique",
    category: "Beauty",
    price: 3200,
    discountPrice: 2900,
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=800"
    ],
    description: "An upgrade on our fan-favorite, this oil-free gel-cream moisturizer with Exclusive Aloe Bio-ferment and Hyaluronic Acid sinks deep into skin surface for 100 hours of hydration. Cloned from Flipkart.",
    rating: 4.6,
    specifications: [
      { key: "Suitable skin type", value: "All Skin Types / Dehydrated" },
      { key: "Item Volume", value: "50 ml" },
      { key: "Formula", value: "Oil-Free Gel-Cream" }
    ]
  }
];

const seedReal = async () => {
  try {
    console.log('Initiating real products database import...');
    await connectDB();

    // Check command line arguments for overwrite option
    const overwrite = process.argv.includes('--overwrite');
    if (overwrite) {
      console.log('Clearing existing product catalog as requested by --overwrite flag...');
      await Product.deleteMany({});
      console.log('Existing product catalog cleared.');
    }

    // Build the mapped objects
    const productsToInsert = realProducts.map(prod => {
      const stock = Math.floor(Math.random() * 85) + 15; // random stock 15-100
      
      return {
        name: prod.name,
        brand: prod.brand,
        category: prod.category,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice || 0,
        stock: stock,
        images: prod.images,
        rating: prod.rating,
        specifications: prod.specifications
      };
    });

    console.log(`Inserting ${productsToInsert.length} real Amazon/Flipkart products...`);
    const inserted = await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${inserted.length} real products!`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding real products failed:', error);
    process.exit(1);
  }
};

seedReal();
