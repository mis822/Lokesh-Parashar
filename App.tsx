
import React, { useState, useMemo, useEffect } from 'react';
import { TabType, EmployeeData, Task } from './types';
import { DAILY_CHECKLIST_DATA, WMY_CHECKLIST_DATA } from './data';

type ViewMode = 'list' | 'detail';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.DAILY);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Enabled by default as per IT Administrator instructions
  const isCreator = true; 
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Local state for editable data
  const [dailyData, setDailyData] = useState<EmployeeData[]>(DAILY_CHECKLIST_DATA);
  const [wmyData, setWmyData] = useState<EmployeeData[]>(WMY_CHECKLIST_DATA);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string | null>(null);

  // Persistence: Load custom data on mount
  useEffect(() => {
    const savedDaily = localStorage.getItem('custom_daily_tasks');
    const savedWmy = localStorage.getItem('custom_wmy_tasks');
    if (savedDaily) setDailyData(JSON.parse(savedDaily));
    if (savedWmy) setWmyData(JSON.parse(savedWmy));
  }, []);

  const saveToDisk = (daily: EmployeeData[], wmy: EmployeeData[]) => {
    localStorage.setItem('custom_daily_tasks', JSON.stringify(daily));
    localStorage.setItem('custom_wmy_tasks', JSON.stringify(wmy));
  };

  const employeesList = useMemo(() => {
    const baseList = activeTab === TabType.DAILY ? dailyData : wmyData;
    return baseList.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTab, searchQuery, dailyData, wmyData]);

  const currentData = useMemo(() => {
    if (!selectedEmployeeName) return null;
    const list = activeTab === TabType.DAILY ? dailyData : wmyData;
    return list.find(e => e.name === selectedEmployeeName) || null;
  }, [activeTab, selectedEmployeeName, dailyData, wmyData]);

  const selectEmployee = (name: string) => {
    setSelectedEmployeeName(name);
    setViewMode('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setViewMode('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Editing handlers
  const updateTask = (taskId: number, newDescription: string) => {
    if (!currentData) return;
    const updateList = (list: EmployeeData[]) => 
      list.map(emp => emp.name === currentData.name 
        ? { ...emp, tasks: emp.tasks.map(t => t.id === taskId ? { ...t, description: newDescription } : t) }
        : emp
      );

    if (activeTab === TabType.DAILY) {
      const newData = updateList(dailyData);
      setDailyData(newData);
      saveToDisk(newData, wmyData);
    } else {
      const newData = updateList(wmyData);
      setWmyData(newData);
      saveToDisk(dailyData, newData);
    }
  };

  const addTask = () => {
    if (!currentData) return;
    const newId = Date.now();
    const updateList = (list: EmployeeData[]) => 
      list.map(emp => emp.name === currentData.name 
        ? { ...emp, tasks: [...emp.tasks, { id: newId, description: "New Task" }] }
        : emp
      );

    if (activeTab === TabType.DAILY) {
      const newData = updateList(dailyData);
      setDailyData(newData);
      saveToDisk(newData, wmyData);
    } else {
      const newData = updateList(wmyData);
      setWmyData(newData);
      saveToDisk(dailyData, newData);
    }
  };

  const removeTask = (taskId: number) => {
    if (!currentData) return;
    const updateList = (list: EmployeeData[]) => 
      list.map(emp => emp.name === currentData.name 
        ? { ...emp, tasks: emp.tasks.filter(t => t.id !== taskId) }
        : emp
      );

    if (activeTab === TabType.DAILY) {
      const newData = updateList(dailyData);
      setDailyData(newData);
      saveToDisk(newData, wmyData);
    } else {
      const newData = updateList(wmyData);
      setWmyData(newData);
      saveToDisk(dailyData, newData);
    }
  };

  const updateLink = (newLink: string) => {
    if (!currentData) return;
    const updateList = (list: EmployeeData[]) => 
      list.map(emp => emp.name === currentData.name ? { ...emp, checklistLink: newLink } : emp);

    if (activeTab === TabType.DAILY) {
      const newData = updateList(dailyData);
      setDailyData(newData);
      saveToDisk(newData, wmyData);
    } else {
      const newData = updateList(wmyData);
      setWmyData(newData);
      saveToDisk(dailyData, newData);
    }
  };

  // Drag and Drop handlers
  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const onDrop = () => {
    if (draggedIndex === null || dragOverIndex === null || !currentData) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTasks = [...currentData.tasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(dragOverIndex, 0, removed);

    const updateList = (list: EmployeeData[]) =>
      list.map(emp => emp.name === currentData.name ? { ...emp, tasks: newTasks } : emp);

    if (activeTab === TabType.DAILY) {
      const newData = updateList(dailyData);
      setDailyData(newData);
      saveToDisk(newData, wmyData);
    } else {
      const newData = updateList(wmyData);
      setWmyData(newData);
      saveToDisk(dailyData, newData);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={goBack}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:inline">Employee Portal</span>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab(TabType.DAILY)}
                className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === TabType.DAILY 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Daily Checklist
              </button>
              <button
                onClick={() => setActiveTab(TabType.WMY)}
                className={`px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === TabType.WMY 
                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                W/M/Y Checklist
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-8 transition-all duration-500">
        {viewMode === 'list' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
               <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Select Employee</h1>
               <div className="relative mb-6">
                  <input 
                    type="text" 
                    placeholder="Search employee name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {employeesList.map(emp => (
                    <button
                      key={emp.name}
                      onClick={() => selectEmployee(emp.name)}
                      className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 active:scale-95"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{emp.name}</span>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                  {employeesList.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 italic">No employees found matching "{searchQuery}"</div>
                  )}
               </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center mb-4">
               <button 
                onClick={goBack}
                className="flex items-center space-x-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors group"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                 </svg>
                 <span>Back to List</span>
               </button>
            </div>

            {/* Vercel Advertisement Banner */}
            <div className="bg-indigo-600 rounded-2xl p-4 shadow-xl shadow-indigo-100 flex items-center space-x-4 border border-indigo-500">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-white font-medium text-sm sm:text-base">
                <span className="font-bold">Vercel Agent</span> Code reviews that catch bugs before they reach production. 
                <span className="hidden sm:inline"> Get started with $100 in free credit.</span>
              </p>
            </div>

            {/* Employee Header View */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex items-center space-x-5">
                <div className="w-20 h-20 flex-shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-100">
                  {currentData?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{currentData?.name}</h2>
                  <div className="flex items-center mt-1">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                      {activeTab === TabType.DAILY ? 'Daily Checklist' : 'W/M/Y Checklist'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Employee Checklist Link</label>
                <input 
                  type="text" 
                  value={currentData?.checklistLink || ''}
                  onChange={(e) => updateLink(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-indigo-600 font-medium"
                  placeholder="Paste checklist URL here..."
                />
              </div>
            </div>

            {/* Task Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-12">
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-slate-800 text-xl">Tasks</h3>
                  <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {currentData?.tasks.length}
                  </span>
                </div>
                <button 
                  onClick={addTask}
                  className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  <span>Add Task</span>
                </button>
              </div>

              <div 
                className="divide-y divide-slate-100"
                onDragLeave={() => setDragOverIndex(null)}
              >
                {currentData?.tasks.map((task, idx) => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={() => onDragStart(idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDrop={onDrop}
                    className={`group p-6 sm:px-8 flex items-start transition-all duration-200 ${
                      draggedIndex === idx ? 'opacity-40 bg-indigo-50' : ''
                    } ${
                      dragOverIndex === idx && draggedIndex !== idx ? 'bg-indigo-50 border-t-2 border-indigo-400' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex-grow flex items-start space-x-5">
                      <div className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                      
                      <div className="flex-grow flex items-center space-x-4">
                        <textarea 
                          value={task.description}
                          onChange={(e) => updateTask(task.id, e.target.value)}
                          rows={1}
                          className="flex-grow text-lg font-medium leading-relaxed text-slate-800 bg-transparent border-b border-dashed border-slate-200 focus:border-indigo-500 outline-none resize-none transition-all py-1"
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                        <button 
                          onClick={() => removeTask(task.id)}
                          className="text-slate-200 hover:text-red-500 transition-colors p-2"
                          title="Delete Task"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {currentData?.tasks.length === 0 && (
                  <div className="p-20 text-center text-slate-400 italic">
                    No tasks found. Click "Add Task" to begin.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;