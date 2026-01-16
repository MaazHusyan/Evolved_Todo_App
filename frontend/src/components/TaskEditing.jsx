/**
 * TaskEditing component for editing task details
 */
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const TaskEditing = ({ taskId, userId, authToken, onTaskUpdated }) => {
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTask();
  }, [taskId, userId, authToken]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      // Use apiClient to fetch task
      const data = await apiClient.getTask(userId, taskId, authToken);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority || 'medium');
      setIsCompleted(data.is_completed);
      setDueDate(data.due_date ? new Date(data.due_date).toISOString().slice(0, 16) : '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
        is_completed: isCompleted,
      };

      if (dueDate) {
        taskData.due_date = dueDate;
      }

      // Use apiClient to update task
      const updatedTask = await apiClient.updateTask(userId, taskId, taskData, authToken);

      // Notify parent component
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading task...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!task) return <div>Task not found</div>;

  return (
    <div className="task-editing">
      <h3>Edit Task</h3>
      {error && <div className="error">Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="edit-title">Title *</label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="edit-description">Description</label>
          <textarea
            id="edit-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="edit-priority">Priority</label>
          <select
            id="edit-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="edit-due-date">Due Date</label>
          <input
            id="edit-due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="edit-completed">
            <input
              id="edit-completed"
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
            />
            Completed
          </label>
        </div>
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default TaskEditing;