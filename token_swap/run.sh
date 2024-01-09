#!/bin/bash

for i in {1..5}
do
   ts-node benchmark.ts &
done

wait
