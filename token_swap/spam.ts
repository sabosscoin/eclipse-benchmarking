import { spawn, ChildProcess } from "child_process";

const runBenchmark = (): ChildProcess => {
  return spawn("ts-node", ["benchmark.ts"], { stdio: "inherit" });
};

for (let i = 0; i < 10; i++) {
  runBenchmark();
}
