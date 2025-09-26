const express = require("express");

const keccak256 = require("ethereum-cryptography/keccak.js").keccak256;
const secp256k1 = require("ethereum-cryptography/secp256k1").secp256k1;
const utf8ToBytes = require('ethereum-cryptography/utils').utf8ToBytes;

const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0395c6413d01dc8f927f4b7098f7dcc1292e0e06ec9bd25b0def50fb23d9ba3c4d": 100,
  "02899c466f2ff9ab75a9f89d0d0a8eb40a49a6bb9742c21a9a61042e6154a21fce": 50,
  "0226e2d25e27523aee83132e80237f31d784e8234f69a93fee2aacf4f46598e4cd": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const transaction = req.body;
  console.log(transaction);
  const { sender, recipient, amount, hexSign } = transaction;
  const message = `${sender}:${recipient}:${amount}`;
  const messageHash = keccak256(utf8ToBytes(message));
  const isSigned = secp256k1.verify(hexSign, messageHash, sender);
  if (isSigned){
    setInitialBalance(sender);
    setInitialBalance(recipient);
  
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
  else {
    res.status(400).send({ message: "Not signed!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
