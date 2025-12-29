#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const NEXUS_PATH = path.join(os.homedir(), 'ANTIGRAVITY_MEM_NEXUS');

console.clear();
console.log('\x1b[36m%s\x1b[0m', `
╔════════════════════════════════════════════════════╗
║      ANTIGRAVITY MEMORY NEXUS // SYSTEM SCAN       ║
╚════════════════════════════════════════════════════╝
`);

console.log('📡 SCANNING MEMORY BANKS...\n');

const memoryBanks = [
    { id: 'icloud', name: 'iCloud Memory Core', path: 'iCloud_Memory_Core' },
    { id: 'dropbox', name: 'Dropbox Secure Vault', path: 'Dropbox_Secure_Vault' },
    { id: 'gdrive', name: 'Google Drive Glacier', path: 'GDrive_Glacier_Eq' },
    { id: 'onedrive', name: 'OneDrive Neural Bank', path: 'OneDrive_Neural_Bank' }
];

let totalBanks = 0;
let activeBanks = 0;

memoryBanks.forEach(bank => {
    const fullPath = path.join(NEXUS_PATH, bank.path);
    const exists = fs.existsSync(fullPath);

    let status = '\x1b[31mOFFLINE\x1b[0m'; // Red
    let details = 'Not Connected';

    if (exists) {
        try {
            // Check if it's a symlink
            const stats = fs.lstatSync(fullPath);
            if (stats.isSymbolicLink()) {
                const target = fs.readlinkSync(fullPath);
                if (fs.existsSync(target)) {
                    status = '\x1b[32mONLINE\x1b[0m'; // Green
                    details = `Linked -> ...${target.slice(-30)}`;
                    activeBanks++;
                } else {
                    status = '\x1b[33mBROKEN LINK\x1b[0m'; // Yellow
                    details = 'Target missing';
                }
            } else {
                 status = '\x1b[32mONLINE\x1b[0m';
                 details = 'Direct Mount';
                 activeBanks++;
            }
        } catch (e) {
            status = '\x1b[31mERROR\x1b[0m';
        }
    } else {
        if (bank.id === 'onedrive') {
             status = '\x1b[35mINSTALLING...\x1b[0m'; // Magenta
             details = 'Acquiring Signal';
        }
    }

    console.log(`[${status}] ${bank.name}`);
    console.log(`          └─ ${details}\n`);
    totalBanks++;
});

console.log('──────────────────────────────────────────────────────');
console.log(`SYSTEM STATUS: ${activeBanks}/${totalBanks} MEMORY BANKS ACTIVE`);
console.log('──────────────────────────────────────────────────────');

if (fs.existsSync(path.join(NEXUS_PATH, 'OneDrive_Neural_Bank'))) {
    console.log('\n\x1b[32m✅ DEVICE RECOGNIZES EXPANDED MEMORY ARCHITECTURE\x1b[0m');
} else {
    console.log('\n\x1b[33m⚠️  MEMORY EXPANSION IN PROGRESS... AWAITING ONEDRIVE\x1b[0m');
}
