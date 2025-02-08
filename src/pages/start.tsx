import { Flex, Space, Image, Typography, Button, Row, Col, Divider, Progress } from "antd";
import logo from "@/assets/tboxtransfer-logo.png"
import { CloudSyncOutlined, FolderAddOutlined, GlobalOutlined, LoginOutlined } from "@ant-design/icons";
import FeatureCard from "@/components/feature-card";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import UserContext from "@/contexts/user";
import { UserStatDto } from "@/models/user/user";
import { userGetStatistics } from "@/services/user";
import { MessageContext } from "@/contexts/message";
import prettyBytes from "pretty-bytes";

export default function Start(props: any) {
	const nav = useNavigate();
	const user = useContext(UserContext);
	const message = useContext(MessageContext);
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [stat, setStat] = useState<UserStatDto | undefined>(undefined);

	useEffect(()=>{
		if (user.logined)
		{
			updateData();
			const id = setInterval(() => {
				updateData();
			}, 10000);
			setTimer(id);

			return () => {
				clearInterval(id);
				setTimer(null);
			};
		}
	}, [user.logined]);

	const updateData = () => {
		userGetStatistics()
			.then((data) => { setStat(data); })
			.catch((err) => { message.error(err); })
	}

	if (!user.logined)
	{
		return (
			<div className="logo-container">
				<Space size={12} direction='vertical' align="center" 
					style={{height: 'calc(100vh - 80px)', justifyContent: 'center'}}>
					<Image src={logo} width={110} height={110} preview={false}></Image>
					<Typography.Title level={1} style={{fontSize: '42px', fontFamily: 'ui-sans-serif, system-ui'}}>
						JboxTransfer
					</Typography.Title>
					<Typography.Title level={3} type="secondary">
						高效、安全、便捷地转移您的文件
					</Typography.Title>
					<Space size={16} direction="horizontal" style={{marginTop: '20px'}}>
						<Button type="primary" icon={<LoginOutlined />} size='large'
							onClick={()=>{nav("/login")}}>
							前往登录
						</Button>
						<Button type="default" icon={<GlobalOutlined />} size='large'
							onClick={()=>{window.open("https://pan.sjtu.edu.cn/jboxtransfer/", "_blank")}}>
							查看文档
						</Button>
					</Space>
					<Row gutter={16} style={{margin: "24px 10% 0px 10%"}}>
						<Col span={8}>
							<FeatureCard icon="☁️" title="快速地从 jBox 转移文件" content="使用 JboxTransfer，程序将在后台自动从 jBox 下载文件，再到新云盘上传，不会占用您的磁盘空间。"></FeatureCard>
						</Col>
						<Col span={8}>
							<FeatureCard icon="🚀" title="保证您的数据安全" content="JboxTransfer 始终将用户的数据安全放在第一位。除必要的 jAccount 登录信息外，JboxTransfer 不存储您的任何数据。"></FeatureCard>
						</Col>
						<Col span={8}>
							<FeatureCard icon="✅" title="经过验证的可靠性" content="JboxTransfer 通过严苛的测试与完善的异常处理机制，保证您在文件转移过程中可以随时控制，最大程度避免了各类异常的发生与扩散。"></FeatureCard>
						</Col>
					</Row>
				</Space>
			</div>
		)
	}
  return (
		<div className="logo-container">
			<Space size={48} direction="horizontal" align="center">
				<Space size={12} direction='vertical' align="center" 
					style={{height: 'calc(100vh - 80px)', justifyContent: 'center'}}>
					<Image src={logo} width={110} height={110} preview={false}></Image>
					<Typography.Title level={1} style={{fontSize: '42px', fontFamily: 'ui-sans-serif, system-ui'}}>
						JboxTransfer
					</Typography.Title>
					<Typography.Title level={3} type="secondary">
						高效、安全、便捷地转移您的文件
					</Typography.Title>
					<Space size={12} style={{marginTop: '24px', width: '100%'}}>
						<Button type="primary" block size="large" icon={<CloudSyncOutlined/>}>
							一键迁移所有文件
						</Button>
						<Button block size="large" icon={<FolderAddOutlined/>}>
							选择文件夹迁移
						</Button>
					</Space>
				</Space>
				{ stat &&
					<Divider type="vertical" style={{height: '200px'}}></Divider>
				}
				{ stat &&
					<Space size={24} direction='vertical' align="center" >
						<Typography.Title level={4}>
							{stat.onlyFullTransfer ? "正在全量迁移中" : "正在迁移中"}
						</Typography.Title>
						<Progress type="dashboard" percent={Math.round(stat.totalTransferredBytes / stat.jboxSpaceUsedBytes * 10000) / 100} />
						<Typography.Title level={5}>
							{prettyBytes(stat.totalTransferredBytes, { binary: true })} / {prettyBytes(stat.jboxSpaceUsedBytes, { binary: true })}
						</Typography.Title>
						<Typography.Text>
							可前往<Link to={"/main/task"}>任务列表</Link>查看详细信息
						</Typography.Text>
					</Space>
				}
			</Space>
		</div>
	)
}


