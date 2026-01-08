/**
 * Todo item component for the todo application.
 * Displays a single todo item with action buttons.
 */

import React, { useState } from 'react';

const TodoItem = ({ todo, onEdit, onToggle, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: todo.title,
    description: todo.description || '',
    is_completed: todo.is_completed
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit
      setEditForm({
        title: todo.title,
        description: todo.description || '',
        is_completed: todo.is_completed
      });
    }
    setIsEditing(!isEditing);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    // Update todo with edited values
    onEdit(todo.id, {
      title: editForm.title,
      description: editForm.description || null,
      is_completed: editForm.is_completed
    });

    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <li className={`p-4 border-b border-gray-200 ${todo.is_completed ? 'bg-gray-50' : 'bg-white'}`}>
      {isEditing ? (
        // Edit form
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <textarea
              name="description"
              rows="2"
              value={editForm.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id={`completed-${todo.id}`}
              name="is_completed"
              type="checkbox"
              checked={editForm.is_completed}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor={`completed-${todo.id}`} className="ml-2 block text-sm text-gray-900">
              Mark as completed
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Display mode
        <div className="flex flex-col sm:flex-row sm:items-start">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <input
              type="checkbox"
              checked={todo.is_completed}
              onChange={() => onToggle(todo.id)}
              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {todo.title}
              </p>
              {todo.description && (
                <p className={`text-sm ${todo.is_completed ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  {todo.description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Created: {new Date(todo.created_at).toLocaleDateString()}
                {todo.updated_at !== todo.created_at && (
                  <span>, Updated: {new Date(todo.updated_at).toLocaleDateString()}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex space-x-2 mt-2 sm:mt-0 sm:ml-4">
            <button
              onClick={handleEditToggle}
              className="inline-flex items-center px-2.5 py-0.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="inline-flex items-center px-2.5 py-0.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default TodoItem;