import React, { useState } from "react";
import {
  AppstoreOutlined,
  StockOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const items = [
  {
    label: <Link to="/">My Portfolio</Link>,
    key: "overview",
    icon: <StockOutlined />,
  },
  {
    label: <Link to="/balance">Cash Accounts</Link>,
    key: "balance",
    icon: <DollarOutlined />,
  },
];

const NavMenu = () => {
  const [current, setCurrent] = useState("mail");
  const onClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};
export default NavMenu;
