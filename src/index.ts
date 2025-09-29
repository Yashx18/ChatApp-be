import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Users {
  socket: WebSocket;
  roomId: string;
  name: string; // ✅ add name
}
let allSockets: Users[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const roomId = parsedMessage.payload.roomId;
        const name = parsedMessage.payload.name;

        allSockets.push({ socket, roomId, name }); // ✅ store name

        const socketsInRoom = allSockets.filter((x) => x.roomId === roomId);
        const usersInARoom = socketsInRoom.length;

        for (const user of socketsInRoom) {
          user.socket.send(
            JSON.stringify({
              type: "system",
              message: `${name} joined room`,
              userCount: usersInARoom,
            })
          );
        }
      }

      if (parsedMessage.type === "chat") {
        const currentUser = allSockets.find((x) => x.socket === socket);
        if (!currentUser) return;

        const socketsInRoom = allSockets.filter(
          (x) => x.roomId === currentUser.roomId
        );
        const usersInARoom = socketsInRoom.length;

        for (const user of socketsInRoom) {
          if (user.socket !== socket) {
            user.socket.send(
              JSON.stringify({
                type: "chat",
                name: parsedMessage.payload.name,
                message: parsedMessage.payload.message,
                userCount: usersInARoom,
              })
            );
          }
        }
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  socket.on("close", () => {
    const userIndex = allSockets.findIndex((x) => x.socket === socket);
    if (userIndex !== -1) {
      const { roomId, name } = allSockets[userIndex]!; 
      allSockets.splice(userIndex, 1);

      const socketsInRoom = allSockets.filter((x) => x.roomId === roomId);
      const usersInARoom = socketsInRoom.length;

      for (const user of socketsInRoom) {
        user.socket.send(
          JSON.stringify({
            type: "system",
            message: `${name} left room`, 
            userCount: usersInARoom,
          })
        );
      }
    }
  });
});
