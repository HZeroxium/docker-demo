import subprocess
import sys
import os


def generate_grpc_files():
    """Generate Python gRPC files from proto definition"""

    # Ensure we're in the correct directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    proto_file = os.path.join(current_dir, "todo.proto")
    output_dir = os.path.join(current_dir, "app")

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    try:
        # Generate Python files from proto
        cmd = [
            sys.executable,
            "-m",
            "grpc_tools.protoc",
            f"--proto_path={current_dir}",
            f"--python_out={output_dir}",
            f"--grpc_python_out={output_dir}",
            proto_file,
        ]

        print(f"Generating gRPC files...")
        print(f"Command: {' '.join(cmd)}")

        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print("✅ gRPC files generated successfully!")

        # Fix the import in the generated grpc file
        fix_grpc_imports(output_dir)

    except subprocess.CalledProcessError as e:
        print(f"❌ Error generating gRPC files: {e}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)


def fix_grpc_imports(output_dir):
    """Fix the import statements in generated gRPC files"""
    grpc_file = os.path.join(output_dir, "todo_pb2_grpc.py")

    if os.path.exists(grpc_file):
        with open(grpc_file, "r") as f:
            content = f.read()

        # Replace absolute import with relative import
        content = content.replace(
            "import todo_pb2 as todo__pb2",
            "from . import todo_pb2 as todo__pb2",
        )

        with open(grpc_file, "w") as f:
            f.write(content)

        print("✅ Fixed import statements in generated gRPC files")


if __name__ == "__main__":
    generate_grpc_files()
