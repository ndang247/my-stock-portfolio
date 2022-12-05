import React, { useState, useEffect } from "react";
import { Form, Select, Button, InputNumber, Divider, Alert, Spin } from "antd";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import qs from "qs";
import axios from "axios";

const SearchInput = (props) => {
  const handleSearch = (newValue) => {
    const { setData, firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      let arr = [];
      if (data?.holdings) {
        for (const holding of Object.values(data.holdings)) {
          if (
            holding.symbol.toLowerCase().includes(newValue.toLowerCase()) ||
            holding.longname.toLowerCase().includes(newValue.toLowerCase()) ||
            holding.shortname.toLowerCase().includes(newValue.toLowerCase())
          ) {
            arr.push(holding);
          }
        }
        setData(arr);
        // console.log(data);
      }
    });
  };

  const handleChange = (newValue) => {
    const { setValue } = props;
    setValue(newValue);
  };

  const handleSelect = (value) => {
    const {
      data,
      setMaxQuantity,
      setPurchasedPrice,
      setMarketPrice,
      setLoading,
    } = props;
    setLoading(true);
    const holding = data.find(
      (holding) => `${holding.exchDisp}:${holding.symbol}` === value
    );
    // console.log(holding);
    setMaxQuantity(holding.quantity);
    setPurchasedPrice(holding.regularMarketPrice);

    const symbol = value.split(":")[1];
    // console.log(value.split(":")[1]);

    const str = qs.stringify({ symbols: symbol, region: "US" });

    const config = {
      method: "GET",
      url: `https://yh-finance.p.rapidapi.com/market/v2/get-quotes?${str}`,
      headers: {
        "X-RapidAPI-Key": "d9d6283b27msh83f7e308bb7541ep127913jsn1e30569668fb",
        "X-RapidAPI-Host": "yh-finance.p.rapidapi.com",
      },
    };

    axios
      .request(config)
      .then(function (response) {
        // console.log(response.data.quoteResponse.result[0].regularMarketPrice);
        setMarketPrice(
          response.data.quoteResponse.result[0].regularMarketPrice
        );
        setLoading(false);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <Select
      showSearch
      value={props.value || null}
      placeholder={props.placeholder}
      style={props.style}
      defaultActiveFirstOption={false}
      showArrow={false}
      filterOption={false}
      onSearch={handleSearch}
      onChange={handleChange}
      onSelect={handleSelect}
      notFoundContent={null}
      options={(props.data || []).map((d) => ({
        value: `${d.exchDisp}:${d.symbol}`,
        label: `${d.exchDisp}:${d.symbol}`,
      }))}
    />
  );
};

const SellForm = (props) => {
  const [currentBalance, setCurrentBalance] = useState(0);
  const [data, setData] = useState([]);
  const [value, setValue] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [purchasedPrice, setPurchasedPrice] = useState(0);
  const [marketPrice, setMarketPrice] = useState(0);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      if (data?.balance) {
        setCurrentBalance(data.balance);
      }
    });
  }, []);

  const sell = () => {
    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);
    let newBalance = 0;
    let newQuantity = 0;

    onValue(ref(db, "portfolio/"), (snapshot) => {
      const data = snapshot.val();
      let arr = [];
      if (data?.holdings) {
        for (const holding of Object.values(data.holdings)) {
          if (
            holding.symbol.toLowerCase().includes(value.toLowerCase()) ||
            holding.longname.toLowerCase().includes(value.toLowerCase()) ||
            holding.shortname.toLowerCase().includes(value.toLowerCase())
          ) {
            arr.push(holding);
          }
        }
      }
      setData(arr);
    });

    data.forEach((holding) => {
      if (`${holding.exchDisp}:${holding.symbol}` === value) {
        newBalance =
          Number(currentBalance) + Number(quantity) * Number(marketPrice);
        // console.log(newBalance.toFixed(2));
        newQuantity = Number(maxQuantity) - Number(quantity);
        set(ref(db, "portfolio/balance"), newBalance.toFixed(2));
        if (newQuantity === 0) {
          remove(
            ref(
              db,
              `portfolio/holdings/${holding.exchDisp}:${holding.symbol.replace(
                /[.#$[\]]/g,
                "-"
              )}`
            )
          );
        } else {
          set(
            ref(
              db,
              `portfolio/holdings/${holding.exchDisp}:${holding.symbol.replace(
                /[.#$[\]]/g,
                "-"
              )}/quantity`
            ),
            newQuantity
          );
          onValue(
            ref(
              db,
              `portfolio/holdings/${holding.exchDisp}:${holding.symbol.replace(
                /[.#$[\]]/g,
                "-"
              )}/quantity`
            ),
            (snapshot) => {
              const maxQuantity = snapshot.val();
              setMaxQuantity(maxQuantity);
            }
          );
        }
        setSuccess(true);
      }
    });
    if (newBalance === 0 && newQuantity === 0) {
      setError(true);
    }
  };

  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>Sell Stock</h1>
        <p style={{ marginTop: "10px" }}>Current Balance: ${currentBalance}</p>
      </header>
      {error && (
        <Alert
          message="Error"
          description="You do not own this stock anymore."
          type="error"
          style={{
            width: "30%",
            marginLeft: "35%",
          }}
        />
      )}
      {success && (
        <Alert
          message="Success"
          type="success"
          style={{
            width: "30%",
            marginLeft: "35%",
          }}
        />
      )}
      <Divider />
      <div>
        <Form
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 4 }}
          initialValues={{
            ["quantity"]: 0,
          }}
        >
          <Form.Item label="Holding">
            <SearchInput
              data={data}
              setData={setData}
              value={value}
              setValue={setValue}
              setMaxQuantity={setMaxQuantity}
              setPurchasedPrice={setPurchasedPrice}
              setMarketPrice={setMarketPrice}
              setLoading={setLoading}
              firebaseApp={props.firebaseApp}
              placeholder="Search Stock"
              style={{
                width: "100%",
              }}
            />
            {loading && <Spin />}
          </Form.Item>
          <Form.Item label="Quantity" name="quantity">
            <InputNumber
              min="0"
              max={maxQuantity}
              step="1"
              value={quantity}
              onChange={(value) => setQuantity(value)}
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item label="Purchased Price">
            <InputNumber
              min="0"
              addonAfter="$"
              value={purchasedPrice}
              disabled
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item label="Market Price">
            <InputNumber
              min="0"
              addonAfter="$"
              value={marketPrice}
              disabled
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
            <Button
              disabled={quantity === 0}
              type="primary"
              htmlType="submit"
              onClick={sell}
            >
              SELL
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SellForm;
