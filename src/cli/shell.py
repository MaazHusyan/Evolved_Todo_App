import asyncio
from rich.console import Console
from rich.table import Table
from rich.prompt import Prompt
from src.core.models import TaskCreate, Priority
from src.core.engine import TaskEngine

console = Console()

def show_dashboard(tasks):
    """Display a summary table of tasks."""
    if not tasks:
        console.print("\n[yellow]Your todo list is currently empty.[/yellow]")
        return

    table = Table(title="Todo Dashboard")
    table.add_column("ID", style="cyan")
    table.add_column("S", justify="center")
    table.add_column("P", justify="center")
    table.add_column("Title", style="magenta")
    table.add_column("Tags", style="blue")

    for task in tasks:
        status = "[green]✔[/green]" if task.is_completed else "[red]✘[/red]"
        p_color = {"high": "red", "medium": "yellow", "low": "green"}.get(task.priority, "white")
        priority = f"[{p_color}]{task.priority[:1].upper()}[/{p_color}]"
        table.add_row(str(task.id)[:8], status, priority, task.title, ", ".join(task.tags))

    console.print(table)

def interactive_shell(engine: TaskEngine):
    """The interactive REPL loop logic."""
    console.print("[bold cyan]Evolve Todo Interactive Shell[/bold cyan]")
    console.print("Type 'help' for commands or 'exit' to quit.\n")

    while True:
        try:
            cmd = Prompt.ask("[bold green]todo[/bold green]").strip().lower()

            if cmd in ["exit", "quit", "q"]:
                console.print("[yellow]Goodbye![/yellow]")
                break

            if cmd == "list" or not cmd:
                tasks = asyncio.run(engine.list_tasks())
                show_dashboard(tasks)

            elif cmd == "add":
                title = Prompt.ask("Title")
                desc = Prompt.ask("Description", default="")
                priority = Prompt.ask("Priority", choices=["low", "medium", "high"], default="medium")
                tags_raw = Prompt.ask("Tags (comma separated)", default="")
                tags = [t.strip() for t in tags_raw.split(",")] if tags_raw else []

                data = TaskCreate(title=title, description=desc, priority=priority, tags=tags)
                asyncio.run(engine.create_task(data))
                console.print("[green]Task created![/green]")

            elif cmd == "help":
                console.print("\n[bold]Available Commands:[/bold]")
                console.print("  list   - Show all tasks")
                console.print("  add    - Add a new task")
                console.print("  help   - Show this help")
                console.print("  exit   - Exit shell\n")

            else:
                console.print(f"[red]Unknown command: {cmd}[/red]")

        except KeyboardInterrupt:
            console.print("\n[yellow]Interrupted. Type 'exit' to quit.[/yellow]")
        except Exception as e:
            console.print(f"[red]Error: {e}[/red]")
