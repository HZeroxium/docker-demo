import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None


database = Database()


async def connect_to_mongo():
    """Create database connection"""
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://todo-mongo:27017")
    database.client = AsyncIOMotorClient(mongodb_url)

    # Test connection
    try:
        await database.client.admin.command("ping")
        logger.info("Connected to MongoDB successfully")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        logger.info("Disconnected from MongoDB")


def get_collection() -> AsyncIOMotorCollection:
    """Get todos collection"""
    return database.client.todos.items
