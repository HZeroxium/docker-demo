from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None


db = Database()


def extract_database_name_from_url(
    mongodb_url: str, default_db: str = "docker_quiz_game"
) -> str:
    """
    Extract database name from MongoDB connection string with robust parsing.
    Supports both local MongoDB and MongoDB Atlas URLs.
    """
    try:
        # Parse the URL
        parsed = urlparse(mongodb_url)

        # Extract database name from path
        if parsed.path and len(parsed.path) > 1:  # path exists and is not just "/"
            db_name = parsed.path.lstrip("/").split("?")[
                0
            ]  # Remove leading slash and query params
            if db_name and db_name.strip():  # Ensure it's not empty or whitespace
                return db_name.strip()

        # Fallback: try to extract from the full URL using string manipulation
        # Handle cases like mongodb+srv://user:pass@cluster.mongodb.net/dbname?options
        if "/" in mongodb_url:
            parts = mongodb_url.split("/")
            if len(parts) >= 4:  # protocol://user:pass@host/dbname
                potential_db = parts[-1].split("?")[0]  # Remove query parameters
                if (
                    potential_db
                    and potential_db.strip()
                    and potential_db not in ["", "admin"]
                ):
                    return potential_db.strip()

        logger.warning(
            f"Could not extract database name from URL, using default: {default_db}"
        )
        return default_db

    except Exception as e:
        logger.warning(f"Error parsing MongoDB URL: {e}, using default: {default_db}")
        return default_db


async def connect_to_mongo():
    """Create database connection with enhanced external MongoDB support"""
    try:
        # Priority: Environment variable > Default localhost
        mongodb_url = os.getenv(
            "MONGODB_URL", "mongodb://localhost:27017/docker_quiz_game"
        )

        # Get database name from environment or extract from URL
        db_name = os.getenv("DB_NAME")

        if not db_name or not db_name.strip():
            # Extract database name from MongoDB URL
            db_name = extract_database_name_from_url(mongodb_url)

        # Final validation - ensure db_name is not empty
        if not db_name or not db_name.strip():
            db_name = "docker_quiz_game"
            logger.warning(f"Using fallback database name: {db_name}")

        logger.info(f"🔄 Attempting to connect to MongoDB...")
        logger.info(f"📍 Database: {db_name}")
        logger.info(
            f"🔗 Connection type: {'Atlas' if 'mongodb.net' in mongodb_url else 'Local/Remote'}"
        )

        # Enhanced connection options for external MongoDB
        connection_options = {
            "serverSelectionTimeoutMS": 5000,  # 5 second timeout
            "connectTimeoutMS": 10000,  # 10 second connection timeout
            "socketTimeoutMS": 10000,  # 10 second socket timeout
            "maxPoolSize": 10,  # Connection pool size
            "minPoolSize": 1,  # Minimum connections
            "maxIdleTimeMS": 30000,  # Max idle time
            "retryWrites": True,  # Enable retry writes
        }

        # # Additional options for MongoDB Atlas
        # if "mongodb.net" in mongodb_url or "mongodb+srv" in mongodb_url:
        #     connection_options.update(
        #         {
        #             "ssl": True,
        #             "ssl_cert_reqs": "CERT_NONE",  # For Atlas compatibility
        #             "authSource": "admin",
        #         }
        #     )

        db.client = AsyncIOMotorClient(mongodb_url, **connection_options)

        # Validate database name one more time before assignment
        if not db_name or not isinstance(db_name, str) or not db_name.strip():
            raise ValueError("Database name is invalid or empty")

        db.database = db.client[db_name.strip()]

        # Test the connection with ping
        await db.client.admin.command("ping")

        # Verify database access
        collections = await db.database.list_collection_names()
        logger.info(f"✅ Successfully connected to MongoDB")
        logger.info(f"📊 Database: {db_name}")
        logger.info(f"📋 Available collections: {len(collections)}")

    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        logger.error(
            f"🔗 Connection URL: {mongodb_url.split('@')[0] if '@' in mongodb_url else mongodb_url}"
        )
        logger.error(
            f"🗄️ Database name attempted: {db_name if 'db_name' in locals() else 'Not determined'}"
        )
        raise ConnectionError(f"MongoDB connection failed: {str(e)}")


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        logger.info("🔌 Disconnected from MongoDB")


def get_database():
    if db.database is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db.database
