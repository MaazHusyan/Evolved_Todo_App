/**
 * Task caching service for frontend data caching
 */
class TaskCacheService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.storageKey = 'todo_tasks_cache';
    this.loadFromStorage();
  }

  /**
   * Cache tasks for a user
   * @param {string} userId - User ID
   * @param {Array} tasks - Array of tasks
   */
  setTasks(userId, tasks) {
    const cacheEntry = {
      data: tasks,
      timestamp: Date.now()
    };
    this.cache.set(userId, cacheEntry);
    this.saveToStorage();
  }

  /**
   * Get cached tasks for a user
   * @param {string} userId - User ID
   * @return {Array|null} Cached tasks or null if not found/expired
   */
  getTasks(userId) {
    const cacheEntry = this.cache.get(userId);
    if (!cacheEntry) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cacheEntry.timestamp > this.cacheTimeout) {
      this.cache.delete(userId);
      this.saveToStorage();
      return null;
    }

    return cacheEntry.data;
  }

  /**
   * Cache a single task
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @param {object} task - Task object
   */
  setTask(userId, taskId, task) {
    let userTasks = this.getTasks(userId) || [];
    const existingIndex = userTasks.findIndex(t => t.id === taskId);

    if (existingIndex !== -1) {
      userTasks[existingIndex] = task;
    } else {
      userTasks.push(task);
    }

    this.setTasks(userId, userTasks);
  }

  /**
   * Get a single cached task
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   * @return {object|null} Cached task or null if not found/expired
   */
  getTask(userId, taskId) {
    const tasks = this.getTasks(userId);
    if (!tasks) {
      return null;
    }
    return tasks.find(task => task.id === taskId) || null;
  }

  /**
   * Invalidate cache for a user
   * @param {string} userId - User ID
   */
  invalidateUserCache(userId) {
    this.cache.delete(userId);
    this.saveToStorage();
  }

  /**
   * Invalidate cache for a specific task
   * @param {string} userId - User ID
   * @param {string} taskId - Task ID
   */
  invalidateTaskCache(userId, taskId) {
    let userTasks = this.getTasks(userId);
    if (userTasks) {
      userTasks = userTasks.filter(task => task.id !== taskId);
      this.setTasks(userId, userTasks);
    }
  }

  /**
   * Clear entire cache
   */
  clearCache() {
    this.cache.clear();
    this.saveToStorage();
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    for (const [userId, cacheEntry] of this.cache.entries()) {
      if (now - cacheEntry.timestamp > this.cacheTimeout) {
        this.cache.delete(userId);
      }
    }
    this.saveToStorage();
  }

  /**
   * Save cache to localStorage
   */
  saveToStorage() {
    try {
      const serializableCache = {};
      for (const [userId, cacheEntry] of this.cache.entries()) {
        serializableCache[userId] = cacheEntry;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(serializableCache));
    } catch (error) {
      console.error('Failed to save cache to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  loadFromStorage() {
    try {
      const storedCache = localStorage.getItem(this.storageKey);
      if (storedCache) {
        const parsedCache = JSON.parse(storedCache);
        for (const [userId, cacheEntry] of Object.entries(parsedCache)) {
          this.cache.set(userId, cacheEntry);
        }
        // Clean expired entries on load
        this.cleanExpired();
      }
    } catch (error) {
      console.error('Failed to load cache from localStorage:', error);
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeout: this.cacheTimeout
    };
  }
}

// Export a singleton instance
const taskCacheService = new TaskCacheService();
export default taskCacheService;

// Export for direct instantiation if needed
export { TaskCacheService };