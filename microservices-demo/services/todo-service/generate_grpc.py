import subprocess
import sys
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_grpc_files():
    """Generate Python gRPC files from proto definition"""

    # Ensure we're in the correct directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    proto_dir = os.path.join(current_dir, "proto")
    proto_file = os.path.join(proto_dir, "todo.proto")
    output_dir = os.path.join(current_dir, "app")

    # Check if proto file exists
    if not os.path.exists(proto_file):
        logger.error(f"Proto file not found: {proto_file}")
        return False

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Generate Python files from proto
        cmd = [
            sys.executable,
            "-m",
            "grpc_tools.protoc",
            f"--proto_path={proto_dir}",
            f"--python_out={output_dir}",
            f"--grpc_python_out={output_dir}",
            proto_file,
        ]

        logger.info(f"Generating gRPC files...")
        logger.info(f"Command: {' '.join(cmd)}")

        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        logger.info("✅ gRPC files generated successfully!")

        # Fix the import in the generated grpc file
        fix_grpc_imports(output_dir)

        # Clean up old root-level proto file if it exists
        cleanup_old_files(current_dir)

        return True

    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Error generating gRPC files: {e}")
        logger.error(f"STDOUT: {e.stdout}")
        logger.error(f"STDERR: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False


def fix_grpc_imports(output_dir):
    """Fix the import statements in generated gRPC files"""
    grpc_file = os.path.join(output_dir, "todo_pb2_grpc.py")

    if os.path.exists(grpc_file):
        try:
            with open(grpc_file, "r") as f:
                content = f.read()

            # Replace absolute import with relative import
            content = content.replace(
                "import todo_pb2 as todo__pb2",
                "from . import todo_pb2 as todo__pb2",
            )

            with open(grpc_file, "w") as f:
                f.write(content)

            logger.info("✅ Fixed import statements in generated gRPC files")
        except Exception as e:
            logger.error(f"Failed to fix import statements: {e}")


def cleanup_old_files(current_dir):
    """Remove old proto file at root level"""
    old_proto = os.path.join(current_dir, "todo.proto")
    if os.path.exists(old_proto):
        try:
            os.remove(old_proto)
            logger.info("✅ Cleaned up old proto file at root level")
        except Exception as e:
            logger.warning(f"Could not remove old proto file: {e}")


if __name__ == "__main__":
    success = generate_grpc_files()
    if not success:
        logger.warning("gRPC generation failed, but continuing...")
        sys.exit(0)  # Don't fail the build, just continue without gRPC
