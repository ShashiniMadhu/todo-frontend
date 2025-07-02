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
  const [searchTerm, setSearchTerm] = useState("");

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
  const addTask = async (text, priority = "medium") => {
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
          priority
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
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

  // Update a task's status - FIXED VERSION
  const updateTaskStatus = async (id, currentStatus) => {
    if (!id) {
      console.error("Task ID is undefined");
      return;
    }

    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    
    // Store original tasks for potential rollback
    const originalTasks = [...tasks];
    
    // Optimistically update the UI first
    const optimisticTasks = tasks.map(task => 
      task._id === id ? { ...task, status: newStatus } : task
    );
    setTasks(optimisticTasks);

    try {
      // Use the correct endpoint that matches your backend
      const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updatedTask = result.task || result;
      
      if (updatedTask && updatedTask._id) {
        setTasks(originalTasks.map(task => task._id === id ? updatedTask : task));
      }
    } catch (error) {
      console.error("Error updating task status:", error);
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

    // Store original tasks for rollback
    const originalTasks = [...tasks];
    
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
        setTasks(originalTasks);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTask = await response.json();
      
      if (updatedTask && updatedTask._id) {
        setTasks(originalTasks.map(task => task._id === id ? updatedTask : task));
      }
    } catch (error) {
      console.error("Error updating task priority:", error);
      // Revert to original state on error
      setTasks(originalTasks);
      alert("Failed to update task priority. Please try again.");
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filtering and searching tasks
  const filterTasks = tasks.filter(
    (task) => 
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority) &&
      (searchTerm === "" || task.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    pending: tasks.filter(task => task.status === 'pending').length,
    high: tasks.filter(task => task.priority === 'high').length
  };

  // Enhanced MainApp component with beautiful UI
  const MainApp = () => {
    const [newTask, setNewTask] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("medium");

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        {/* Enhanced Navigation */}
        <nav className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h1 className="text-2xl font-bold">TaskMaster Pro</h1>
            </div>
            <button 
              onClick={logout} 
              className="px-6 py-2 bg-white bg-opacity-20 rounded-full font-semibold hover:bg-opacity-30 transition-all duration-300 backdrop-blur-sm"
            >
              Logout
            </button>
          </div>
        </nav>
        
        <main className='max-w-6xl mx-auto p-6'>
          {/* Welcome Section with Stats */}
          <div className="mb-8 text-center">
            <h2 className='text-5xl font-extrabold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
              Welcome to TaskMaster Pro
            </h2>
            <p className="text-gray-600 text-lg mb-6">Organize your life, one task at a time</p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-orange-100">
                <div className="text-3xl font-bold text-orange-600">{taskStats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-green-100">
                <div className="text-3xl font-bold text-green-600">{taskStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-yellow-100">
                <div className="text-3xl font-bold text-yellow-600">{taskStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg border border-red-100">
                <div className="text-3xl font-bold text-red-600">{taskStats.high}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>
          </div>

          {/* Enhanced Add Task Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (newTask.trim()) {
                addTask(newTask.trim(), newTaskPriority);
                setNewTask('');
                setNewTaskPriority('medium');
              }
            }} className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1 p-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300" 
                placeholder="What needs to be done?"
                required
              />
              <select 
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="p-4 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🟡 Medium Priority</option>
                <option value="high">🔴 High Priority</option>
              </select>
              <button 
                type="submit" 
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Add Task
              </button>
            </form>
          </div>
          
          {/* Enhanced Filters and Search */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-orange-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Filter & Search</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Tasks</label>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                  placeholder="Search your tasks..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select 
                  onChange={(e) => setFilterStatus(e.target.value)} 
                  className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300" 
                  value={filterStatus}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Priority</label>
                <select 
                  onChange={(e) => setFilterPriority(e.target.value)} 
                  className="w-full p-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300"
                  value={filterPriority}
                > 
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                <span className="text-orange-600 font-medium">Loading tasks...</span>
              </div>
            </div>
          )}
          
          {/* Enhanced Tasks List */}
          <div className="space-y-4">
            {filterTasks.map((task, index) => (
              <div 
                key={task._id} 
                className={`bg-white rounded-2xl shadow-lg border border-orange-100 p-6 transform hover:scale-[1.02] transition-all duration-300 ${
                  task.status === 'completed' ? 'opacity-75' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <div className='flex-1 flex items-center gap-3'>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      task.status === 'completed' 
                        ? 'bg-green-500 border-green-500' 
                        : 'border-gray-300 hover:border-orange-400'
                    } transition-colors duration-200`}>
                      {task.status === 'completed' && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`text-lg font-medium ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-800'
                      }`}>
                        {task.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className='flex gap-3 items-center flex-wrap'>
                    <button 
                      onClick={() => updateTaskStatus(task._id, task.status)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        task.status === "pending" 
                          ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200" 
                          : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                      }`}
                    >
                      {task.status === "pending" ? "✓ Complete" : "↺ Reopen"}
                    </button>
                    
                    <select 
                      value={task.priority}
                      onChange={(e) => updateTaskPriority(task._id, e.target.value)}
                      className='p-2 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300'
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                    
                    <button 
                      onClick={() => deleteTask(task._id)} 
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-200"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filterTasks.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                {tasks.length === 0 ? "No tasks yet!" : "No tasks match your filters"}
              </h3>
              <p className="text-gray-500">
                {tasks.length === 0 
                  ? "Add your first task to get started on your productivity journey." 
                  : "Try adjusting your filters or search term to find more tasks."}
              </p>
            </div>
          )}
        </main>
        
        {/* Enhanced Footer */}
        <footer className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 mt-16">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-lg font-medium">© 2025 TaskMaster Pro</p>
            <p className="text-sm opacity-75 mt-1">Empowering productivity, one task at a time</p>
          </div>
        </footer>
      </div>
    );
  };

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