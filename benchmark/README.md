# Benchmarks

Measure the perfomance of your graphql queries using wrk & lua scripts.

## Prerequesities
- Install of wrk. (For linux, sorry Eric)
    - Clone its repo: https://github.com/wg/wrk.git
    - Installation instructions: https://github.com/wg/wrk/wiki/Installing-Wrk-on-Linux

## Running benchmarks

- Standard parameters:
    - Number of concurrent connections: 5000 - 10000
    - Duration of tests: 1m, 5m, 15m 

- Results to be stored in the results folder. Example format stored.
- An example lua script is stored in the scripts/ folder

## Examples

wrk -c5000 -t12 -d1m -s ./graphql.lua --latency http://localhost:4000/graphql