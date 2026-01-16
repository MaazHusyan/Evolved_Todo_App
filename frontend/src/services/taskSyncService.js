/**
 * Task synchronization service for handling offline/online synchronization
 */
class TaskSyncService {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.offlineStorageKey = 'todo_tasks_offline_queue';

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Load any queued operations from localStorage
    this.loadQueuedOperations();
  }

  /**
   * Queue an operation to be performed when online
   * @param {string} operation - Operation type ('create', 'update', 'delete')
   * @param {object} data - Operation data
   * @param {string} userId - User ID
   * @param {string} authToken - Authentication token
   */
  queueOperation(operation, data, userId, authToken) {
    const operationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const queuedOperation = {
      id: operationId,
      operation,
      data,
      userId,
      authToken,
      timestamp: new Date().toISOString()
    };

    this.syncQueue.push(queuedOperation);
    this.saveQueuedOperations();

    // If online, try to sync immediately
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return operationId;
  }

  /**
   * Process the sync queue when online
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const operation = this.syncQueue.shift();
    try {
      await this.executeOperation(operation);
      console.log(`Successfully synced operation: ${operation.id}`);
      this.saveQueuedOperations(); // Remove the completed operation
    } catch (error) {
      console.error(`Failed to sync operation: ${operation.id}`, error);
      // Add it back to the front of the queue to retry later
      this.syncQueue.unshift(operation);
      this.saveQueuedOperations();
    }
  }

  /**
   * Execute a single operation
   * @param {object} operation - Operation to execute
   */
  async executeOperation(operation) {
    const { operation: op, data, userId, authToken } = operation;
    const apiEndpoint = `/api/${userId}/tasks`;

    switch (op) {
      case 'create':
        return await fetch(`${apiEndpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      case 'update':
        return await fetch(`${apiEndpoint}/${data.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
      case 'delete':
        return await fetch(`${apiEndpoint}/${data.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          }
        });
      case 'complete':
        return await fetch(`${apiEndpoint}/${data.id}/complete`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_completed: data.isCompleted })
        });
      default:
        throw new Error(`Unknown operation: ${op}`);
    }
  }

  /**
   * Handle when browser comes online
   */
  async handleOnline() {
    this.isOnline = true;
    console.log('Browser is online, syncing queued operations...');
    await this.processSyncQueue();
  }

  /**
   * Handle when browser goes offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log('Browser is offline, queuing operations...');
  }

  /**
   * Save queued operations to localStorage
   */
  saveQueuedOperations() {
    try {
      localStorage.setItem(this.offlineStorageKey, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save queued operations to localStorage:', error);
    }
  }

  /**
   * Load queued operations from localStorage
   */
  loadQueuedOperations() {
    try {
      const savedQueue = localStorage.getItem(this.offlineStorageKey);
      if (savedQueue) {
        this.syncQueue = JSON.parse(savedQueue);
        if (this.isOnline && this.syncQueue.length > 0) {
          // If we're online and have operations queued, process them
          setTimeout(() => this.processSyncQueue(), 1000);
        }
      }
    } catch (error) {
      console.error('Failed to load queued operations from localStorage:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      isOnline: this.isOnline,
      queueSize: this.syncQueue.length,
      operations: [...this.syncQueue]
    };
  }

  /**
   * Clear the sync queue
   */
  clearQueue() {
    this.syncQueue = [];
    this.saveQueuedOperations();
  }
}

// Export a singleton instance
const taskSyncService = new TaskSyncService();
export default taskSyncService;

// Export for direct instantiation if needed
export { TaskSyncService };