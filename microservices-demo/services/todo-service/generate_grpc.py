import grpc_tools.protoc

# Generate gRPC files
grpc_tools.protoc.main(
    [
        "grpc_tools.protoc",
        "-I./proto",
        "--python_out=./app",
        "--grpc_python_out=./app",
        "./proto/todo.proto",
    ]
)

print("gRPC files generated successfully!")
