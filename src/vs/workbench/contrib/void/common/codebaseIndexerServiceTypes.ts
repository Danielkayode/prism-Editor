/*--------------------------------------------------------------------------------------
 *  Copyright 2025 Glass Devtools, Inc. All rights reserved.
 *  Licensed under the Apache License, Version 2.0. See LICENSE.txt for more information.
 *--------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';

export interface SymbolInfo {
    name: string;
    kind: string; // e.g., 'function', 'class', 'variable'
    range: { startLine: number; startColumn: number; endLine: number; endColumn: number };
    uri: URI;
}

export interface FileIndex {
    uri: URI;
    symbols: SymbolInfo[];
    imports: string[];
    // Basic text content hash for change detection
    contentHash: string;
    lastUpdated: number;
}

export interface CodebaseIndex {
    files: Map<string, FileIndex>; // Keyed by URI.toString()
}

export interface IndexStats {
    totalFiles: number;
    totalSymbols: number;
    lastIndexed: number;
}

export interface IPrismCodebaseIndexerService {
    readonly _serviceBrand: undefined;

    readonly onDidUpdateIndex: Event<void>;

    /**
     * Rebuilds the index for the given workspace folder or all folders.
     */
    rebuildIndex(root?: URI): Promise<void>;

    /**
     * Updates the index for a specific file (incremental update).
     */
    updateFileIndex(uri: URI): Promise<void>;

    /**
     * Search for symbols in the index.
     */
    searchSymbols(query: string): Promise<SymbolInfo[]>;

    /**
     * Get the index statistics.
     */
    getStats(): IndexStats;
}

export const IPrismCodebaseIndexerService = createDecorator<IPrismCodebaseIndexerService>('prismCodebaseIndexerService');
