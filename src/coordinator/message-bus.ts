/**
 * EventEmitter-based message bus for agent coordination
 *
 * WHY: Spike 1 validated that simple in-process EventEmitter is sufficient for
 * agent communication. No need for HTTP, JSON-RPC, or A2A protocol AgentCards.
 * This lightweight approach handles all 6 agents efficiently.
 */

import { EventEmitter } from "events";
import type { Message } from "../types/agent";

/**
 * Message bus for broadcasting messages between agents
 *
 * WHY: Central communication hub. All agents emit messages to the bus, which
 * broadcasts them to subscribers. Enables loose coupling and easy observability.
 */
export class MessageBus extends EventEmitter {
  private messages: Message[] = [];
  private messageCounter = 0;

  constructor() {
    super();
    // Increase max listeners since we'll have 6+ agents subscribed
    this.setMaxListeners(20);
  }

  /**
   * Send a message to a specific agent or broadcast to all
   *
   * WHY: Core message passing mechanism. Generates unique ID, timestamps message,
   * stores for logging, and emits event for routing.
   */
  send(from: string, to: string, type: Message["type"], content: any): Message {
    const message: Message = {
      id: `msg_${++this.messageCounter}_${Date.now()}`,
      from,
      to,
      type,
      content,
      timestamp: new Date(),
    };

    // Store message for history/observability
    this.messages.push(message);

    // Emit to specific agent or broadcast channel
    if (to === "broadcast") {
      this.emit("broadcast", message);
    } else {
      this.emit(`to:${to}`, message);
    }

    // Also emit to generic 'message' channel for logging/observability
    this.emit("message", message);

    return message;
  }

  /**
   * Subscribe to messages for a specific agent
   *
   * WHY: Each agent subscribes to their own channel to receive directed messages
   */
  subscribe(agentId: string, handler: (message: Message) => void): void {
    this.on(`to:${agentId}`, handler);
  }

  /**
   * Subscribe to all broadcast messages
   *
   * WHY: Some messages need to go to all agents (e.g., coordinator announcements)
   */
  subscribeBroadcast(handler: (message: Message) => void): void {
    this.on("broadcast", handler);
  }

  /**
   * Subscribe to all messages for logging/observability
   *
   * WHY: US3 requires visibility into all agent communications. Logger subscribes
   * to this channel to display message flow in terminal.
   */
  subscribeAll(handler: (message: Message) => void): void {
    this.on("message", handler);
  }

  /**
   * Get message history for a specific agent or all messages
   *
   * WHY: Observability and debugging. Can inspect full conversation history.
   */
  getHistory(agentId?: string): Message[] {
    if (!agentId) {
      return [...this.messages];
    }
    return this.messages.filter((m) => m.from === agentId || m.to === agentId);
  }

  /**
   * Get total message count
   *
   * WHY: SC-001 and metadata tracking need to know how many messages were exchanged
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Clear message history (useful for testing or new planning session)
   *
   * WHY: Each planning session should start fresh. Clear history between sessions.
   */
  clear(): void {
    this.messages = [];
    this.messageCounter = 0;
  }
}
