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
        if (!command) {
            return {
                content: [{ type: "text", text: "No command provided" }]
            }
        }

        try {
            const result = await shell.execute(command);
            return {
                content: [{ type: "text", text: result }]
            }
        } catch (error) {
            return {
                content: [{ type: "text", text: `Command execution failed: ${error instanceof Error ? error.message : String(error)}` }]
            }
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
});

console.log("MCP server started");