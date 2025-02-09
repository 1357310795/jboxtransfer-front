import React, { useContext, useEffect, useMemo, useState } from 'react';
import type { BadgeProps, GetProp, TableProps } from 'antd';
import { Flex, Table, Image, Space, Typography, Result, Button, Badge, Modal, Input } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { FileSystemItem } from '@/models/cloud/fs-item';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NotificationContext } from '@/contexts/notification';
import { MessageContext } from '@/contexts/message';
import { PageContainer } from '@ant-design/pro-components';
import prettyBytes from 'pretty-bytes';
import FileIcon from '@/utils/fileicon';
import folderIcon from "@/assets/folder.svg";
import dayjs from 'dayjs';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { taskAdd } from '@/services/task';

const { Link } = Typography;

type ColumnsType<T extends object = object> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<GetProp<TableProps, 'pagination'>, boolean>;
interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

const stateEnums: {[key: string]: BadgeProps} = {
  None: { text: '未同步', status: 'default', color: undefined },
  Idle: { text: '等待中', status: undefined, color: 'cyan' },
  Pending: { text: '排队中', status: undefined, color: 'purple' },
  Busy: { text: '传输中', status: 'processing', color: undefined },
  Error: { text: '已停止', status: undefined, color: 'red' },
  Done: { text: '已完成', status: undefined, color: 'green' },
  Cancel: { text: '已取消', status: undefined, color: 'magenta' },
};

export interface CloudFileListProps {
  title: string;
  listCloudItems: (path: string, page: number, pageSize: number) => Promise<FileSystemItem>;
  getItemActions: (record: FileSystemItem) => React.ReactNode;
  addTaskModalOpen: boolean;
  setAddTaskModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addTaskPath: string;
}

export default function CloudFileList(props: CloudFileListProps) {
  const [data, setData] = useState<FileSystemItem[]>();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 20,
      pageSizeOptions: [5, 10, 20],
    },
  });
  const [busyButton, setBusyButton] = useState<string>("");
  
  const nav = useNavigate();
  const noti = useContext(NotificationContext);
  const message = useContext(MessageContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const mapStateToBadge = (state: string) => {
    var badge = stateEnums[state];
    if (badge == undefined) 
      return <Badge status="default" text="未知" />;
    return <Badge status={badge.status} text={badge.text} color={badge.color} />
  }

  const columns: ColumnsType<FileSystemItem> = [
    {
      title: '文件名',
      width: '40%',
      ellipsis: true,
      render: (_, record) => (
        <Link onClick={()=>{ 
          if (record.type == "Folder")
            navToPath(record.fullPath); 
        }}>
          <Flex gap={8} align="center" style={{justifyContent: 'flex-start', width: '100%'}} >
            <div style={{flex: '0'}}>
              {
                record.type == "Folder" ? 
                  <Image preview={false} src={folderIcon} style={{width: '28px', height: '28px' }}></Image>
                  : <FileIcon style={{width: '28px', height: '28px' }} filename={record.name} />
              }
            </div>
            <Space direction="vertical" style={{flex: 'auto', minWidth: '0', gap: '0px'}}>
              <Typography.Text ellipsis={true}>
                {record.name}
              </Typography.Text>
            </Space>
          </Flex>
        </Link>
      )
    },
    {
      title: '更新时间',
      width: '160px',
      render: (_, record) => (
        dayjs(record.updateTime).format("YYYY-MM-DD HH:mm:ss")
      )
    },
    {
      title: '大小',
      width: '120px',
      render: (_, record) => (
        record.type == "File" ? prettyBytes(record.size, {binary: true}) : "-"
      )
    },
    {
      title: '状态',
      width: '100px',
      render: (_, record) => (
        mapStateToBadge(record.syncState!)
      )
    },
    {
      title: '操作',
      width: '20%',
      render: (_, record) => (
        props.getItemActions(record)
      )
    },
  ];

  const fetchData = () => {
    var path = searchParams.get("path");
    if (path != null)
    {
      setLoading(true);
      props.listCloudItems(path, tableParams.pagination!.current!, tableParams.pagination!.pageSize!)
        .then(data => {
          setData(data.contents);
          setLoading(false);
          setTableParams({
            ...tableParams,
            pagination: {
              ...tableParams.pagination,
              total: data.totalCount,
            },
          });
        })
        .catch(err => {
          setLoading(false);
          setIsError(true);
          message.error(err);
        });
    }
  };

  useEffect(() => {
    if (searchParams.get("path") == null)
    {
      var initParam = new URLSearchParams();
      initParam.set("path", "/");
      setSearchParams(initParam);
    }
  }, []);

  useEffect(fetchData, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.sortOrder,
    tableParams?.sortField,
    JSON.stringify(tableParams.filters),
    searchParams.get("path"),
  ]);

  const handleTableChange: TableProps<FileSystemItem>['onChange'] = (pagination, filters, sorter) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const navToPath = (path: string) => {
    searchParams.set("path", path);
    setSearchParams(searchParams);
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  }

  const breadcrumbItems = useMemo(()=>{
    const homeItem: BreadcrumbItemType = {
      title: <><HomeOutlined /><span>根目录</span></>,
      href: "#",
      onClick: () => { navToPath("/") }
    }
    var fullPath = searchParams.get("path");
    if (fullPath == null || fullPath == "/")
      return [ homeItem ];
    var cascadePath = "";
    var routes: BreadcrumbItemType[] = [ homeItem ];
    fullPath = fullPath.startsWith("/") ? fullPath.slice(1) : fullPath;
    fullPath.split("/").forEach((segment, index)=> {
      cascadePath = cascadePath + "/" + segment;
      var pathCopy = `${cascadePath}`;
      routes.push({
        title: segment,
        href: "#",
        onClick: () => { navToPath(pathCopy);  }
      });
    })
    return routes;
  }, [searchParams.get("path")]);

  const onAddTask = (path: string) => {
    setBusyButton(`addtask`);
    taskAdd(path)
      .then((data) => { 
        message.info("操作成功");
        fetchData();
      })
      .catch((err) => { 
        message.error(err); 
      })
      .finally(()=>{
        setBusyButton("");
        props.setAddTaskModalOpen(false);
      });
  };


  return (
    <>
    <Modal
      open={props.addTaskModalOpen}
      title="请确认待同步的文件/文件夹路径"
      onOk={() => {onAddTask(props.addTaskPath);}}
      okButtonProps={{loading: (busyButton == `addtask`)}}
      onCancel={() => {props.setAddTaskModalOpen(false);}}
    >
      <p><Input value={props.addTaskPath}></Input></p>
    </Modal>
    <PageContainer
      title={props.title}
      subTitle={
        <Button 
          icon={<ReloadOutlined/>} 
          color="default" 
          variant="text"
          onClick={()=>{fetchData();}}
        >

        </Button>
      }
      breadcrumb={{
        items: breadcrumbItems
      }}
		>
      <div>
        {
          isError ? (
            <Result
              status="error"
              title="操作失败"
              // subTitle={errMessage}
              extra={[
                <Button type="primary" onClick={() => { navToPath("/"); setIsError(false); }}>
                  返回根目录
                </Button>
              ]}
            />
          ) : (
            <Table<FileSystemItem>
              columns={columns}
              rowKey={(record) => record.fullPath}
              dataSource={data}
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
            />
          )
        }
      </div>
    </PageContainer>
    </>
  )
}