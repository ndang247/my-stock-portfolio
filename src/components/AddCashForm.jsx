import React, { useState } from "react";
import { Button, Form, InputNumber, Divider, Alert } from "antd";
import { getDatabase, ref, set, onValue } from "firebase/database";

const AddCashForm = (props) => {
  const [success, setSuccess] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleChanges = (value) => setAmount(value);

  const add = () => {
    const { firebaseApp } = props;
    let currentBalance = 0;
    const db = getDatabase(firebaseApp);

    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      if (data?.balance) {
        currentBalance = data.balance;
      }
    });

    set(ref(db, "portfolio/"), {
      balance: currentBalance + amount,
    });

    setSuccess(true);
    setAmount(0);
  };

  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>Add Cash</h1>
      </header>
      {success && (
        <Alert
          message="Success"
          description="Your balance has been updated."
          type="success"
          style={{
            width: "30%",
            marginLeft: "35%",
          }}
        />
      )}
      <Divider />
      <Form
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 4 }}
        initialValues={{
          ["amount"]: 0,
        }}
      >
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please input your amount!" }]}
        >
          <InputNumber
            min={0}
            addonAfter="$"
            value={amount}
            step={0.01}
            onChange={handleChanges}
          />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button
            disabled={amount === 0}
            type="primary"
            htmlType="submit"
            onClick={add}
          >
            ADD
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default AddCashForm;
