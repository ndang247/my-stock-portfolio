import React, { useEffect, useState } from "react";
import { Button, Divider, Table } from "antd";
import { Link } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

const columns = [
  {
    title: "TICKER",
    dataIndex: "symbol",
  },
  {
    title: "COMPANY",
    dataIndex: "longname",
  },
  {
    title: "MARKET",
    dataIndex: "exchDisp",
    filters: [
      {
        text: "NASDAQ",
        value: "NASDAQ",
      },
      {
        text: "NEO",
        value: "NEO",
      },
      {
        text: "XETRA",
        value: "XETRA",
      },
    ],
    // specify the condition of filtering result
    // here is that finding the exchDisp started with `value`
    onFilter: (value, record) => record.exchDisp.indexOf(value) === 0,
  },
  {
    title: "PURCHASED PRICE",
    dataIndex: "regularMarketPrice",
    sorter: (a, b) => a.regularMarketPrice - b.regularMarketPrice,
  },
  {
    title: "QTY",
    dataIndex: "quantity",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.quantity - b.quantity,
  },
];

// const onChange = (pagination, filters, sorter, extra) => {
//   console.log("params", pagination, filters, sorter, extra);
// };

const MyPortfolio = (props) => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      let arr = [];
      let key = 1;
      if (data?.holdings) {
        for (const holding of Object.values(data.holdings)) {
          holding.key = key;
          arr.push(holding);
          key++;
        }
        setHoldings(arr);
        // console.log(holdings);
      }
    });
  }, []);

  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>My Portfolio</h1>
      </header>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          marginBottom: "10px",
        }}
      >
        <Button type="primary">
          <Link to="/buy" style={{ color: "#fff" }}>
            Buy
          </Link>
        </Button>
        <Button type="primary" style={{ marginLeft: "10px" }}>
          <Link to="/sell" style={{ color: "#fff" }}>
            Sell
          </Link>
        </Button>
      </div>
      <Divider>My Holdings</Divider>
      <div>
        <Table
          columns={columns}
          dataSource={holdings}
          // onChange={onChange}
          pagination={{ pageSize: 50 }}
          scroll={{ y: 240 }}
        />
      </div>
    </div>
  );
};

export default MyPortfolio;
