# AI Chatbot Usage Guide

## Getting Started

The Evolve Todo AI chatbot helps you manage your tasks through natural language conversations. This guide covers how to interact with the chatbot effectively.

## Basic Usage

### Starting a Conversation

Simply type your message in the chat interface. The chatbot understands natural language and can help with various task management operations.

### Example Conversations

#### Creating Tasks

**User:** "Add a task to buy groceries tomorrow"

**Chatbot:** "I've created a task 'Buy groceries' with a due date of tomorrow. Would you like to add any additional details?"

**User:** "Yes, add milk, bread, and eggs to the description"

**Chatbot:** "Updated the task description with your shopping list."

#### Listing Tasks

**User:** "Show me my tasks for today"

**Chatbot:** "Here are your tasks for today:
1. Buy groceries (Due: Today, Priority: Medium)
2. Finish project report (Due: Today, Priority: High)
3. Call dentist (Due: Today, Priority: Low)"

#### Updating Tasks

**User:** "Change the priority of task 2 to urgent"

**Chatbot:** "I've updated 'Finish project report' to high priority."

#### Completing Tasks

**User:** "Mark task 1 as done"

**Chatbot:** "Great! I've marked 'Buy groceries' as complete."

## Advanced Features

### Natural Language Understanding

The chatbot understands various ways of expressing the same intent:

**Creating Tasks:**
- "Add a task to..."
- "Create a new task for..."
- "I need to..."
- "Remind me to..."

**Listing Tasks:**
- "Show me my tasks"
- "What do I need to do today?"
- "List all my pending tasks"
- "What's on my todo list?"

**Updating Tasks:**
- "Change the due date of..."
- "Update task 3 with..."
- "Modify the description of..."
- "Set the priority to..."

### Context Awareness

The chatbot remembers your conversation context:

**User:** "Create a task to review the proposal"

**Chatbot:** "Task created. When would you like to complete this?"

**User:** "By Friday"

**Chatbot:** "I've set the due date to Friday."

### Smart Suggestions

The chatbot can provide intelligent suggestions:

**User:** "I have a meeting tomorrow"

**Chatbot:** "Would you like me to create a task for this meeting? I can also set a reminder 15 minutes before."

## Task Management Commands

### Create Task

**Syntax:** "Create a task [title] [optional: due date] [optional: priority]"

**Examples:**
- "Create a task to finish the report by Friday"
- "Add a high priority task to call the client"
- "I need to schedule a dentist appointment next week"

### List Tasks

**Syntax:** "Show/List [filter] tasks"

**Examples:**
- "Show all my tasks"
- "List high priority tasks"
- "What tasks are due today?"
- "Show completed tasks from last week"

### Update Task

**Syntax:** "Update task [id/title] [property] to [value]"

**Examples:**
- "Update task 5 due date to tomorrow"
- "Change the priority of 'Buy groceries' to high"
- "Modify task 3 description to include meeting notes"

### Delete Task

**Syntax:** "Delete task [id/title]"

**Examples:**
- "Delete task 7"
- "Remove the task about calling the dentist"
- "Cancel the meeting task"

### Complete Task

**Syntax:** "Mark task [id/title] as complete/done"

**Examples:**
- "Mark task 2 as complete"
- "I finished the report task"
- "Task 5 is done"

### Search Tasks

**Syntax:** "Search for [keywords]"

**Examples:**
- "Search for tasks about the project"
- "Find all tasks related to meetings"
- "Look for tasks with 'urgent' in the description"

## Filters and Sorting

### Filter by Status

- "Show completed tasks"
- "List pending tasks"
- "What tasks are in progress?"

### Filter by Priority

- "Show high priority tasks"
- "List all urgent tasks"
- "What are my low priority tasks?"

### Filter by Due Date

- "Show tasks due today"
- "List overdue tasks"
- "What's due this week?"

### Sort Tasks

- "Sort tasks by priority"
- "Show tasks ordered by due date"
- "List tasks from newest to oldest"

## Best Practices

### 1. Be Specific

**Good:** "Create a task to review the Q4 financial report by Friday at 5 PM"

**Less Good:** "Add a task about the report"

### 2. Use Natural Language

You don't need to use specific commands. The chatbot understands natural conversation:

**Good:** "I need to remember to call John tomorrow about the project"

**Also Good:** "Create a task to call John tomorrow regarding the project"

### 3. Provide Context

**Good:** "Update the meeting task to include the Zoom link and agenda"

**Less Good:** "Update task 3"

### 4. Ask for Help

If you're unsure about something, just ask:

- "How do I create a recurring task?"
- "Can you show me all my overdue tasks?"
- "What can you help me with?"

## Troubleshooting

### Chatbot Doesn't Understand

If the chatbot doesn't understand your request:

1. Try rephrasing your message
2. Be more specific about what you want
3. Break complex requests into smaller steps
4. Ask for help: "How do I...?"

### Task Not Found

If the chatbot can't find a task:

1. Check the task ID or title
2. List all tasks to verify it exists
3. Use search to find the task by keywords

### Unexpected Behavior

If the chatbot behaves unexpectedly:

1. Refresh the page and try again
2. Check your internet connection
3. Verify you're logged in
4. Contact support if the issue persists

## Tips and Tricks

### Batch Operations

**User:** "Create three tasks: buy groceries, call dentist, and finish report"

**Chatbot:** "I've created three tasks for you:
1. Buy groceries
2. Call dentist
3. Finish report"

### Quick Updates

**User:** "Make all my tasks for today high priority"

**Chatbot:** "I've updated 5 tasks to high priority."

### Smart Scheduling

**User:** "I have a busy week. What should I focus on?"

**Chatbot:** "Based on your tasks, I recommend focusing on:
1. Finish project report (Due: Today, High Priority)
2. Client presentation (Due: Tomorrow, High Priority)
3. Team meeting prep (Due: Wednesday, Medium Priority)"

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift + Enter**: New line
- **Ctrl + K**: Clear conversation
- **Ctrl + /**: Show help

## Privacy and Security

### Data Handling

- All conversations are encrypted
- Task data is stored securely
- AI interactions are logged for quality improvement
- You can delete your conversation history anytime

### Permissions

The chatbot can only:
- Access your tasks
- Create/update/delete tasks on your behalf
- View your user preferences

The chatbot cannot:
- Access other users' data
- Modify system settings
- Execute arbitrary code

## Feedback

Help us improve the chatbot:

- Rate conversations (thumbs up/down)
- Report issues or bugs
- Suggest new features
- Share your experience

## Additional Resources

- [AI Architecture Documentation](./architecture.md)
- [MCP Integration Guide](./mcp-integration.md)
- [API Documentation](./api-documentation.md)
- [FAQ](./faq.md)

## Support

Need help? Contact us:

- Email: support@evolve-todo.com
- GitHub Issues: [github.com/yourusername/evolve-todo-app/issues](https://github.com/yourusername/evolve-todo-app/issues)
- Documentation: [docs.evolve-todo.com](https://docs.evolve-todo.com)
