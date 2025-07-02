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

  // Fetch tasks from the backend
  const fetchTasks = async () => {
    try {
      const response = await fetch("https://todo-backend-06ap.onrender.com/tasks", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Fetched data:", data);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
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

      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  //Delete a task
  const deleteTask = async (id) => {
    await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setTasks(tasks.filter(task => task._id !== id));
  };   

  // Update a task's status
  const updateTaskStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "pending" ? "completed" : "pending";

  const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });

  const updatedTask = await response.json();
  setTasks(tasks.map(task => task._id === id ? updatedTask : task));
};


  // Update a task's priority
  const updateTaskPriority = async (id, newPriority) => {
  const response = await fetch(`https://todo-backend-06ap.onrender.com/tasks/${id}/priority`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ priority: newPriority }),
  });

  const updatedTask = await response.json();
  setTasks(tasks.map(task => task._id === id ? updatedTask : task));
};


  // Filtering tasks
  const filterTasks = tasks.filter(
    (task) => 
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  // Simple MainApp placeholder
  const MainApp = () => (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md ">
        <ul className='flex space-x-4'>
          <li>
            <a href="#" className="px-4 py-2 rounded-full font-semibold tansition-colors duration-200 hover:bg-orange-600 hover-text-white focus:bg-orange-700 focus:outline-none shadow-sm">
              Home
            </a>
          </li>
        </ul>
        <button onClick={logout} className="px-4 py-2 rounded-full font-semibold tansition-colors duration-200 hover:bg-orange-600 hover-text-white focus:bg-orange-700 focus:outline-none shadow-sm">
          Logout
        </button>
      </nav>
      <main className='flex-1 p-8'>
        <h2 className='text-4xl font-extrabold text-center mb-8 text-orange-600 drop-shadow'>Welcome to the Todo App</h2>
        <form onSubmit={(e)=>{
          e.preventDefault();
          addTask(e.target[0].value);
          e.target[0].value = '';
        }}
        className="flex justify-center items-center gap-2 mb-6"
        >
          <input type="text" className="p-3 border-2 border-orange-300 rounded-lg w-2/3 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Add a new task" />
          <button type="submit" className="ml-4 px-4 py-2 rounded-full font-semibold tansition-colors duration-200 hover:bg-orange-600 hover-text-white focus:bg-orange-700 focus:outline-none shadow-sm">
            Add Task
          </button>
        </form>
        <div className='mb-6 flex gap-4 justify-center'>
          <select onChange={(e) => setFilterStatus(e.target.value)} className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400" 
          value={filterStatus}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>

          </select>
          <select onChange={(e) => setFilterPriority(e.target.value)} 
          className="p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          value={filterPriority}
          > 
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {/* task after filtering */}
        <ul className='space-y-4'>
          {filterTasks.map((task) => (
            <li key={task._id} className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md-item-center md-justify-center gap-4 hover:bg-orange-100 transition duration-300">
              <div className='flex-1'>
                <span className='text-lg text-orange-800'>
                  {task.text}
                </span>
                <span className='ml-2 text-sm text-gray-500'>
                  ({task.status},{task.priority})
                </span>
              </div>
              <div className='flex gap-2 item-center'>
                <button onClick={()=>updateTaskStatus(task._id,task.status)}
                className={'px-3 py-1 rounded-full font-semibold transition-colors duration-300 ${task.status==="pending"?"bg-yellow-400 text-yellow-900 hover:yellow-500":"bg-green-400 text-green-900 hover:green-500"}'}
                >
                  {task.status==="pending"?"Mark complete":"Mark pending"}
                </button>
                <select 
                  value={task.priority}
                  onChange={(e)=>{
                  updateTaskPriority(task._id,e.target.value);
                  }}
                  className='p-2 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400'
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button onClick={()=>deleteTask(task._id)} 
                title="Delete task" 
                classname="flex-item-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-full transition-color duration-200 ml-2">
                  <i className='fas fa-trash'/>Delete
                </button>
              </div>
            </li>
          ))}:
        </ul>
      </main>
      <footer className="bg-orange-500 text-white p-4 mt-auto text-center shadow-inner">
        2025 your To-Do App
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/" element={token ? <MainApp /> : <Navigate to="/login" replace />} /> */}
        <Route path="/" element={<MainApp />}/>
      </Routes>
    </Router>
  );
}

export default App;
