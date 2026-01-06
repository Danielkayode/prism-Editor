import { URI } from '../../../../base/common/uri.js'
import { RawMCPToolCall } from './mcpServiceTypes.js';
import { builtinTools } from './prompt/prompts.js';
import { RawToolParamsObj } from './sendLLMMessageTypes.js';



export type TerminalResolveReason = { type: 'timeout' } | { type: 'done', exitCode: number }

export type LintErrorItem = { code: string, message: string, startLineNumber: number, endLineNumber: number }

// Partial of IFileStat
export type ShallowDirectoryItem = {
	uri: URI;
	name: string;
	isDirectory: boolean;
	isSymbolicLink: boolean;
}


export const approvalTypeOfBuiltinToolName: Partial<{ [T in BuiltinToolName]?: 'edits' | 'terminal' | 'MCP tools' }> = {
	'create_file_or_folder': 'edits',
	'delete_file_or_folder': 'edits',
	'rewrite_file': 'edits',
	'edit_file': 'edits',
	'move_file_or_folder': 'edits',
	'copy_file_or_folder': 'edits',
	'run_command': 'terminal',
	'run_persistent_command': 'terminal',
	'open_persistent_terminal': 'terminal',
	'kill_persistent_terminal': 'terminal',
	'git_status': 'terminal',
	'git_diff': 'terminal',
	'git_commit': 'terminal',
	'git_branch': 'terminal',
	'git_push': 'terminal',
	'git_log': 'terminal',
	'git_rebase': 'terminal',
	'git_stash': 'terminal',
	'git_tag': 'terminal',
	'git_checkout': 'terminal',
}


export type ToolApprovalType = NonNullable<(typeof approvalTypeOfBuiltinToolName)[keyof typeof approvalTypeOfBuiltinToolName]>;


export const toolApprovalTypes = new Set<ToolApprovalType>([
	...Object.values(approvalTypeOfBuiltinToolName),
	'MCP tools',
])




// PARAMS OF TOOL CALL
export type BuiltinToolCallParams = {
	'read_file': { uri: URI, startLine: number | null, endLine: number | null, pageNumber: number },
	'ls_dir': { uri: URI, pageNumber: number },
	'get_dir_tree': { uri: URI },
	'search_pathnames_only': { query: string, includePattern: string | null, pageNumber: number },
	'search_for_files': { query: string, isRegex: boolean, searchInFolder: URI | null, pageNumber: number },
	'search_in_file': { uri: URI, query: string, isRegex: boolean },
	'read_lint_errors': { uri: URI },
	// ---
	'rewrite_file': { uri: URI, newContent: string },
	'edit_file': { uri: URI, searchReplaceBlocks: string },
	'create_file_or_folder': { uri: URI, isFolder: boolean },
	'delete_file_or_folder': { uri: URI, isRecursive: boolean, isFolder: boolean },
	'move_file_or_folder': { source_uri: URI, target_uri: URI },
	'copy_file_or_folder': { source_uri: URI, target_uri: URI },
	// ---
	'run_command': { command: string; cwd: string | null, terminalId: string },
	'open_persistent_terminal': { cwd: string | null },
	'run_persistent_command': { command: string; persistentTerminalId: string },
	'kill_persistent_terminal': { persistentTerminalId: string },
	// ---
	'git_status': { cwd: string | null },
	'git_diff': { cwd: string | null, args: string | null },
	'git_commit': { cwd: string | null, message: string },
	'git_branch': { cwd: string | null, name: string | null, delete: boolean | null },
	'git_push': { cwd: string | null, remote: string | null, branch: string | null },
	'git_log': { cwd: string | null, count: number | null },
	'git_rebase': { cwd: string | null, branch: string },
	'git_stash': { cwd: string | null, command: 'push' | 'pop' | 'list' | 'apply' | null },
	'git_tag': { cwd: string | null, command: 'list' | 'create' | 'delete' | null, name: string | null },
	// --- lsp ---
	'lsp_symbols': { uri: URI },
	'lsp_definitions': { uri: URI, line: number, column: number },
	'lsp_references': { uri: URI, line: number, column: number },
	'lsp_hover': { uri: URI, line: number, column: number },
	'lsp_format': { uri: URI },
	'project_symbols': { query: string },
	'editor_open': { uri: URI },
	'project_index': {},
	'project_dependencies': {},
	'lsp_rename': { uri: URI, line: number, column: number, newName: string },
	'lsp_organize_imports': { uri: URI },
	'editor_close': { uri: URI },
	'editor_selection': { uri: URI, startLine: number, startColumn: number, endLine: number, endColumn: number },
	'git_checkout': { cwd: string | null, branch: string },
	'lsp_code_actions': { uri: URI, line: number, column: number },
	'editor_scroll': { uri: URI, line: number },
	'terminal_focus': { terminalId: string },
	'terminal_clear': { terminalId: string },
}

