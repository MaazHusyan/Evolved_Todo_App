/**
 * Todo form component for the todo application.
 * Allows users to create and edit todo items.
 */

import React, { useState, useEffect } from 'react';

const TodoForm = ({ initialTodo = null, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_completed: false
  });
  const [errors, setErrors] = useState({});

  // Set initial values if editing
  useEffect(() => {
    if (initialTodo) {
      setFormData({
        title: initialTodo.title || '',
        description: initialTodo.description || '',
        is_completed: initialTodo.is_completed || false
      });
    } else {
      // Reset form for new todo
      setFormData({
        title: '',
        description: '',
        is_completed: false
      });
    }
  }, [initialTodo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      is_completed: formData.is_completed
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <div className="mt-1">
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="What needs to be done?"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <div className="mt-1">
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="Add details about this task..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="is_completed"
          name="is_completed"
          type="checkbox"
          checked={formData.is_completed}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_completed" className="ml-2 block text-sm text-gray-900">
          Mark as completed
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialTodo ? 'Update Todo' : 'Add Todo'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TodoForm;