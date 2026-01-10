/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const gulp = require('gulp');
const path = require('path');
const es = require('event-stream');
const util = require('./lib/util');
const { getVersion } = require('./lib/getVersion');
const task = require('./lib/task');
const optimize = require('./lib/optimize');
const { inlineMeta } = require('./lib/inlineMeta');
const product = require('../product.json');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const filter = require('gulp-filter');
const { getProductionDependencies } = require('./lib/dependencies');
const { readISODate } = require('./lib/date');
const vfs = require('vinyl-fs');
const packageJson = require('../package.json');
const flatmap = require('gulp-flatmap');
const gunzip = require('gulp-gunzip');
const File = require('vinyl');
const fs = require('fs');
const glob = require('glob');
const { compileBuildWithManglingTask } = require('./gulpfile.compile');
const { cleanExtensionsBuildTask, compileNonNativeExtensionsBuildTask, compileNativeExtensionsBuildTask, compileExtensionMediaBuildTask } = require('./gulpfile.extensions');
// const { vscodeWebResourceIncludes, createVSCodeWebFileContentMapper } = require('./gulpfile.web'); // Commented out - not available in Void fork

const root = path.dirname(__dirname);
const commit = getVersion(root);

const BUILD_ROOT = path.dirname(root);
const DESTINATION = path.join(BUILD_ROOT, 'vscode-server');

const json = require('gulp-json-editor');

function packageTask(type, platform, arch, sourceFolderName, destinationFolderName) {
	const archiveName = `vscode-server-${platform}-${arch}`;
	const destination = path.join(BUILD_ROOT, destinationFolderName);

	return () => {
		const version = packageJson.version;

		const productJsonStream = gulp.src(['product.json'], { base: '.' })
			.pipe(json({ 
				commit, 
				date: readISODate('out-build'), 
				version, 
				serverDownloadUrlTemplate: 'https://github.com/Danielkayode/binaries/releases/download/!!RELEASE_VERSION!!/prism-reh-${os}-${arch}-!!RELEASE_VERSION!!.tar.gz' 
			}))
			.pipe(es.through(function (file) {
				const product = JSON.parse(file.contents.toString());
				if (type === 'reh-web') {
					delete product.serverApplicationName;
					delete product.serverDataFolderName;
				}
				file.contents = Buffer.from(JSON.stringify(product, null, '\t'));
				this.emit('data', file);
			}));

		const license = gulp.src(['remote/LICENSE'], { base: 'remote' });

		const sources = vfs.src(path.join(sourceFolderName, '**'), { base: sourceFolderName, dot: true })
			.pipe(filter(['**', '!**/*.js.map']));

		const depsSrc = _.flatten(getProductionDependencies(path.join(root, 'remote'))
			.map(d => [path.join(d.path, '**'), `!${path.join(d.path, 'node_modules', '**')}`]));

		const deps = gulp.src(depsSrc, { base: 'remote', dot: true })
			.pipe(filter(['**', '!**/package-lock.json', '!**/yarn.lock', '!**/*.js.map']));

		let all = es.merge(sources, deps, productJsonStream, license);

		if (platform === 'win32') {
			all = es.merge(all, gulp.src(['remote/win32/code-server.cmd'], { base: 'remote' }));
		} else if (platform === 'linux' || platform === 'darwin') {
			all = es.merge(all, gulp.src([`remote/${platform}/code-server.sh`], { base: 'remote' })
				.pipe(rename('bin/code-server')));
		}

		return all
			.pipe(vfs.dest(destination));
	};
}

const tweakProductForServerWeb = (product) => {
	const res = { ...product };
	delete res.serverApplicationName;
	delete res.serverDataFolderName;
	return res;
};

['reh', 'reh-web'].forEach(type => {
	const bundleTask = task.define(`bundle-vscode-${type}`, task.series(
		util.rimraf(`out-vscode-${type}`),
		optimize.bundleTask(
			{
				src: 'out-build',
				// entryPoints: buildfile.vscodeServer(type), // Commented out - buildfile not defined in Void fork
				entryPoints: [], // Empty array as fallback - no entry points needed
				// resources: vscodeWebResourceIncludes, // Commented out - not available in Void fork
				resources: [], // Empty array as fallback
				out: `out-vscode-${type}`,
				bundleIdMapper: {
					'.build/extensions': (product) => {
						// return createVSCodeWebFileContentMapper('.build/extensions', type === 'reh-web' ? tweakProductForServerWeb(product) : product); // Commented out - not available in Void fork
						return {}; // Empty object as fallback
					}
				}
			}
		)
	));

	const minifyTask = task.define(`minify-vscode-${type}`, task.series(
		bundleTask,
		util.rimraf(`out-vscode-${type}-min`),
		optimize.minifyTask(`out-vscode-${type}`, `https://github.com/Danielkayode/binaries/releases/download/!!RELEASE_VERSION!!/sourcemaps/${commit}/core`)
	));
	gulp.task(minifyTask);

	const BUILD_TARGETS = [
		{ platform: 'linux', arch: 'x64' },
		{ platform: 'linux', arch: 'arm64' },
		{ platform: 'linux', arch: 'armhf' },
		{ platform: 'darwin', arch: 'x64' },
		{ platform: 'darwin', arch: 'arm64' },
		{ platform: 'win32', arch: 'x64' },
		{ platform: 'win32', arch: 'ia32' },
		{ platform: 'win32', arch: 'arm64' },
	];

	BUILD_TARGETS.forEach(buildTarget => {
		const dashed = (str) => (str ? `-${str}` : ``);
		const platform = buildTarget.platform;
		const arch = buildTarget.arch;

		['', 'min'].forEach(minified => {
			const sourceFolderName = `out-vscode-${type}${dashed(minified)}`;
			const destinationFolderName = `vscode-${type}${dashed(platform)}${dashed(arch)}`;

			const serverTaskCI = task.define(`vscode-${type}${dashed(platform)}${dashed(arch)}${dashed(minified)}-ci`, task.series(
				compileNativeExtensionsBuildTask,
				gulp.task(`node-${platform}-${arch}`),
				util.rimraf(path.join(BUILD_ROOT, destinationFolderName)),
				packageTask(type, platform, arch, sourceFolderName, destinationFolderName)
			));
			gulp.task(serverTaskCI);
		});
	});
});
