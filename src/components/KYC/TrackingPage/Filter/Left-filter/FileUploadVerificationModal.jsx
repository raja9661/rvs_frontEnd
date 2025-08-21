import React, { useState, useEffect } from 'react';
import { X, Download, Eye, CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

const FileUploadVerificationModal = ({ 
  isOpen, 
  onClose, 
  uploadedFiles = [], 
  caseIds = [],
  isDarkMode 
}) => {
  const [verificationStatus, setVerificationStatus] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});
  console.log("uploadedFiles:",uploadedFiles)

  useEffect(() => {
    if (isOpen && uploadedFiles.length > 0) {
      verifyUploadedFiles();
    }
  }, [isOpen, uploadedFiles]);

  const verifyUploadedFiles = async () => {
    setIsVerifying(true);
    setVerificationStatus({});
    
    const status = {};
    
    for (const file of uploadedFiles) {
      try {
        // Check if file exists in S3
        const response = await fetch(file.downloadUrl, { method: 'HEAD' });
        
        if (response.ok) {
          status[file.name] = { 
            status: 'success', 
            message: 'Verified successfully',
            size: response.headers.get('content-length') || file.size
          };
        } else {
          status[file.name] = { 
            status: 'error', 
            message: `S3 returned status: ${response.status}`
          };
        }
      } catch (error) {
        console.error(`Verification failed for ${file.name}:`, error);
        status[file.name] = { 
          status: 'error', 
          message: error.message || 'Verification failed'
        };
      }
    }
    
    setVerificationStatus(status);
    setIsVerifying(false);
  };

  const handleDownload = async (file, filename) => {
    setDownloadProgress(prev => ({ ...prev, [file.name]: true }));
    
    try {
      const response = await fetch(file.location);
      const blob = await response.blob();
      
      // Create a blob URL for download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setDownloadProgress(prev => ({ ...prev, [file.name]: false }));
    }
  };

  const handleView = (file) => {
    // Open the file in a new tab
    window.open(file.location, '_blank');
  };

  const handleRetryVerification = () => {
    verifyUploadedFiles();
  };

  if (!isOpen) return null;

  return (
    <div className=" fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
      <div className={`relative rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold">Upload Verification</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              isDarkMode ? 'hover:bg-white' : 'hover:bg-gray-800'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-130px)]">
          <div className="mb-4">
            <p className="text-sm mb-2">
              <span className="font-medium">Case IDs:</span> {caseIds.join(', ')}
            </p>
            <p className="text-sm">
              <span className="font-medium">Files uploaded:</span> {uploadedFiles.length}
            </p>
          </div>
          
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 mb-4" />
              <p>Verifying uploaded files...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => {
                const status = verificationStatus[file.name] || {};
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      status.status === 'success'
                        ? isDarkMode ? 'bg-green-900 bg-opacity-20 border-green-700' : 'bg-green-50 border-green-200'
                        : status.status === 'error'
                        ? isDarkMode ? 'bg-red-900 bg-opacity-20 border-red-700' : 'bg-red-50 border-red-200'
                        : isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {status.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : status.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        ) : (
                          <Loader2 className="h-5 w-5 animate-spin text-blue-500 flex-shrink-0" />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs opacity-75">
                            {status.size ? `${(status.size / 1024).toFixed(2)} KB • ` : ''}
                            {status.message || 'Pending verification...'}
                          </p>
                        </div>
                      </div>
                      
                      {status.status === 'success' && (
                        <div className="flex space-x-2 ml-3">
                          <button
                            onClick={() => handleView(file)}
                            className={`p-1.5 rounded ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-blue-400' 
                                : 'hover:bg-gray-200 text-blue-500'
                            }`}
                            title="View file"
                          >
                            <Eye size={16} />
                          </button>
                          {/* <button
                            onClick={() => handleDownload(file, file.name)}
                            disabled={downloadProgress[file.name]}
                            className={`p-1.5 rounded ${
                              isDarkMode 
                                ? 'hover:bg-gray-700 text-green-400 disabled:opacity-50' 
                                : 'hover:bg-gray-200 text-green-500 disabled:opacity-50'
                            }`}
                            title="Download file"
                          >
                            {downloadProgress[file.name] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                          </button> */}
                        </div>
                      )}
                    </div>
                    
                    {status.status === 'error' && (
                      <div className="mt-2 text-xs">
                        <button
                          onClick={handleRetryVerification}
                          className={`px-2 py-1 rounded text-xs ${
                            isDarkMode 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Retry Verification
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};



export default FileUploadVerificationModal;