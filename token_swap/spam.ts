import { spawn, ChildProcess } from "child_process";

const maxProcesses = 10;
let activeProcesses = 0;

const runBenchmark = (): void => {
  // Only spawn a new process if there's room
  if (activeProcesses < maxProcesses) {
    activeProcesses++;
    const process = spawn("ts-node", ["benchmark.ts"], { stdio: "inherit" });

    process.on("exit", () => {
      activeProcesses--;
      // Try to spawn a new process after one exits
      runBenchmark();
    });
  }
};

// Initial population of processes
for (let i = 0; i < maxProcesses; i++) {
  runBenchmark();
}
