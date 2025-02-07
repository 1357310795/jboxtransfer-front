import { MessageContext } from "@/contexts/message";
import { NotificationContext } from "@/contexts/notification";
import { SyncTask, SyncTaskState } from "@/models/sync-task/sync-task";
import { taskListCancelAll, taskListCancelAllErr, taskListDeleteAllDone, taskListInfo, taskListPauseAll, taskListRestartAllErr, taskListStartAll } from "@/services/task-list";
import FileIcon from "@/utils/fileicon";
import { PageContainer, ProColumns, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Flex, Space, Typography, Image, Progress, Dropdown, Popconfirm, Modal } from "antd";
import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom";
import folderIcon from "@/assets/folder.svg";
import { CloseCircleFilled, CopyOutlined, ExportOutlined, PauseCircleFilled, PlayCircleFilled, PlayCircleOutlined, SyncOutlined } from "@ant-design/icons";
import prettyBytes from "pretty-bytes";
import { ModalContext } from "@/contexts/modal";
import { taskCancel, taskCancelErr, taskJboxLink, taskPause, taskRestartErr, taskSetTop, taskStart, taskTboxLink } from "@/services/task";

export default function TaskList(props: any) {
  const nav = useNavigate();
  const noti = useContext(NotificationContext);
  const message = useContext(MessageContext);
  const modal = useContext(ModalContext);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null); // 保存定时器的引用
  const [taskListData, setTaskListData] = useState<SyncTask[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("transferring");
  const [busyButton, setBusyButton] = useState<string>("");
  const [restartModalOpen, setRestartModalOpen] = useState<boolean>(false);

  const getCurrentTabAction = () => {
    switch (selectedTab)
    {
      case "transferring":
        return (
          <Space>
            <Button 
              key="3" 
              color="primary" 
              variant="outlined" 
              loading={busyButton == "startall"}
              onClick={()=>{ onStartAll(); }}
            >
              全部开始
            </Button>
            <Button 
              key="2" 
              color="default" 
              variant="outlined"
              loading={busyButton == "pauseall"}
              onClick={()=>{ onPauseAll(); }}
            >
              全部暂停
            </Button>
            <Button
              key="1"
              color="danger" 
              variant="dashed"
              loading={busyButton == "cancelall"}
              onClick={async ()=>{ 
                var res = await modal.confirm({title: "数据删除确认", content: "此操作将删除所有传输中、待传输和出错的项目，是否确定？", cancelText: "取消", okText: "确定"});
                if (res) onCancelAll(); 
              }}
            >
              全部取消
            </Button>
          </Space>
        );
      case "completed":
        return (
          <Space>
            <Popconfirm
              title="清除任务确认"
              description="您确定要清除所有已完成的任务吗？"
              onConfirm={() => { onDeleteAllDone(); }}
              okText="是"
              cancelText="否"
            >
              <Button 
                key="2" 
                color="default" 
                variant="outlined"
                loading={busyButton == "deletealldone"}
              >
                全部清除
              </Button>
            </Popconfirm>
          </Space>
        );
      case "error":
        return (
          <Space>
            <Button 
              key="3" 
              color="primary" 
              variant="outlined" 
              loading={busyButton == "restartallerr"}
              onClick={()=>{ 
                setRestartModalOpen(true);
              }}
            >
              全部重试
            </Button>
            <Popconfirm
              title="取消任务确认"
              description="您确定要取消所有出错的任务吗？"
              onConfirm={() => { onCancelAllErr(); }}
              okText="是"
              cancelText="否"
            >
              <Button
                key="1"
                color="danger" 
                variant="dashed"
                loading={busyButton == "cancelallerr"}
              >
                全部取消
              </Button>
            </Popconfirm>
          </Space>
        );
      default: return undefined;
    }
  };

  const getCurrentTabItemAction = (entity: SyncTask) => {
    switch (selectedTab)
    {
      case "transferring":
        return [
          (entity.state == "Running" ? 
            <Button 
              variant="outlined" 
              style={{padding: '4px 8px'}} 
              color="default" 
              icon={<PauseCircleFilled />}
              loading={busyButton == `pauseone_${entity.id}`}
              onClick={()=>{ onPauseOne(entity.id) }}
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
              onClick={()=>{ onStartOne(entity.id) }}
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
            onClick={()=>{ onCancelOne(entity.id) }}
          >
            取消
          </Button>,
          <TableDropdown
            key="actionGroup"
            menus={[
              { key: 'settop', name: '优先传输', onClick: () => {onSetTop(entity.id)}, disabled: (busyButton == `settop_${entity.id}`) },
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.id)}, disabled: (busyButton == `jboxlink_${entity.id}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.id)}, disabled: (busyButton == `tboxlink_${entity.id}`) },
              { key: 'copypath', name: '复制完整路径', onClick: () => {onCopyPath(entity)} },
            ]}
          />,
        ];
      case "completed":
        return [
          <Dropdown 
            placement="bottomLeft" 
            arrow
            menu={{items: [
              { key: 'openinjbox', label: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.id)}, disabled: (busyButton == `jboxlink_${entity.id}`) },
              { key: 'openintbox', label: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.id)}, disabled: (busyButton == `tboxlink_${entity.id}`) },
            ]}}
          >
            <Button variant="outlined" style={{padding: '4px 8px'}} color="default" icon={<ExportOutlined />}>
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
      case "error":
        return [
          <Popconfirm
            title="请选择重试方式"
            onConfirm={() => { onRestartOneErr(entity.id, false); }}
            onCancel={() => { onRestartOneErr(entity.id, true); }}
            okText="从头开始"
            cancelText="保留进度"
            cancelButtonProps={{type: 'primary'}}
          >
            <Button 
              variant="outlined" 
              style={{padding: '4px 8px'}} 
              color="default" 
              icon={<SyncOutlined />}
            >
              重试
            </Button>
          </Popconfirm>,
          <Button 
            variant="outlined" 
            style={{padding: '4px 8px'}} 
            color="default" 
            icon={<CloseCircleFilled />}
            loading={busyButton == `canceloneerr_${entity.id}`}
            onClick={()=>{ onCancelOneErr(entity.id) }}
          >
            取消
          </Button>,
          <TableDropdown
            key="actionGroup"
            menus={[
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.id)}, disabled: (busyButton == `jboxlink_${entity.id}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.id)}, disabled: (busyButton == `tboxlink_${entity.id}`) },
              { key: 'copypath', name: '复制完整路径' },
            ]}
          />,
        ];
      default: return [];
    }
  }

  const columns: ProColumns<SyncTask>[] = [
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
      title: '进度',
      width: 160,
      hidden: (selectedTab != "transferring"),
      render: (_, entity) => (
        <Space size={0} direction="vertical" style={{width: '100%', lineHeight: '1em', paddingRight: '20px'}}>
          <Progress strokeColor={(entity.state != "Running" ? "grey" : undefined)} percent={Math.round(entity.progress * 10000) / 100} status={(entity.state == "Running" ? "active" : undefined)} />
          <Typography.Text style={{lineHeight: '1em'}}>
            {`${prettyBytes(entity.downloadedBytes, {binary: true})} / ${prettyBytes(entity.uploadedBytes, {binary: true})} / ${prettyBytes(entity.totalBytes, {binary: true})}`}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: '进度',
      width: 160,
      hidden: (selectedTab != "completed"),
      render: (_, entity) => (
        <Space size={0} direction="vertical" style={{width: '100%', lineHeight: '1em', paddingRight: '20px'}}>
          <Progress percent={Math.round(entity.progress * 10000) / 100} status="success" />
          <Typography.Text style={{lineHeight: '1em'}}>
            {`${prettyBytes(entity.downloadedBytes, {binary: true})} / ${prettyBytes(entity.uploadedBytes, {binary: true})} / ${prettyBytes(entity.totalBytes, {binary: true})}`}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: '错误信息',
      width: 160,
      hidden: (selectedTab != "error"),
      render: (_, entity) => (
        <Typography.Text type="secondary">
          {entity.message ?? "（找不到错误信息）"}
        </Typography.Text>
      )
    },
    {
      title: '操作',
      width: 120,
      key: 'option',
      valueType: 'option',
      render: (_, entity) => getCurrentTabItemAction(entity)
    },
  ];

  useEffect(()=>{
      // 每秒执行一次 fetchTaskListInfo
      const id = setInterval(() => {
        updateData(selectedTab);
      }, 1000);
      setTimer(id); // 保存定时器的ID

      // 当组件卸载或路由变化时清除定时器
      return () => {
        clearInterval(id);
        setTimer(null);
      };
  }, [selectedTab]);

  const updateData = (listType: string) => {
    taskListInfo(listType)
      .then((data) => { setTaskListData(data.entities); })
      .catch((err) => { 
        if (err == "NotLoginedError")
        {
          message.warning("请先登录"); 
          nav("/login");
        }
        else
          message.error(err); 
      });
  };

  const onStartAll = () => {
    setBusyButton("startall");
    taskListStartAll()
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

  const onPauseAll = () => {
    setBusyButton("pauseall");
    taskListPauseAll()
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

  const onCancelAll = () => {
    setBusyButton("cancelall");
    taskListCancelAll()
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

  const onDeleteAllDone = () => {
    setBusyButton("deletealldone");
    taskListDeleteAllDone()
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

  const onRestartAllErr = (keepProgress : boolean) => {
    setBusyButton("restartallerr");
    taskListRestartAllErr(keepProgress)
      .then((data) => { 
        message.success("操作成功"); 
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
        setRestartModalOpen(false);
      });
  };

  const onCancelAllErr = () => {
    setBusyButton("cancelallerr");
    taskListCancelAllErr()
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

  const onStartOne = (id: number) => {
    setBusyButton(`startone_${id}`);
    taskStart(id)
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

  const onPauseOne = (id: number) => {
    setBusyButton(`pauseone_${id}`);
    taskPause(id)
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

  const onCancelOne = (id: number) => {
    setBusyButton(`cancelone_${id}`);
    taskCancel(id)
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
  
  const onRestartOneErr = (id: number, keepProgress: boolean) => {
    setBusyButton(`restartoneerr_${id}`);
    taskRestartErr(id, keepProgress)
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
  
  const onCancelOneErr = (id: number) => {
    setBusyButton(`canceloneerr_${id}`);
    taskCancelErr(id)
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
  
  const onGetJboxLink = (id: number) => {
    setBusyButton(`jboxlink_${id}`);
    taskJboxLink(id)
      .then((data) => { 
        // 打开新网页
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
      });
  };
  
  const onGetTboxLink = (id: number) => {
    setBusyButton(`tboxlink_${id}`);
    taskTboxLink(id)
      .then((data) => { 
        // 打开新网页
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
      });
  };

  const onCopyPath = (entity: SyncTask) => {
    window.navigator.clipboard.writeText(entity.filePath); 
    message.info("已复制到剪切板");
  }

  return (
    <>
      <Modal
        open={restartModalOpen}
        title="请选择重试方式"
        footer={[
          <Button key="back" onClick={() => { setRestartModalOpen(false); }}>
            取消
          </Button>,
          <Button type="primary" loading={busyButton == "restartallerr"} onClick={() => {onRestartAllErr(true);}}>
            保留进度
          </Button>,
          <Button type="primary" loading={busyButton == "restartallerr"} onClick={() => {onRestartAllErr(false);}}>
            从头开始
          </Button>
        ]}
      >
        <p>重试任务时，是否保留已传输的进度？</p>
      </Modal>
    <PageContainer
      title="任务列表"
      extra={[
				
      ]}
      subTitle="简单的描述"
      tabList={[
        {
          tab: '传输中',
          key: 'transferring',
        },
        {
          tab: '已完成',
          key: 'completed',
        },
        {
          tab: '已停止',
          key: 'error',
        },
      ]}
      onTabChange={(x) => { 
        console.log(x)
        setSelectedTab(x);
        setTaskListData([]);
        updateData(x);
      }}
		>
      <div>
        <ProTable<SyncTask>
          dataSource={taskListData}
          rowKey="id"
          pagination={{
            showQuickJumper: true,
          }}
          columns={columns}
          search={false}
          dateFormatter="string"
          headerTitle={
            getCurrentTabAction()
          }
          toolBarRender={() => [
            
          ]}
        />
      </div>
    </PageContainer>
    </>
  )
}