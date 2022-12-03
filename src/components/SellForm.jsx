import React from "react";
import { Form, Input, Button, InputNumber, Divider } from "antd";

const SellForm = () => {
  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>Sell Stock</h1>
      </header>
      <Divider />
      <div>
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 16 }}>
          <Form.Item label="Stock">
            <Input />
          </Form.Item>
          <Form.Item label="Quantity">
            <InputNumber min="0" />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button type="primary" htmlType="submit">
              SELL
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SellForm;
