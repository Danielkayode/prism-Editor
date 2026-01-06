# Tool Calls in Prism (Prism AI) Code Editor

This document provides a comprehensive guide on how to build and use all the AI-powered tool calls available in the Prism (Prism AI) code editor, which is a fork of VSCode with enhanced AI capabilities.

## Overview

Prism (Prism AI) extends the traditional VSCode editor with a rich set of AI-powered tools that allow language models to interact with the codebase, file system, terminal, and other development resources. These tools enable AI agents to perform complex development tasks such as reading files, searching code, editing files, running commands, and managing the development environment.

## Tool Categories

The tools are organized into several categories based on their functionality. The actual tools implemented in the Prism AI code editor are:

### 1. File System Tools
- `read_file`: Returns full contents of a given file
- `ls_dir`: Lists all files and folders in the given URI
- `get_dir_tree`: Returns a tree diagram of all files and folders in the given folder
- `search_pathnames_only`: Returns all pathnames that match a given query (searches only file names)
- `search_for_files`: Returns a list of file names whose content matches the given query
- `search_in_file`: Returns an array of all start line numbers where the content appears in the file
- `read_lint_errors`: Use this tool to view all lint errors on a file

### 2. File Editing Tools
- `create_file_or_folder`: Create a file or folder at the given path
- `delete_file_or_folder`: Delete a file or folder at the given path
- `edit_file`: Edit the contents of a file using SEARCH/REPLACE blocks
- `rewrite_file`: Edits a file, deleting all old contents and replacing with new content

### 3. Terminal Tools
- `run_command`: Runs a terminal command and waits for the result
- `run_persistent_command`: Runs a terminal command in a persistent terminal
- `open_persistent_terminal`: Opens a new persistent terminal for long-running processes
- `kill_persistent_terminal`: Interrupts and closes a persistent terminal

### 4. Additional Tools (Conceptual - Not Yet Implemented)
The following tools were mentioned in your request but are not currently implemented in the Prism AI codebase:
- Git tools: `git_status`, `git_diff`, `git_commit`, `git_branch`, `git_push`, `git_log`, `git_rebase`, `git_stash`, `git_tag`
- Shell tools: `shell_exec`, `shell_spawn`, `shell_kill`, `shell_attach`, `shell_prompt`
- LSP tools: `lsp_symbols`, `lsp_rename`, `lsp_hover`, `lsp_diagnostic`, `lsp_format`, `lsp_code_actions`, `lsp_references`, `lsp_organize_imports`
- Project tools: `project_index`, `project_search`, `project_symbols`, `project_dependencies`
- Editor tools: `editor_open`, `editor_close`, `editor_scroll`, `editor_selection`, `editor_fold`, `editor_format`
- Build tools: `build_run`, `build_clean`, `build_test`, `build_bench`, `build_install`
- Release tools: `version_bump`, `version_tag`, `version_publish`
- Other terminal tools: `terminal_focus`, `terminal_resize`, `terminal_clear`, `terminal_set_env`
- Additional edit tools: `copy_path`, `create_directory`, `delete_path`, `move_path`

## Built-in Prism Tools Implementation

The Prism AI editor comes with a comprehensive set of built-in tools that are implemented in the `toolsService.ts` file. Here's a detailed breakdown of each tool:

### Context-Gathering Tools

#### `read_file`
- **Description**: Returns full contents of a given file
- **Parameters**:
  - `uri`: The full path to the file
  - `start_line`: Optional. Start line number (defaults to beginning)
  - `end_line`: Optional. End line number (defaults to end)
  - `page_number`: Optional. Page number for large files (default is 1)
- **Usage**: Use this tool to read file contents, optionally specifying line ranges or pagination for large files
- **Result**: Returns file contents with pagination information and total line count

#### `ls_dir`
- **Description**: Lists all files and folders in the given URI
- **Parameters**:
  - `uri`: Optional. The full path to the folder (leave empty for workspace root)
  - `page_number`: Optional. Page number for large directories (default is 1)
- **Usage**: Use this tool to list directory contents
- **Result**: Returns paginated list of directory items with pagination info

#### `get_dir_tree`
- **Description**: Returns a tree diagram of all files and folders in the given folder
- **Parameters**:
  - `uri`: The full path to the folder
- **Usage**: Use this tool to get an overview of directory structure
- **Result**: Returns a string representation of the directory tree

#### `search_pathnames_only`
- **Description**: Returns all pathnames that match a given query (searches only file names)
- **Parameters**:
  - `query`: Your search query
  - `include_pattern`: Optional. Limit search to specific patterns
  - `page_number`: Optional. Page number for results (default is 1)
- **Usage**: Use this tool to find files by name
- **Result**: Returns list of matching URIs with pagination info

#### `search_for_files`
- **Description**: Returns a list of file names whose content matches the given query
- **Parameters**:
  - `query`: Your search query
  - `search_in_folder`: Optional. Limit search to specific folder
  - `is_regex`: Optional. Whether the query is a regex (default is false)
  - `page_number`: Optional. Page number for results (default is 1)
