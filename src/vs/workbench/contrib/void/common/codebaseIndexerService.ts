/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved. 
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information. 
 *--------------------------------------------------------------------------------------*/

import { Emitter, Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { registerSingleton, InstantiationType } from '../../../../platform/instantiation/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IPrismDirectoryStrService } from './directoryStrService.js';
import { IPrismCodebaseIndexerService, IndexStats, SymbolInfo, FileIndex } from './codebaseIndexerServiceTypes.js';

class PrismCodebaseIndexerService extends Disposable implements IPrismCodebaseIndexerService {
    _serviceBrand: undefined;

    private readonly _onDidUpdateIndex = new Emitter<void>();
    readonly onDidUpdateIndex: Event<void> = this._onDidUpdateIndex.event;

    private _index: Map<string, FileIndex> = new Map();

    constructor(
        @IWorkspaceContextService private readonly workspaceContextService: IWorkspaceContextService,
        @IFileService private readonly fileService: IFileService,
        @IPrismDirectoryStrService private readonly directoryStrService: IPrismDirectoryStrService,
    ) {
        super();
    }

    getStats(): IndexStats {
        let totalSymbols = 0;
        for (const fileIndex of this._index.values()) {
            totalSymbols += fileIndex.symbols.length;
        }
        return {
            totalFiles: this._index.size,
            totalSymbols,
            lastIndexed: Date.now() // Approximation
        };
    }

    async rebuildIndex(root?: URI): Promise<void> {
        this._index.clear();
        
        const roots = root ? [root] : this.workspaceContextService.getWorkspace().folders.map(f => f.uri);
        
        for (const folderUri of roots) {
            // Use directoryStrService to get all files. 
            // Note: getAllURIsInDirectory might need a large limit.
            const uris = await this.directoryStrService.getAllURIsInDirectory(folderUri, { maxResults: 10000 });
            
            for (const uri of uris) {
                await this.updateFileIndex(uri);
            }
        }
        
        this._onDidUpdateIndex.fire();
    }

    async updateFileIndex(uri: URI): Promise<void> {
        try {
            const content = await this.fileService.readFile(uri);
            const text = content.value.toString();
            
            const symbols = this._parseSymbols(uri, text);
            
            this._index.set(uri.toString(), {
                uri,
                symbols,
                imports: [], // TODO: extract imports
                contentHash: String(text.length), // Simple hash for now
                lastUpdated: Date.now()
            });
        } catch (e) {
            // console.error('Failed to index file', uri.fsPath, e);
        }
    }

    async searchSymbols(query: string): Promise<SymbolInfo[]> {
        const results: SymbolInfo[] = [];
        const lowerQuery = query.toLowerCase();

        for (const fileIndex of this._index.values()) {
            for (const symbol of fileIndex.symbols) {
                if (symbol.name.toLowerCase().includes(lowerQuery)) {
                    results.push(symbol);
                }
            }
        }
        return results;
    }

    private _parseSymbols(uri: URI, text: string): SymbolInfo[] {
        const symbols: SymbolInfo[] = [];
        const ext = uri.path.split('.').pop()?.toLowerCase();

        if (ext === 'ts' || ext === 'js' || ext === 'tsx' || ext === 'jsx') {
            this._parseTSJS(uri, text, symbols);
        } else if (ext === 'py') {
            this._parsePython(uri, text, symbols);
        }
        
        return symbols;
    }

    private _parseTSJS(uri: URI, text: string, symbols: SymbolInfo[]) {
        const lines = text.split('\n');
        // Simple regexes - not perfect but okay for prototype
        const funcRegex = /function\s+([a-zA-Z0-9_$]+)/;
        const classRegex = /class\s+([a-zA-Z0-9_$]+)/;
        const constRegex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/;
        const interfaceRegex = /interface\s+([a-zA-Z0-9_$]+)/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let match;

            if ((match = funcRegex.exec(line))) {
                symbols.push(this._createSymbol(uri, match[1], 'function', i, match.index));
            } else if ((match = classRegex.exec(line))) {
                symbols.push(this._createSymbol(uri, match[1], 'class', i, match.index));
            } else if ((match = constRegex.exec(line))) {
                symbols.push(this._createSymbol(uri, match[1], 'variable', i, match.index));
            } else if ((match = interfaceRegex.exec(line))) {
                 symbols.push(this._createSymbol(uri, match[1], 'interface', i, match.index));
            }
        }
    }

    private _parsePython(uri: URI, text: string, symbols: SymbolInfo[]) {
         const lines = text.split('\n');
        const defRegex = /^\s*def\s+([a-zA-Z0-9_]+)/;
        const classRegex = /^\s*class\s+([a-zA-Z0-9_]+)/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let match;
            
            if ((match = defRegex.exec(line))) {
                 symbols.push(this._createSymbol(uri, match[1], 'function', i, match.index));
            } else if ((match = classRegex.exec(line))) {
                 symbols.push(this._createSymbol(uri, match[1], 'class', i, match.index));
            }
        }
    }

    private _createSymbol(uri: URI, name: string, kind: string, line: number, col: number): SymbolInfo {
        return {
            name,
            kind,
            uri,
            range: {
                startLine: line + 1,
                startColumn: col + 1,
                endLine: line + 1,
                endColumn: col + 1 + name.length
            }
        };
    }
}

registerSingleton(IPrismCodebaseIndexerService, PrismCodebaseIndexerService, InstantiationType.Delayed);
