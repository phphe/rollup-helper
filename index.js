"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const glob = require("glob");
const zlib = require('zlib');
function report(dir = 'dist', extensions = ['.js', '.css']) {
    const report = {};
    dir = dir.replace(/(\\|\/)$/, '');
    const filePaths = glob.sync(`${dir}/**/*`);
    for (const filePath of filePaths) {
        if (extensions.find(v => filePath.endsWith(v))) {
            const code = fs.readFileSync(filePath);
            const size = getSize(code);
            const sizeGzipped = getSize(zlib.gzipSync(code));
            report[filePath] = { size, sizeGzipped };
        }
    }
    console.table(report);
    return report;
}
exports.report = report;
function getSize(code) {
    return (code.length / 1024).toFixed(2) + ' KiB';
}
exports.getSize = getSize;
function belongsTo(source, dependencePatterns) {
    for (const pattern of dependencePatterns) {
        if (pattern instanceof RegExp) {
            if (pattern.test(source)) {
                return true;
            }
        }
        else if (source.startsWith(pattern)) {
            return true;
        }
    }
}
exports.belongsTo = belongsTo;
