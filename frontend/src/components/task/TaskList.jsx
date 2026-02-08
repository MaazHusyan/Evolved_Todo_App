"use client";

import { useState, useMemo } from "react";
import { TaskCard } from "./TaskCard";
import { TaskProgress } from "./TaskProgress";
import { EmptyState } from "@/components/shared/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskList({
  tasks,
  loading,
  onToggle,
  onEdit,
  onDelete,
  onCreateTask,
  className,
}) {
  const [filter, setFilter] = useState("all");

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case "pending":
        return tasks.filter((t) => !t.is_completed);
      case "completed":
        return tasks.filter((t) => t.is_completed);
      default:
        return tasks;
    }
  }, [tasks, filter]);

  const pendingCount = tasks.filter((t) => !t.is_completed).length;
  const completedCount = tasks.filter((t) => t.is_completed).length;

  if (loading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress Overview */}
      {tasks.length > 0 && <TaskProgress tasks={tasks} />}

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="relative">
            All
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {tasks.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <span className="ml-2 rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs">
              {pendingCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            <span className="ml-2 rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs">
              {completedCount}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title={
                filter === "all"
                  ? "No tasks yet"
                  : filter === "pending"
                  ? "No pending tasks"
                  : "No completed tasks"
              }
              description={
                filter === "all"
                  ? "Get started by creating your first task."
                  : filter === "pending"
                  ? "Great job! All tasks are completed."
                  : "Complete some tasks to see them here."
              }
              action={filter === "all" && onCreateTask ? onCreateTask : undefined}
            />
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TaskListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <Skeleton className="h-5 w-5 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-[150px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
