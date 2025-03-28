import { ShellExecutorProxy } from "./shell-executor-proxy.js";

// 使用示例
(async () => {
  const shell = new ShellExecutorProxy();

  try {
    let result = await shell.execute('ls -l', 1000);
    console.log(result);

    result = await shell.execute('sleep 11', 1000);
    console.log(result);
  } catch (e) {
    console.log("received error: " + e);
  } finally {
    console.log("finally");
  }
})();