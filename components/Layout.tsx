import { UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import React, { useState } from "react";
import type { MenuProps } from "antd";
import { useRouter } from "next/router";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];
const MENU: MenuItem[] = [
  {
    key: "/",
    icon: <UserOutlined />,
    label: "首页",
  },
  {
    key: "/webRTC",
    icon: <VideoCameraOutlined />,
    label: "音视频",
    children: [
      {
        key: "/webRTC/take-photos",
        icon: <VideoCameraOutlined />,
        label: "拍照",
      },
      {
        key: "/webRTC/record",
        icon: <VideoCameraOutlined />,
        label: "分享屏幕、录制",
      },
    ],
  },
  {
    key: "/three",
    icon: <VideoCameraOutlined />,
    label: "threeJS",
    children: [
      {
        key: "/three/first-cube",
        icon: <VideoCameraOutlined />,
        label: "基础立方体",
      },
      {
        key: "/three/planet",
        icon: <VideoCameraOutlined />,
        label: "星球",
      },
    ],
  },
  {
    key: "/canvas",
    icon: <VideoCameraOutlined />,
    label: "Canvas",
    children: [
      {
        key: "/canvas/base-tree",
        icon: <VideoCameraOutlined />,
        label: "树",
      }
    ],
  },
  {
    key: "/magic",
    icon: <VideoCameraOutlined />,
    label: "小特效"
  },
];

const MyLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [selectedKeys, setSelectedKeys] = useState(["home"]);

  const onClick: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
    setSelectedKeys([key]);
  };
  const renderMenuItem = (item: MenuItem) => {};
  return (
    <Layout>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
        style={{
          height: "100vh",
          overflow: "auto",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={MENU}
          onClick={onClick}
          selectedKeys={selectedKeys}
        />
      </Sider>
      <Layout
        className="site-layout"
        style={{ marginLeft: 200, minHeight: "100vh" }}
      >
        <Content style={{ margin: "24px 16px 0" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyLayout;
