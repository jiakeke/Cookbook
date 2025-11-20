const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Allergen = require('../models/Allergen');
const SpecialGroup = require('../models/SpecialGroup');
const connectDB = require('../config/db');

const migrateUserData = async () => {
  await connectDB();
  try {
    // 1. Load all necessary data
    const exportFilePath = path.join(__dirname, 'db_export.json');
    if (!fs.existsSync(exportFilePath)) {
      throw new Error('db_export.json not found!');
    }
    const exportedData = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));
    const usersFromJSON = exportedData.users || [];

    const [allergens, specialGroups] = await Promise.all([
      Allergen.find({}),
      SpecialGroup.find({}),
    ]);

    // 2. Create lookup maps
    const allergenMap = new Map(allergens.map(a => [a.name.en, a._id]));
    const specialGroupMap = new Map(specialGroups.map(sg => [sg.name.en, sg._id]));

    console.log(`Found ${usersFromJSON.length} users in export file. Starting migration...`);

    // 3. Iterate and update
    let updatedCount = 0;
    const updatePromises = usersFromJSON.map(async (userJson) => {
      const allergenNames = userJson.allergens || [];
      const specialGroupNames = userJson.specialGroups || [];

      const allergenIds = allergenNames.map(name => allergenMap.get(name)).filter(id => id);
      const specialGroupIds = specialGroupNames.map(name => specialGroupMap.get(name)).filter(id => id);

      const result = await User.updateOne(
        { email: userJson.email }, // Match user by unique email
        {
          $set: {
            allergens: allergenIds,
            specialGroups: specialGroupIds,
          },
        }
      );
      if (result.modifiedCount > 0) {
        updatedCount++;
      }
    });

    await Promise.all(updatePromises);

    console.log(`Migration complete. ${updatedCount} user(s) were updated.`);
    process.exit();
  } catch (err) {
    console.error('Error during user data migration:', err);
    process.exit(1);
  }
};

migrateUserData();
