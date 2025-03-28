import { IShellExecutor } from './interfaces/shell.js';
import { ShellExecutor } from './shell.js';

export class ShellExecutorProxy implements IShellExecutor {
  private executor: IShellExecutor;

  constructor() {
    this.executor = new ShellExecutor();
  }

  public async execute(command: string, timeoutMs: number = 10000): Promise<string> {
    // Create a timeout promise that rejects when time is up
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        this.destroy().finally(() => {
          this.executor = new ShellExecutor();
          reject(new Error('Command timed out'));
        });
      }, timeoutMs);
    });

    // Race between the execution and the timeout
    try {
      const result = await Promise.race([
        this.executor.execute(command),
        timeoutPromise
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    await this.executor.destroy();
  }
}