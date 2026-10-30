#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..', '..', '..', '..')
const checks = [
  {
    file: 'README.md',
    check: (p) => fs.existsSync(p) && fs.readFileSync(p, 'utf8').trim().length > 0
  },
  {
    file: 'docs/evidence/PROVENANCE.md',
    check: (p) => fs.existsSync(p) && fs.readFileSync(p, 'utf8').trim().length > 0
  },
  {
    file: 'docs/TOOLS-MATRIX.md',
    check: (p) => {
      const content = fs.readFileSync(p, 'utf8')
      const lines = content.split('\n').slice(2) // skip header and separator
      const emptyHeads = lines.some(line => line.split('|').pop().trim() === '✗' && line.split('|')[4].trim() === '')
      return !emptyHeads
    }
  }
]

let allPassed = true

for (const { file, check } of checks) {
  const fullPath = path.join(root, file)
  if (check(fullPath)) {
    console.log(`✓ ${file} presente`)
  } else {
    console.error(`✗ ${file} faltante o inválido`)
    allPassed = false
  }
}

if (allPassed) {
  console.log('\nRelease check passed.')
  process.exit(0)
} else {
  console.error('\nRelease check failed.')
  process.exit(1)
}
