/**
 * ZPL Documentation Analysis Script
 * 
 * This script scans all documentation chunks to extract ZPL commands,
 * parses their syntax, and compares them against the zebra_builder.ts implementation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ZPLCommand {
    command: string;
    description?: string;
    format?: string;
    parameters?: ParameterInfo[];
    sourceFiles: string[];
}

interface ParameterInfo {
    name: string;
    description?: string;
    values?: string[];
}

interface APIImplementation {
    methodName: string;
    zplCommand: string;
    parameters: string[];
}

const CHUNKS_DIR = path.join(__dirname, '../src/chunks');
const API_FILE = path.join(__dirname, '../src/zebra_builder.ts');
const OUTPUT_DIR = path.join(__dirname, '../analysis-output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Extract ZPL commands from a single chunk file
 */
function extractCommandsFromChunk(content: string, filename: string): ZPLCommand[] {
    const commands: ZPLCommand[] = [];
    
    // Pattern to match ZPL command definitions like "^XA" or "^FO"
    // Look for patterns like: ^XX followed by description or format
    const commandPatterns = [
        // Command followed by name/description on next line
        /\^([A-Z]{1,2})\s*\n\s*([^\n]+)/g,
        // Command in format line: Format: ^XX...
        /Format:\s*\^([A-Z]{1,2})/g,
        // Standalone command references
        /\^([A-Z]{1,2})\.{3,}/g,
        // Command with parameters
        /\^([A-Z]{1,2})[,\s]/g,
    ];
    
    for (const pattern of commandPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const command = match[1];
            const description = match[2]?.trim();
            
            // Skip if we already have this command from this file
            const existing = commands.find(c => c.command === command);
            if (existing) {
                if (!existing.sourceFiles.includes(filename)) {
                    existing.sourceFiles.push(filename);
                }
                continue;
            }
            
            commands.push({
                command,
                description,
                sourceFiles: [filename],
            });
        }
    }
    
    return commands;
}

/**
 * Scan all chunk files and extract ZPL commands
 */
function scanAllChunks(): Map<string, ZPLCommand> {
    const commandsMap = new Map<string, ZPLCommand>();
    const files = fs.readdirSync(CHUNKS_DIR);
    
    console.log(`Scanning ${files.length} chunk files...`);
    
    for (const file of files) {
        if (!file.endsWith('.txt')) continue;
        
        const filePath = path.join(CHUNKS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const commands = extractCommandsFromChunk(content, file);
        
        for (const cmd of commands) {
            const existing = commandsMap.get(cmd.command);
            if (existing) {
                existing.sourceFiles.push(...cmd.sourceFiles.filter(f => !existing.sourceFiles.includes(f)));
                if (cmd.description && !existing.description) {
                    existing.description = cmd.description;
                }
            } else {
                commandsMap.set(cmd.command, cmd);
            }
        }
    }
    
    console.log(`Found ${commandsMap.size} unique ZPL commands`);
    return commandsMap;
}

/**
 * Parse API implementation to extract implemented commands
 */
function parseAPIImplementation(): Map<string, APIImplementation> {
    const content = fs.readFileSync(API_FILE, 'utf-8');
    const implementations = new Map<string, APIImplementation>();
    
    // Extract method names and their ZPL command outputs
    // Look for patterns like: this.commands.push(`^XX...`)
    const commandPattern = /(\w+)\s*\([^)]*\)\s*:\s*this\s*{[\s\S]*?this\.commands\.push\([^`]*`(\^([A-Z]{1,2}))/g;
    
    let match;
    while ((match = commandPattern.exec(content)) !== null) {
        const methodName = match[1];
        const zplCommand = match[3];
        
        // Skip if this is just ^FD (field data) - it's used by many methods
        if (zplCommand === 'FD') continue;
        
        // Also skip ^FS (field separator) - it's used by many methods
        if (zplCommand === 'FS') continue;
        
        implementations.set(zplCommand, {
            methodName,
            zplCommand,
            parameters: [], // Could be enhanced to extract parameters
        });
    }
    
    console.log(`Found ${implementations.size} implemented ZPL commands`);
    return implementations;
}

/**
 * Generate comparison report
 */
function generateReport(
    documentedCommands: Map<string, ZPLCommand>,
    implementedCommands: Map<string, APIImplementation>
): void {
    const report: string[] = [];
    
    report.push('# ZPL API Analysis Report\n');
    report.push(`Generated: ${new Date().toISOString()}\n`);
    report.push(`---\n\n`);
    
    // Summary
    report.push('## Summary\n');
    report.push(`- **Documented Commands**: ${documentedCommands.size}\n`);
    report.push(`- **Implemented Commands**: ${implementedCommands.size}\n`);
    report.push(`- **Coverage**: ${((implementedCommands.size / documentedCommands.size) * 100).toFixed(1)}%\n\n`);
    
    // Implemented commands
    report.push('## Implemented Commands\n');
    report.push('The following ZPL commands are implemented in the API:\n\n');
    for (const [cmd, impl] of implementedCommands) {
        const doc = documentedCommands.get(cmd);
        report.push(`- **^${cmd}** → \`${impl.methodName}()\``);
        if (doc?.description) {
            report.push(` - ${doc.description}`);
        }
        report.push(` (found in ${doc?.sourceFiles.length || 0} doc files)\n`);
    }
    report.push('\n');
    
    // Missing commands
    report.push('## Missing Commands\n');
    report.push('The following ZPL commands are documented but NOT implemented:\n\n');
    const missing = Array.from(documentedCommands.keys())
        .filter(cmd => !implementedCommands.has(cmd))
        .sort();
    
    for (const cmd of missing) {
        const doc = documentedCommands.get(cmd);
        report.push(`- **^${cmd}**`);
        if (doc?.description) {
            report.push(` - ${doc.description}`);
        }
        report.push(` (found in ${doc?.sourceFiles.length} doc files)\n`);
    }
    report.push('\n');
    
    // Commands in API but not found in docs
    report.push('## Commands in API (Not Found in Docs)\n');
    report.push('The following commands are implemented but were not found in the documentation chunks:\n\n');
    const extra = Array.from(implementedCommands.keys())
        .filter(cmd => !documentedCommands.has(cmd))
        .sort();
    
    for (const cmd of extra) {
        const impl = implementedCommands.get(cmd);
        report.push(`- **^${cmd}** → \`${impl?.methodName}()\`\n`);
    }
    report.push('\n');
    
    // Detailed command list
    report.push('## All Documented Commands\n');
    report.push('Complete list of all ZPL commands found in documentation:\n\n');
    const allCommands = Array.from(documentedCommands.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    for (const [cmd, doc] of allCommands) {
        const status = implementedCommands.has(cmd) ? '✅' : '❌';
        report.push(`${status} **^${cmd}**`);
        if (doc.description) {
            report.push(` - ${doc.description}`);
        }
        report.push(` [${doc.sourceFiles.length} refs]\n`);
    }
    
    // Write report
    const reportPath = path.join(OUTPUT_DIR, 'zpl-analysis-report.md');
    fs.writeFileSync(reportPath, report.join(''));
    console.log(`Report written to: ${reportPath}`);
    
    // Write JSON data for programmatic use
    const jsonPath = path.join(OUTPUT_DIR, 'zpl-commands.json');
    const jsonData = {
        summary: {
            totalDocumented: documentedCommands.size,
            totalImplemented: implementedCommands.size,
            coverage: (implementedCommands.size / documentedCommands.size) * 100,
        },
        documented: Array.from(documentedCommands.entries()).map(([cmd, doc]) => ({
            command: cmd,
            description: doc.description,
            sourceFileCount: doc.sourceFiles.length,
            implemented: implementedCommands.has(cmd),
            methodName: implementedCommands.get(cmd)?.methodName,
        })),
        implemented: Array.from(implementedCommands.values()),
        missing,
        extra,
    };
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
    console.log(`JSON data written to: ${jsonPath}`);
}

/**
 * Main execution
 */
function main() {
    console.log('Starting ZPL Documentation Analysis...\n');
    
    const documentedCommands = scanAllChunks();
    const implementedCommands = parseAPIImplementation();
    
    generateReport(documentedCommands, implementedCommands);
    
    console.log('\nAnalysis complete!');
}

main();
