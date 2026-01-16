/**
 * TaskList component for displaying user's tasks
 */
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const TaskList = ({ userId, authToken }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [userId, authToken]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      // Use apiClient to fetch tasks
      const data = await apiClient.getTasks(userId, authToken);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      // Use apiClient to update task completion
      await apiClient.updateTaskCompletion(userId, taskId, !currentStatus, authToken);

      // Update the task in the list
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, is_completed: !currentStatus } : task
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      // Use apiClient to delete task
      await apiClient.deleteTask(userId, taskId, authToken);

      // Remove the task from the list
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks found. Create your first task!</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.is_completed}
                onChange={() => toggleTaskCompletion(task.id, task.is_completed)}
              />
              <span className={task.is_completed ? 'completed' : ''}>
                {task.title}
              </span>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;