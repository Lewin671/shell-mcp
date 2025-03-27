#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { ShellExecutor } from "./shell.js";

// Create an MCP server
const server = new McpServer({
    name: "shell",
    version: "0.0.1",
});
let shell = new ShellExecutor();

// Add an addition tool
server.tool("execute", "execute a shell command",
    { command: z.string() },
    async ({ command }) => {
        return {
            content: [{ type: "text", text: await shell.execute(command) }]
        }
    }
);

server.tool("clearShellContext", "clear the shell context", {}, async () => {
    if (shell) {
        await shell.destroy();
    }
    shell = new ShellExecutor();
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