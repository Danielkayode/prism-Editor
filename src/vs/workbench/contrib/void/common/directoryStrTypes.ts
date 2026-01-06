import { URI } from '../../../../base/common/uri.js';

export type PrismDirectoryItem = {
	uri: URI;
	name: string;
	isSymbolicLink: boolean;
	children: PrismDirectoryItem[] | null;
	isDirectory: boolean;
	isGitIgnoredDirectory: false | { numChildren: number }; // if directory is gitignored, we ignore children
}
