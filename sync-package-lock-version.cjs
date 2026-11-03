const fs = require('node:fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lockfilePath = 'package-lock.json';
const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf8'));

if (!lockfile.packages?.['']) {
  throw new Error('package-lock.json is missing the root package entry');
}

lockfile.version = packageJson.version;
lockfile.packages[''].version = packageJson.version;

fs.writeFileSync(lockfilePath, `${JSON.stringify(lockfile, null, 2)}\n`);
