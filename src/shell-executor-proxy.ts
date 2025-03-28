import { IShellExecutor } from './interfaces/shell.js';
import { ShellExecutor } from './shell.js';

export class ShellExecutorProxy implements IShellExecutor {
  private executor: IShellExecutor;

  constructor() {
    this.executor = new ShellExecutor();
  }

  public async execute(command: string, timeoutMs: number = 10000): Promise<string> {
    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(async () => {
        this.destroy();
        this.executor = new ShellExecutor();
        reject(new Error('Command timed out'));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([
        this.executor.execute(command),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      throw error;
    } finally {
      clearTimeout(timeoutId);  // 成功执行时取消定时器
    }
  }

  public async destroy(): Promise<void> {
    await this.executor.destroy();
  }
}
