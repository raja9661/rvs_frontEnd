import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, List, Button, Spin, message } from 'antd';
import { EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';

const AttachmentsModal = ({ visible, caseId, onClose }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingAttachment, setViewingAttachment] = useState(null);

  useEffect(() => {
    if (visible && caseId) {
      fetchAttachments();
    }
  }, [visible, caseId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_Backend_Base_URL}/kyc/attachments`, {
              params: { caseId }
            });
      console.log("Response Data:",response.data);      
      setAttachments(response.data || []);
    } catch (error) {
      message.error('Failed to fetch attachments');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
          const response = await axios.get(
            `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${filename}`,
            { responseType: 'blob' }
          );
          
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          toast.error("Failed to download file");
        }
  };

  const handleView = (attachment) => {
    setViewingAttachment(attachment);
  };

  const isImage = (mimetype) => {
    return mimetype?.startsWith('image/');
  };

  return (
    <>
      <Modal
        title={`Attachments for Case ID: ${caseId}`}
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={800}
      >
        <Spin spinning={loading}>
          <List
            itemLayout="horizontal"
            dataSource={attachments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button 
                    icon={<EyeOutlined />} 
                    onClick={() => handleView(item)}
                    disabled={!isImage(item.mimetype)}
                  >
                    View
                  </Button>,
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />} 
                    onClick={() => handleDownload(item.originalname)}
                  >
                    Download
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={item.originalname}
                  description={` ${(item.size / 1024).toFixed(2)} KB`}
                />
                <List.Item.Meta
                  title={item.uploadedAt}
                  // description={`${item.mimetype} | ${(item.size / 1024).toFixed(2)} KB`}
                />
              </List.Item>
            )}
          />
        </Spin>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={!!viewingAttachment}
        onCancel={() => setViewingAttachment(null)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {viewingAttachment && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={viewingAttachment.location || `${import.meta.env.VITE_Backend_Base_URL}/kyc/download-attachment/${caseId}/${viewingAttachment.filename}`}
              alt={viewingAttachment.originalname}
              style={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
            <div style={{ marginTop: 16 }}>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />} 
                onClick={() => handleDownload(viewingAttachment.originalname)}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AttachmentsModal;