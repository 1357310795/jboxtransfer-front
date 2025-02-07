import { MessageContext } from "@/contexts/message";
import { ModalContext } from "@/contexts/modal";
import { NotificationContext } from "@/contexts/notification";
import { SyncTaskDbModel } from "@/models/sync-task/sync-task";
import { PageContainer, ProColumns, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Flex, Image, Space, Typography } from "antd";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import folderIcon from "@/assets/folder.svg";
import FileIcon from "@/utils/fileicon";
import { CloseCircleFilled, PauseCircleFilled, PlayCircleFilled } from "@ant-design/icons";

export default function Query(props: any) {
	const nav = useNavigate();
  const noti = useContext(NotificationContext);
  const message = useContext(MessageContext);
  const modal = useContext(ModalContext);
  const [taskListData, setTaskListData] = useState<SyncTaskDbModel[]>([]);
  const [busyButton, setBusyButton] = useState<string>("");

	const getItemAction = (entity: SyncTaskDbModel) => {
    switch (entity.state)
    {
      case "Idle":
        return [
          (entity.state == "Running" ? 
            <Button 
              variant="outlined" 
              style={{padding: '4px 8px'}} 
              color="default" 
              icon={<PauseCircleFilled />}
              loading={busyButton == `pauseone_${entity.id}`}
              onClick={()=>{  }}
            >
              暂停
            </Button>
            : 
            <Button 
              variant="outlined" 
              style={{padding: '4px 8px'}} 
              color="default" 
              icon={<PlayCircleFilled />}
              loading={busyButton == `startone_${entity.id}`}
              onClick={()=>{  }}
            >
              继续
            </Button>
          ),
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<CloseCircleFilled />}
            loading={busyButton == `cancelone_${entity.id}`}
            onClick={()=>{  }}
          >
            取消
          </Button>,
          <TableDropdown
            key="actionGroup"
            menus={[
              // { key: 'settop', name: '优先传输', onClick: () => {onSetTop(entity.id)}, disabled: (busyButton == `settop_${entity.id}`) },
              // { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.id)}, disabled: (busyButton == `jboxlink_${entity.id}`) },
              // { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.id)}, disabled: (busyButton == `tboxlink_${entity.id}`) },
              // { key: 'copypath', name: '复制完整路径', onClick: () => {onCopyPath(entity)} },
            ]}
          />,
        ];
      default: return [];
    }
  }
	
	const columns: ProColumns<SyncTaskDbModel>[] = [
    {
      title: '文件名',
      width: 240,
      ellipsis: true,
      render: (_, entity) => (
        <Flex gap={8} align="center" style={{justifyContent: 'flex-start', width: '100%'}} >
          <div style={{flex: '0'}}>
            {
              entity.type == "Folder" ? 
                <Image preview={false} src={folderIcon} style={{width: '36px', height: '36px', transform: 'translateY(2px)' }}></Image>
                : <FileIcon style={{width: '36px', height: '36px', transform: 'translateY(2px)' }} filename={entity.fileName} />
            }
          </div>
          <Space direction="vertical" style={{flex: 'auto', minWidth: '0', gap: '0px'}}>
            <Typography.Text ellipsis={true}>
              {entity.fileName}
            </Typography.Text>
            <Typography.Text type="secondary" ellipsis={true} >
              {entity.parentPath}
            </Typography.Text>
          </Space>
        </Flex>
      )
    },
    {
      title: '状态',
      width: 160,
      render: (_, entity) => (
        undefined
      )
    },
    {
      title: '创建日期',
      width: 160,
			hideInTable: true,
      render: (_, entity) => (
        undefined
      )
    },
    {
      title: '操作',
      width: 120,
      key: 'option',
      valueType: 'option',
      render: (_, entity) => getItemAction(entity)
    },
  ];
	
	return (
    <>
    <PageContainer
      title="任务查询"
      extra={[
				
      ]}
		>
      <div>
        <ProTable<SyncTaskDbModel>
          request={async (params, sort, filter) => {
						// console.log(sort, filter);
						// await waitTime(2000);
						// return request<{
						// 	data: GithubIssueItem[];
						// }>('https://proapi.azurewebsites.net/github/issues', {
						// 	params,
						// });
					}}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
            pageSize: 50
          }}
          columns={columns}
          search={undefined}
          headerTitle={
            <div></div>
          }
          toolBarRender={() => [
            
          ]}
        />
      </div>
    </PageContainer>
    </>
  )
}