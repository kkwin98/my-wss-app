var ws;
var userName;
var field = document.getElementById('field');
var currentRoomId;

function connect() {
    
    userName = document.getElementById('userName').value;

    ws = new WebSocket(`ws://localhost:3000/user/${userName}`);
    
    ws.onopen = (event) => {
        console.log('[Client] Connection Open');
    }
    
    ws.onmessage = (event) => {
        console.log('[Client] msg receieved : ' + event.data);

        var res = JSON.parse(event.data);

        if(res.type == 'response') {
            if(res.cmd == 'enterRoom') {
                var p = document.createElement('p');
                p.innerHTML=res.msg
                field.append(p);
            } else if(res.cmd == 'broadCast') {
                var p = document.createElement('p');
                var inLine = `${res.from}: ${res.msg}`;
                p.innerHTML = inLine;
                field.append(p);
            }
        }
    }
    
    ws.onclose = (event) => {
        console.log(`[Client] Connection closed, {${event.reason}}`)
    }
}

function enterRoom(roomId) {
    currentRoomId = roomId;
    roomName = document.getElementById(roomId).getAttribute('name');

    var req = {
        cmd:'enterRoom',
        roomId:roomId,
        roomName:roomName,
        userName:userName            
    }

    if(ws!= undefined && ws.readyState == WebSocket.OPEN) {
        ws.send(JSON.stringify(req));
    } else {
        alert('채팅방에 입장하여 주시기 바랍니다.')
    }
}

function send() {

    var msg = document.getElementById('msg').value;

    var req = {
        cmd: 'broadCast',
        to: currentRoomId,
        from: userName,
        msg: msg
    }
    console.log(req);
    if(ws!= undefined && ws.readyState == WebSocket.OPEN) {
        ws.send(JSON.stringify(req))
    } else {
        alert('채팅방에 입장하여 주시기 바랍니다.')
    }

    var p = document.createElement('p');
    p.align = 'right';
    p.innerHTML = msg
    field.append(p);
}