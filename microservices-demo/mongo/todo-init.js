// Creates a 'todos' database and 'items' collection
db = db.getSiblingDB("todos");

// Create collections
db.createCollection("items");

// Create indexes for better performance
db.items.createIndex({ user_id: 1 });
db.items.createIndex({ completed: 1 });
db.items.createIndex({ priority: 1 });
db.items.createIndex({ created_at: -1 });
db.items.createIndex({ title: "text", description: "text" });

// Insert sample todos
db.items.insertMany([
  {
    title: "Learn Docker",
    description: "Complete the Docker microservices tutorial",
    completed: false,
    priority: "high",
    user_id: "sample_user_1",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: "Setup Kubernetes",
    description: "Deploy the application to Kubernetes cluster",
    completed: false,
    priority: "medium",
    user_id: "sample_user_1",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    title: "Write Documentation",
    description: "Document the microservices architecture",
    completed: true,
    priority: "low",
    user_id: "sample_user_2",
    created_at: new Date(),
    updated_at: new Date(),
  },
]);

print("Todo database initialized successfully!");
