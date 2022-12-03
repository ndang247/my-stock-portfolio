import "./App.css";
import { Routes, Route } from "react-router-dom";
import {
  NavMenu,
  MyPortfolio,
  CashAccounts,
  BuyForm,
  SellForm,
  AddCashForm,
  RemoveCashForm,
} from "./components";
import { Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBG6g7Z_2m648Qe2aY-OEJXCvn5mQUqSTk",
  authDomain: "my-stock-portfolio-9a843.firebaseapp.com",
  databaseURL:
    "https://my-stock-portfolio-9a843-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-stock-portfolio-9a843",
  storageBucket: "my-stock-portfolio-9a843.appspot.com",
  messagingSenderId: "981700905877",
  appId: "1:981700905877:web:9497d5e8b2adfc2073c49c",
  measurementId: "G-XWZ2BJB7T2",
};

const app = initializeApp(firebaseConfig);

function App() {
  return (
    <div className="App">
      <Layout>
        <Header style={{ backgroundColor: "#f5f5f5" }}>
          <div className="Menu">
            <NavMenu />
          </div>
        </Header>
        <Content style={{ padding: "0 50px" }}>
          <div className="Main">
            <Routes>
              <Route path="/" element={<MyPortfolio firebaseApp={app} />} />
              <Route
                path="/balance"
                element={<CashAccounts firebaseApp={app} />}
              />
              <Route path="/buy" element={<BuyForm firebaseApp={app} />} />
              <Route path="/sell" element={<SellForm firebaseApp={app} />} />
              <Route path="/add" element={<AddCashForm firebaseApp={app} />} />
              <Route
                path="/remove"
                element={<RemoveCashForm firebaseApp={app} />}
              />
            </Routes>
          </div>
        </Content>
      </Layout>
    </div>
  );
}

export default App;
