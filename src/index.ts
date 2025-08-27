import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
let user = 0;
let allSockets = [];
wss.on("connection", (socket) => {
  console.log("User Connected");
  socket.send("Connection Established !!")
  allSockets.push(socket);
  user++;
  socket.on("message", (message) => {
    console.log(message);
    setTimeout(() => {
      allSockets.forEach((s) => {
        s.send(`${message}: came back from server.`);
      });
    }, 500);
  });
});
