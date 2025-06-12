// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const AttachmentManager = ({ caseId, isDarkMode, onClose }) => {
//   const [attachments, setAttachments] = useState([]);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);

//   useEffect(() => {
//     fetchAttachments();
//   }, [caseId]);

//   const fetchAttachments = async () => {
//     try {
//       const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/attachments`, {
//         params: { caseId }
//       });
//       console.log(response)
//       setAttachments(response.data || []);
//     } catch (error) {
//       toast.error("Failed to load attachments");
//     }
//   };

//   const handleFileChange = (e) => {
//     setSelectedFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     if (!selectedFile) return;
    
//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', selectedFile);
//       formData.append('caseId', caseId);

//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-attachment`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       toast.success("File uploaded successfully");
//       setSelectedFile(null);
//       fetchAttachments();
//     } catch (error) {
//       toast.error("Failed to upload file");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   // const handleDownload = async (attachment) => {
//   //   window.open(
//   //     `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${attachment.filename}`,
//   //     '_blank'
//   //   );
//   // };
//   const handleDownload = async (attachment) => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${attachment.filename}`,
//         { responseType: 'blob' }
//       );
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', attachment.originalname);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (error) {
//       toast.error("Failed to download file");
//     }
//   };

//   const handleDelete = async (filename) => {
//     if (!window.confirm("Delete this attachment?")) return;
    
//     try {
//       await axios.delete(
//         `${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-attachment/${caseId}/${filename}`
//       );
//       toast.success("Attachment deleted");
//       fetchAttachments();
//     } catch (error) {
//       toast.error("Failed to delete attachment");
//     }
//   };

//   const showPreview = (attachment) => {
//     if (attachment.mimetype.startsWith('image/')) {
//       setPreviewImage(attachment);
//     } else {
//       handleDownload(attachment);
//     }
//   };

//   const isImage = (mimetype) => {
//     return mimetype.startsWith('image/');
//   };

//   return (
//     <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//       {/* Upload Section */}
//       <div className="mb-6 p-4 border rounded-lg border-dashed border-gray-300 dark:border-gray-600">
//         <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//           Upload New Attachment
//         </label>
//         <div className="flex items-center space-x-4">
//           <label className="flex-1">
//             <input 
//               type="file" 
//               onChange={handleFileChange} 
//               className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
//                 isDarkMode ? 
//                 'file:bg-gray-600 file:text-white hover:file:bg-gray-500' : 
//                 'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
//               }`}
//             />
//           </label>
//           <button
//             onClick={handleUpload}
//             disabled={!selectedFile || isUploading}
//             className={`px-4 py-2 rounded-md text-sm font-medium ${
//               isDarkMode ? 
//               'bg-blue-600 hover:bg-blue-700 text-white' : 
//               'bg-blue-500 hover:bg-blue-600 text-white'
//             } ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
//           >
//             {isUploading ? (
//               <span className="flex items-center">
//                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 Uploading...
//               </span>
//             ) : 'Upload'}
//           </button>
//         </div>
//       </div>

//       {/* Attachments List */}
//       <div>
//         <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//           Existing Attachments ({attachments.length})
//         </h4>
        
//         {attachments.length > 0 ? (
//           <div className="space-y-2">
//             {attachments.map((attachment, index) => (
//               <div 
//                 key={index}z
//                 className={`flex justify-between items-center p-3 rounded-lg ${
//                   isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'
//                 } transition-colors duration-200`}
//               >
//                 <div 
//                   className="flex items-center cursor-pointer flex-1 min-w-0"
//                   onClick={() => showPreview(attachment)}
//                 >
//                   {isImage(attachment.mimetype) ? (
//                     <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                     </svg>
//                   ) : (
//                     <svg className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   )}
//                   <span className="truncate">
//                     {attachment.originalname}
//                   </span>
//                 </div>
                
