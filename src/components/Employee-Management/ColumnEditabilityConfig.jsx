import React, { useState, useEffect } from "react";
import axios from "axios";

const ColumnEditabilityConfig = ({ headers, onSave }) => {
  const [editableColumns, setEditableColumns] = useState([]);

  useEffect(() => {
    // Initialize editable columns as all editable by default
    const initialEditable = headers.map(() => true);
    setEditableColumns(initialEditable);
  }, [headers]);

  const handleCheckboxChange = (index) => {
    setEditableColumns((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      await axios.post("/api/save-editable-columns", {
        editableColumns, // Send the updated column editability configuration
      });
      alert("Column editability settings saved!");
      if (onSave) onSave(editableColumns);
    } catch (error) {
      console.error("Error saving column configuration", error);
      alert("Failed to save column settings");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-center text-blue-700">
        Configure Editable Columns (For Employee Role)
      </h2>
      <div className="mt-4">
        {headers.map((header, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={editableColumns[index]}
              onChange={() => handleCheckboxChange(index)}
            />
            <label>{header}</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 transition duration-300"
      >
        Save Settings
      </button>
    </div>
  );
};

export default ColumnEditabilityConfig;
