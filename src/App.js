import React, { useState, useEffect } from 'react';
import "./Style.css";
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [loading, setLoading] = useState(false);

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://todo-backend-06ap.onrender.com/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched data:", data);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // Logout
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  // Add a new task
  const addTask = async (text) => {
    try {
      const response = await fetch("https://todo-backend-06ap.onrender.com/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          status: "pending",
          priority: "medium"
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // Extract the task from the response (your backend returns {message, task})
      const newTask = result.task || result;
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Please try again.");
    }
  };

  // Delete a task
  const deleteTask = async (id) => {
    if (!id) {
      console.error("Task ID is undefined");
      return;
    }
    
    try {
      const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Please try again.");
    }
  };   

  // Update a task's status - DEBUG VERSION
  const updateTaskStatus = async (id, currentStatus) => {
    if (!id) {
      console.error("Task ID is undefined");
      return;
    }

    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    
    console.log("Updating task:", { id, currentStatus, newStatus });
    console.log("Token:", token ? "Present" : "Missing");
    
    // Store original tasks for potential rollback
    const originalTasks = [...tasks];
    
    // Optimistically update the UI first
    const optimisticTasks = tasks.map(task => 
      task._id === id ? { ...task, status: newStatus } : task
    );
    setTasks(optimisticTasks);

    try {
      // Try different API endpoints to see which one works
      console.log("Attempting PUT request to:", `https://todo-backend-06ap.onrender.com/tasks/${id}`);
      
      const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Get response text first to see what we're getting
      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        // Try alternative endpoint - PATCH method
        console.log("PUT failed, trying PATCH method...");
        
        const patchResponse = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!patchResponse.ok) {
          // Try another alternative - status-specific endpoint
          console.log("PATCH failed, trying status-specific endpoint...");
          
          const statusResponse = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!statusResponse.ok) {
            const statusText = await statusResponse.text();
            console.error("All endpoints failed. Last response:", statusText);
            throw new Error(`All HTTP methods failed. Status: ${response.status}, Message: ${responseText}`);
          }

          const statusResult = await statusResponse.json();
          console.log("Status endpoint success:", statusResult);
          const updatedTask = statusResult.task || statusResult;
          if (updatedTask && updatedTask._id) {
            setTasks(originalTasks.map(task => task._id === id ? updatedTask : task));
          }
          return;
        }

        const patchResult = await patchResponse.json();
        console.log("PATCH success:", patchResult);
        const updatedTask = patchResult.task || patchResult;
        if (updatedTask && updatedTask._id) {
          setTasks(originalTasks.map(task => task._id === id ? updatedTask : task));
        }
        return;
      }

      // PUT succeeded
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        // Keep optimistic update if parse fails but request succeeded
        return;
      }
      
      console.log("PUT success:", result);
      
      // Update with the actual response from server
      const updatedTask = result.task || result;
      if (updatedTask && updatedTask._id) {
        setTasks(originalTasks.map(task => task._id === id ? updatedTask : task));
      } else {
        // If server doesn't return the updated task, keep our optimistic update
        console.log("Server didn't return updated task, keeping optimistic update");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      });
      
      // Revert to original state on error
      setTasks(originalTasks);
      alert(`Failed to update task status: ${error.message}`);
    }
  };

  // Update a task's priority
  const updateTaskPriority = async (id, newPriority) => {
    if (!id) {
      console.error("Task ID is undefined");
      return;
    }

    // Optimistically update the UI first
    const optimisticTasks = tasks.map(task => 
      task._id === id ? { ...task, priority: newPriority } : task
    );
    setTasks(optimisticTasks);

    try {
      const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}/priority`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!response.ok) {
        // Revert the optimistic update if the request fails
        setTasks(tasks);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      console.log("Priority update result:", updatedTask);
      
      if (updatedTask && updatedTask._id) {
        setTasks(tasks.map(task => task._id === id ? updatedTask : task));
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
      // Revert to original state on error
      setTasks(tasks);
      alert("Failed to update task priority. Please try again.");
    }
  };

  // Filtering tasks
  const filterTasks = tasks.filter(
    (task) => 
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  // Simple MainApp component
  const MainApp = () => (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <ul className='flex space-x-4'>
          <li>
            <a href="#" className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:bg-orange-700 focus:outline-none shadow-sm">
              Home
            </a>
          </li>
        </ul>
        <button onClick={logout} className="px-4 py-2 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:bg-orange-700 focus:outline-none shadow-sm">
          Logout
        </button>
      </nav>
      
      <main className='flex-1 p-8'>
        <h2 className='text-4xl font-extrabold text-center mb-8 text-orange-600 drop-shadow'>Welcome to the Todo App</h2>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          const input = e.target[0];
          if (input.value.trim()) {
            addTask(input.value.trim());
            input.value = '';
          }
        }}
        className="flex justify-center items-center gap-2 mb-6"
        >
          <input 
            type="text" 
            className="p-3 border-2 border-orange-300 rounded-lg w-2/3 focus:outline-none focus:ring-2 focus:ring-orange-400" 
            placeholder="Add a new task"
            required
          />
          <button type="submit" className="ml-4 px-4 py-2 bg-orange-500 rounded-full font-semibold transition-colors duration-200 hover:bg-orange-600 hover:text-white focus:bg-orange-700 focus:outline-none shadow-sm">
            Add Task
          </button>
        </form>
        
        <div className='mb-6 flex gap-4 justify-center'>
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" 
            value={filterStatus}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            onChange={(e) => setFilterPriority(e.target.value)} 
            className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={filterPriority}
          > 
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        {loading && (
          <div className="text-center text-orange-600 mb-4">
            Loading tasks...
          </div>
        )}
        
        {/* Tasks after filtering */}
        <ul className='space-y-4'>
          {filterTasks.map((task) => (
            <li key={task._id} className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-orange-100 transition duration-300">
              <div className='flex-1'>
                <span className={`text-lg ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-orange-800'}`}>
                  {task.text}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  ({task.status}, {task.priority})
                </span>
              </div>
              
              <div className='flex gap-2 items-center'>
                <button 
                  onClick={() => updateTaskStatus(task._id, task.status)}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors duration-300 ${
                    task.status === "pending" 
                      ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-500" 
                      : "bg-green-400 text-green-900 hover:bg-green-500"
                  }`}
                >
                  {task.status === "pending" ? "Mark Complete" : "Mark Pending"}
                </button>
                
                <select 
                  value={task.priority}
                  onChange={(e) => updateTaskPriority(task._id, e.target.value)}
                  className='p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400'
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                
                <button 
                  onClick={() => deleteTask(task._id)} 
                  title="Delete task" 
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-full transition-colors duration-200 ml-2"
                >
                  <i className='fas fa-trash'></i>Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
        
        {filterTasks.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-8">
            {tasks.length === 0 ? "No tasks yet. Add your first task!" : "No tasks match the current filters."}
          </div>
        )}
      </main>
      
      <footer className="bg-orange-500 text-white p-4 mt-auto text-center shadow-inner">
        © 2025 Your To-Do App
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={token ? <MainApp /> : <Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;