// Sample data seeding script for development
// Run this after setting up Firebase to populate initial data

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  // Your Firebase config
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Sample menu data
const sampleMenus = [
  {
    date: "2024-01-08",
    breakfast: ["Idli", "Sambar", "Coconut Chutney", "Tea"],
    lunch: ["Rice", "Dal", "Mixed Vegetable", "Chapati", "Pickle"],
    dinner: ["Chapati", "Paneer Curry", "Rice", "Dal", "Salad"],
  },
  {
    date: "2024-01-09",
    breakfast: ["Poha", "Tea", "Banana"],
    lunch: ["Biryani", "Raita", "Pickle", "Papad"],
    dinner: ["Rice", "Rajma", "Chapati", "Vegetable"],
  },
]

// Sample inventory data
const sampleInventory = [
  {
    name: "Rice",
    quantity: 500,
    unit: "kg",
    lowStockThreshold: 50,
    category: "Grains",
    lastUpdated: new Date().toISOString(),
  },
  {
    name: "Dal (Toor)",
    quantity: 200,
    unit: "kg",
    lowStockThreshold: 20,
    category: "Pulses",
    lastUpdated: new Date().toISOString(),
  },
  {
    name: "Onions",
    quantity: 8,
    unit: "kg",
    lowStockThreshold: 10,
    category: "Vegetables",
    lastUpdated: new Date().toISOString(),
  },
]

// Sample polls
const samplePolls = [
  {
    date: "2024-01-09",
    mealType: "lunch",
    question: "What would you like for tomorrow's lunch?",
    options: [
      { id: "1", name: "Biryani", votes: 15 },
      { id: "2", name: "Fried Rice", votes: 8 },
      { id: "3", name: "Pulao", votes: 12 },
    ],
    totalVotes: 35,
    active: true,
  },
]

async function seedData() {
  try {
    console.log("Seeding sample data...")

    // Add sample menus
    for (const menu of sampleMenus) {
      await addDoc(collection(db, "menus"), menu)
    }
    console.log("✅ Sample menus added")

    // Add sample inventory
    for (const item of sampleInventory) {
      await addDoc(collection(db, "inventory"), item)
    }
    console.log("✅ Sample inventory added")

    // Add sample polls
    for (const poll of samplePolls) {
      await addDoc(collection(db, "polls"), poll)
    }
    console.log("✅ Sample polls added")

    console.log("🎉 Data seeding completed successfully!")
  } catch (error) {
    console.error("❌ Error seeding data:", error)
  }
}

seedData()
