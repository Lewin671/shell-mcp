export interface IShellExecutor {
  execute(command: string, timeoutMs?: number): Promise<string>;
  destroy(): Promise<void>;
}