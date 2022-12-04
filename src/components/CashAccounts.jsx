import { Divider, Button } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

const CashAccounts = (props) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      if (data?.balance) {
        setBalance(data.balance);
      }
    });
  }, []);

  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>My Cash Accounts</h1>
      </header>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "10px",
        }}
      >
        <Button type="primary">
          <Link to="/add" style={{ color: "#fff" }}>
            Add
          </Link>
        </Button>
        <Button type="primary" style={{ marginLeft: "10px" }}>
          <Link to="/remove" style={{ color: "#fff" }}>
            Remove
          </Link>
        </Button>
      </div>
      <Divider>Balance</Divider>
      <div style={{ marginBottom: "10px" }}>${balance}</div>
    </div>
  );
};

export default CashAccounts;
