import typer
import asyncio
from typing import Optional, List
from uuid import UUID
from rich.console import Console
from rich.table import Table

from src.core.models import TaskCreate, TaskUpdate, Priority
from src.core.engine import TaskEngine
from src.core.exceptions import TaskNotFoundError
from src.repositories.json_repo import JSONTaskRepository

app = typer.Typer(help="Evolve Todo CLI - Phase 1.1 (Persistent & Interactive)")
console = Console()

# Use JSON Repository for persistence
repository = JSONTaskRepository("tasks.json")
engine = TaskEngine(repository)

def run_async(coro):
    """Helper to run async functions in a sync context."""
    return asyncio.run(coro)

@app.command()
def add(
    title: str = typer.Argument(..., help="Task title"),
    description: str = typer.Option("", "--desc", "-d", help="Task description"),
    priority: Priority = typer.Option(Priority.MEDIUM, "--priority", "-p", help="Task priority (low, medium, high)"),
    tags: Optional[List[str]] = typer.Option(None, "--tag", "-t", help="Add tags to the task")
):
    """Add a new task."""
    data = TaskCreate(title=title, description=description, priority=priority, tags=tags or [])
    task = run_async(engine.create_task(data))
    console.print(f"[green]✓[/green] Task added: [bold]{task.title}[/bold] (ID: {task.id})")

@app.command(name="list")
def list_tasks(
    status: Optional[bool] = typer.Option(None, "--completed/--incomplete", help="Filter by completion status"),
    priority: Optional[Priority] = typer.Option(None, "--priority", "-p", help="Filter by priority"),
    tag: Optional[str] = typer.Option(None, "--tag", "-t", help="Filter by tag"),
    sort: Optional[str] = typer.Option(None, "--sort", help="Sort order (alpha, priority)")
):
    """List all tasks with filtering and sorting."""
    tasks = run_async(engine.list_tasks(status=status, priority=priority, tag=tag, sort_by=sort))

    if not tasks:
        console.print("[yellow]No tasks matching the criteria found.[/yellow]")
        return

    table = Table(title="Todo List")
    table.add_column("ID", style="cyan", no_wrap=True)
    table.add_column("S", justify="center")
    table.add_column("P", justify="center")
    table.add_column("Title", style="magenta")
    table.add_column("Tags", style="blue")

    for task in tasks:
        status_icon = "[green]✔[/green]" if task.is_completed else "[red]✘[/red]"
        p_color = {"high": "red", "medium": "yellow", "low": "green"}.get(task.priority, "white")
        priority_label = f"[{p_color}]{task.priority[:1].upper()}[/{p_color}]"
        tags_str = ", ".join(task.tags)
        table.add_row(str(task.id)[:8], status_icon, priority_label, task.title, tags_str)

    console.print(table)

@app.command()
def search(keyword: str = typer.Argument(..., help="Search keyword")):
    """Search tasks by keyword."""
    tasks = run_async(engine.search_tasks(keyword))
    if not tasks:
        console.print(f"[yellow]No tasks found matching '[bold]{keyword}[/bold]'.[/yellow]")
        return

    table = Table(title=f"Search Results: {keyword}")
    table.add_column("ID", style="cyan")
    table.add_column("Title", style="magenta")
    for task in tasks:
        table.add_row(str(task.id)[:8], task.title)
    console.print(table)

@app.command()
def update(
    task_id: UUID = typer.Argument(..., help="ID of the task to update"),
    title: Optional[str] = typer.Option(None, "--title", "-t"),
    description: Optional[str] = typer.Option(None, "--desc", "-d"),
    priority: Optional[Priority] = typer.Option(None, "--priority", "-p"),
    tags: Optional[List[str]] = typer.Option(None, "--tag"),
):
    """Update an existing task."""
    try:
        data = TaskUpdate(title=title, description=description, priority=priority, tags=tags)
        task = run_async(engine.update_task(task_id, data))
        console.print(f"[green]✓[/green] Task updated: [bold]{task.title}[/bold]")
    except TaskNotFoundError as e:
        console.print(f"[red]Error:[/red] {e}")

@app.command()
def toggle(
    task_id: UUID = typer.Argument(..., help="ID of the task to toggle status")
):
    """Toggle task completion status."""
    try:
        task = run_async(engine.toggle_task(task_id))
        status = "completed" if task.is_completed else "incomplete"
        console.print(f"[green]✓[/green] Task '[bold]{task.title}[/bold]' marked as {status}.")
    except TaskNotFoundError as e:
        console.print(f"[red]Error:[/red] {e}")

@app.command()
def delete(
    task_id: UUID = typer.Argument(..., help="ID of the task to delete")
):
    """Delete a task."""
    try:
        run_async(engine.delete_task(task_id))
        console.print(f"[green]✓[/green] Task {task_id} deleted.")
    except TaskNotFoundError as e:
        console.print(f"[red]Error:[/red] {e}")

@app.command()
def shell():
    """Enter interactive REPL shell mode."""
    from src.cli.shell import interactive_shell
    interactive_shell(engine)

if __name__ == "__main__":
    app()
