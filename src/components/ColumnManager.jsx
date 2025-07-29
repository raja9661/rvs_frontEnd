
import Layout from './Layout/Layout';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, GripVertical, Plus, Trash2, Save, Users, Shield, User } from 'lucide-react';

const ColumnManager = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeId, setActiveId] = useState(null);
  
  // Get theme from localStorage (synced with Layout component)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check localStorage for theme
    setIsDarkMode(localStorage.getItem("theme") === "dark");
    
    // Listen for theme changes
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("theme") === "dark");
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Initialize sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const getUser  = localStorage.getItem("loginUser ");
    if (getUser ) {
      const data = JSON.parse(getUser );
      setActiveRole(data.role || "");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [colsResponse, configResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/available`),
          axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/config/${activeRole}`)
        ]);
        
        setAvailableColumns(colsResponse.data.columns);
        setColumnOrder(configResponse.data.config.columnOrder);
        setMessage({ text: '', type: '' });
      } catch (error) {
        console.error('Error fetching column data:', error);
        setMessage({ 
          text: 'Failed to load column configuration', 
          type: 'error' 
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [activeRole]);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };

  const saveColumnOrder = async () => {
    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/config/${activeRole}`, { columnOrder });
      setMessage({ 
        text: 'Column configuration saved successfully!', 
        type: 'success' 
      });
      
      setTimeout(() => {
        setMessage(prev => prev.type === 'success' ? { text: '', type: '' } : prev);
      }, 3000);
    } catch (error) {
      console.error('Error saving column order:', error);
      setMessage({ 
        text: 'Failed to save configuration', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addColumn = (columnName) => {
    if (!columnOrder.includes(columnName)) {
      setColumnOrder([...columnOrder, columnName]);
    }
  };

  const removeColumn = (columnName) => {
    setColumnOrder(columnOrder.filter(col => col !== columnName));
  };

  // Role icon mapping
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'employee': return <Users className="w-4 h-4" />;
      case 'client': return <User  className="w-4 h-4" />;
      default: return <User  className="w-4 h-4" />;
    }
  };

  // Custom drop animation
  const dropAnimationConfig = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  return (
    <Layout>
      <div className="w-auto mx-auto space-y-4 md:p-1">
        {/* Header Section */}
        
        {/* Role Selector */}
        <div className={`${
  isDarkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200 shadow-lg'
} rounded-xl p-6 shadow-xl border`}>
  <h3 className={`text-lg font-semibold mb-4 ${
    isDarkMode ? 'text-white' : 'text-gray-800'
  }`}>Select User Role</h3>

  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {['admin', 'employee', 'client'].map((role) => (
      <button
        key={role}
        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg capitalize transition-all duration-200 font-medium ${
          activeRole === role
            ? (isDarkMode 
                ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400'
                : 'bg-blue-600 text-white shadow-md ring-2 ring-blue-300')
            : (isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300')
        }`}
        onClick={() => setActiveRole(role)}
      >
        {getRoleIcon(role)}
        {role}
      </button>
    ))}
  </div>
