import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";
import { FiPlus, FiX, FiPaperclip, FiSend, FiEdit2, FiTrash2 } from "react-icons/fi";

const HelpSupportPanel = () => {
  const [issues, setIssues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch issues on component mount
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_Backend_Base_URL}/support/issues`
        );
        setIssues(res.data.issues);
      } catch (err) {
        setError("Failed to fetch issues. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      attachments.forEach((file) => {
        formData.append("support", file);
      });

      const res = await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/support/issues`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIssues([res.data.issue, ...issues]);
      setSuccess("Issue submitted successfully and developer has been notified!");
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Submission error:", error);
      setError(error.response?.data?.error || "Failed to submit issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAttachments([]);
  };

  const handleDeleteIssue = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue?")) return;
    
    try {
      setIsLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_Backend_Base_URL}/support/issues/${id}`
      );
      setIssues(issues.filter(issue => issue._id !== id));
      setSuccess("Issue deleted successfully!");
    } catch (error) {
      setError("Failed to delete issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Help & Support</h1>
            <p className="text-gray-600 mt-1">Report issues and get assistance from our team</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center shadow-md transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            <FiPlus className="mr-2" size={18} />
            New Issue
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Issues List */}
        {isLoading && !issues.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-700">No issues reported yet</h3>
            <p className="text-gray-500 mt-2">Click "New Issue" to report a problem</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue._id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{issue.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                        title="Delete"
                        onClick={() => handleDeleteIssue(issue._id)}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Attachments */}
                  {issue.attachments?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-3">
                        {issue.attachments.map((file, index) => (
                          <div key={index} className="flex flex-col">
                            {file.mimetype?.startsWith('image/') ? (
                              <a 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="group"
                              >
                                <div className="h-24 w-24 rounded-md overflow-hidden border border-gray-200">
                                  <img 
                                    src={file.url} 
                                    alt={file.filename}
                                    className="h-full w-full object-cover group-hover:opacity-90 transition-opacity"
                                  />
                                </div>
                              </a>
                            ) : (
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md border border-gray-200 text-sm text-gray-700 transition-colors"
                              >
                                <FiPaperclip size={14} />
                                <span className="truncate max-w-xs">{file.filename}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(issue.createdAt).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Sent to developers</span>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* New Issue Modal */}
        {isModalOpen && (
          <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Report New Issue</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    disabled={isLoading}
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      placeholder="Briefly describe your issue"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                      required
                      placeholder="Provide detailed information about the issue..."
                      disabled={isLoading}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      multiple
                      className="hidden"
                      disabled={isLoading}
                    />
                    
                    <div className="flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 py-3 px-4 rounded-lg border border-gray-300 border-dashed transition-colors"
                        disabled={isLoading}
                      >
                        <FiPaperclip size={18} />
                        <span>Click to upload screenshots or files</span>
                      </button>
                      
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3 truncate">
                                <FiPaperclip size={16} className="flex-shrink-0 text-gray-500" />
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeAttachment(index)}
                                className="text-gray-500 hover:text-red-500 p-1"
                                disabled={isLoading}
                              >
                                <FiX size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 pb-2 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-70"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend size={16} />
                        Submit Issue
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HelpSupportPanel;










// import React, { useState, useRef } from "react";
// import axios from "axios";
// import Layout from "../Layout/Layout";

// const HelpSupportPanel = () => {
//   const [issues, setIssues] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [attachments, setAttachments] = useState([]);
//   const fileInputRef = useRef(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
      
//       attachments.forEach((file) => {
//         formData.append("support", file);
//       });

//       const res = await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/support/issues`,
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setIssues([...issues, res.data.issue]);
//       alert("Issue submitted successfully!");
//       setIsModalOpen(false);
//       setTitle("");
//       setDescription("");
//       setAttachments([]);
//     } catch (error) {
//       console.error("Submission error:", error);
//       alert("Failed to submit issue!");
//     }
//   };

//   const handleSendToDeveloper = async (id) => {
//     try {
//       await axios.post(
//         `${import.meta.env.VITE_Backend_Base_URL}/support/issues/${id}/send`
//       );
//       alert("Issue sent to ufs-team!");
//     } catch (error) {
//       console.error("Send error:", error);
//       alert("Failed to send issue!");
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     setAttachments(files);
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current.click();
//   };

//   return (
//     <Layout>
//       <div className="p-6 max-w-6xl mx-auto">
//         <button
//           className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
//           onClick={() => setIsModalOpen(true)}
//         >
//           <span className="mr-2">+</span> Add New Issue
//         </button>

//         <div className="mt-6 space-y-4">
//           {issues.map((issue) => (
//             <div
//               key={issue._id}
//               className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
//             >
//               <div className="flex justify-between items-start">
//                 <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
//                 <div className="flex space-x-2">
//                   <button
//                     className="text-gray-500 hover:text-gray-700"
//                     title="Edit"
//                   >
//                     ✏️
//                   </button>
//                   <button
//                     className="text-gray-500 hover:text-gray-700"
//                     title="Delete"
//                   >
//                     🗑️
//                   </button>
//                   <button
//                     className="text-blue-500 hover:text-blue-700"
//                     title="Send to developer"
//                     onClick={() => handleSendToDeveloper(issue._id)}
//                   >
//                     📤
//                   </button>
//                 </div>
//               </div>
//               <p className="text-gray-700">{issue.description}</p>
//               {issue.attachments?.length > 0 && (
//                 <div className="mt-3">
//                   <h4 className="text-sm font-medium mb-1">Attachments:</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {issue.attachments.map((file, index) => (
//                       <a
//                         key={index}
//                         href={`${import.meta.env.VITE_Backend_Base_URL}/support/attachments/${file.s3Key}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-blue-600 hover:underline text-sm"
//                       >
//                         {file.originalName}
//                       </a>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Custom Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//               <div className="p-4 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold">Report New Issue</h2>
//                 <button
//                   className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   ✕
//                 </button>
//               </div>

//               <form onSubmit={handleSubmit} className="p-4">
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium mb-1">
//                     Title *
//                   </label>
//                   <input
//                     type="text"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded"
//                     required
//                     placeholder="Enter issue title"
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium mb-1">
//                     Description *
//                   </label>
//                   <textarea
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     className="w-full p-2 border border-gray-300 rounded"
//                     rows="4"
//                     required
//                     placeholder="Describe the issue..."
//                   ></textarea>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium mb-1">
//                     Attachments
//                   </label>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     multiple
//                     className="hidden"
//                   />
//                   <button
//                     type="button"
//                     onClick={triggerFileInput}
//                     className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
//                   >
//                     Upload Screenshot
//                   </button>
//                   {attachments.length > 0 && (
//                     <div className="mt-2">
//                       <p className="text-sm text-gray-600">
//                         {attachments.length} file(s) selected
//                       </p>
//                       <ul className="text-xs text-gray-500">
//                         {attachments.map((file, index) => (
//                           <li key={index}>{file.name}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex justify-end gap-2 pt-2">
//                   <button
//                     type="button"
//                     onClick={() => setIsModalOpen(false)}
//                     className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//                   >
//                     Submit
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default HelpSupportPanel;








// import React, { useState } from "react";
// import { Button, Modal, Form, Input, Upload, message, List, Card } from "antd";
// import { PlusOutlined, DeleteOutlined, EditOutlined, SendOutlined } from "@ant-design/icons";
// import axios from "axios";
// import Layout from "../Layout/Layout";
// const { TextArea } = Input;

// const HelpSupportPanel = () => {
//   const [issues, setIssues] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();

//   const handleSubmit = async (values) => {
//     try {
//       const formData = new FormData();
//       formData.append("title", values.title);
//       formData.append("description", values.description);
//       values.attachments?.forEach(file => formData.append("attachments", file));
//       console.log("formdata:",formData)

//       const res = await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/support/issues`, formData);
//       setIssues([...issues, res.data.issue]);
//       message.success("Issue submitted!");
//       setIsModalOpen(false);
//     } catch (error) {
//       message.error("Failed to submit issue!");
//     }
//   };

//   const handleSendToDeveloper = async (id) => {
//     try {
//       await axios.post(`${import.meta.env.VITE_Backend_Base_URL}/support/issues/${id}/send`);
//       message.success("Issue sent to developer!");
//     } catch (error) {
//       message.error("Failed to send issue!");
//     }
//   };

//   return (
//     <Layout>
//         <div className="p-6">
//       <Button type="primary" onClick={() => setIsModalOpen(true)} icon={<PlusOutlined />}>
//         Add New Issue
//       </Button>

//       <List
//         dataSource={issues}
//         renderItem={(issue) => (
//           <Card
//             title={issue.title}
//             actions={[
//               <EditOutlined key="edit" />,
//               <DeleteOutlined key="delete" />,
//               <SendOutlined key="send" onClick={() => handleSendToDeveloper(issue._id)} />,
//             ]}
//           >
//             <p>{issue.description}</p>
//           </Card>
//         )}
//       />

//       <Modal
//         title="Report New Issue"
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//       >
//         <Form form={form} onFinish={handleSubmit}>
//           <Form.Item name="title" label="Title" rules={[{ required: true }]}>
//             <Input placeholder="Enter issue title" />
//           </Form.Item>
//           <Form.Item name="description" label="Description" rules={[{ required: true }]}>
//             <TextArea rows={4} placeholder="Describe the issue..." />
//           </Form.Item>
//           <Form.Item name="attachments" label="Attachments">
//             <Upload multiple beforeUpload={() => false}>
//               <Button icon={<PlusOutlined />}>Upload Screenshot</Button>
//             </Upload>
//           </Form.Item>
//           <Button type="primary" htmlType="submit">Submit</Button>
//         </Form>
//       </Modal>
//     </div>
//     </Layout>
//   );
// };

// export default HelpSupportPanel;