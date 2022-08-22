#!/bin/bash

# Exit on first error
set -ex

# Bring the test network down
pushd ../network
./networkdown.sh
popd # pop directory : 들어간곳에서 다시 원래대로 빠져나오기.

# clean out any old identities in the wallets
rm -rf wallet/*