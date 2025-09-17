import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface Users {
  socket: WebSocket;
  roomId: string;
}
let allSockets: Users[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      if (parsedMessage.type === "join") {
        const roomId = parsedMessage.payload.roomId;
        const name = parsedMessage.payload.name;

        allSockets.push({ socket, roomId });

        const socketsInRoom = allSockets.filter((x) => x.roomId === roomId);
        const usersInARoom = socketsInRoom.length;

        for (const user of socketsInRoom) {
          user.socket.send(
            JSON.stringify({
              type: "system",
              message: `${name} joined room: ${roomId}`,
              userCount: usersInARoom,
            })
          );
        }
      }

      if (parsedMessage.type === "chat") {
        const currentUserRoom = allSockets.find(
          (x) => x.socket === socket
        )?.roomId;
        if (!currentUserRoom) return;

        const socketsInRoom = allSockets.filter(
          (x) => x.roomId === currentUserRoom
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
      const roomId = allSockets[userIndex]?.roomId;
      allSockets.splice(userIndex, 1);

      // const socketsInRoom = allSockets.filter((x) => x.roomId === roomId);
      // const usersInARoom = socketsInRoom.length;

      // for (const user of socketsInRoom) {
      //   user.socket.send(
      //     JSON.stringify({
      //       type: "system",
      //       message: `A user left room: ${roomId}`,
      //       userCount: usersInARoom,
      //     })
      //   );
      // }
    }
  });
});
