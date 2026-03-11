import './env.js';

import mongoose from 'mongoose';

import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';



const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── Clear existing seed data ───────────────────────────────────────────────
  await Product.deleteMany({});
  await Category.deleteMany({});
  console.log('🗑️  Cleared products and categories');

  // ── Categories ─────────────────────────────────────────────────────────────
  const categories = await Category.insertMany([
    { name: 'Mango Pickles',   slug: 'mango-pickles',   description: 'Raw & ripe mango achaar varieties', isActive: true, sortOrder: 1 },
    { name: 'Mixed Pickles',   slug: 'mixed-pickles',   description: 'A medley of seasonal vegetables', isActive: true, sortOrder: 2 },
    { name: 'Lemon Pickles',   slug: 'lemon-pickles',   description: 'Tangy lemon and lime achaar', isActive: true, sortOrder: 3 },
    { name: 'Garlic Pickles',  slug: 'garlic-pickles',  description: 'Bold and pungent garlic varieties', isActive: true, sortOrder: 4 },
    { name: 'Amla Pickles',    slug: 'amla-pickles',    description: 'Indian gooseberry pickles', isActive: true, sortOrder: 5 },
    {
      name: 'Holi Specials', slug: 'holi-specials',
      description: 'Gujiya, Mathri & festive sweets for Holi',
      isActive: true, isSeasonal: true, seasonMonths: [3], sortOrder: 6,
    },
    {
      name: 'Diwali Specials', slug: 'diwali-specials',
      description: 'Dry fruits, laddoos & festive snacks for Diwali',
      isActive: true, isSeasonal: true, seasonMonths: [10, 11], sortOrder: 7,
    },
  ]);

  const [mango, mixed, lemon, garlic, amla, holi, diwali] = categories;
  console.log(`✅ Created ${categories.length} categories`);

  // ── Products ───────────────────────────────────────────────────────────────
  const products = [
    {
      name: 'Classic Mango Achaar',
      slug: 'classic-mango-achaar',
      description: 'Our signature raw mango pickle made with hand-ground spices, cold-pressed mustard oil, and sun-dried raw mangoes. This recipe has been in the family for three generations — bold, tangy, and deeply aromatic.',
      shortDescription: 'Traditional raw mango pickle with mustard oil & hand-ground spices',
      category: mango._id,
      images: [{ url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800', publicId: 'seed-1', alt: 'Mango Achaar' }],
      variants: [
        { label: '250g', weight: 250, price: 149, comparePrice: 199, stock: 50, sku: 'MNG-ACH-250' },
        { label: '500g', weight: 500, price: 279, comparePrice: 349, stock: 40, sku: 'MNG-ACH-500' },
        { label: '1kg',  weight: 1000, price: 499, comparePrice: 599, stock: 25, sku: 'MNG-ACH-1KG' },
      ],
      basePrice: 149, comparePrice: 199,
      ingredients: ['Raw Mango', 'Mustard Oil', 'Fenugreek Seeds', 'Fennel Seeds', 'Red Chilli', 'Turmeric', 'Salt'],
      tags: ['mango', 'achaar', 'traditional', 'spicy'],
      isFeatured: true, isBestseller: true, isNewArrival: false,
      ratings: { average: 4.8, count: 124 }, totalSold: 380,
    },
    {
      name: 'Sweet & Spicy Mango Pickle',
      slug: 'sweet-spicy-mango-pickle',
      description: 'A unique blend of sweet jaggery and fiery red chillies with ripe Alphonso mango pieces. The perfect balance of sweet, sour, and spicy in every bite.',
      shortDescription: 'Ripe mango pickle with jaggery & red chilli',
      category: mango._id,
      images: [{ url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800', publicId: 'seed-2', alt: 'Sweet Mango Pickle' }],
      variants: [
        { label: '250g', weight: 250, price: 169, comparePrice: 220, stock: 35, sku: 'MNG-SWT-250' },
        { label: '500g', weight: 500, price: 319, comparePrice: 399, stock: 28, sku: 'MNG-SWT-500' },
      ],
      basePrice: 169, comparePrice: 220,
      ingredients: ['Ripe Mango', 'Jaggery', 'Red Chilli', 'Mustard Seeds', 'Ginger', 'Vinegar', 'Salt'],
      tags: ['mango', 'sweet', 'spicy', 'jaggery'],
      isFeatured: true, isBestseller: false, isNewArrival: true,
      ratings: { average: 4.6, count: 67 }, totalSold: 210,
    },
    {
      name: 'Punjabi Mixed Achaar',
      slug: 'punjabi-mixed-achaar',
      description: 'A robust Punjabi-style mixed vegetable pickle loaded with carrots, cauliflower, turnips, and green chillies — slow-cured in mustard oil with whole spices. The authentic taste of Punjab.',
      shortDescription: 'Hearty Punjabi mixed vegetable pickle',
      category: mixed._id,
      images: [{ url: 'https://images.unsplash.com/photo-1599021419847-d8a7a6aba5b4?w=800', publicId: 'seed-3', alt: 'Punjabi Mixed Achaar' }],
      variants: [
        { label: '250g', weight: 250, price: 129, comparePrice: 169, stock: 60, sku: 'MXD-PNJ-250' },
        { label: '500g', weight: 500, price: 239, comparePrice: 299, stock: 45, sku: 'MXD-PNJ-500' },
        { label: '1kg',  weight: 1000, price: 449, comparePrice: 549, stock: 30, sku: 'MXD-PNJ-1KG' },
      ],
      basePrice: 129, comparePrice: 169,
      ingredients: ['Carrot', 'Cauliflower', 'Turnip', 'Green Chilli', 'Mustard Oil', 'Garam Masala', 'Turmeric', 'Salt'],
      tags: ['mixed', 'punjabi', 'vegetables', 'traditional'],
      isFeatured: true, isBestseller: true, isNewArrival: false,
      ratings: { average: 4.7, count: 89 }, totalSold: 295,
    },
    {
      name: 'Nimbu Ka Achaar',
      slug: 'nimbu-ka-achaar',
      description: 'Sun-cured lemon pickle marinated for 21 days in our secret spice blend. The long curing process develops a complex, deeply tangy flavour that pairs beautifully with dal and rice.',
      shortDescription: 'Sun-cured 21-day lemon pickle',
      category: lemon._id,
      images: [{ url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800', publicId: 'seed-4', alt: 'Lemon Pickle' }],
      variants: [
        { label: '250g', weight: 250, price: 119, comparePrice: 149, stock: 70, sku: 'LMN-NMB-250' },
        { label: '500g', weight: 500, price: 219, comparePrice: 279, stock: 55, sku: 'LMN-NMB-500' },
      ],
      basePrice: 119, comparePrice: 149,
      ingredients: ['Lemon', 'Salt', 'Turmeric', 'Red Chilli', 'Mustard Seeds', 'Asafoetida'],
      tags: ['lemon', 'tangy', 'nimbu', 'classic'],
      isFeatured: false, isBestseller: true, isNewArrival: false,
      ratings: { average: 4.9, count: 156 }, totalSold: 520,
    },
    {
      name: 'Lahsun Ka Achaar',
      slug: 'lahsun-ka-achaar',
      description: 'Bold, pungent whole garlic cloves slow-cured in a fiery red chilli and mustard oil base. A powerful condiment beloved in Rajasthani homes — intense flavour, zero compromise.',
      shortDescription: 'Whole garlic cloves in spicy mustard oil',
      category: garlic._id,
      images: [{ url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', publicId: 'seed-5', alt: 'Garlic Pickle' }],
      variants: [
        { label: '200g', weight: 200, price: 139, comparePrice: 179, stock: 40, sku: 'GRL-LHS-200' },
        { label: '400g', weight: 400, price: 259, comparePrice: 329, stock: 30, sku: 'GRL-LHS-400' },
      ],
      basePrice: 139, comparePrice: 179,
      ingredients: ['Whole Garlic', 'Red Chilli', 'Mustard Oil', 'Fenugreek', 'Asafoetida', 'Salt'],
      tags: ['garlic', 'spicy', 'lahsun', 'bold'],
      isFeatured: true, isBestseller: false, isNewArrival: true,
      ratings: { average: 4.5, count: 43 }, totalSold: 145,
    },
    {
      name: 'Amla Murabba',
      slug: 'amla-murabba',
      description: 'Indian gooseberry slow-cooked in sugar syrup with cardamom and saffron. A traditional sweet preserve rich in Vitamin C — eaten daily for immunity and digestion.',
      shortDescription: 'Sweet amla preserve with cardamom & saffron',
      category: amla._id,
      images: [{ url: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800', publicId: 'seed-6', alt: 'Amla Murabba' }],
      variants: [
        { label: '500g', weight: 500, price: 249, comparePrice: 299, stock: 35, sku: 'AML-MRB-500' },
        { label: '1kg',  weight: 1000, price: 449, comparePrice: 549, stock: 20, sku: 'AML-MRB-1KG' },
      ],
      basePrice: 249, comparePrice: 299,
      ingredients: ['Amla', 'Sugar', 'Cardamom', 'Saffron', 'Rose Water'],
      tags: ['amla', 'murabba', 'sweet', 'immunity', 'vitamin-c'],
      isFeatured: true, isBestseller: false, isNewArrival: false,
      ratings: { average: 4.7, count: 78 }, totalSold: 230,
    },
    {
      name: 'Holi Special Gujiya Box',
      slug: 'holi-special-gujiya-box',
      description: 'Celebrate Holi with our handcrafted Mawa Gujiya — crispy pastry shells filled with khoya, dry fruits, and coconut, fried to golden perfection. Made fresh and shipped within 24 hours of your order.',
      shortDescription: 'Handcrafted mawa gujiya for Holi celebrations',
      category: holi._id,
      images: [{ url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800', publicId: 'seed-7', alt: 'Gujiya Box' }],
      variants: [
        { label: '6 pieces',  weight: 300, price: 199, comparePrice: 250, stock: 100, sku: 'HOL-GUJ-6' },
        { label: '12 pieces', weight: 600, price: 369, comparePrice: 449, stock: 80,  sku: 'HOL-GUJ-12' },
        { label: '24 pieces', weight: 1200, price: 699, comparePrice: 849, stock: 50, sku: 'HOL-GUJ-24' },
      ],
      basePrice: 199, comparePrice: 250,
      ingredients: ['Maida', 'Khoya', 'Desiccated Coconut', 'Cashew', 'Raisins', 'Cardamom', 'Sugar', 'Ghee'],
      tags: ['holi', 'gujiya', 'seasonal', 'festival', 'sweet'],
      isFeatured: true, isBestseller: false, isNewArrival: true,
      isSeasonal: true,
      ratings: { average: 4.9, count: 34 }, totalSold: 89,
    },
    {
      name: 'Diwali Dry Fruit Laddoo',
      slug: 'diwali-dry-fruit-laddoo',
      description: 'Premium dry fruit laddoos made with almonds, cashews, pistachios, and dates — bound with pure desi ghee and cardamom. A festive gift that feels like home.',
      shortDescription: 'Premium ghee-based dry fruit laddoos for Diwali',
      category: diwali._id,
      images: [{ url: 'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=800', publicId: 'seed-8', alt: 'Dry Fruit Laddoo' }],
      variants: [
        { label: '250g (8 pcs)', weight: 250, price: 349, comparePrice: 429, stock: 60, sku: 'DIW-LAD-250' },
        { label: '500g (16 pcs)', weight: 500, price: 649, comparePrice: 799, stock: 40, sku: 'DIW-LAD-500' },
      ],
      basePrice: 349, comparePrice: 429,
      ingredients: ['Almonds', 'Cashews', 'Pistachios', 'Dates', 'Desi Ghee', 'Cardamom', 'Saffron'],
      tags: ['diwali', 'laddoo', 'dry-fruits', 'seasonal', 'gift'],
      isFeatured: true, isBestseller: false, isNewArrival: true,
      isSeasonal: true,
      ratings: { average: 4.8, count: 22 }, totalSold: 67,
    },
  ];

  await Product.insertMany(products);
  console.log(`✅ Created ${products.length} products`);

  console.log('\n🎉 Seed complete! Summary:');
  console.log(`   Categories : ${categories.length}`);
  console.log(`   Products   : ${products.length}`);
  console.log('\n📝 Admin credentials:');
  console.log('   Email    : admin@apnirasoi.com');
  console.log('   Password : Admin@1234');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});