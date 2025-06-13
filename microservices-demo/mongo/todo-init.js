// Creates a 'todos' database and 'items' collection
db = db.getSiblingDB("todos");
if (!db.getCollectionNames().includes("items")) {
  db.createCollection("items");
}
