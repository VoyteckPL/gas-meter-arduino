#!/bin/sh
# Builds and runs the firmware pulse accounting tests on a PC. Add any argument for a verbose log.
set -e
cd "$(dirname "$0")"
g++ -std=c++17 -O1 -Wall -Wextra -Wno-unused-function -Ishim test_gas_meter.cpp -o /tmp/gas_meter_sim
/tmp/gas_meter_sim "$@"
