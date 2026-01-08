/**
 * Todo list component for the todo application.
 * Displays a list of todo items with filtering options.
 */

import React, { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { useTodo } from '../../contexts/TodoContext';

const TodoList = ({ onEdit, onToggle, onDelete }) => {
  const { todos, isLoading, error, fetchTodos } = useTodo();
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Filter and search todos
  const filteredTodos = todos.filter(todo => {
    // Apply filter
    if (filter === 'active' && todo.is_completed) return false;
    if (filter === 'completed' && !todo.is_completed) return false;

    // Apply search
    if (searchTerm && !todo.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      if (todo.description && !todo.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Stats for todo summary
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.is_completed).length;
  const activeTodos = totalTodos - completedTodos;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{activeTodos}</span> active,
            <span className="font-medium ml-1">{completedTodos}</span> completed
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search todos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredTodos.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No todos</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'No todos match your search.' :
             filter === 'completed' ? 'No completed todos yet.' :
             filter === 'active' ? 'All todos are completed!' :
             'Get started by adding a new todo.'}
          </p>
        </div>
      )}

      {/* Todo list */}
      {!isLoading && filteredTodos.length > 0 && (
        <ul className="divide-y divide-gray-200">
          {filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onEdit={onEdit}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      {/* Summary */}
      {todos.length > 0 && (
        <div className="text-xs text-gray-500 text-center mt-4">
          Showing {filteredTodos.length} of {todos.length} todos
        </div>
      )}
    </div>
  );
};

export default TodoList;