require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.IO — khởi tạo sẵn, sẽ dùng ở phase sau
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});
app.set('io', io);
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`Socket disconnected: ${socket.id}`));
});

connectDB()
  .then(() => {
    const { startStockReleaseJob } = require('./src/jobs/stockRelease.job');
    startStockReleaseJob();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
