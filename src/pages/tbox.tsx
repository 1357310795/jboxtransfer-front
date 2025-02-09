import { useContext, useState } from 'react';
import { Space, Button } from 'antd';
import { FileSystemItem } from '@/models/cloud/fs-item';
import { getTboxItemLink, listTboxItems } from '@/services/cloud';
import { MessageContext } from '@/contexts/message';
import { TableDropdown } from '@ant-design/pro-components';
import { CopyOutlined, ExportOutlined, SyncOutlined } from '@ant-design/icons';
import CloudFileList from '@/components/cloud-file-list';

export default function Tbox() {
  const [addTaskModalOpen, setAddTaskModalOpen] = useState<boolean>(false);
  const [addTaskPath, setAddTaskPath] = useState<string>("");
  const [busyButton, setBusyButton] = useState<string>("");

  const message = useContext(MessageContext);

  const onGetTboxLink = (path: string) => {
    setBusyButton(`tboxlink_${path}`);
    getTboxItemLink(path)
      .then((data) => { 
        window.open(data, "_blank");
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
      });
  };
  
  const onCopyPath = (entity: FileSystemItem) => {
    window.navigator.clipboard.writeText(entity.fullPath); 
    message.info("已复制到剪切板");
  }

  const getItemActions = (record: FileSystemItem) => (
    <Space size="small">
      {/* <Button 
        variant="outlined" 
        style={{padding: '4px 8px'}} 
        color="default" 
        icon={<SyncOutlined />}
        onClick={()=>{ 
          setAddTaskPath(record.fullPath);
          setAddTaskModalOpen(true);
        }}
      >
        迁移
      </Button> */}
      <TableDropdown
        key="actionGroup"
        menus={[
          { key: 'openintbox', name: '在云盘中打开', icon: <ExportOutlined />, onClick: () => {onGetTboxLink(record.fullPath)} },
          { key: 'copypath', name: '复制完整路径', icon: <CopyOutlined />, onClick: () => {onCopyPath(record)} },
        ]}
      />
    </Space>
  );

  return (
    <CloudFileList 
      title="新云盘文件"
      getItemActions={getItemActions}
      listCloudItems={listTboxItems}
      addTaskModalOpen={addTaskModalOpen}
      setAddTaskModalOpen={setAddTaskModalOpen}
      addTaskPath={addTaskPath}
    />
  )
}