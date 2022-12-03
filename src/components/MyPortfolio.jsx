import React, { useEffect, useState } from "react";
import { Button, Divider, Table } from "antd";
import { Link } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";

const columns = [
  {
    title: "TICKER",
    dataIndex: "symbol",
    // filters: [
    //   {
    //     text: "Joe",
    //     value: "Joe",
    //   },
    //   {
    //     text: "Jim",
    //     value: "Jim",
    //   },
    //   {
    //     text: "Submenu",
    //     value: "Submenu",
    //     children: [
    //       {
    //         text: "Green",
    //         value: "Green",
    //       },
    //       {
    //         text: "Black",
    //         value: "Black",
    //       },
    //     ],
    //   },
    // ],
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    // onFilter: (value, record) => record.name.indexOf(value) === 0,
    // sorter: (a, b) => a.name.length - b.name.length,
    // sortDirections: ["descend"],
  },
  {
    title: "COMPANY",
    dataIndex: "longname",
    // defaultSortOrder: "descend",
    // sorter: (a, b) => a.age - b.age,
  },
  {
    title: "MARKET",
    dataIndex: "exchDisp",
    // defaultSortOrder: "descend",
    // sorter: (a, b) => a.age - b.age,
  },
  {
    title: "PRICE",
    dataIndex: "regularMarketPrice",
    // filters: [
    //   {
    //     text: "London",
    //     value: "London",
    //   },
    //   {
    //     text: "New York",
    //     value: "New York",
    //   },
    // ],
    // onFilter: (value, record) => record.address.indexOf(value) === 0,
  },
  {
    title: "QTY",
    dataIndex: "quantity",
    // defaultSortOrder: "descend",
    // sorter: (a, b) => a.age - b.age,
  },
  // {
  //   title: "VALUE",
  //   dataIndex: "age",
  // defaultSortOrder: "descend",
  // sorter: (a, b) => a.age - b.age,
  // },
];

const onChange = (pagination, filters, sorter, extra) => {
  console.log("params", pagination, filters, sorter, extra);
};

const MyPortfolio = (props) => {
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      let arr = [];
      let key = 1;
      for (const holding of Object.values(data.holdings)) {
        holding.key = key;
        arr.push(holding);
        key++;
      }
      setHoldings(arr);
      console.log(holdings);
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
          onChange={onChange}
          pagination={{ pageSize: 50 }}
          scroll={{ y: 240 }}
        />
      </div>
    </div>
  );
};

export default MyPortfolio;
