/**
 * TaskDetail component for viewing task details
 */
import React, { useState, useEffect } from 'react';

const TaskDetail = ({ taskId, userId, authToken }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTask();
  }, [taskId, userId, authToken]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${userId}/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading task...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-detail">
      <h2>{task.title}</h2>
      <div className="task-details">
        <p><strong>Description:</strong> {task.description || 'No description'}</p>
        <p><strong>Status:</strong> {task.is_completed ? 'Completed' : 'Pending'}</p>
        <p><strong>Priority:</strong> {task.priority || 'Not set'}</p>
        <p><strong>Created:</strong> {new Date(task.created_at).toLocaleString()}</p>
        {task.due_date && (
          <p><strong>Due:</strong> {new Date(task.due_date).toLocaleString()}</p>
        )}
        <p><strong>Updated:</strong> {new Date(task.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default TaskDetail;