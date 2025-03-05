#!/bin/bash

# check if port is occupied, if so kill pid
check_port_3000() {
    PID=$(lsof -t -i:3000)
    if [ -n "$PID" ]; then
        kill "$PID"
    fi
}

# start dev in auth-server
cd packages/auth-server
check_port_3000

# finishing state
pnpm dev > auth-server.log 2>&1 &
while ! grep -q "listening" auth-server.log; do
    sleep 1
done

# clean up
rm auth-server.log
echo "'auth server is ready."