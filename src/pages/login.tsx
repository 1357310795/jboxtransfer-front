import { useContext, useEffect, useRef, useState } from "react";
import { Card, Layout, Button, Form, Input, Space, Flex, Typography, Avatar, ConfigProvider, Image, Divider, Spin, Result } from "antd";
import { ApiOutlined, LockOutlined, MoonOutlined, SunOutlined, UserOutlined } from "@ant-design/icons";
import { MessageContext } from "@/contexts/message";
import QRCode from 'qrcode';
import bg from '@/assets/students_center.jpg';
import code_inactive from '@/assets/code_inactive.png'
import mcbg_light from '@/assets/mc-bg-day.jpg';
import mcbg_dark from '@/assets/mc-bg-night.jpg';
import logo from '@/assets/tboxtransfer-logo.png';
import UserContext from "@/contexts/user";
import {
  userLoginByJac, 
  userLoginByJacValidate
} from "@/services/user";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeContext from "@/contexts/theme";

const { Header, Footer, Sider, Content } = Layout;
const { Paragraph, Text, Link, Title } = Typography;
const { Meta } = Card;

export default function Login() {
  const loc = useLocation();
  const nav = useNavigate();
  const [qrcodeImg, setQrcodeImg] = useState<string | undefined>(undefined);
  const [uuid, setUuid] = useState<string | undefined>(undefined);
  const [errMessage, setErrMessage] = useState<string | undefined>(undefined);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const cnt = useRef<number>(0);

  const message = useContext(MessageContext);
  const userCtx = useContext(UserContext);
  const theme = useContext(ThemeContext);

  useEffect(() =>{
    loginbyjac();
  }, []);

  useEffect(()=>{
    if (uuid != undefined)
    {
      cnt.current = 0;
      const id = setInterval(() => {
        cnt.current += 1;
        if (cnt.current > 100) {
          setErrMessage("登录超时，请刷新页面重试");
          setUuid(undefined);
        }
        onJacLoginFinish(false);
      }, 800);
      setTimer(id);
  
      return () => {
        clearInterval(id);
        setTimer(null);
      };
    }
  }, [uuid]);

  const getJacLoginForm = function() {
    return (
      <Card className="login-card" 
      styles={{body: { 
        display: 'flex',
        gap: '8px',
        flexDirection: 'column',
        width: '100%',
        height: '100%'
      }}}
      style={{
        backgroundColor: theme.userTheme == 'light' ? "rgba(255, 255, 255, 0.6)" : "rgba(5, 0, 8, 0.6)",
        boxShadow: theme.userTheme == 'light' ? "hsla(218, 31%, 5%, 0.05) 0px 5px 15px 0px,hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px" : "hsla(218, 31%, 5%, 0.05) 0px 5px 15px 0px,hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px"
      }}
    >
      <Flex align='center' style={{ 
        alignSelf: 'flex-start', 
        gap: '6px',
        background: theme.userTheme == 'light' ? 'linear-gradient( 135deg, #123597 10%,rgb(103, 127, 220)  100%) text' : 'linear-gradient( 135deg,rgb(123, 86, 255) 10%,rgb(243, 103, 253)  100%) text',
        color: 'transparent'
      }}>
        <Image
          src={logo}
          alt="logo"
          width={24}
          height={24}
          preview={false}
        />
        <Typography.Title level={5} style={{ color: 'inherit' }}>
          JboxTransfer 网页端
        </Typography.Title>
      </Flex>
      <Form
        name="login"
        onFinish={() => {onJacLoginFinish(true);}}
        autoComplete="off"
        layout="vertical"
        requiredMark={false}
        size='large'
      >
        <Form.Item style={{ marginBottom: '4px', marginTop: '8px', textAlign: 'center' }}>
          <Typography.Title level={2}>
            扫码登录
          </Typography.Title>
        </Form.Item>
        <Form.Item style={{marginBottom: "8px", textAlign: "center"}}>
          请使用交我办或微信扫码
        </Form.Item>

        <Form.Item style={{marginBottom: "16px", textAlign: "center"}}>
          {
            errMessage == undefined ? (
              uuid == undefined ? 
                <Spin tip="加载中">
                  <img width={228} height={228} className="qrcode" src={qrcodeImg} />
                </Spin>
                : <img width={228} height={228} className="qrcode" src={qrcodeImg} />
            ) : (
              <Result
                status="error"
                title="登录失败"
                subTitle={errMessage}
                extra={[
                  <Button key="refresh" type="primary" onClick={() => { window.location.reload(); }}>
                    刷新页面
                  </Button>
                ]}
              />
            )
          }
        </Form.Item>

        <Form.Item style={{ marginBottom: '0px' }} hidden={errMessage != undefined}>
          <Button type="primary" htmlType="submit" block>
            验证
          </Button>
        </Form.Item>
      </Form>
    </Card>
    )
  }

  const loginbyjac = () => {
    setQrcodeImg(code_inactive);
    userLoginByJac()
      .then((data)=>{
        setUuid(data.uuid);
        QRCode.toDataURL(data.qrcode).then((v)=>{
          setQrcodeImg(v);
        });
      })
      .catch((err) => { message.error(err); })
  }

  const onJacLoginFinish = (showErrMessage: boolean) => {
    userLoginByJacValidate(uuid!)
      .then((data)=>{
        message.success('登录成功，跳转中……');
        userCtx.setLogined(true);
        nav("/main/start");
      })
      .catch((err) => { 
        if (showErrMessage) message.error(err); 
      })
  };

  return (
      <>
  <ConfigProvider
    theme={{
      components: {
        Button: {
          primaryShadow: 'none'
        }
      },
      token: {
        // colorBgContainer: theme.userTheme == 'light' ? '#e6e3f39A' : '#e6e3f39A',
        // colorBgElevated: '#e6e3f39A',
      },
    }}
  >
  <Layout style={{ 
    backgroundImage: `url(${theme.userTheme == 'light' ? mcbg_light : mcbg_dark})`, 
    backgroundSize: "cover", 
    height: '100vh', 
    width: '100vw' 
  }}>
    <Content style={{ 
      display: "flex", 
      justifyContent: "flex-start", 
      alignItems: "center", 
      height: "calc(100vh - 64px)" }}>
      <div style={{ 
        width: 400, 
        height: 500, 
        margin: "0 0 0 15vw", 
        padding: "0", 
        backdropFilter: 'blur(20px)',
        border: 'none'
      }}>
          {/* <div style={{ 
            height: "100%",
            width: "100%",
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center" }}>
            <div style={{ flex: 1}}> 
              
            </div>
          </div> */}
          {getJacLoginForm()}
      </div>
    </Content>
    <div style={{position: "absolute", bottom: 4, right: 16}}>
      {/* <p style={{color: "#CCC"}}>Photo by @Nereise</p> */}
      <p style={{color: "#EEE", textShadow: "1px 1px 10px #000"}}>
        Photo by <a href="https://mc.sjtu.cn/" target="_blank" style={{textDecoration: 'none', color: 'inherit'}}>上海交通大学 Minecraft 社</a>
      </p>
    </div>
    <div style={{position: "absolute", top: 16, right: 16}}>
      <Button shape="circle" icon={
          theme.userTheme == "light" ? <MoonOutlined /> : <SunOutlined />
        } 
        onClick={
          ()=>{theme.userTheme == "light" ? theme.changeTheme("dark") : theme.changeTheme("light")}
        }/>
    </div>
  </Layout>
  </ConfigProvider>
      </>
    );
}
  