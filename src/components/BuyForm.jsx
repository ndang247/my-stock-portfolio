import React, { useEffect, useState } from "react";
import { Button, Divider, Form, InputNumber, Select, Alert, Spin } from "antd";
import axios from "axios";
import qs from "qs";
import { getDatabase, ref, set, onValue } from "firebase/database";

let timeout;
let currentValue;

const fetch = (value, callback, isLoading) => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;
  const req = () => {
    const str = qs.stringify({ q: value, region: "US" });

    const config = {
      method: "GET",
      url: `https://yh-finance.p.rapidapi.com/auto-complete?${str}`,
      headers: {
        "X-RapidAPI-Key": "d9d6283b27msh83f7e308bb7541ep127913jsn1e30569668fb",
        "X-RapidAPI-Host": "yh-finance.p.rapidapi.com",
      },
    };

    axios
      .request(config)
      .then(function (response) {
        // console.log(response.data);
        // console.log(currentValue);
        // console.log(value);
        if (currentValue === value) {
          const { quotes } = response.data;
          // console.log(quotes);
          const data = quotes.map((quote) => quote);
          // console.log(data);
          callback(data);
          isLoading(false);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  };
  timeout = setTimeout(req, 300);
};

const SearchInput = (props) => {
  const handleSearch = (newValue) => {
    const { setData, setLoading } = props;
    if (newValue) {
      setLoading(true);
      fetch(newValue, setData, setLoading);
    } else {
      setData([]);
    }
  };

  const handleChange = (newValue) => {
    const { setValue } = props;
    setValue(newValue);
  };

  const handleSelect = (value) => {
    const { setPrice, setLoading } = props;
    setLoading(true);
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
        setPrice(response.data.quoteResponse.result[0].regularMarketPrice);
        setLoading(false);
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  return (
    <Select
      showSearch
      value={props.value}
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

const BuyForm = (props) => {
  const [data, setData] = useState([]);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [value, setValue] = useState();
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
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

  const buy = () => {
    const total = quantity * price;
    let currentQuantity = 0;

    const { firebaseApp } = props;
    const db = getDatabase(firebaseApp);

    if (total <= currentBalance) {
      // console.log(data);

      onValue(ref(db, "portfolio/"), (snapshot) => {
        const data = snapshot.val();
        // console.log(data);
        if (data?.holdings) {
          for (const holding of Object.values(data.holdings)) {
            if (`${holding.exchDisp}:${holding.symbol}` === value) {
              currentQuantity = holding.quantity;
            }
          }
        }
      });

      data.forEach((item) => {
        if (`${item.exchDisp}:${item.symbol}` === value) {
          // console.log(item);
          set(
            ref(
              db,
              `portfolio/holdings/${item.exchDisp}:${item.symbol.replace(
                /[.#$[\]]/g,
                "-"
              )}`
            ),
            {
              exchange: item.exchange,
              shortname: item.shortname,
              quoteType: item.quoteType,
              symbol: item.symbol,
              index: item.index,
              score: item.score,
              typeDisp: item.typeDisp,
              longname: item.longname,
              exchDisp: item.exchDisp,
              isYahooFinance: item.isYahooFinance,
              regularMarketPrice: price,
              quantity: currentQuantity + quantity,
            }
          );
          setCurrentBalance(currentBalance - total);
          set(
            ref(db, `portfolio/balance`),
            (currentBalance - total).toFixed(2)
          );
        }
      });
      setSuccess(true);
    } else {
      setError(true);
    }
  };

  return (
    <div>
      <header>
        <h1 style={{ marginTop: "10px" }}>Buy Stock</h1>
        <p style={{ marginTop: "10px" }}>Current Balance: ${currentBalance}</p>
      </header>
      {error && (
        <Alert
          message="Error"
          description="You don't have enough balance to buy this stock."
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
          <Form.Item label="Company Name">
            <SearchInput
              data={data}
              setData={setData}
              value={value}
              setValue={setValue}
              setPrice={setPrice}
              setLoading={setLoading}
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
              value={quantity}
              onChange={(value) => setQuantity(value)}
              style={{
                width: "100%",
              }}
            />
          </Form.Item>
          <Form.Item label="Price Per Share">
            <InputNumber
              min="0"
              addonAfter="$"
              value={price}
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
              onClick={buy}
            >
              BUY
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
export default BuyForm;
