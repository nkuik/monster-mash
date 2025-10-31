/**
 * PurchaserAgent - Aggregates costs and creates purchase list
 *
 * WHY: FR-045 requires budget calculation and ensuring costs stay within constraints.
 * This agent is RULES-BASED (not LLM) as it performs calculations.
 */

import type { Agent, Decision } from "../types/agent";
import type {
  BudgetBreakdown,
  DecorationItem,
  MenuItem,
  PartyConstraints,
  PurchaseItem,
} from "../types/party";

export class PurchaserAgent implements Agent {
  id = "purchase";

  async decide(input: any): Promise<Decision> {
    const { menu, decorations, constraints } = input as {
      menu: MenuItem[];
      decorations: DecorationItem[];
      constraints: PartyConstraints;
    };

    // Build purchase list from menu and decorations
    const purchaseList: PurchaseItem[] = [];

    // Add menu items to purchase list
    for (const item of menu) {
      purchaseList.push({
        name: item.name,
        category: "food",
        quantity: item.servings,
        unit: "servings",
        estimatedPrice: item.costPerServing,
        source: "grocery store",
      });
    }

    // Add decoration items to purchase list
    for (const item of decorations) {
      purchaseList.push({
        name: item.name,
        category: "decoration",
        quantity: item.quantity || 1,
        unit: "each",
        estimatedPrice: item.estimatedCost,
        source: "party supply store",
      });
    }

    // Calculate budget breakdown
    const foodCost = menu.reduce(
      (sum, item) => sum + item.costPerServing * item.servings,
      0
    );
    const decorCost = decorations.reduce(
      (sum, item) => sum + item.estimatedCost,
      0
    );
    const entertainmentCost = 0; // DJ/music is digital (no cost)
    const suppliesCost = constraints.guestCount * 2; // Estimate $2 per guest for plates/cups

    const estimatedTotal =
      foodCost + decorCost + entertainmentCost + suppliesCost;
    const remaining = constraints.budget - estimatedTotal;
    const withinBudget = remaining >= constraints.budget * -0.05; // 5% tolerance per SC-008

    const budget: BudgetBreakdown = {
      totalBudget: constraints.budget,
      food: foodCost,
      decorations: decorCost,
      entertainment: entertainmentCost,
      supplies: suppliesCost,
      estimatedTotal,
      remaining,
      withinBudget,
    };

    // Return decision with purchase list and budget
    return {
      agentId: this.id,
      description: `Budget ${
        withinBudget ? "compliant" : "EXCEEDED"
      }: $${estimatedTotal.toFixed(2)} / $${constraints.budget}`,
      confidence: withinBudget ? 0.95 : 0.6,
      data: {
        purchaseList,
        budget,
      },
      rationale: withinBudget
        ? `Total cost $${estimatedTotal.toFixed(
            2
          )} is within budget ($${remaining.toFixed(2)} remaining)`
        : `Total cost $${estimatedTotal.toFixed(
            2
          )} exceeds budget by $${Math.abs(remaining).toFixed(2)}`,
    };
  }
}
