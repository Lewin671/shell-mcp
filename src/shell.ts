import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { EOL } from 'os';
import { IShellExecutor } from './interfaces/shell.js';

interface PendingCommand {
  resolve: (output: string) => void;
  reject: (error: Error) => void;
}

export class ShellExecutor implements IShellExecutor {
  private shell: ChildProcessWithoutNullStreams;
  private buffer: string = '';
  private pendingCommands: Map<string, PendingCommand> = new Map();
  private commandCounter: number = 0;

  constructor() {
    this.shell = spawn('/bin/bash', ['--norc'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PS1: '' }
    });

    this.shell.stdout.on('data', this.handleData.bind(this));
    this.shell.stderr.on('data', this.handleData.bind(this));
    this.shell.on('error', this.handleError.bind(this));
    this.shell.on('close', this.handleClose.bind(this));
  }

  private handleData(data: Buffer): void {
    this.buffer += data.toString();

    // 检查是否有命令完成标记
    let startIndex = 0;
    const marker = "__CMD_END_";
    const markerEnd = "__";

    while (true) {
      const markerIndex = this.buffer.indexOf(marker, startIndex);
      if (markerIndex === -1) break;

      const endIndex = this.buffer.indexOf(markerEnd, markerIndex + marker.length);
      if (endIndex === -1) break;

      const cmdId = this.buffer.substring(markerIndex + marker.length, endIndex);
      const output = this.buffer.substring(0, markerIndex).trim();

      const pending = this.pendingCommands.get(cmdId);
      if (pending) {
        pending.resolve(output);
        this.pendingCommands.delete(cmdId);
      }

      this.buffer = this.buffer.substring(endIndex + markerEnd.length);
      startIndex = 0; // 重置搜索起始位置，因为buffer已经被更新
    }
  }

  private handleError(error: Error): void {
    this.cleanup();
    Array.from(this.pendingCommands.values()).forEach(pending => {
      pending.reject(error);
    });
    this.pendingCommands.clear();
  }

  private handleClose(code: number): void {
    const error = new Error(`Shell process exited with code ${code}`);
    this.handleError(error);
  }

  public async execute(command: string, _: number): Promise<string> {
    return new Promise((resolve, reject) => {
      // 判断 shell 是否存在或者是否处于关闭状态
      if (!this.shell || this.shell.killed) {
        reject(new Error('Shell process is not running'));
        return;
      }
      const cmdId = (++this.commandCounter).toString();

      this.pendingCommands.set(cmdId, { resolve, reject });

      // 添加唯一结束标记
      const fullCommand = `${command}; echo "__CMD_END_${cmdId}__"${EOL}`;
      this.shell.stdin.write(fullCommand);
    });
  }

  public async destroy(): Promise<void> {
    return new Promise((resolve) => {
      this.shell.once('close', () => resolve());
      this.shell.stdin.write('exit\n');
    });
  }

  private cleanup(): void {
    this.pendingCommands.clear();
  }
}