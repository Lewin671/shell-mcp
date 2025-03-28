# shell-mcp

A Model Context Protocol (MCP) server that provides shell command execution capabilities. This server enables LLMs to interact with the system shell through a structured and secure interface, with built-in timeout protection and automatic shell context management.

### Key Features

- **Secure Shell Execution**: Executes shell commands with built-in timeout protection
- **Automatic Context Management**: Handles shell context cleanup and renewal
- **MCP Integration**: Seamlessly integrates with the Model Context Protocol


### Usage

The shell-mcp server provides two main tools:

1. **execute**: Execute a shell command
   - Parameters: `command` (string): The shell command to execute

2. **clearShellContext**: Clear the current shell context. No parameters required

### Configuration
To make the LLMs interact with shell-mcp, you need to change the configuration of MCP as follows:
```js
{
  "mcpServers": {
    "shellExecutor": {
      "isActive": true,
      "name": "shellExecutor",
      "description": "execute shell commands",
      "command": "npx",
      "args": [
        "shell-mcp@latest"
      ]
    }
  }
}
```
