/**
 * TaskCreationForm component for creating new tasks
 */
import React, { useState } from 'react';
import apiClient from '../services/apiClient';

const TaskCreationForm = ({ userId, authToken, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority: priority,
      };

      if (dueDate) {
        taskData.due_date = dueDate;
      }

      // Use apiClient to create task
      const newTask = await apiClient.createTask(userId, taskData, authToken);

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
    } catch (err) {
      // Handle specific error messages from the backend
      if (err.message) {
        if (err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
          setError('Unauthorized access. Please log in again.');
        } else if (err.message.includes('403') || err.message.toLowerCase().includes('forbidden')) {
          setError('Access forbidden. You can only modify your own tasks.');
        } else if (err.message.includes('404')) {
          setError('Task or user not found.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to create task. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-creation-form">
      <h3>Create New Task</h3>
      {error && <div className="error">Error: {error}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
          />
        </div>
        <div>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </div>
  );
};

export default TaskCreationForm;