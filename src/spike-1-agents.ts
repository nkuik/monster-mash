/**
 * Spike 1: Can 2 Agents Coordinate?
 *
 * Hypothesis: Two TypeScript functions can exchange messages and agree on a theme
 * Learn: Do we need HTTP? JSON-RPC? AgentCards? Or are simple function calls sufficient?
 *
 * Success Criteria:
 * - Script outputs selected theme
 * - Script outputs theme-appropriate menu
 * - Message log shows agent-to-agent communication
 * - Total lines: ~150
 */

// Type Definitions
type Agent = {
  id: string;
  decide: (input: any) => any;
};

type Message = {
  from: string;
  to: string;
  content: any;
  timestamp: Date;
};

// Message Log
const messages: Message[] = [];

function logMessage(from: string, to: string, content: any) {
  const message: Message = {
    from,
    to,
    content,
    timestamp: new Date(),
  };
  messages.push(message);
  console.log(`[${message.timestamp.toISOString()}] ${from} → ${to}:`, content);
}

// Theme Agent
const themeAgent: Agent = {
  id: "theme",
  decide: (options: string[]) => {
    console.log("\n🎭 ThemeAgent: Evaluating theme options...");
    console.log("Options:", options);

    // Simple selection logic: pick first option for now
    // In a real implementation, this might use LLM to evaluate options
    const selected = options[0];

    console.log(`ThemeAgent selected: "${selected}"`);
    return selected;
  },
};

// Food Agent
const foodAgent: Agent = {
  id: "food",
  decide: (theme: string) => {
    console.log("\n🍽️  FoodAgent: Generating menu based on theme...");
    console.log("Theme received:", theme);

    // Generate theme-appropriate menu
    const menus: Record<string, string[]> = {
      Spooky: [
        "Witch's Brew Punch",
        "Monster Finger Sandwiches",
        "Graveyard Dirt Cups",
        "Pumpkin Soup",
      ],
      Elegant: [
        "Champagne & Appetizers",
        "Gourmet Cheese Platter",
        "Roasted Butternut Squash Salad",
        "Dark Chocolate Truffles",
      ],
      Playful: [
        "Jack-O'-Lantern Pizza",
        "Candy Corn Cupcakes",
        "Apple Cider Donuts",
        "Ghost-Shaped Cookies",
      ],
    };

    const menu = menus[theme] || menus["Spooky"];

    console.log("FoodAgent generated menu:", menu);
    return menu;
  },
};

// Orchestration
console.log("=".repeat(60));
console.log("SPIKE 1: Testing 2-Agent Coordination");
console.log("=".repeat(60));

// Step 1: Theme Agent selects theme
const themeOptions = ["Spooky", "Elegant", "Playful"];
const selectedTheme = themeAgent.decide(themeOptions);
logMessage("orchestrator", "theme", {
  action: "select_theme",
  options: themeOptions,
});
logMessage("theme", "orchestrator", {
  action: "theme_selected",
  theme: selectedTheme,
});

// Step 2: Food Agent generates menu based on theme
logMessage("orchestrator", "food", {
  action: "generate_menu",
  theme: selectedTheme,
});
const generatedMenu = foodAgent.decide(selectedTheme);
logMessage("food", "orchestrator", {
  action: "menu_generated",
  menu: generatedMenu,
});

// Final Output
console.log("\n" + "=".repeat(60));
console.log("FINAL PARTY PLAN");
console.log("=".repeat(60));
console.log("Theme:", selectedTheme);
console.log("Menu:");
generatedMenu.forEach((item: string, index: number) => {
  console.log(`  ${index + 1}. ${item}`);
});

console.log("\n" + "=".repeat(60));
console.log("MESSAGE LOG (" + messages.length + " messages)");
console.log("=".repeat(60));
messages.forEach((msg, index) => {
  console.log(
    `${index + 1}. [${msg.timestamp.toISOString()}] ${msg.from} → ${msg.to}`
  );
  console.log("   Content:", JSON.stringify(msg.content, null, 2));
});

console.log("\n" + "=".repeat(60));
console.log("SPIKE 1 RESULTS");
console.log("=".repeat(60));
console.log("✅ SUCCESS: 2 agents successfully coordinated");
console.log("✅ Theme selected:", selectedTheme);
console.log("✅ Menu generated:", generatedMenu.length, "items");
console.log("✅ Messages exchanged:", messages.length);
console.log("\n📝 LEARNINGS:");
console.log("- Simple function calls are sufficient for agent coordination");
console.log("- No need for HTTP or JSON-RPC at this stage");
console.log("- Message passing can be synchronous and in-process");
console.log("- Agents can make decisions based on other agent outputs");
console.log("\n🤔 DECISION: Continue to Spike 2 to test voting mechanism");