// RESULT OF TOOL CALL
export type BuiltinToolResultType = {
	'read_file': { fileContents: string, totalFileLen: number, totalNumLines: number, hasNextPage: boolean },
	'ls_dir': { children: ShallowDirectoryItem[] | null, hasNextPage: boolean, hasPrevPage: boolean, itemsRemaining: number },
	'get_dir_tree': { str: string, },
	'search_pathnames_only': { uris: URI[], hasNextPage: boolean },
	'search_for_files': { uris: URI[], hasNextPage: boolean },
	'search_in_file': { lines: number[]; },
	'read_lint_errors': { lintErrors: LintErrorItem[] | null },
	// ---
	'rewrite_file': Promise<{ lintErrors: LintErrorItem[] | null }>,
	'edit_file': Promise<{ lintErrors: LintErrorItem[] | null }>,
	'create_file_or_folder': {},
	'delete_file_or_folder': {},
	'move_file_or_folder': {},
	'copy_file_or_folder': {},
	// ---
	'run_command': { result: string; resolveReason: TerminalResolveReason; },
	'run_persistent_command': { result: string; resolveReason: TerminalResolveReason; },
	'open_persistent_terminal': { persistentTerminalId: string },
	'kill_persistent_terminal': {},
	// ---
	'git_status': { result: string; resolveReason: TerminalResolveReason; },
	'git_diff': { result: string; resolveReason: TerminalResolveReason; },
	'git_commit': { result: string; resolveReason: TerminalResolveReason; },
	'git_branch': { result: string; resolveReason: TerminalResolveReason; },
	'git_push': { result: string; resolveReason: TerminalResolveReason; },
	'git_log': { result: string; resolveReason: TerminalResolveReason; },
	'git_rebase': { result: string; resolveReason: TerminalResolveReason; },
	'git_stash': { result: string; resolveReason: TerminalResolveReason; },
	'git_tag': { result: string; resolveReason: TerminalResolveReason; },
	// --- lsp ---
	'lsp_symbols': { symbols: { name: string, kind: string, range: { startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number } }[] },
	'lsp_definitions': { definitions: { uri: URI, range: { startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number } }[] },
	'lsp_references': { references: { uri: URI, range: { startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number } }[] },
	'lsp_hover': { contents: string[] },
	'lsp_format': {},
	'project_symbols': { symbols: { name: string, kind: string, uri: URI, range: { startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number } }[] },
	'editor_open': {},
	'project_index': { uris: URI[] },
	'project_dependencies': { dependencies: { file: URI, content: string }[] },
	'lsp_rename': {},
	'lsp_organize_imports': {},
	'editor_close': {},
	'editor_selection': {},
	'git_checkout': { result: string; resolveReason: TerminalResolveReason; },
	'lsp_code_actions': { actions: { title: string, kind: string, isPreferred: boolean }[] },
	'editor_scroll': {},
	'terminal_focus': {},
	'terminal_clear': {},
}


export type ToolCallParams<T extends BuiltinToolName | (string & {})> = T extends BuiltinToolName ? BuiltinToolCallParams[T] : RawToolParamsObj
export type ToolResult<T extends BuiltinToolName | (string & {})> = T extends BuiltinToolName ? BuiltinToolResultType[T] : RawMCPToolCall

export type BuiltinToolName = keyof BuiltinToolResultType

type BuiltinToolParamNameOfTool<T extends BuiltinToolName> = keyof (typeof builtinTools)[T]['params']
export type BuiltinToolParamName = { [T in BuiltinToolName]: BuiltinToolParamNameOfTool<T> }[BuiltinToolName]


export type ToolName = BuiltinToolName | (string & {})
export type ToolParamName<T extends ToolName> = T extends BuiltinToolName ? BuiltinToolParamNameOfTool<T> : string
