// Creates a 'users' database and 'profiles' collection
db = db.getSiblingDB("user_db");

// Create collections
db.createCollection("users");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ name: "text", email: "text" });

// Insert sample users
db.users.insertMany([
  {
    email: "admin@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfnOE4SyDLMGd5u", // password: admin123
    name: "System Administrator",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: "user@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfnOE4SyDLMGd5u", // password: user123
    name: "Regular User",
    role: "user",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: "moderator@example.com",
    password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewfnOE4SyDLMGd5u", // password: mod123
    name: "Content Moderator",
    role: "moderator",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

print("User database initialized successfully!");