</div>

        
        {/* Status Message */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'error' 
              ? 'bg-red-900/20 text-red-400 border-red-700'
              : 'bg-green-900/20 text-green-400 border-green-700'
          }`}>
            <div className="flex items-center">
              {message.type === 'error' ? (
                <Trash2 className="w-5 h-5 mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Available Columns Panel */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-300 shadow-lg'
          } rounded-xl p-6 shadow-xl border`}>
            <div className="flex items-center mb-6">
              <Plus className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className={`text-lg font-semibold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Available Columns
              </h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
              {availableColumns.length === 0 ? (
                <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {isLoading ? 'Loading columns...' : 'No columns available'}
                </div>
              ) : (
                availableColumns.map(col => (
                  <div 
                    key={col} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-650 shadow-lg'
                        : 'bg-gray-100 border-gray-300 hover:bg-gray-200 shadow-lg'
                    }`}
                  >
                    <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {col}
                    </span>
                    {!columnOrder.includes(col) && (
                      <button 
                        onClick={() => addColumn(col)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-medium transition-all duration-200 shadow-lg ${
                          'bg-blue-600 hover:bg-blue-700 text-white ring-2 ring-blue-500/20'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Current Configuration Panel */}
          <div className={`${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-300 shadow-lg'
          } rounded-xl p-6 shadow-xl border`}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div className="flex items-center">
                <GripVertical className={`w-5 h-5 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Column Order for{' '}
                  <span className={`capitalize ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {activeRole}
                  </span>
                </h3>
              </div>
              
              <button 
                onClick={saveColumnOrder}
                disabled={isLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                    : 'bg-green-600 hover:bg-green-700 text-white ring-2 ring-green-500/20'
                }`}
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={columnOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                  {columnOrder.map((col, index) => (
                    <SortableItem 
                      key={col} 
                      id={col} 
                      col={col} 
                      index={index}
                      onRemove={removeColumn}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay dropAnimation={dropAnimationConfig}>
                {activeId ? (
                  <div className={`flex items-center justify-between p-4 rounded-lg border shadow-2xl transition-all ${
                    'bg-blue-900/50 border-blue-500 backdrop-blur-sm ring-2 ring-blue-400'
                  }`}>
                    <div className="flex items-center">
                      <GripVertical className={`w-5 h-5 mr-3 text-blue-400`} />
                      <span className={`font-medium text-blue-200`}>
                        {activeId}
                      </span>
                    </div>
                    <button 
                      className={`p-1.5 rounded-full transition-colors text-red-400 hover:text-red-300 hover:bg-red-900/20`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            
            {columnOrder.length === 0 && (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <Settings className={`w-12 h-12 mx-auto mb-4 ${
                  isDarkMode ? 'text-gray-600' : 'text-gray-600'
                }`} />
                <p className="text-lg font-medium mb-2">No columns configured</p>
                <p className="text-sm">Add columns from the available list to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#f3f4f6'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#6b7280' : '#9ca3af'};
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#9ca3af' : '#d1d5db'};
        }
      `}</style>
    </Layout>
  );
};

// Custom Sortable Item Component
const SortableItem = ({ id, col, index, onRemove, isDarkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 ${
        isDragging 
          ? 'bg-blue-900/30 border-blue-500 shadow-2xl ring-2 ring-blue-400'
          : `${isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650 shadow-lg' : 'bg-white border-gray-300 hover:bg-gray-100 shadow-lg'}`
      }`}
      {...attributes}
    >
      <div className="flex items-center flex-1" {...listeners}>
        <GripVertical className={`w-5 h-5 mr-3 cursor-move transition-colors ${
          isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-500'
        }`} />
        <div className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
            'bg-blue-600 text-white ring-2 ring-blue-500/20'
          }`}>
            {index + 1}
          </span>
          <span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {col}
          </span>
        </div>
      </div>
      
      <button 
        onClick={() => onRemove(col)}
        className={`p-2 rounded-full transition-all duration-200 ${
          'text-red-400 hover:text-red-300 hover:bg-red-900/20'
        }`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ColumnManager;








// const ColumnManager = () => {
//   const [activeRole, setActiveRole] = useState('admin');
//   const [availableColumns, setAvailableColumns] = useState([]);
//   const [columnOrder, setColumnOrder] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState({ text: '', type: '' });

//   useEffect(() => {
//     const getUser = localStorage.getItem("loginUser");
//     if (getUser) {
//       const data = JSON.parse(getUser);
//       setActiveRole(data.role || "");
//     }
//   }, []);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const [colsResponse, configResponse] = await Promise.all([
//           axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/available`),
//           axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/config/${activeRole}`)
//         ]);
        
//         setAvailableColumns(colsResponse.data.columns);
//         setColumnOrder(configResponse.data.config.columnOrder);
//         setMessage({ text: '', type: '' });
//       } catch (error) {
//         console.error('Error fetching column data:', error);
//         setMessage({ 
//           text: 'Failed to load column configuration', 
//           type: 'error' 
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [activeRole]);

//   const handleDragEnd = (result) => {
//     if (!result.destination) return;
    
//     const items = Array.from(columnOrder);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);
    
//     setColumnOrder(items);
//   };

//   const saveColumnOrder = async () => {
//     setIsLoading(true);
//     try {
//       await axios.put(`${import.meta.env.VITE_Backend_Base_URL}/kyc/columns/config/${activeRole}`, { columnOrder });
//       setMessage({ 
//         text: 'Column configuration saved successfully!', 
//         type: 'success' 
//       });
      
//       setTimeout(() => {
//         setMessage(prev => prev.type === 'success' ? { text: '', type: '' } : prev);
//       }, 3000);
//     } catch (error) {
//       console.error('Error saving column order:', error);
//       setMessage({ 
//         text: 'Failed to save configuration', 
//         type: 'error' 
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addColumn = (columnName) => {
//     if (!columnOrder.includes(columnName)) {
//       setColumnOrder([...columnOrder, columnName]);
//     }
//   };

//   const removeColumn = (columnName) => {
//     setColumnOrder(columnOrder.filter(col => col !== columnName));
//   };

//   return (
//     <Layout>
//     <div className="max-w-6xl mx-auto p-4 md:p-6">
//       <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
//         Column Management System
//       </h2>
      
//       {/* Role Selector */}
//       <div className="flex flex-wrap gap-2 mb-6">
//         {['admin', 'employee', 'client'].map((role) => (
//           <button
//             key={role}
//             className={`px-4 py-2 rounded-md capitalize transition-colors ${
//               activeRole === role
//                 ? 'bg-blue-600 text-white shadow-md'
//                 : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//             }`}
//             onClick={() => setActiveRole(role)}
//           >
//             {role}
//           </button>
//         ))}
//       </div>
      
//       {/* Status Message */}
//       {message.text && (
//         <div className={`mb-6 p-3 rounded-md ${
//           message.type === 'error' 
//             ? 'bg-red-100 text-red-700 border border-red-200'
//             : 'bg-green-100 text-green-700 border border-green-200'
//         }`}>
//           {message.text}
//         </div>
//       )}
      
//       {/* Main Content */}
//       <div className="flex flex-col lg:flex-row gap-6">
//         {/* Available Columns Panel */}
//         <div className="flex-1 bg-white rounded-lg shadow-md p-4 border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
//             Available Columns
//           </h3>
//           <ul className="space-y-2">
//             {availableColumns.map(col => (
//               <li 
//                 key={col} 
//                 className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
//               >
//                 <span className="text-gray-700 font-medium">{col}</span>
//                 {!columnOrder.includes(col) && (
//                   <button 
//                     onClick={() => addColumn(col)}
//                     className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
//                   >
//                     Add
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
        
//         {/* Current Configuration Panel */}
//         <div className="flex-1 bg-white rounded-lg shadow-md p-4 border border-gray-200">
//           <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-700">
//               Current Column Order for <span className="capitalize">{activeRole}</span>
//             </h3>
//             <button 
//               onClick={saveColumnOrder}
//               disabled={isLoading}
//               className={`px-4 py-2 rounded-md ${
//                 isLoading
//                   ? 'bg-gray-400 cursor-not-allowed'
//                   : 'bg-green-500 hover:bg-green-600'
//               } text-white transition-colors`}
//             >
//               {isLoading ? 'Saving...' : 'Save Configuration'}
//             </button>
//           </div>
          
//           <DragDropContext onDragEnd={handleDragEnd}>
//             <Droppable droppableId="columns">
//               {(provided) => (
//                 <div
//                   {...provided.droppableProps}
//                   ref={provided.innerRef}
//                   className="space-y-2"
//                 >
//                   {columnOrder.map((col, index) => (
//                     <Draggable key={col} draggableId={col} index={index}>
//                       {(provided, snapshot) => (
//                         <div
//                           ref={provided.innerRef}
//                           {...provided.draggableProps}
//                           {...provided.dragHandleProps}
//                           className={`flex items-center justify-between p-3 rounded-md border ${
//                             snapshot.isDragging
//                               ? 'bg-blue-50 border-blue-300 shadow-lg'
//                               : 'bg-white border-gray-300 shadow-sm'
//                           } transition-all`}
//                         >
//                           <div className="flex items-center">
//                             <svg 
//                               xmlns="http://www.w3.org/2000/svg" 
//                               className="h-5 w-5 text-gray-400 mr-2" 
//                               fill="none" 
//                               viewBox="0 0 24 24" 
//                               stroke="currentColor"
//                             >
//                               <path 
//                                 strokeLinecap="round" 
//                                 strokeLinejoin="round" 
//                                 strokeWidth={2} 
//                                 d="M4 8h16M4 16h16" 
//                               />
//                             </svg>
//                             <span className="text-gray-700 font-medium">{col}</span>
//                           </div>
//                           <button 
//                             onClick={() => removeColumn(col)}
//                             className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
//                           >
//                             <svg 
//                               xmlns="http://www.w3.org/2000/svg" 
//                               className="h-5 w-5" 
//                               fill="none" 
//                               viewBox="0 0 24 24" 
//                               stroke="currentColor"
//                             >
//                               <path 
//                                 strokeLinecap="round" 
//                                 strokeLinejoin="round" 
//                                 strokeWidth={2} 
//                                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
//                               />
//                             </svg>
//                           </button>
//                         </div>
//                       )}
//                     </Draggable>
//                   ))}
//                   {provided.placeholder}
//                 </div>
//               )}
//             </Droppable>
//           </DragDropContext>
          
//           {columnOrder.length === 0 && (
//             <div className="text-center py-8 text-gray-500">
//               No columns selected. Add columns from the available list.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     </Layout>
//   );
// };

// export default ColumnManager;