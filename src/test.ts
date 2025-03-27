import { ShellExecutor } from "./shell.js";

// 使用示例
(async () => {
  const shell = new ShellExecutor();

  try {
    // 保持上下文的连续命令执行
    await shell.execute('cd /tmp');
    const pwdResult = await shell.execute('pwd');
    console.log('Current directory:', pwdResult); // 输出 /tmp

    // 设置环境变量
    await shell.execute('export MY_VAR="typescript"');
    const echoResult = await shell.execute('echo $MY_VAR');
    console.log('Environment variable:', echoResult); // 输出 typescript

    // 组合命令
    const lsResult = await shell.execute('ls -la | head -n 3');
    console.log('Directory listing:', lsResult);

    // 测试错误处理
    try {
      await shell.execute('non_existent_command', 2000);
    } catch (error) {
      console.error('Command failed:', (error as Error).message);
    }
  } finally {
    await shell.destroy();
  }
})();