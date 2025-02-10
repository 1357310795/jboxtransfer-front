import { MessageContext } from "@/contexts/message";
import { ModalContext } from "@/contexts/modal";
import { NotificationContext } from "@/contexts/notification";
import { SyncTaskDbModel } from "@/models/sync-task/sync-task";
import { PageContainer, ProColumns, ProFormInstance, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Dropdown, Flex, Image, Space, Tooltip, Typography } from "antd";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import folderIcon from "@/assets/folder.svg";
import FileIcon from "@/utils/fileicon";
import { CloseCircleFilled, CopyOutlined, ExportOutlined, RedoOutlined, SyncOutlined, VerticalAlignTopOutlined } from "@ant-design/icons";
import { taskListSearch } from "@/services/db";
import prettyBytes from "pretty-bytes";
import { taskCancel, taskSetTop } from "@/services/task";
import { getJboxItemLink, getTboxItemLink } from "@/services/cloud";

const stateQueryValueEnum = {
  All: { text: '全部' },
  Idle: { text: '等待中', color: 'cyan' },
  Pending: { text: '排队中', color: 'purple' },
  Busy: { text: '传输中', status: 'processing' },
  Error: { text: '已停止', color: 'red' },
  Done: { text: '已完成', color: 'green' },
  Cancel: { text: '已取消', color: 'magenta' },
};

export default function Query(props: any) {
	const nav = useNavigate();
  const noti = useContext(NotificationContext);
  const message = useContext(MessageContext);
  const modal = useContext(ModalContext);
  const [taskListData, setTaskListData] = useState<SyncTaskDbModel[]>([]);
  const [busyButton, setBusyButton] = useState<string>("");
  const formRef = useRef<ProFormInstance>();

	const getItemAction = (entity: SyncTaskDbModel) => {
    switch (entity.state)
    {
      case "Idle":
      case "Pending":
      case "Busy":
        return [
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<VerticalAlignTopOutlined />}
            loading={busyButton == `settop_${entity.id}`}
            onClick={()=>{ onSetTop(entity.id) }}
          >
            优先传输
          </Button>,
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<CloseCircleFilled />}
            loading={busyButton == `cancelone_${entity.id}`}
            onClick={()=>{ onCancelOne(entity.id) }}
          >
            取消
          </Button>,
          <TableDropdown
            key="actionGroup"
            menus={[
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
              { key: 'copypath', name: '复制完整路径', onClick: () => {onCopyPath(entity)} },
            ]}
          />,
        ];
      case "Done": 
        return [
          <Dropdown 
            placement="bottomLeft" 
            arrow
            menu={{items: [
              { key: 'openinjbox', label: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', label: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
            ]}}
          >
            <Button 
              variant="outlined" 
              style={{padding: '4px 8px'}} 
              color="default" 
              icon={<ExportOutlined />}
            >
              打开
            </Button>
          </Dropdown>,
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<CopyOutlined />}
            onClick={()=>{onCopyPath(entity)}}
          >
            复制完整路径
          </Button>
        ];
      case "Cancel":
        return [
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<RedoOutlined />}
            hidden={true}
            onClick={()=>{ /* Todo */ }}
          >
            重新添加任务
          </Button>,
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<CopyOutlined />}
            onClick={()=>{onCopyPath(entity)}}
          >
            复制完整路径
          </Button>
        ];
      case "Error":
        return [
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<SyncOutlined />}
            onClick={()=>{ message.info("请前往任务列表进行操作！") }}
          >
            重试
          </Button>,
          <TableDropdown
            key="actionGroup"
            menus={[
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
              { key: 'copypath', name: '复制完整路径', onClick: ()=>{onCopyPath(entity)} },
            ]}
          />
        ]
      default: return [];
    }
  }
	
	const columns: ProColumns<SyncTaskDbModel>[] = [
    {
      title: '文件名',
      width: 240,
      key: 'file',
      ellipsis: true,
      search: false,
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
      title: '搜索关键词',
      key: 'search',
      hideInForm: true,
      hideInTable: true,
      valueType: "text",
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '状态',
      width: 40,
      key: 'state',
      valueType: "select",
      dataIndex: "state",
      render: (dom, entity) => (
        <Tooltip title={(entity.state == "Error" ? entity.message : undefined)}>
          <div>{dom}</div>
        </Tooltip>
      ),
      valueEnum: stateQueryValueEnum,
    },
    {
      title: '创建日期',
      width: 80,
      key: 'creationTime',
      dataIndex: "creationTime",
      valueType: "dateTime",
      hideInTable: true,
      hideInForm: true,
      search: false,
    },
    {
      title: '更新日期',
      width: 80,
      key: 'updateTime',
      dataIndex: "updateTime",
      valueType: "dateTime",
      search: false,
    },
    {
      title: '大小',
      width: 40,
      key: 'size',
      dataIndex: "size",
      search: false,
      render: (_, entity) => (
        entity.type == "File" ? prettyBytes(entity.size, {binary: true}) : "-"
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

  const onCancelOne = (id: number) => {
    setBusyButton(`cancelone_${id}`);
    taskCancel(id)
      .then((data) => { 
        message.success("操作成功"); 
        formRef.current?.submit();
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
      });
  };

  const onSetTop = (id: number) => {
    setBusyButton(`settop_${id}`);
    taskSetTop(id)
      .then((data) => { 
        message.success("操作成功"); 
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
      });
  };
  
  const onGetJboxLink = (path: string) => {
    setBusyButton(`jboxlink_${path}`);
    getJboxItemLink(path)
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

  const onCopyPath = (entity: SyncTaskDbModel) => {
    window.navigator.clipboard.writeText(entity.filePath); 
    message.info("已复制到剪切板");
  }
  
	return (
    <>
    <PageContainer
      title="任务查询"
		>
      <div>
        <ProTable<SyncTaskDbModel>
          request={async (params, sort, filter) => {
						if (params.search == undefined)
            {
              message.info("请输入搜索关键词");
              return { success: false };
            }
            try {
              var res = await taskListSearch(params);
              return {
                data: res.entities,
                success: true,
                total: res.total,
              }
            }
            catch (ex)
            {
              message.error(`${ex}`);
              return { success: false };
            }
					}}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
          }}
          columns={columns}
          search={undefined}
          headerTitle={
            <div></div>
          }
          toolBarRender={() => [
            
          ]}
          formRef={formRef}
        />
      </div>
    </PageContainer>
    </>
  )
}