//                 <div className="flex space-x-2 ml-3">
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDownload(attachment);
//                     }}
//                     className={`px-3 py-1 text-xs rounded-md ${
//                       isDarkMode ? 
//                       'bg-gray-500 hover:bg-gray-400 text-white' : 
//                       'bg-gray-200 hover:bg-gray-300 text-gray-800'
//                     }`}
//                   >
//                     Download
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(attachment.filename);
//                     }}
//                     className={`px-3 py-1 text-xs rounded-md ${
//                       isDarkMode ? 
//                       'bg-red-600 hover:bg-red-500 text-white' : 
//                       'bg-red-500 hover:bg-red-600 text-white'
//                     }`}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className={`p-4 text-center rounded-lg ${
//             isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'
//           }`}>
//             No attachments found for this case
//           </div>
//         )}
//       </div>
//       {/* Image Preview Modal */}
// {previewImage && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
//     <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh]">
//       <div className="flex justify-between items-center mb-2">
//         <h3 className="text-lg font-medium">{previewImage.originalname}</h3>
//         <button 
//           onClick={() => setPreviewImage(null)}
//           className="text-xl text-gray-600 hover:text-gray-800"
//         >
//           ✖
//         </button>
//       </div>
//       <img 
//         src={`${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${previewImage.filename}`} 
//         alt={previewImage.originalname}
//         className="max-w-full max-h-[80vh] object-contain"
//       />
//       <div className="mt-2 flex justify-end">
//         <button
//           onClick={() => handleDownload(previewImage)}
//           className="px-3 py-1 bg-blue-500 text-white rounded"
//         >
//           Download
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//     </div>

//     // <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
//     //   <div className="flex justify-between items-center mb-4">
//     //     <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
//     //       Attachments
//     //     </h3>
//     //     <button 
//     //       onClick={onClose}
//     //       className={`text-xl ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
//     //     >
//     //       ✖
//     //     </button>
//     //   </div>

//     //   {/* Upload Section */}
//     //   <div className="mb-4">
//     //     <input 
//     //       type="file" 
//     //       onChange={handleFileChange} 
//     //       className={`mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
//     //     />
//     //     <button
//     //       onClick={handleUpload}
//     //       disabled={!selectedFile || isUploading}
//     //       className={`px-3 py-1 rounded ${isDarkMode ? 
//     //         'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
//     //     >
//     //       {isUploading ? 'Uploading...' : 'Upload'}
//     //     </button>
//     //   </div>

//     //   {/* Image Preview Modal */}
//     //   {previewImage && (
//     //     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//     //       <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh]">
//     //         <div className="flex justify-between items-center mb-2">
//     //           <h3 className="text-lg font-medium">{previewImage.originalname}</h3>
//     //           <button 
//     //             onClick={() => setPreviewImage(null)}
//     //             className="text-xl text-gray-600 hover:text-gray-800"
//     //           >
//     //             ✖
//     //           </button>
//     //         </div>
//     //         <img 
//     //           src={`${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${previewImage.filename}`} 
//     //           alt={previewImage.originalname}
//     //           className="max-w-full max-h-[80vh] object-contain"
//     //         />
//     //         <div className="mt-2 flex justify-end">
//     //           <button
//     //             onClick={() => handleDownload(previewImage)}
//     //             className="px-3 py-1 bg-blue-500 text-white rounded"
//     //           >
//     //             Download
//     //           </button>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   )}

//     //   {/* Attachments List */}
//     //   {attachments.length > 0 ? (
//     //     <ul className="space-y-2">
//     //       {attachments.map((attachment, index) => (
//     //         <li 
//     //           key={index}
//     //           className={`flex justify-between items-center p-2 rounded ${isDarkMode ? 'bg-gray-600' : 'bg-white'}`}
//     //         >
//     //           <div 
//     //             className="flex items-center cursor-pointer"
//     //             onClick={() => showPreview(attachment)}
//     //           >
//     //             {isImage(attachment.mimetype) ? (
//     //               <i className="fas fa-image mr-2 text-blue-500"></i>
//     //             ) : (
//     //               <i className="fas fa-file-alt mr-2 text-gray-500"></i>
//     //             )}
//     //             <span className="truncate max-w-xs">
//     //               {attachment.originalname}
//     //             </span>
//     //           </div>
              
