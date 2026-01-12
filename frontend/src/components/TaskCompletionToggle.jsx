/**
 * TaskCompletionToggle component for toggling task completion status
 */
import React, { useState } from 'react';

const TaskCompletionToggle = ({ task, userId, authToken, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const toggleCompletion = async () => {
    if (isUpdating) return; // Prevent multiple clicks

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/${userId}/tasks/${task.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: !task.is_completed }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();

      // Notify parent component
      if (onStatusChange) {
        onStatusChange(updatedTask);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating task completion:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="task-completion-toggle">
      <label htmlFor={`toggle-${task.id}`}>
        <input
          id={`toggle-${task.id}`}
          type="checkbox"
          checked={task.is_completed}
          onChange={toggleCompletion}
          disabled={isUpdating}
        />
        {isUpdating ? 'Updating...' : task.is_completed ? 'Completed' : 'Mark as Complete'}
      </label>
      {error && <div className="error">Error: {error}</div>}
    </div>
  );
};

export default TaskCompletionToggle;