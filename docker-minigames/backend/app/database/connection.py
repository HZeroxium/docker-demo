from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None


db = Database()


async def connect_to_mongo():
    """Create database connection"""
    try:
        db.client = AsyncIOMotorClient("mongodb://localhost:27017")
        db.database = db.client.docker_quiz_game
        # Test the connection
        await db.client.admin.command("ping")
        print("✅ Connected to MongoDB successfully")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("🔌 Disconnected from MongoDB")


def get_database():
    if db.database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db.database
