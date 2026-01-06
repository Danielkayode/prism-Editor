# Prism Editor System Prompt Documentation

## Overview
The Prism Editor includes an AI assistant with different modes (agent, gather, normal) that can interact with the codebase using various tools.

## System Message Structure

The system message is dynamically generated based on the chat mode and includes:

### 1. Header Information
- Defines the AI's role based on the chat mode:
  - **Agent mode**: "to help the user develop, run, and make changes to their codebase"
  - **Gather mode**: "to search, understand, and reference files in the user's codebase"
  - **Normal mode**: "to assist the user with their coding tasks"

### 2. System Information
- Operating system details
- Workspace folder information
- Opened files
- Active file
- Available persistent terminal IDs (in agent mode)

### 3. File System Overview
- Directory structure of the user's file system

### 4. Tool Definitions (for agent and gather modes)
- Available tools with their XML format definitions
- Tool calling guidelines:
  - Write tool name and parameters in XML format
  - Stop after tool call and wait for results
  - Only output one tool call at the end of response
  - Tool results appear in following user message

### 5. Mode-Specific Guidelines

#### Agent Mode Guidelines:
- Only call tools if they help accomplish the user's goal
- Don't ask for permission to use tools
- Use only one tool call at a time
- Prioritize completing requests over stopping early
- Gather context before making changes
- Have maximal certainty before making changes
- Never modify files outside workspace without permission

#### Gather Mode Guidelines:
- Must use tools to gather information, files, and context
- Extensively read files, types, content to solve problems

#### Normal Mode Guidelines:
- Allowed to ask for more context with @ references
- If suggesting edits, describe in code blocks with full file paths

### 6. General Guidelines
- Include language in code blocks when possible
- Use shell for terminal code blocks
- Include full file path as first line of code blocks
- For file edit suggestions, bias toward writing minimal changes
- Don't make up information
- Use markdown for formatting
- Today's date is included

## Chat Modes

### Agent Mode ('agent')
- Default mode for the application
- Focuses on making changes to the codebase
- Has full tool access for editing, file operations, and terminal commands

### Gather Mode ('gather')
- Focused on gathering information from the codebase
- Uses tools to search and understand files

### Normal Mode ('normal')
- General assistance mode
- Provides suggestions and information

## Tool Support

The system supports various tools including:
- File operations (read, write, create, delete, move, copy)
- Directory operations (list, tree view, search)
- Code operations (search in files, lint errors)
- Git operations (status, diff, commit, push, etc.)
- Terminal operations (run commands, persistent terminals)
- LSP operations (symbols, definitions, references, etc.)
- Editor operations (open, scroll, selection)

## XML Tool Format

Tools are called using XML format:
```
<tool_name>
<param_name>parameter value</param_name>
</tool_name>
```

## Auto-Approval Configuration

Tools are categorized by approval type:
- **edits**: File modification operations
- **terminal**: Terminal command operations  
- **MCP tools**: Model Context Protocol tools

By default, all tool types are auto-approved to enable seamless AI interaction.

## Reasoning Capabilities

The system supports models with reasoning capabilities, including:
- Open-source models with think tags (e.g., [THINK]...[/THINK])
- Anthropic-style reasoning
- OpenAI-style reasoning