import React, { useState } from "react";
import { toast } from 'react-toastify';
import axios from "axios";

const CopyFieldsModal = ({ record, onClose, isDarkMode, selectedRecord, fetchTrackerData }) => {
    const [selectedFields, setSelectedFields] = useState({
        product: true,
        accountNumber: true,
        vendorName: false,
        listByEmployee: false,
        status: false,
        requirement: true,
        attachments:false,
        details: false,
        remarks: false
    });

    // State for editable fields
    const [editableFields, setEditableFields] = useState({
        vendorName: record.vendorName || '',
        listByEmployee: record.listByEmployee || ''
    });

    const handleFieldChange = (field, value) => {
        setEditableFields(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCopy = async () => {
        const changes = {};
        
        // Add all selected fields to changes
        Object.entries(selectedFields).forEach(([field, shouldCopy]) => {
            if (shouldCopy) {
                // Use edited values for vendorName and listByEmployee
                if (field === 'vendorName' || field === 'listByEmployee') {
                    changes[field] = editableFields[field];
                } else {
                    changes[field] = record[field];
                }
            }
        });

        try {
            await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/update-from-deduce`, {
                caseId: selectedRecord.caseId,
                updates: changes
            });
            toast.success("Record updated successfully");
            onClose();
            fetchTrackerData();
        } catch (error) {
            toast.error(`Failed to update record: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-md ${
                isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                        Select Fields to Copy
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-1 rounded-full ${
                            isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                        }`}
                    >
                        ✕
                    </button>
                </div>
                
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {Object.keys(selectedFields).map(field => (
                        record[field] !== undefined && (
                            <div key={field} className="flex flex-col gap-1 p-2 rounded hover:bg-opacity-10 hover:bg-gray-500">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`field-${field}`}
                                        checked={selectedFields[field]}
                                        onChange={() => setSelectedFields(prev => ({
                                            ...prev,
                                            [field]: !prev[field]
                                        }))}
                                        className="mr-2"
                                    />
                                    <label 
                                        htmlFor={`field-${field}`}
                                        className={`font-medium capitalize flex-1 ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}
                                    >
                                        {field}
                                    </label>
                                </div>
                                
                                {/* Special editable fields */}
                                {(field === 'vendorName' || field === 'listByEmployee') ? (
                                    <input
                                        type="text"
                                        value={editableFields[field]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                        className={`mt-1 p-2 border rounded w-full ${
                                            isDarkMode 
                                                ? "bg-gray-700 border-gray-600 text-white" 
                                                : "bg-white border-gray-300 text-gray-700"
                                        }`}
                                        disabled={!selectedFields[field]}
                                    />
                                ) : (
                                    <div className={`text-sm mt-1 p-2 rounded ${
                                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                                    } break-all`}>
                                        {String(record[field] || 'N/A')}
                                    </div>
                                )}
                            </div>
                        )
                    ))}
                </div>
                
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded ${
                            isDarkMode
                                ? "bg-gray-600 hover:bg-gray-500 text-white"
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded ${
                            isDarkMode
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-green-500 hover:bg-green-600"
                        } text-white`}
                    >
                        Update Record
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CopyFieldsModal;