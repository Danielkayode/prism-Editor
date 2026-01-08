/*---------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const es = require('event-stream');
const vfs = require('vinyl-fs');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const filter = require('gulp-filter');
const util = require('./lib/util');
const { getVersion } = require('./lib/getVersion');
const { readISODate } = require('./lib/date');
const task = require('./lib/task');
const buildfile = require('./buildfile');
const optimize = require('./lib/optimize');
const { inlineMeta } = require('./lib/inlineMeta');
const root = path.dirname(__dirname);
const commit = getVersion(root);
const packageJson = require('../package.json');
const product = require('../product.json');
const crypto = require('crypto');
const i18n = require('./lib/i18n');
const { getProductionDependencies } = require('./lib/dependencies');
const { config } = require('./lib/electron');
const createAsar = require('./lib/asar').createAsar;
const minimist = require('minimist');
const { compileBuildWithoutManglingTask, compileBuildWithManglingTask } = require('./gulpfile.compile');
const { cleanExtensionsBuildTask, compileAllExtensionsBuildTask, compileExtensionMediaBuildTask } = require('./gulpfile.extensions');

const BUILD_ROOT = path.dirname(root);
const json = require('gulp-json-editor');

function packageTask(platform, arch, sourceFolderName, destinationFolderName, opts) {
	opts = opts || {};

	const destination = path.join(BUILD_ROOT, destinationFolderName);

	return () => {
		const checksums = {};
		const version = packageJson.version;

		const productJsonStream = gulp.src(['product.json'], { base: '.' })
			.pipe(json({ 
				commit, 
				date: readISODate('out-build'), 
				checksums, 
				version, 
				serverDownloadUrlTemplate: 'https://github.com/Danielkayode/binaries/releases/download/!!RELEASE_VERSION!!/prism-reh-${os}-${arch}-!!RELEASE_VERSION!!.tar.gz' 
			}))
			.pipe(es.through(function (file) {
				const product = JSON.parse(file.contents.toString());
				file.contents = Buffer.from(JSON.stringify(product, null, '\t'));
				this.emit('data', file);
			}));

		// ... (rest of the packageTask implementation)
	};
}

const coreCI = task.define('optimize-vscode-ci', task.series(
	util.rimraf('out-vscode-min'),
	optimize.optimizeTask({
		src: 'out-build',
		entryPoints: buildfile.vscode,
		resources: [],
		out: 'out-vscode-min',
		sourcemaps: `https://github.com/Danielkayode/binaries/releases/download/!!RELEASE_VERSION!!/sourcemaps/${commit}/core`
	})
));
gulp.task(coreCI);

const minifyTask = (src, sourcemaps, name) => task.define(`minify-vscode-${name}`, task.series(
	util.rimraf(`out-vscode-${name}-min`),
	optimize.minifyTask(src, `https://github.com/Danielkayode/binaries/releases/download/!!RELEASE_VERSION!!/sourcemaps/${commit}/core`)
));

gulp.task(minifyTask('out-vscode', true, 'main'));
gulp.task(minifyTask('out-vscode-dev', true, 'dev'));
