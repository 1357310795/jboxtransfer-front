import { MessageContext } from "@/contexts/message";
import { NotificationContext } from "@/contexts/notification";
import { SyncTask } from "@/models/sync-task/sync-task";
import { taskListCancelAll, taskListCancelAllErr, taskListDeleteAllDone, taskListInfo, taskListPauseAll, taskListRestartAllErr, taskListStartAll } from "@/services/task-list";
import FileIcon from "@/utils/fileicon";
import { PageContainer, ProColumns, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Flex, Space, Typography, Image, Progress, Dropdown, Popconfirm, Modal, Tooltip, Badge } from "antd";
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom";
import folderIcon from "@/assets/folder.svg";
import { CloseCircleFilled, CopyOutlined, ExportOutlined, PauseCircleFilled, PlayCircleFilled, SyncOutlined } from "@ant-design/icons";
import prettyBytes from "pretty-bytes";
import { ModalContext } from "@/contexts/modal";
import { taskCancel, taskCancelErr, taskPause, taskRestartErr, taskSetTop, taskStart } from "@/services/task";
import { getJboxItemLink, getTboxItemLink } from "@/services/cloud";

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
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [runningCount, setRunningCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

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
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
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
              { key: 'openinjbox', label: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', label: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
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
              { key: 'openinjbox', name: '在旧云盘中打开', onClick: () => {onGetJboxLink(entity.filePath)}, disabled: (busyButton == `jboxlink_${entity.filePath}`) },
              { key: 'openintbox', name: '在新云盘中打开', onClick: () => {onGetTboxLink(entity.filePath)}, disabled: (busyButton == `tboxlink_${entity.filePath}`) },
              { key: 'copypath', name: '复制完整路径', onClick: ()=>{onCopyPath(entity)} },
            ]}
          />,
        ];
      default: return [];
    }
  }

  const getCustomProgressText = (down: number, up: number, total: number, type: string) => {
    if (type == "File")
      return (
        <Tooltip title={
          <>
            <div>{`已下载：${down} Bytes`}</div>
            <div>{`已上传：${up} Bytes`}</div>
            <div>{`文件大小：${total} Bytes`}</div>
          </>
        }>
          <Typography.Text style={{lineHeight: '1em'}}>
            {`${prettyBytes(down, {binary: true})} / ${prettyBytes(up, {binary: true})} / ${prettyBytes(total, {binary: true})}`}
          </Typography.Text>
        </Tooltip>
      )
    else 
      return (
        <Tooltip title={
          <>
            <div>{`已迁移：${down} 个子文件（夹）`}</div>
            <div>{`总计：${total} 个子文件（夹）`}</div>
          </>
        }>
          <Typography.Text style={{lineHeight: '1em'}}>
            {`${down} pcs / ${total} pcs`}
          </Typography.Text>
        </Tooltip>
      )
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
          {getCustomProgressText(entity.downloadedBytes, entity.uploadedBytes, entity.totalBytes, entity.type)}
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
          {getCustomProgressText(entity.downloadedBytes, entity.uploadedBytes, entity.totalBytes, entity.type)}
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
      .then((data) => { 
        setIsLoading(false);
        setRunningCount(data.runningCount);
        setCompletedCount(data.completedCount);
        setErrorCount(data.errorCount);
        if (selectedTab == "transferring")
        {
          setHasMore(data.hasMore);
          setTaskListData(data.entities.filter(x => x.state != "Error" && x.state != "Complete"));
        }
        else if (selectedTab == "completed")
        {
          setHasMore(data.hasMore);
          setTaskListData(data.entities);
        }
        else if (selectedTab == "error")
        {
          setTaskListData(data.entities);
        }
      })
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
      // subTitle="简单的描述"
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
          tab: (
            <Badge size="small" offset={[8, 0]} count={errorCount}>
              已停止
            </Badge>
          ),
          key: 'error',
        },
      ]}
      onTabChange={(x) => { 
        setSelectedTab(x);
        setIsLoading(true);
        setTaskListData([]);
        updateData(x);
      }}
		>
      <div>
        <ProTable<SyncTask>
          dataSource={taskListData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showQuickJumper: true,
            pageSize: 200
          }}
          columns={columns}
          search={false}
          headerTitle={
            getCurrentTabAction()
          }
          toolBarRender={() => [
            
          ]}
          footer={
            hasMore ? (() => (
              <p>列表仅显示前 {taskListData.length} 项，如需查看更多，请前往<Link to="/main/query">任务查询</Link>页面。</p>
            )) : undefined
          }
        />
      </div>
    </PageContainer>
    </>
  )
}