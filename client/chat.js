var chatlist; //[{name:"aa",id:"21"}]
// http://www.websocket.org/echo.html
var login = "";
var userID = "";
var msglist = new Msglistclass(); // klasa msglist.add(idChat,nick,text) nick 0 = orginalny nick 1 = ja
var button = document.querySelector("#send"),
    output = document.querySelector("#output"),
    textarea = document.querySelector("textarea"),
    wsUri = "ws://127.0.0.1:4649/Chat",
    websocket = new WebSocket(wsUri);
button.addEventListener("click", onClickButton);

function Msglistclass() {
    this.list = [];
    this.isActiveList = [];
    this.add = function(idChat, nick, text) {
        if (nick == 1) nick = login;
        else {
            nick = chatlist.find(e => e.id === idChat).name;
        }
        if (this.list[idChat] == undefined) {
            this.list[idChat] = [];
            this.isActiveList[idChat] = 0;
        }

        this.isActiveList[idChat] = this.isActiveList[idChat] + 1;
        document.getElementById(idChat).children[0].innerHTML = this.isActiveList[idChat];
        this.list[idChat].push([nick, text]);
        if (userID == idChat) output.innerHTML = output.innerHTML + "<p><b>" + nick + ": </b>" + text + "</p>";
    };
    this.remove = function(idChat) {
        this.list[idChat] = undefined;
        if (userID == idChat) {
            document.getElementById('activemsg').innerHTML = "<b>Wybierz użytkownika do pisania z listy po lewej stronie</b>";
            userID = "";
            output.innerHTML = "";
        }
    };
    this.writeActiveOnScreen = function() {
        output.innerHTML = "";
        //output.innerHTML="";console.log(userID);console.log(this.list[userID]);console.log(this.list[userID].length);
        if (msglist.list[userID] == undefined) msglist.list[userID] = [];
        for (var i = 0; i < msglist.list[userID].length; i++) {
            output.innerHTML = output.innerHTML + "<p><b>" + msglist.list[userID][i][0] + ": </b>" + msglist.list[userID][i][1] + "</p>";
        }
        var user = chatlist.find(e => e.id === userID);


    };


}


websocket.onopen = function(e) {
    writeToScreen("CONNECTED");
    //doSend("WebSocket rocks");
    statusWindow(2);
};

websocket.onclose = function(e) {
    //writeToScreen("DISCONNECTED");
    statusWindow(5);
};


websocket.onerror = function(e) {
    // writeToScreen("<span class=error>ERROR:</span> " + e.data);
    statusWindow(3);
};

websocket.onmessage = function(e) {
    var text = e.data.substr(1);
    console.log(e.data)
    switch (e.data[0]) {
        case '1': // nick zajęty
            statusWindow(4);
            break;
        case '2': // ustawiono nick
            login = document.getElementById("nick").value;
            document.getElementById('user').innerHTML = "Witaj użytkowniku " + login;
            statusWindow(1);
            break;
        case '3': // Lista online
            console.log(text);
            updatelist(text);
            break;
        case '4': // Przychodząca wiadomość [id,text]
            reciveMsg(text);
            break;
        case '5': // Usuń zdisconectowanego użytkownika
            msglist.remove(text);
            break;


    }
}

function writeToScreen(message, classs) {
    output.insertAdjacentHTML("afterbegin", "<p class='", classs, "'>" + message + "</p>");
}

function onClickButton() {
    var text = textarea.value;
    if (text != "" && userID != "") sendMessage(userID, text)
    textarea.value = "";
    textarea.focus();
}

function sendMessage(id, text) {
    websocket.send("1" + JSON.stringify([id, text]));
    msglist.add(id, 1, text);

}

function setNickname() {
    websocket.send("0" + document.getElementById('nick').value);
}

function changeUserId(id) {
    userID = id;
    msglist.isActiveList[id] = 0;
    msglist.writeActiveOnScreen();
    document.getElementById('activemsg').innerHTML = "<b>" + chatlist.find(e => e.id === userID).name + "</b>";
}

function updatelist(text) {
    chatlist = JSON.parse(text); //[{name,id},{name,id}]
    x = document.getElementById("linki");
    x.innerHTML = "";
    for (var i = 0; i < chatlist.length; i++) {
        if (chatlist[i].name != login) {
            if (msglist.isActiveList[chatlist[i].id] != undefined) var count = msglist.isActiveList[chatlist[i].id];
            else count = 0;
            str = "<p  id='" + chatlist[i].id + "' onclick=\"changeUserId('" + chatlist[i].id + "')\" >" + chatlist[i].name + " (<span>" + count + "</span>)</p>";
            x.innerHTML = x.innerHTML + str;
        }
    }

}

function reciveMsg(text) {
    console.log(text);
    msg = JSON.parse(text); // Przychodząca wiadomość [id,text]
    msglist.add(msg[0], 0, msg[1]);

}

function statusWindow(x) {
    var statusdiv = document.getElementById("statusdiv");
    var status = document.getElementById("status");
    var lform = document.getElementById("loginform");
    switch (x) {
        case 1: // brak okna statusu
            statusdiv.style.display = "none";
            //status.style.display = "none";
            lform.style.display = "none";
            break;
        case 2: // połączono
            status.innerHTML = "Połączono wprowadź nick.";
            lform.style.display = "block";
            break;
        case 3: // nie udało się połączyć;
            status.innerHTML = "Nie udało się połączyć";
            break;
        case 4: // Ten nick jest zajęty
            status.innerHTML = "Ten nick jest zajęty lub zbyt krótki <p> spróbuj ponownie!";
            break;
        case 5: // Rozłaczono
            statusWindow(1);
            statusdiv.style.display = "block";
            status.innerHTML = "Serwer jest offline.";
            break;

    }
}