- **Usage**: Use this tool to search file contents
- **Result**: Returns list of matching URIs with pagination info

#### `search_in_file`
- **Description**: Returns an array of all start line numbers where the content appears in the file
- **Parameters**:
  - `uri`: The full path to the file
  - `query`: The string or regex to search for
  - `is_regex`: Optional. Whether the query is a regex (default is false)
- **Usage**: Use this tool to search for specific content within a single file
- **Result**: Returns array of matching line numbers

#### `read_lint_errors`
- **Description**: Use this tool to view all lint errors on a file
- **Parameters**:
  - `uri`: The full path to the file
- **Usage**: Use this tool to check for lint errors in a specific file
- **Result**: Returns array of lint error items or null if no errors

### File Editing Tools

#### `create_file_or_folder`
- **Description**: Create a file or folder at the given path
- **Parameters**:
  - `uri`: The full path to the file or folder
- **Usage**: Use this tool to create new files or folders (folders must end with a trailing slash)
- **Result**: Returns success confirmation

#### `delete_file_or_folder`
- **Description**: Delete a file or folder at the given path
- **Parameters**:
  - `uri`: The full path to the file or folder
  - `is_recursive`: Optional. Delete recursively (default is false)
- **Usage**: Use this tool to delete files or folders
- **Result**: Returns success confirmation

#### `edit_file`
- **Description**: Edit the contents of a file using SEARCH/REPLACE blocks
- **Parameters**:
  - `uri`: The full path to the file
  - `search_replace_blocks`: String of SEARCH/REPLACE blocks to apply
- **Usage**: Use this tool to make precise edits to file contents
- **Result**: Returns success confirmation with optional lint error information

#### `rewrite_file`
- **Description**: Edits a file, deleting all old contents and replacing with new content
- **Parameters**:
  - `uri`: The full path to the file
  - `new_content`: The new contents of the file
- **Usage**: Use this tool to completely rewrite a file
- **Result**: Returns success confirmation with optional lint error information

### Terminal Tools

#### `run_command`
- **Description**: Runs a terminal command and waits for the result (times out after 8s of inactivity)
- **Parameters**:
  - `command`: The terminal command to run
  - `cwd`: Optional. Working directory for the command
- **Usage**: Use this tool to run shell commands
- **Result**: Returns command output with exit code or timeout information

#### `run_persistent_command`
- **Description**: Runs a terminal command in a persistent terminal
- **Parameters**:
  - `command`: The terminal command to run
  - `persistent_terminal_id`: The ID of the terminal created with open_persistent_terminal
- **Usage**: Use this tool to run commands in a persistent terminal
- **Result**: Returns command output with exit code or timeout information

#### `open_persistent_terminal`
- **Description**: Opens a new persistent terminal for long-running processes
- **Parameters**:
  - `cwd`: Optional. Working directory for the terminal
- **Usage**: Use this tool to create a persistent terminal for long-running processes
- **Result**: Returns the persistent terminal ID

#### `kill_persistent_terminal`
- **Description**: Interrupts and closes a persistent terminal
- **Parameters**:
  - `persistent_terminal_id`: The ID of the persistent terminal
- **Usage**: Use this tool to close a persistent terminal
- **Result**: Returns success confirmation

## Implementation Architecture

The tool system in Prism AI is built with the following architecture:

### 1. Tool Service Interface
The `IToolsService` interface defines the contract for all tools:
- `validateParams`: Validates tool parameters
- `callTool`: Executes the tool with validated parameters
- `stringOfResult`: Converts tool results to strings for LLM consumption

### 2. Parameter Validation
Each tool has a validation function that:
- Ensures required parameters are present
- Validates parameter types and formats
- Converts parameters to appropriate data types (e.g., URI objects)
- Handles optional parameters with default values

### 3. Tool Execution
Each tool has an execution function that:
- Performs the actual operation
- Handles errors appropriately
- Returns structured results
- May return promises for asynchronous operations

### 4. Result Formatting
Each tool has a result formatting function that:
- Converts structured results to human-readable strings
- Formats output appropriately for LLM consumption
- Handles pagination and truncation for large results
- Provides context about the operation performed

## Building Custom Tools

To build custom tools for the Prism AI editor, follow these steps:

### 1. Define the Tool Interface
Add your tool to the `BuiltinToolCallParams` and `BuiltinToolResultType` types in `toolsServiceTypes.ts`. For example:

```typescript
export type BuiltinToolCallParams = {
  // ... existing tools
  'your_new_tool': { param1: string, param2: number },
  // ... other tools
}

export type BuiltinToolResultType = {
  // ... existing tools
  'your_new_tool': { resultData: string, success: boolean },
  // ... other tools
}
```

### 2. Implement Parameter Validation
Add a validation function to the `validateParams` object in `toolsService.ts`:

```typescript
this.validateParams = {
  // ... existing validations
  your_new_tool: (params: RawToolParamsObj) => {
    const { param1, param2 } = params;
    // Validate and convert parameters
    const validatedParam1 = validateStr('param1', param1);
    const validatedParam2 = validateNumber(param2, { default: 0 });
    return { param1: validatedParam1, param2: validatedParam2 };
  },
  // ... other validations
}
```

### 3. Implement Tool Execution
Add an execution function to the `callTool` object in `toolsService.ts`:

```typescript
this.callTool = {
  // ... existing tools
  your_new_tool: async ({ param1, param2 }) => {
    // Implement your tool's functionality
    const result = await performYourToolAction(param1, param2);
    return { result };
  },
  // ... other tools
}
```

### 4. Implement Result Formatting
Add a result formatting function to the `stringOfResult` object in `toolsService.ts`:

```typescript
this.stringOfResult = {
  // ... existing formatters
  your_new_tool: (params, result) => {
    // Format the result for LLM consumption
    return `Tool result: ${result.resultData}`;
  },
  // ... other formatters
}
```

### 5. Add Tool Definition
Add your tool to the `builtinTools` object in `prompts.ts` with proper documentation:

```typescript
your_new_tool: {
  name: 'your_new_tool',
  description: `Description of what your tool does.`,
  params: {
    param1: { description: 'Description of param1' },
    param2: { description: 'Description of param2' },
  },
},
```

### 6. Security Considerations
If your tool performs potentially dangerous operations, add it to the approval system in `approvalTypeOfBuiltinToolName` in `toolsServiceTypes.ts`:

```typescript
export const approvalTypeOfBuiltinToolName: Partial<{ [T in BuiltinToolName]?: 'edits' | 'terminal' | 'MCP tools' }> = {
  // ... existing tools
  'your_new_tool': 'edits', // or 'terminal' or 'MCP tools'
}
```

## Leveraging the Full Potential of Prism (Prism AI)

### 1. Tool Chaining
The Prism AI editor supports tool chaining, allowing AI agents to use multiple tools in sequence to accomplish complex tasks. The system ensures that each tool's output is properly formatted and available for the next tool call.

### 2. Context Management
The tool system maintains context between tool calls, allowing AI agents to build upon previous results. This enables complex workflows like:
- Searching for files using `search_pathnames_only`
- Reading file contents with `read_file`
- Making edits with `edit_file` or `rewrite_file`
- Verifying changes with `read_lint_errors`

### 3. Error Handling and Recovery
The tool system includes comprehensive error handling:
- Parameter validation prevents invalid inputs
- Proper error messages guide AI agents toward correct usage
- Lint error checking after edits helps maintain code quality

### 4. Performance Optimization
- Large files and directories are handled with pagination
- Asynchronous operations prevent blocking the UI
- Caching mechanisms improve response times for repeated operations

### 5. Integration with VSCode Features
The Prism AI tools integrate seamlessly with existing VSCode features:
- File system operations work with VSCode's file service
- Terminal tools integrate with VSCode's terminal system
- Linting tools work with existing language servers
- Git operations can be extended to work with VSCode's Git extension

## Security and Approval System

Prism AI implements a security approval system for potentially dangerous operations:

- **Edit tools** (create, delete, edit files) require explicit approval
- **Terminal tools** (run commands) require explicit approval
- **MCP tools** (external services) require explicit approval

The approval system is defined in `approvalTypeOfBuiltinToolName` in `toolsServiceTypes.ts`.

## Best Practices

### For Tool Usage:
1. Always use the appropriate tool for the task at hand
2. Prefer specific tools over general ones when possible
3. Use pagination for large files or directories
4. Handle errors gracefully and provide meaningful feedback
5. Use persistent terminals for long-running processes

### For Tool Development:
1. Validate all parameters before processing
2. Handle both synchronous and asynchronous operations appropriately
3. Format results in a way that's consumable by LLMs
4. Implement proper error handling and reporting
5. Consider performance implications for large operations

## Integration with Language Models

The tool system is designed to work seamlessly with language models through:

1. **XML-based tool calling format**: Tools are called using XML-like syntax
2. **Structured parameters**: All tools have well-defined parameter schemas
3. **Formatted results**: Tool results are formatted for easy parsing by LLMs
4. **Sequential execution**: Tools are executed one at a time with results returned before the next tool call

## Conclusion

The tool system in Prism (Prism AI) provides a powerful foundation for AI-assisted development. By leveraging these tools, AI agents can perform complex development tasks while maintaining safety and providing meaningful feedback to users. The modular architecture allows for easy extension with custom tools while maintaining consistency across the system.

The integration between the AI capabilities and traditional VSCode functionality creates a unique development environment that enhances productivity while maintaining the familiar VSCode experience. The tools are designed to work seamlessly together, enabling complex workflows that combine AI reasoning with precise code manipulation and system interaction.

Whether you're building new tools or leveraging existing ones, the Prism AI tool system provides the flexibility and power needed for modern AI-assisted software development.