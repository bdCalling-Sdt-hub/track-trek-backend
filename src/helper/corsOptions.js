const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5175",
    "http://localhost:5174",
    "http://localhost:5179",
    "http://10.0.60.26:8080",
    "http://localhost:5173",
    "http://10.0.60.24:5173",
    "http://10.0.60.24:3003",
    "http://209.97.134.184:8002",
  ],
  credentials: true,
};

module.exports = corsOptions;
