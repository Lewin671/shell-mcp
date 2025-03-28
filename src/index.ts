#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ShellExecutorProxy } from "./shell-executor-proxy.js";

// Create an MCP server
const server = new McpServer({
    name: "shell",
    version: "0.0.1",
});
let shell = new ShellExecutorProxy();

// Add an addition tool
server.tool("execute", "execute a shell command",
    { command: z.string().optional() },
    async ({ command }) => {
        return {
            content: [{ type: "text", text: command ? await shell.execute(command) : "No command provided" }]
        }
    }
);

server.tool("clearShellContext", "clear the shell context", {}, async () => {
    if (shell) {
        await shell.destroy();
    }
    shell = new ShellExecutorProxy();
    return {
        content: [{ type: "text", text: "Shell context cleared" }]
    }
})

// 将顶级 await 包装在异步函数中并立即调用
const main = async () => {
    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
};

main().catch(error => {
    console.error("Error:", error);
    process.exit(1);
});

console.log("MCP server started");