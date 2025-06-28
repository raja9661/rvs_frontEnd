import React, { useState, useRef } from "react";
import axios from "axios";
import Layout from "../Layout/Layout";

const HelpSupportPanel = () => {
  const [issues, setIssues] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      setIssues([...issues, res.data.issue]);
      alert("Issue submitted successfully!");
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setAttachments([]);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit issue!");
    }
  };

  const handleSendToDeveloper = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_Backend_Base_URL}/support/issues/${id}/send`
      );
      alert("Issue sent to ufs-team!");
    } catch (error) {
      console.error("Send error:", error);
      alert("Failed to send issue!");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="mr-2">+</span> Add New Issue
        </button>

        <div className="mt-6 space-y-4">
          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{issue.title}</h3>
                <div className="flex space-x-2">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    title="Delete"
                  >
                    🗑️
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    title="Send to developer"
                    onClick={() => handleSendToDeveloper(issue._id)}
                  >
                    📤
                  </button>
                </div>
              </div>
              <p className="text-gray-700">{issue.description}</p>
              {issue.attachments?.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-1">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {issue.attachments.map((file, index) => (
                      <a
                        key={index}
                        href={`${import.meta.env.VITE_Backend_Base_URL}/support/attachments/${file.s3Key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {file.originalName}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Custom Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Report New Issue</h2>
                <button
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                    placeholder="Enter issue title"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="4"
                    required
                    placeholder="Describe the issue..."
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Attachments
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded"
                  >
                    Upload Screenshot
                  </button>
                  {attachments.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {attachments.length} file(s) selected
                      </p>
                      <ul className="text-xs text-gray-500">
                        {attachments.map((file, index) => (
                          <li key={index}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Submit
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