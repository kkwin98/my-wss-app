/* Module */
const http = require('http')
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const WebSocketServer = require('ws').WebSocketServer;
/* Module */

/* HTTP */
// Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'))
})
// Static
app.use(express.static('public'));
// Listen
const server = http.createServer(app).listen(port, ()=>{
    console.log('Example app listening on port 3000');
});
/* HTTP */

/* ChatRoom */
class ChatRoom {

    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.members = new Array();
    }

    boradCast(data, isBinary) {
        this.members.forEach(user => {

            console.log(`Send [${data}] to [${user.name}]`);

            user.socket.send(data, {binary:isBinary});
        })
    }

}

class User {
    constructor(id, name, socket) {
        this.id = id;
        this.name = name;
        this.socket = socket;
    }
}
const users = new Map();

const room_1 = new ChatRoom('room-1','동물의왕국');
const room_2 = new ChatRoom('room-2','걸어서세계속으로');
const room_3 = new ChatRoom('room-3','무한도전');

const rooms = new Map();
rooms.set(room_1.id, room_1);
rooms.set(room_2.id, room_2);
rooms.set(room_3.id, room_3);

/* WebSocket */
// Constant
const ERR_CODE_INVALID_ACCESS = 1003;
const ERR_MSG_USER_NOT_DEFINE = 'A user is not defined properly';
// Constructor
const wss = new WebSocketServer({
    server:server
});
// Event (connection)
wss.on('connection', (ws, req) => {

    const ip = req.socket.remoteAddress;
    console.log(`[WebSocketServer] Conncection From ${[ip]}`)

    const url = req.url;
    const userPath = "/user";
    var userName;
    if(url.startsWith(userPath)) {
        userName = url.substring(userPath.length + 1, url.length);
    } else {
        ws.close(WS_ERR_INVALID_ACCESS, ERR_MSG_USER_NOT_DEFINE);
    }
    users.set(userName, new User(ip, userName, ws));    
    console.log(`[WebSocketServer] User name : ${userName}`);

    const clientCount = users.size;
    console.log(`[WebSocketServer] Total Clinet : ${clientCount}`);

    ws.on('message', (data, isBinary) => {
        var req = JSON.parse(data);
        console.log(req)
        if(req.cmd == 'enterRoom') {
            var roomId = req.roomId;
            var roomName = req.roomName;
            var userName = req.userName;
            rooms.forEach((room) => {
                if(room.id == req.roomId) {    
                    room.members.push(users.get(userName));
                    var rtnMsg = {
                        type: 'response',
                        cmd: req.cmd
                    }
                    room.members.forEach((user)=>{
                        if(userName != user.name)  {
                            rtnMsg.msg = `${userName}님이 접속하셨습니다`;
                        } else {
                            rtnMsg.msg = `${roomName}에 접속했습니다`;
                        }
                        user.socket.send(JSON.stringify(rtnMsg));
                    });
                } else {
                    room.members.pop(users.get(userName));
                }
            })
        } else if(req.cmd == 'broadCast' ) {
            var msg = req.msg;
            var roomId = req.to;
            var userName = req.from;
            var res = {
                type:'response',
                cmd:req.cmd,
                from:req.from,
                msg:req.msg
            }
            rooms.get(roomId).members.forEach((user) => {
                if(user.name != userName) {
                    user.socket.send(JSON.stringify(res));
                }
            })
        } else {
            console.log('Invalid Command');
        }
    });

});
/* WebSocket */