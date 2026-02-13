# User Guide: AI-Powered Chat for Task Management

**Welcome to Evolve Todo's AI Chat Feature!**

This guide will help you get started with managing your tasks through natural conversation with our AI assistant.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Basic Commands](#basic-commands)
3. [Creating Tasks](#creating-tasks)
4. [Viewing Tasks](#viewing-tasks)
5. [Updating Tasks](#updating-tasks)
6. [Completing Tasks](#completing-tasks)
7. [Deleting Tasks](#deleting-tasks)
8. [Advanced Features](#advanced-features)
9. [Tips & Best Practices](#tips--best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Accessing the Chat

1. Log in to your Evolve Todo account
2. Click the **💬 Chat** link in the navigation menu
3. Start typing your message in the chat input box

### Your First Message

Try sending a simple message like:
```
"Hello! What can you help me with?"
```

The AI assistant will introduce itself and explain what it can do.

---

## Basic Commands

The AI understands natural language, so you don't need to memorize specific commands. Here are some examples:

### Task Creation
- "Add a task to buy groceries"
- "Create a new task: call dentist tomorrow"
- "Remind me to submit the report by Friday"

### Task Viewing
- "What do I need to do today?"
- "Show me my tasks"
- "List all my urgent tasks"
- "What's on my todo list?"

### Task Updates
- "Mark the first task as done"
- "Change the priority of 'Buy groceries' to high"
- "Update the due date to next Monday"

### Task Deletion
- "Delete the third task"
- "Remove 'Buy groceries' from my list"

---

## Creating Tasks

### Simple Task Creation

**Example 1: Basic Task**
```
You: "Add a task to buy milk"
AI: "I've added 'Buy milk' to your tasks. Anything else?"
```

**Example 2: Task with Due Date**
```
You: "Create a task to submit report tomorrow"
AI: "I've added 'Submit report' to your tasks, due tomorrow (Feb 13). Anything else?"
```

**Example 3: Task with Priority**
```
You: "Add an urgent task to call the client"
AI: "I've added 'Call the client' to your tasks with high priority. Anything else?"
```

### Advanced Task Creation

**With Multiple Details:**
```
You: "Create a high priority task to review contract by Friday, tag it as work"
AI: "I've added 'Review contract' to your tasks:
     - Priority: High
     - Due: Friday, Feb 16
     - Tags: work
     Anything else?"
```

### Natural Language Date Recognition

The AI understands various date formats:
- "tomorrow" → Next day
- "next week" → 7 days from now
- "Friday" → Next Friday
- "Feb 15" → Specific date
- "in 3 days" → 3 days from now

---

## Viewing Tasks

### List All Tasks

```
You: "Show me my tasks"
AI: "You have 5 tasks:
     1. [pending] Buy groceries (Due: Feb 13) [Priority: medium] (ID: abc123)
     2. [pending] Call dentist (Due: Feb 14) [Priority: high] (ID: def456)
     3. [completed] Submit report (ID: ghi789)
     4. [pending] Review contract (Due: Feb 16) Tags: work (ID: jkl012)
     5. [pending] Pay bills (Due: Feb 20) (ID: mno345)"
```

### Filter by Status

**Pending Tasks:**
```
You: "What tasks are still pending?"
AI: "You have 4 pending tasks: [lists pending tasks]"
```

**Completed Tasks:**
```
You: "Show me completed tasks"
AI: "You have 1 completed task: [lists completed tasks]"
```

### Filter by Priority

```
You: "Show me my urgent tasks"
AI: "You have 2 high priority tasks:
     1. Call dentist (Due: Feb 14)
     2. Review contract (Due: Feb 16)"
```

### Filter by Date

```
You: "What do I need to do today?"
AI: "You have 2 tasks due today:
     1. Buy groceries
     2. Call dentist"
```

### Filter by Tags

```
You: "Show me my work tasks"
AI: "You have 1 work task:
     1. Review contract (Due: Feb 16)"
```

---

## Updating Tasks

### Using Context References

The AI remembers recent conversations, so you can reference tasks naturally:

**Example 1: Reference by Position**
```
You: "Show me my tasks"
AI: "You have 3 tasks: 1. Buy groceries 2. Call dentist 3. Submit report"

You: "Mark the first one done"
AI: "Great! I've marked 'Buy groceries' as complete. You have 2 tasks remaining."
```

**Example 2: Reference by Name**
```
You: "Update 'Call dentist' to high priority"
AI: "I've changed 'Call dentist' to high priority."
```

**Example 3: Multiple Updates**
```
You: "Show me urgent tasks"
AI: "You have 2 urgent tasks: 1. Submit proposal 2. Review contract"

You: "Update the second one to high priority"
AI: "I've changed 'Review contract' to high priority."

You: "Add a description: needs legal review"
AI: "Added description to 'Review contract'. All set!"
```

### Update Task Title

```
You: "Change the title of 'Buy groceries' to 'Buy groceries and supplies'"
AI: "Task updated successfully: 'Buy groceries and supplies'"
```

### Update Due Date

```
You: "Move the deadline for 'Submit report' to next Monday"
AI: "I've updated the due date for 'Submit report' to Monday, Feb 19."
```

### Update Priority

```
You: "Change 'Review contract' to low priority"
AI: "I've changed 'Review contract' to low priority."
```

### Add Description

```
You: "Add a note to 'Call dentist': appointment at 2pm"
AI: "Added description to 'Call dentist'."
```

---

## Completing Tasks

### Mark as Complete

**By Reference:**
```
You: "Mark 'Buy groceries' as done"
AI: "Great! I've marked 'Buy groceries' as complete."
```

**By Position:**
```
You: "Complete the first task"
AI: "Great! I've marked 'Buy groceries' as complete."
```

**Multiple Tasks:**
```
You: "Mark tasks 1 and 2 as done"
AI: "I've marked both tasks as complete:
     - Buy groceries
     - Call dentist
     Great work!"
```

---

## Deleting Tasks

### Delete Single Task

**By Name:**
```
You: "Delete 'Buy groceries'"
AI: "Task deleted successfully: 'Buy groceries'"
```

**By Position:**
```
You: "Remove the third task"
AI: "Task deleted successfully: 'Submit report'"
```

### Confirmation (Optional)

For important tasks, you can ask for confirmation:
```
You: "Delete 'Important project'"
AI: "Are you sure you want to delete 'Important project'? This cannot be undone."

You: "Yes, delete it"
AI: "Task deleted successfully: 'Important project'"
```

---

## Advanced Features

### Multi-Turn Conversations

The AI maintains context across multiple messages:

```
You: "Show me my urgent tasks"
AI: "You have 2 urgent tasks: 1. Submit proposal 2. Review contract"

You: "When is the first one due?"
AI: "'Submit proposal' is due tomorrow (Feb 13)."

You: "Move it to Friday"
AI: "I've updated the due date for 'Submit proposal' to Friday, Feb 16."

You: "Add a note: needs manager approval"
AI: "Added description to 'Submit proposal'."
```

### Batch Operations

Create multiple tasks at once:
```
You: "Add three tasks: buy milk, call dentist, and submit report"
AI: "I've added 3 tasks to your list:
     1. Buy milk
     2. Call dentist
     3. Submit report
     Anything else?"
```

### Smart Suggestions

The AI can provide helpful suggestions:
```
You: "I have a lot to do today"
AI: "Would you like me to show you your tasks for today? I can help you prioritize them."
```

---

## Tips & Best Practices

### 1. Be Natural

You don't need to use specific commands. Just talk naturally:
- ✅ "Can you add a task to buy groceries?"
- ✅ "I need to remember to call the dentist"
- ✅ "What's on my todo list?"

### 2. Use Context

Reference previous messages to save time:
- ✅ "Mark the first one done"
- ✅ "Change that to high priority"
- ✅ "Add a note to it"

### 3. Be Specific with Dates

For better accuracy, be specific about dates:
- ✅ "tomorrow" (clear)
- ✅ "next Friday" (clear)
- ❌ "soon" (ambiguous)
- ❌ "later" (ambiguous)

### 4. Use Tags for Organization

Tags help you filter and organize tasks:
```
You: "Add a task to review contract, tag it as work and urgent"
AI: "I've added 'Review contract' with tags: work, urgent"
```

### 5. Review Regularly

Check your tasks regularly:
```
You: "What do I need to do today?"
You: "Show me my high priority tasks"
You: "What's due this week?"
```

### 6. Keep Titles Concise

Short, clear titles work best:
- ✅ "Buy groceries"
- ✅ "Call dentist"
- ❌ "I need to remember to buy groceries from the store on my way home"

### 7. Use Descriptions for Details

Put extra details in the description:
```
You: "Add a task to buy groceries"
AI: "Task added: 'Buy groceries'"

You: "Add a note: milk, eggs, bread, cheese"
AI: "Added description to 'Buy groceries'"
```

---

## Troubleshooting

### Issue: AI Doesn't Understand

**Problem:** The AI doesn't understand your request.

**Solution:**
- Try rephrasing your message
- Be more specific
- Break complex requests into smaller steps

**Example:**
```
❌ "Do the thing with the task"
✅ "Mark 'Buy groceries' as complete"
```

### Issue: Wrong Task Referenced

**Problem:** The AI updates the wrong task.

**Solution:**
- Use the task name instead of "it" or "that"
- Reference the task ID if available
- List tasks first to see the correct order

**Example:**
```
You: "Show me my tasks"
AI: "1. Buy groceries 2. Call dentist 3. Submit report"

You: "Mark 'Buy groceries' as done"  ✅ (specific)
```

### Issue: Context Lost

**Problem:** The AI doesn't remember previous messages.

**Solution:**
- Context is maintained for the last 50 messages
- If context is lost, restate your request with full details
- Start a new conversation if needed

### Issue: Rate Limit Exceeded

**Problem:** "Rate limit exceeded" error message.

**Solution:**
- Wait 60 seconds before sending more messages
- Maximum 60 messages per minute
- Slow down your requests

### Issue: Task Not Found

**Problem:** "Task not found" error.

**Solution:**
- List your tasks first to verify it exists
- Check the task name spelling
- The task may have been deleted

**Example:**
```
You: "Show me my tasks"
AI: [lists current tasks]

You: "Mark 'Buy groceries' as done"  ✅ (verified name)
```

---

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line in message
- **Esc**: Clear input field

---

## Privacy & Security

### Your Data is Safe

- All conversations are encrypted
- Only you can see your tasks and conversations
- We don't share your data with third parties
- Conversations are deleted when you delete your account

### What We Log

- Message timestamps (for performance monitoring)
- Error types (for debugging)
- We DO NOT log message content

---

## Getting Help

### In-App Help

Ask the AI assistant:
```
You: "Help"
AI: "I can help you manage your tasks! Here's what I can do:
     - Create tasks
     - List tasks
     - Update tasks
     - Complete tasks
     - Delete tasks

     Just tell me what you need in natural language!"
```

### Support Resources

- **Documentation**: https://docs.evolve-todo.com
- **FAQ**: https://evolve-todo.com/faq
- **Email Support**: support@evolve-todo.com
- **GitHub Issues**: https://github.com/evolve-todo/issues

---

## Example Conversations

### Example 1: Morning Planning

```
You: "Good morning! What do I need to do today?"
AI: "Good morning! You have 3 tasks due today:
     1. Buy groceries (Priority: medium)
     2. Call dentist (Priority: high)
     3. Submit report (Priority: high)
     Would you like me to help you prioritize?"

You: "Yes, show me the high priority ones first"
AI: "Your high priority tasks for today:
     1. Call dentist
     2. Submit report
     I recommend starting with these!"

You: "I finished calling the dentist"
AI: "Great! I've marked 'Call dentist' as complete. You have 2 tasks remaining today."
```

### Example 2: Quick Task Management

```
You: "Add a task to buy milk"
AI: "I've added 'Buy milk' to your tasks."

You: "Actually, make it urgent"
AI: "I've changed 'Buy milk' to high priority."

You: "And due tomorrow"
AI: "I've updated the due date for 'Buy milk' to tomorrow (Feb 13)."

You: "Perfect, thanks!"
AI: "You're welcome! Anything else I can help with?"
```

### Example 3: Weekly Review

```
You: "Show me all my tasks"
AI: "You have 8 tasks:
     [lists all tasks with details]"

You: "Which ones are overdue?"
AI: "You have 2 overdue tasks:
     1. Submit report (was due Feb 10)
     2. Pay bills (was due Feb 11)"

You: "Mark both as high priority"
AI: "I've updated both tasks to high priority:
     - Submit report
     - Pay bills"

You: "I'll do the report today"
AI: "Great! Would you like me to update the due date to today?"

You: "Yes"
AI: "I've updated the due date for 'Submit report' to today."
```

---

## Feedback

We're constantly improving! Share your feedback:
- In-app: Click "Send Feedback" in the chat menu
- Email: feedback@evolve-todo.com
- Rate your experience after each conversation

---

**Happy task managing! 🎉**

*Last updated: February 12, 2026*
