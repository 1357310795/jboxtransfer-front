import {
    CaretDownFilled,
    DoubleRightOutlined,
    GithubFilled,
    InfoCircleFilled,
    LogoutOutlined,
    PlusCircleFilled,
    QuestionCircleFilled,
    SearchOutlined,
    SmileFilled,
} from '@ant-design/icons';
import type { ProSettings } from '@ant-design/pro-components';
import {
    PageContainer,
    ProCard,
    ProConfigProvider,
    ProLayout,
    SettingDrawer,
} from '@ant-design/pro-components';
import { css } from '@emotion/css';
import {
    Button,
    ConfigProvider,
    Divider,
    Dropdown,
    Input,
    Popover,
    theme,
} from 'antd';
import React, { useState } from 'react';
import logo from "@/assets/tboxtransfer-logo.png";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const menuProps = {
    route: {
      path: '/',
      routes: [
        {
          name: "文件迁移",
          children: [
            {
              path: '/main/start',
              name: '开始',
              icon: <SmileFilled />,
            },
            {
              path: '/main/task',
              name: '任务列表',
              icon: <SmileFilled />,
            },
            {
              path: '/main/query',
              name: '任务查询',
              icon: <SmileFilled />,
            },
          ]
        },
        {
          name: "云盘文件查看",
          children: [
            {
              path: '/main/jbox',
              name: '旧云盘文件',
              icon: <SmileFilled />,
            },
            {
              path: '/main/tbox',
              name: '新云盘文件',
              icon: <SmileFilled />,
            },
          ]
        }
      ],
    },
    location: {
      pathname: '/',
    },
    appList: [
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
        title: 'Ant Design',
        desc: '杭州市较知名的 UI 设计语言',
        url: 'https://ant.design',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/FLrTNDvlna/antv.png',
        title: 'AntV',
        desc: '蚂蚁集团全新一代数据可视化解决方案',
        url: 'https://antv.vision/',
        target: '_blank',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/antfincdn/upvrAjAPQX/Logo_Tech%252520UI.svg',
        title: 'Pro Components',
        desc: '专业级 UI 组件库',
        url: 'https://procomponents.ant.design/',
      },
      {
        icon: 'https://img.alicdn.com/tfs/TB1zomHwxv1gK0jSZFFXXb0sXXa-200-200.png',
        title: 'umi',
        desc: '插件化的企业级前端应用框架。',
        url: 'https://umijs.org/zh-CN/docs',
      },
  
      {
        icon: 'https://gw.alipayobjects.com/zos/bmw-prod/8a74c1d3-16f3-4719-be63-15e467a68a24/km0cv8vn_w500_h500.png',
        title: 'qiankun',
        desc: '可能是你见过最完善的微前端解决方案🧐',
        url: 'https://qiankun.umijs.org/',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/XuVpGqBFxXplzvLjJBZB.svg',
        title: '语雀',
        desc: '知识创作与分享工具',
        url: 'https://www.yuque.com/',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/rmsportal/LFooOLwmxGLsltmUjTAP.svg',
        title: 'Kitchen ',
        desc: 'Sketch 工具集',
        url: 'https://kitchen.alipay.com/',
      },
      {
        icon: 'https://gw.alipayobjects.com/zos/bmw-prod/d3e3eb39-1cd7-4aa5-827c-877deced6b7e/lalxt4g3_w256_h256.png',
        title: 'dumi',
        desc: '为组件开发场景而生的文档工具',
        url: 'https://d.umijs.org/zh-CN',
      },
    ],
};
  
export default function Root(props: any) {
    const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({
      "fixSiderbar": true,
      "layout": "side",
      "splitMenus": false,
      "navTheme": "light",
      "contentWidth": "Fluid",
      "colorPrimary": "#1677FF"
    });
  
    const [pathname, setPathname] = useState('/list/sub-page/sub-sub-page1');
    const [num, setNum] = useState(40);
    const loc = useLocation();
    const nav = useNavigate();

    if (typeof document === 'undefined') {
      return <div />;
    }
    return (
      <div
        id="test-pro-layout"
        style={{
          height: '100vh',
          width: '100vw',
          overflowX: 'auto',
          overflowY: 'scroll'
        }}
      >
        <ProConfigProvider hashed={false}>
          <ConfigProvider
            getTargetContainer={() => {
              return document.getElementById('test-pro-layout') || document.body;
            }}
          >
            <ProLayout
              prefixCls="my-prefix"
              bgLayoutImgList={[
                {
                  src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
                  left: 85,
                  bottom: 100,
                  height: '303px',
                },
                {
                  src: 'https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png',
                  bottom: -68,
                  right: -45,
                  height: '303px',
                },
                {
                  src: 'https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png',
                  bottom: 0,
                  left: 0,
                  width: '331px',
                },
              ]}
              {...menuProps}
              location={{
                pathname,
              }}
              token={{
                header: {
                  colorBgMenuItemSelected: 'rgba(0,0,0,0.04)',
                },
              }}
              siderMenuType="group"
              menu={{
                collapsedShowGroupTitle: true,
              }}
              avatarProps={{
                src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
                size: 'small',
                title: '七妮妮',
                render: (props, dom) => {
                  return (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'logout',
                            icon: <LogoutOutlined />,
                            label: '退出登录',
                          },
                        ],
                      }}
                    >
                      {dom}
                    </Dropdown>
                  );
                },
              }}
              actionsRender={(props) => {
                if (props.isMobile) return [];
                if (typeof window === 'undefined') return [];
                return [
                  // props.layout !== 'side' && document.body.clientWidth > 1400 ? (
                  //   <SearchInput />
                  // ) : undefined,
                  <InfoCircleFilled key="InfoCircleFilled" />,
                  <QuestionCircleFilled key="QuestionCircleFilled" />,
                  <GithubFilled key="GithubFilled" />,
                ];
              }}
              logo={logo}
              title="JboxTransfer"
              headerTitleRender={(logo, title, _) => {
                const defaultDom = (
                  <a>
                    {logo}
                    {title}
                  </a>
                );
                if (typeof window === 'undefined') return defaultDom;
                if (document.body.clientWidth < 1400) {
                  return defaultDom;
                }
                if (_.isMobile) return defaultDom;
                return (
                  <>
                    {defaultDom}
                    {/* <MenuCard /> */}
                  </>
                );
              }}
              menuFooterRender={(props) => {
                if (props?.collapsed) return undefined;
                return (
                  <div
                    style={{
                      textAlign: 'center',
                      paddingBlockStart: 12,
                    }}
                  >
                    <div>© 2025 上海交通大学网络信息中心</div>
                    <div style={{fontSize: '0.8em', marginTop: '6px'}}>技术支持：思源极客学生信息技术协会</div>
                  </div>
                );
              }}
              onMenuHeaderClick={(e) => console.log(e)}
              menuProps={{selectedKeys: [loc.pathname]}}
              menuItemRender={(item, dom) => (
                <div
                  onClick={() => {
                    setPathname(item.path || '/main/start');
                    nav(item.path || '/main/start');
                  }}
                >
                  {dom}
                </div>
              )}
              {...settings}
            >
              <Outlet />
              <SettingDrawer
                pathname={pathname}
                enableDarkTheme
                getContainer={(e: any) => {
                  if (typeof window === 'undefined') return e;
                  return document.getElementById('test-pro-layout');
                }}
                settings={settings}
                onSettingChange={(changeSetting) => {
                  setSetting(changeSetting);
                }}
                disableUrlParams={false}
              />
            </ProLayout>
          </ConfigProvider>
        </ProConfigProvider>
      </div>
    );
  };
