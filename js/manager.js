function connect() {
  var ip = query.get("ip") || "localhost";
  var port = query.get("port") || 6557;

  var socket = new WebSocket(`ws://${ip}:${port}/socket`);

  socket.addEventListener("open", () => {
    console.log("WebSocket opened");
    is_connect_http = true;
    updateStatus();
  });

  socket.addEventListener("message", (message) => {
    var data = JSON.parse(message.data);
    var event = events[data.event];

    if (event) {
      event(data);
    }
  });

  socket.addEventListener("close", () => {
    console.log("Failed to connect to HttpSoraStatus server, retrying in 3 seconds");
    is_connect_http = false;
    updateStatus();
    setTimeout(connect, 3000);
  });
}

function connectMulti(){
  var ip = query.get("multi_ip") || "ws://localhost:2948/socket";

  var socket = new WebSocket(ip);

  socket.addEventListener("open", () => {
    console.log("WebSocket opened");
    is_connect_multi = true;
    updateStatus();
  });

  socket.addEventListener("message", (message) => {
    var data = JSON.parse(message.data);
    console.log("MultiplayerPlus message received:", data); 
    if (data._type === "handshake") {
      console.log("MultiplayerPlus handshake received:", data);
      userID = data.LocalUserID;
      console.log("Player ID set to:", userID);
    }
  });

  socket.addEventListener("close", () => {
    console.log("Failed to connect to MultiplayerPlus server, retrying in 3 seconds");
    is_connect_multi = false;
    updateStatus();
    setTimeout(connectMulti, 3000);
  });
}

function connectScore() {
  score_server = query.get("score_ip") || "https://web.dogesato.com/api/postScore";

  try {
    fetch("https://web.dogesato.com/api/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => {
      if (response.ok) {
        is_connect_score = true;
        updateStatus();
        console.log("Connected to score server successfully");
      } else {
        throw new Error("Failed to connect to score server");
      }
    }).catch(error => {
      console.error("Error connecting to score server:", error);
      is_connect_score = false;
      updateStatus();
      setTimeout(connectScore, 3000);
    });
  } catch (error) {
    console.error("Error connecting to score server:", error);
    is_connect_score = false;
    updateStatus();
    setTimeout(connectScore, 3000);
  }
}

function updateStatus() {
  if (!is_connect_http || !is_connect_multi || !is_connect_score) {
    document.getElementById("alert").style.display = "block";
    console.log(is_connect_score)
    // スコア送信サーバーの表示制御
    if (!is_connect_score) {
      document.getElementById("scoreServer").textContent = "スコア送信サーバーへ接続できません";
    } else {
      document.getElementById("scoreServer").style.display = "none";
    }
    // HttpSiraStatusの表示制御
    if (!is_connect_http) {
      document.getElementById("httpStatus").textContent = "HttpSiraStatusを検出できません";
    } else {
      document.getElementById("httpStatus").style.display = "none";
    }

    // MultiplayerPlusの表示制御
    if (!is_connect_multi) {
      document.getElementById("multiplayerPlus").textContent = "MultiplayerPlusを検出できません";
    } else {
      document.getElementById("multiplayerPlus").style.display = "none";
    }

  } else {
    document.getElementById("alert").style.display = "none";
  }
}


setTimeout(connect, 1000);
setTimeout(connectMulti, 1000);
setTimeout(connectScore, 1000);
