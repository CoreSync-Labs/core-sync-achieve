import { z } from 'zod';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Task validation schema
const taskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(1000, 'Description must be less than 1000 characters').optional(),
  completed: z.boolean().optional(),
});

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().trim().max(1000, 'Description must be less than 1000 characters').optional(),
  completed: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

export async function fetchTasks() {
  try {
    console.log('Express API: Fetching tasks from', API_BASE_URL);
    
    // Add timeout to detect sleeping Render service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Express API Response:', data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Express API: Request timed out (service may be sleeping)');
      throw new Error('Request timed out. Render service may be waking up - please try again in 30 seconds.');
    }
    console.error('Express API Error:', error);
    throw new Error(error.message || 'Failed to connect to Express API');
  }
}

export async function createTask(task: { title: string; description?: string; completed?: boolean }) {
  try {
    // Validate input
    const validatedTask = taskSchema.parse(task);
    
    console.log('Express API: Creating task', validatedTask);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedTask),
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Express API: Task created', data);
    return data;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Express API: Validation error', error.errors);
      throw new Error(error.errors[0].message);
    }
    if (error.name === 'AbortError') {
      console.error('Express API: Create task timed out');
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Express API: Create task error', error);
    throw new Error(error.message || 'Failed to create task');
  }
}

export async function updateTask(id: string | number, updates: { title?: string; description?: string; completed?: boolean }) {
  try {
    // Validate input
    const validatedUpdates = taskUpdateSchema.parse(updates);
    
    console.log('Express API: Updating task', id, validatedUpdates);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedUpdates),
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Express API: Task updated', data);
    return data;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error('Express API: Validation error', error.errors);
      throw new Error(error.errors[0].message);
    }
    if (error.name === 'AbortError') {
      console.error('Express API: Update task timed out');
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Express API: Update task error', error);
    throw new Error(error.message || 'Failed to update task');
  }
}

export async function deleteTask(id: string | number) {
  try {
    console.log('Express API: Deleting task', id);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const res = await fetch(`${API_BASE_URL}/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    // DELETE might return empty response or confirmation
    const contentType = res.headers.get('content-type');
    let data = null;
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    }
    
    console.log('Express API: Task deleted', data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Express API: Delete task timed out');
      throw new Error('Request timed out. Please try again.');
    }
    console.error('Express API: Delete task error', error);
    throw new Error(error.message || 'Failed to delete task');
  }
}

export async function checkApiHealth() {
  try {
    console.log('Express API: Checking health at', API_BASE_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const res = await fetch(`${API_BASE_URL}/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await res.text();
    console.log('Express API Health Check:', data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Express API: Health check timed out');
      throw new Error('Health check timed out. Service may be sleeping.');
    }
    console.error('Express API Health Check Failed:', error);
    throw error;
  }
}
