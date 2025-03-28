# shell-mcp

A Model Context Protocol (MCP) server that provides shell command execution capabilities. This server enables LLMs to interact with the system shell through a structured and secure interface, with built-in timeout protection and automatic shell context management.

### Key Features

- **Secure Shell Execution**: Executes shell commands with built-in timeout protection
- **Automatic Context Management**: Handles shell context cleanup and renewal
- **MCP Integration**: Seamlessly integrates with the Model Context Protocol


### Usage

The shell-mcp server provides two main tools:

1. **execute**: Execute a shell command
   - Parameters:
     - `command` (string): The shell command to execute

2. **clearShellContext**: Clear the current shell context
   - No parameters required

### Configuration
To make the LLMs interact with shell-mcp, you need to add the following configuration to your MCP configuration:
1. Build the shell-mcp project:
    ```bash
    npm install shell-mcp
    ```
2. Add the following configuration to your MCP configuration:
    ```js
    {
        "mcpServers": {
            "shell": {
                "command": "node",
                "args": [
                    "./build/index.js" // Path to the shell-mcp server
                ]
            }
        }
    }
    ```
