import mongoose from 'mongoose';
import './env.js';
import Category from './models/Category.js';

const newCategories = [
    { name: 'Lal Mirch Achaar', isActive: true, sortOrder: 1 },
    { name: 'Aam ka Achaar', isActive: true, sortOrder: 2 },
    { name: 'Aam ka kuchha', isActive: true, sortOrder: 3 },
    { name: 'Hari Mirch', isActive: true, sortOrder: 4 },
    { name: 'Neembu chatpata', isActive: true, sortOrder: 5 },
    { name: 'Neembu Khatta-Meetha', isActive: true, sortOrder: 6 },
    { name: 'Kathal ka Achaar', isActive: true, sortOrder: 7 },
    { name: 'Barobara Achaar', isActive: true, sortOrder: 8 },
    { name: 'Lahsun ka Achaar', isActive: true, sortOrder: 9 },
    { name: 'Aavla ka Achaar', isActive: true, sortOrder: 10 },
    { name: 'Aavla ka Murabba', isActive: true, sortOrder: 11 },
    { name: 'Karela ka achaar', isActive: true, sortOrder: 12 },
    { name: 'Namakpare (Holi Special)', isActive: true, isSeasonal: true, seasonMonths: [3], sortOrder: 13 },
    { name: 'Gujiya (Holi Special)', isActive: true, isSeasonal: true, seasonMonths: [3], sortOrder: 14 },
    { name: 'Til Gud Laddoo (MankarSankranti Special)', isActive: true, isSeasonal: true, seasonMonths: [1], sortOrder: 15 },
    { name: 'katarni Choora (MankarSankranti Special)', isActive: true, isSeasonal: true, seasonMonths: [1], sortOrder: 16 }
];

const updateCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Category.deleteMany({});
        console.log('🗑️ Cleared existing categories');

        for (const cat of newCategories) {
            // Manually generating slug
            const baseSlug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            cat.slug = baseSlug;
        }

        await Category.insertMany(newCategories);
        console.log('✅ Inserted new categories');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to update categories:', err);
        process.exit(1);
    }
};

updateCategories();
