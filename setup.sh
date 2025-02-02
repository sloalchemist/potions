#!/bin/bash

# Set base directory to 'packages'
BASE_DIR="$(pwd)/packages"

# Check if base dir exists
if [ ! -d "$BASE_DIR" ]; then
    echo "Directory '$BASE_DIR' does not exist."
    exit 1
fi

# function to build world   
build_project() {
    pnpm build
    echo "Building world"
}

# function to create the test world
create_test_world() {
    cd "$BASE_DIR/server" || exit 1
    pnpm run create test-world
    echo "Creating test world"
    cd - || exit 1
}

# function to start the Auth server
start_auth_server() {
    osascript -e "tell application \"Terminal\" to do script \"cd '$BASE_DIR/auth-server' && pnpm dev\""
    echo "Starting Auth-Server in Terminal"
    sleep 3
}

# function to start the server
start_server() {
    osascript -e "tell application \"Terminal\" to do script \"cd '$BASE_DIR/server' && pnpm dev test-world\""
    echo "Starting Server in Terminal"
    sleep 3
}

# function to start the client
start_client() {
    osascript -e "tell application \"Terminal\" to do script \"cd '$BASE_DIR/client' && pnpm start\""
    echo "Starting Client in Terminal"
}

# Parse arguments and call corresponding functions
if [ $# -eq 0 ]; then
    echo "Usage: ./start_servers.sh [options]"
    echo "Options:"
    echo "  --build          Build the project"
    echo "  --create-world   Create the test world"
    echo "  --auth-server    Start the Auth-Server"
    echo "  --server         Start the Server"
    echo "  --client         Start the Client"
    echo "  --all            Run all the above steps"
    exit 1
fi

for arg in "$@"; do
    case "$arg" in
        --build) 
            build_project
            ;;
        --create-world) 
            create_test_world
            ;;
        --auth-server) 
            start_auth_server
            ;;
        --server) 
            start_server
            ;;
        --client) 
            start_client
            ;;
        --all) 
            build_project
            create_test_world
            start_auth_server
            start_server
            start_client
            ;;
        *) 
            echo "Unknown option: $arg"
            echo "Usage: ./setup.sh [options]"
            exit 1
            ;;
    esac
done

echo "Done."