//     //           <div className="flex space-x-2">
//     //             <button
//     //               onClick={() => handleDownload(attachment)}
//     //               className={`px-2 py-1 text-xs rounded ${isDarkMode ? 
//     //                 'bg-gray-500 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
//     //             >
//     //               Download
//     //             </button>
//     //             <button
//     //               onClick={() => handleDelete(attachment.filename)}
//     //               className={`px-2 py-1 text-xs rounded ${isDarkMode ? 
//     //                 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
//     //             >
//     //               Delete
//     //             </button>
//     //           </div>
//     //         </li>
//     //       ))}
//     //     </ul>
//     //   ) : (
//     //     <p className={`italic ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
//     //       No attachments found
//     //     </p>
//     //   )}
//     // </div>
//   );
// };

// export default AttachmentManager;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AttachmentManager = ({ caseId, isDarkMode, onClose,fetchTrackerData,handleMasterReset  }) => {
  const [attachments, setAttachments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchAttachments();
  }, [caseId]);

  const fetchAttachments = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/attachments`, {
        params: { caseId }
      });
      setAttachments(response.data || []);
    } catch (error) {
      toast.error("Failed to load attachments");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caseId', caseId);

     const res = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/kyc/upload-single`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log("attachment Response:",res);

      toast.success("File uploaded successfully");
      setSelectedFile(null);
      handleMasterReset();
      fetchAttachments();
      fetchTrackerData(true);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment) => {
    console.log("attachment",attachment)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${attachment.originalname}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', attachment.originalname);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Delete this attachment?")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_Backend_Base_URL}/kyc/delete-attachment/${caseId}/${filename}`);
      toast.success("Attachment deleted");
      fetchAttachments();
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  const showPreview = (attachment) => {
    if (attachment.mimetype.startsWith('image/')) {
      setPreviewImage(attachment);
    } else {
      handleDownload(attachment);
    }
  };

  const isImage = (mimetype) => {
    return mimetype.startsWith('image/');
  };

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Attachments
        </h3>
        <button
          onClick={onClose}
          className={`text-xl ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
        >
          ✖
        </button>
      </div>

      {/* Upload Section */}
      <div className="mb-6 p-4 border rounded-lg border-dashed border-gray-300 dark:border-gray-600">
        <label className={`block mb-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Upload New Attachment
        </label>
        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <input
              type="file"
              onChange={handleFileChange}
              className={`w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold ${
                isDarkMode ?
                'file:bg-gray-600 file:text-white hover:file:bg-gray-500' :
                'file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
              }`}
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isDarkMode ?
              'bg-blue-600 hover:bg-blue-700 text-white' :
              'bg-blue-500 hover:bg-blue-600 text-white'
            } ${(!selectedFile || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : 'Upload'}
          </button>
        </div>
      </div>

      {/* Attachments List */}
      <div>
        <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Existing Attachments ({attachments.length})
        </h4>

        {attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-gray-100'
                } transition-colors duration-200`}
              >
                <div
                  className="flex items-center cursor-pointer flex-1 min-w-0"
                  onClick={() => showPreview(attachment)}
                >
                  {isImage(attachment.mimetype) ? (
                    <svg className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <span className="truncate">
                    {attachment.originalname}
                  </span>
                </div>

                <div className="flex space-x-2 ml-3">
                  <span className="truncate">
                    {attachment.uploadedAt}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(attachment);
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      isDarkMode ?
                      'bg-gray-500 hover:bg-gray-400 text-white' :
                      'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                  >
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(attachment.filename);
                    }}
                    className={`px-3 py-1 text-xs rounded-md ${
                      isDarkMode ?
                      'bg-red-600 hover:bg-red-500 text-white' :
                      'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-4 text-center rounded-lg ${
            isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'
          }`}>
            No attachments found for this case
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">{previewImage.originalname}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="text-xl text-gray-600 hover:text-gray-800"
              >
                ✖
              </button>
            </div>
            <img
              src={previewImage.location || `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${previewImage.filename}`}
              alt={previewImage.originalname}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleDownload(previewImage)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentManager;
