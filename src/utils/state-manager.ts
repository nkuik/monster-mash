/**
 * JSON file-based state persistence for planning sessions
 *
 * WHY: US2 requires adaptive re-planning, which needs persisted state. This
 * module handles saving/loading PartyPlan to JSON files. Constitution principle:
 * "Minimal ceremony" - simple fs-based persistence, no database needed yet.
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { PartyPlan } from "../types/party";

/**
 * State manager for persisting party plans
 *
 * WHY: Enables saving plans to disk for later review or adaptation
 */
export class StateManager {
  private baseDir: string;

  constructor(baseDir: string = "./party-plans") {
    this.baseDir = baseDir;
  }

  /**
   * Ensure base directory exists
   *
   * WHY: Must create directory before saving files
   */
  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  /**
   * Save party plan to JSON file
   *
   * WHY: Persist plan for later retrieval or modification
   */
  async savePlan(plan: PartyPlan, filename?: string): Promise<string> {
    await this.ensureDir();

    // Generate filename if not provided
    const actualFilename =
      filename || `plan-${plan.constraints.date}-${Date.now()}.json`;

    const filepath = join(this.baseDir, actualFilename);

    await fs.writeFile(filepath, JSON.stringify(plan, null, 2), "utf-8");

    return filepath;
  }

  /**
   * Load party plan from JSON file
   *
   * WHY: Retrieve saved plan for review or adaptation
   */
  async loadPlan(filename: string): Promise<PartyPlan> {
    const filepath = join(this.baseDir, filename);
    const content = await fs.readFile(filepath, "utf-8");
    return JSON.parse(content) as PartyPlan;
  }

  /**
   * List all saved plans
   *
   * WHY: Allow users to see available saved plans
   */
  async listPlans(): Promise<string[]> {
    try {
      await this.ensureDir();
      const files = await fs.readdir(this.baseDir);
      return files.filter((f) => f.endsWith(".json"));
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete a saved plan
   *
   * WHY: Clean up old or unwanted plans
   */
  async deletePlan(filename: string): Promise<void> {
    const filepath = join(this.baseDir, filename);
    await fs.unlink(filepath);
  }
}

/**
 * Singleton state manager instance
 *
 * WHY: Most code will use same base directory
 */
let globalStateManager: StateManager | null = null;

export function getStateManager(baseDir?: string): StateManager {
  if (!globalStateManager) {
    globalStateManager = new StateManager(baseDir);
  }
  return globalStateManager;
}
