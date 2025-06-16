// MongoDB Initialization Script for Docker Quiz Game

// Get environment variables with fallbacks
const rootUser = process.env.MONGO_ROOT_USER || "admin";
const rootPassword = process.env.MONGO_ROOT_PASSWORD || "password123";
const initDb = process.env.MONGO_INIT_DB || "docker_quiz_game";

print("🚀 Starting MongoDB initialization...");
print(`📋 Root User: ${rootUser}`);
print(`🗄️ Database: ${initDb}`);

// Switch to the target database
db = db.getSiblingDB(initDb);

// Create application user with read/write permissions
db.createUser({
  user: rootUser,
  pwd: rootPassword,
  roles: [
    {
      role: "readWrite",
      db: initDb,
    },
    {
      role: "dbAdmin",
      db: initDb,
    },
  ],
});

print("🎉 MongoDB initialization completed successfully!");
