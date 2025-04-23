const fs = require('fs')
const path = require('path')

const envFile = path.join(__dirname, '..', '.env.local')

if (!fs.existsSync(envFile)) {
    console.error('\x1b[31mERROR: .env.local file not found\x1b[0m')
    console.log('Please create it from .env.example')
    process.exit(1) // 非零退出码表示失败
}

console.log('\x1b[32m✓ Found .env.local\x1b[0m')
