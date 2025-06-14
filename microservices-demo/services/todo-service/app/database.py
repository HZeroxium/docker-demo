import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

logger = logging.getLogger(__name__)


class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database = None

    async def connect_to_mongo(self):
        """Connect to MongoDB"""
        try:
            mongodb_url = os.getenv("MONGODB_URL", "mongodb://todo-mongo:27017")
            self.client = AsyncIOMotorClient(mongodb_url)
            self.database = self.client.todos

            # Test the connection
            await self.client.admin.command("ping")
            logger.info("Connected to MongoDB successfully")

        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def close_mongo_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")

    def get_collection(self):
        """Get the todos collection"""
        if self.database is None:
            raise RuntimeError(
                "Database not initialized. Call connect_to_mongo() first."
            )
        return self.database.items

    def get_database(self):
        """Get the database instance"""
        if self.database is None:
            raise RuntimeError(
                "Database not initialized. Call connect_to_mongo() first."
            )
        return self.database


# Global database manager instance
database = DatabaseManager()


# Legacy compatibility functions
async def connect_to_mongo():
    """Connect to MongoDB"""
    await database.connect_to_mongo()


async def close_mongo_connection():
    """Close MongoDB connection"""
    await database.close_mongo_connection()


def get_collection():
    """Get the todos collection"""
    return database.get_collection()


def get_database():
    """Get the database instance"""
    return database.get_database()
