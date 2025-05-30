import { useEffect, useCallback } from 'react';
import { message } from 'antd';

const useKeyboardShortcuts = ({ 
  selectedRecord,
  onDownload,
  onRecheck,
  onOtherAction
}) => {
  const handleKeyDown = useCallback((e) => {
    // Check if Ctrl or Cmd key is pressed
    if (e.ctrlKey || e.metaKey) {
      if (!selectedRecord) {
        message.warning('No row selected');
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'd':
          e.preventDefault();
          onDownload(selectedRecord);
          message.success('Download initiated');
          break;
        case 'r':
          e.preventDefault();
          onRecheck(selectedRecord);
          message.info('Recheck initiated');
          break;
        // Add more shortcuts as needed
        default:
          break;
      }
    }
  }, [selectedRecord, onDownload, onRecheck, onOtherAction]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;