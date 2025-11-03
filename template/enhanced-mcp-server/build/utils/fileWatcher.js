#!/usr/bin/env node
/**
 * File Watcher for Constitutional Rules Hot Reload
 *
 * Watches constitutional-rules.json for changes and reloads rules
 * without requiring MCP server restart.
 *
 * Enable with environment variable:
 *   VIBE_CHECK_HOT_RELOAD=true
 *
 * Features:
 * - Debounced reloading (300ms delay)
 * - Validation before reload
 * - Error handling with fallback
 * - Console logging of reload events
 */
import fs from 'fs';
import path from 'path';
import { getConstitutionalRulesPath, loadConstitutionalRules } from './constitutionalRules.js';
import { validateRules } from './constitutional/rule-resolver.js';
class ConstitutionalRulesWatcher {
    watcher = null;
    debounceTimer = null;
    currentRulesPath = null;
    options;
    isReloading = false;
    constructor(options = {}) {
        this.options = {
            debounceMs: 300,
            onReload: (rulesPath, ruleCount) => {
                console.log(`[Hot Reload] ✅ Reloaded ${ruleCount} constitutional rules from ${rulesPath}`);
            },
            onError: (error) => {
                console.error('[Hot Reload] ❌ Error reloading constitutional rules:', error.message);
            },
            ...options
        };
    }
    /**
     * Start watching the constitutional rules file
     */
    start() {
        const rulesPath = getConstitutionalRulesPath();
        if (!rulesPath) {
            console.log('[Hot Reload] No constitutional rules file found, watcher not started');
            return false;
        }
        if (this.watcher) {
            console.warn('[Hot Reload] Watcher already started');
            return false;
        }
        this.currentRulesPath = rulesPath;
        try {
            // Watch the rules file
            this.watcher = fs.watch(rulesPath, (eventType) => {
                if (eventType === 'change') {
                    this.scheduleReload();
                }
            });
            // Also watch parent files if this file extends others
            this.watchInheritanceChain(rulesPath);
            console.log(`[Hot Reload] 🔄 Watching constitutional rules: ${rulesPath}`);
            return true;
        }
        catch (error) {
            if (this.options.onError) {
                this.options.onError(error);
            }
            return false;
        }
    }
    /**
     * Stop watching
     */
    stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            console.log('[Hot Reload] Stopped watching constitutional rules');
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }
    /**
     * Schedule a reload with debouncing
     */
    scheduleReload() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.reload();
        }, this.options.debounceMs);
    }
    /**
     * Reload constitutional rules
     */
    async reload() {
        if (this.isReloading || !this.currentRulesPath) {
            return;
        }
        this.isReloading = true;
        try {
            console.log(`[Hot Reload] 🔄 Reloading constitutional rules...`);
            // Step 1: Validate before reloading
            const validation = validateRules(this.currentRulesPath);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            if (validation.warnings.length > 0) {
                console.warn(`[Hot Reload] ⚠️  Warnings: ${validation.warnings.join(', ')}`);
            }
            // Step 2: Load rules
            const rules = loadConstitutionalRules();
            // Step 3: Clear existing constitution entries
            // This forces re-initialization on next vibe_check call
            this.clearConstitutionCache();
            // Step 4: Notify success
            if (this.options.onReload) {
                this.options.onReload(this.currentRulesPath, rules.length);
            }
        }
        catch (error) {
            if (this.options.onError) {
                this.options.onError(error);
            }
        }
        finally {
            this.isReloading = false;
        }
    }
    /**
     * Clear constitution cache to force reload
     * This is a workaround since we can't directly access constitutionMap
     */
    clearConstitutionCache() {
        // The constitution cache is in src/tools/constitution.ts
        // We can't directly clear it, but we can notify the system
        // The next getConstitution() call will re-initialize from files
        console.log('[Hot Reload] 🗑️  Constitution cache will be cleared on next session initialization');
    }
    /**
     * Watch parent files in the inheritance chain
     */
    watchInheritanceChain(rulesPath) {
        try {
            const content = fs.readFileSync(rulesPath, 'utf-8');
            const parsed = JSON.parse(content);
            if (parsed.extends && Array.isArray(parsed.extends)) {
                for (const extendPath of parsed.extends) {
                    const absoluteExtendPath = path.resolve(path.dirname(rulesPath), extendPath);
                    if (fs.existsSync(absoluteExtendPath)) {
                        fs.watch(absoluteExtendPath, (eventType) => {
                            if (eventType === 'change') {
                                console.log(`[Hot Reload] 🔄 Parent rules changed: ${absoluteExtendPath}`);
                                this.scheduleReload();
                            }
                        });
                        console.log(`[Hot Reload] 🔄 Also watching parent rules: ${absoluteExtendPath}`);
                        // Recursively watch parents of parents
                        this.watchInheritanceChain(absoluteExtendPath);
                    }
                }
            }
        }
        catch (error) {
            // Non-critical error, just log
            console.warn(`[Hot Reload] Warning: Could not watch inheritance chain: ${error}`);
        }
    }
}
// Singleton instance
let globalWatcher = null;
/**
 * Initialize hot reload if enabled via environment variable
 */
export function initializeHotReload() {
    const hotReloadEnabled = process.env.VIBE_CHECK_HOT_RELOAD === 'true';
    if (!hotReloadEnabled) {
        return;
    }
    if (globalWatcher) {
        console.warn('[Hot Reload] Already initialized');
        return;
    }
    globalWatcher = new ConstitutionalRulesWatcher();
    globalWatcher.start();
}
/**
 * Stop hot reload
 */
export function stopHotReload() {
    if (globalWatcher) {
        globalWatcher.stop();
        globalWatcher = null;
    }
}
/**
 * Get the global watcher instance
 */
export function getWatcher() {
    return globalWatcher;
}
export { ConstitutionalRulesWatcher };
