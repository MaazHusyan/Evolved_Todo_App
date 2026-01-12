/**
 * TaskPersistenceIndicator component to show task persistence status
 */
import React from 'react';

const TaskPersistenceIndicator = ({ task }) => {
  const isPersisted = task && task.id;

  return (
    <div className={`persistence-indicator ${isPersisted ? 'persisted' : 'unsaved'}`}>
      {isPersisted ? (
        <span className="status-icon persisted">✓</span>
      ) : (
        <span className="status-icon unsaved">●</span>
      )}
      <span className="status-text">
        {isPersisted ? 'Saved' : 'Unsaved'}
      </span>
    </div>
  );
};

export default TaskPersistenceIndicator;