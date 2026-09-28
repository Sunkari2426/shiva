import mongoose from "mongoose";
import { connectDatabase } from "./db.js";
import ScrapCategory from "./models/ScrapCategory.js";
import ScrapRate from "./models/ScrapRate.js";
import User from "./models/User.js";

const seedData = [
  ["Newspaper", 18], ["Cardboard", 12], ["Iron/Steel", 32],
  ["Aluminium", 145], ["Plastic", 22], ["E-waste", 45]
];

await connectDatabase();

for (const [name, rate] of seedData) {
  const category = await ScrapCategory.findOneAndUpdate(
    { name }, { name, unit: "kg", isActive: true }, { upsert: true, new: true }
  );
  await ScrapRate.findOneAndUpdate(
    { categoryId: category._id, isActive: true },
    { categoryId: category._id, rate, effectiveFrom: new Date(), isActive: true },
    { upsert: true, new: true }
  );
}

if (process.env.SEED_COLLECTOR_PHONE) {
  await User.findOneAndUpdate(
    { phone: process.env.SEED_COLLECTOR_PHONE },
    { phone: process.env.SEED_COLLECTOR_PHONE, name: "Scrap Mama Collector", role: "collector", isActive: true },
    { upsert: true, new: true }
  );
}

if (process.env.SEED_ADMIN_PHONE) {
  await User.findOneAndUpdate(
    { phone: process.env.SEED_ADMIN_PHONE },
    { phone: process.env.SEED_ADMIN_PHONE, name: "Scrap Mama Admin", role: "admin", isActive: true },
    { upsert: true, new: true }
  );
}

console.log("Scrap Mama seed complete");
await mongoose.disconnect();
