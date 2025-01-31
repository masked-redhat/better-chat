const friendBtn = document.getElementById("frndBtn");
const channelBtn = document.getElementById("channelBtn");
const friends = document.getElementById("friends");
const channels = document.getElementById("channels");
const logOutBtn = document.getElementById("logout");
// const notifBar = document.getElementById('notifications');
const searchBtn = document.getElementById("search");
const searchText = document.getElementById("searchText");
const chatSection = document.getElementById("chat");
const currentOnlineFs = document.getElementById("friendsNumberOnline");
const channelCreationBtn = document.getElementById("createChannelButton");
const profileBtn = document.getElementById("person");

const socket = io();

socket.on("chatFrom", (params) => {
  let doc = false;
  if (params.type == "f") {
    doc = document.getElementById(`newChats${params.user}${params.type}`);
  } else {
    doc = document.getElementById(`newChats${params.channel}${params.type}`);
  }
  if (doc) {
    doc.appendChild(
      createChatCardOldChats({ user: params.user, text: params.text })
    );
  }
  scrollBottom();
});

socket.on("onlineFriends", (val) => {
  let online = Number(currentOnlineFs.textContent) + val[0];
  currentOnlineFs.textContent = online >= 0 ? online : 0;
  socket.emit("OnlineFriend", val);
});

socket.on("OnlineFriend", (val) => {
  let online = Number(currentOnlineFs.textContent) + val;
  currentOnlineFs.textContent = online >= 0 ? online : 0;
});

socket.on("friendAdded", (val) => {
  loadChannelsAndFriends();
  socket.emit("friendAdded", val);
});

const checkAndAdjustChannelFriendBtns = () => {
  if (friendBtn.dataset.open == "false") {
    friends.classList.add("absolute");
    friends.classList.add("h-0");
    friendBtn.innerHTML = friendBtn.innerHTML.replace("_up", "_down");
  } else {
    friends.classList.remove("absolute");
    friends.classList.remove("h-0");
    friendBtn.innerHTML = friendBtn.innerHTML.replace("_down", "_up");
  }
  if (channelBtn.dataset.open == "false") {
    channels.classList.add("absolute");
    channels.classList.add("h-0");
    channelBtn.innerHTML = channelBtn.innerHTML.replace("_up", "_down");
  } else {
    channels.classList.remove("absolute");
    channels.classList.remove("h-0");
    channelBtn.innerHTML = channelBtn.innerHTML.replace("_down", "_up");
  }
};

friendBtn.onclick = () => {
  friendBtn.dataset.open = friendBtn.dataset.open == "open" ? "false" : "open";
  checkAndAdjustChannelFriendBtns();
};

channelBtn.onclick = () => {
  channelBtn.dataset.open =
    channelBtn.dataset.open == "open" ? "false" : "open";
  checkAndAdjustChannelFriendBtns();
};

logOutBtn.onclick = async () => {
  await fetch("/auth/logout");
  socket.disconnect();
  socket.close();
  location.href = "/";
};

searchBtn.onclick = () => {
  if (searchText.classList.contains("bottom-full")) {
    searchText.classList.remove("bottom-full");
    searchText.classList.add("-bottom-full");
  } else {
    searchText.classList.remove("-bottom-full");
    searchText.classList.add("bottom-full");
  }
  searchText.focus();
  if (searchText.value != "") {
    searchText.dispatchEvent(
      new KeyboardEvent("keypress", {
        key: "Enter",
        code: "Enter",
        which: 13,
        keyCode: 13,
      })
    );
  }
};

profileBtn.onclick = () => {
  chatSection.textContent = "";
  let div = document.createElement("div");
  chatSection.appendChild(div);
  div.outerHTML = `<div class="flex h-full w-full items-center justify-center flex-col gap-2 text-xl"><span class="material-symbols-outlined select-none text-5xl">person</span><span class="text-green-300"><span class="text-white mr-2 select-none">@</span><span class="select-text tracking-wider">${sessionStorage.getItem(
    "username"
  )}</span></span>
    <button class="px-4 py-1 rounded-md bg-gray-600 mt-5" onclick="logOutBtn.click()">Logout</button></div>`;
};

searchText.addEventListener("keypress", async (e) => {
  if (e.key == "Enter") {
    if (e.target.value.trim() == "") {
      chatSection.textContent = "";
      return;
    }
    e.target.blur();
    let searchRes = await fetch("/home/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: e.target.value.trim() }),
    });
    searchRes = await searchRes.json();

    chatSection.textContent = "";

    for (const res of searchRes) {
      let name, icon;
      if (res.type == "c") {
        icon = "tag";
      } else {
        icon = "alternate_email";
      }
      if (res.channel) {
        name = res.channel;
      } else {
        name = res.user;
      }
      let div = document.createElement("div");
      chatSection.appendChild(div);
      div.outerHTML = `<div class="result p-4 w-full border-b border-b-gray-600 flex items-center justify-between gap-2"><span class='text-base flex items-center gap-1'><span class="material-symbols-outlined">${icon}</span>${name}</span><button class="px-3 py-1 bg-white text-black font-semibold" data-user="${name}" data-type="${
        res.type
      }" onclick="followCommand(this)">${
        icon != "tag" ? "Add Friend" : "Join Channel"
      }</button></div>`;
      chatSection.appendChild(div);
    }
  }
});

const followCommand = async (e) => {
  let usr = e.dataset.user;
  let typ = e.dataset.type;
  let res = await fetch("/home/join", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user: usr, type: typ }),
  });
  res = await res.json();
  e.disabled = true;
  e.textContent = "Friend";
  await loadChannelsAndFriends();
  if (typ == "c") {
    e.disabled = true;
    e.textContent = "Joined";
    return;
  }
  socket.emit("addFriend", usr);
};

const loadChannelsAndFriends = async () => {
  channels.textContent = "";
  friends.textContent = "";
  let chnls = await fetch("/home/connections");
  chnls = await chnls.json();

  for (const channel of chnls.channels) {
    let div = document.createElement("div");
    channels.appendChild(div);
    div.outerHTML = `<button class="channel hover:bg-gray-700 relative text-right" data-type="c" data-name="${channel.slice(
      1
    )}" onclick="loadChats(this)">${channel.slice(1)}</button>`;
  }

  for (const frnd of chnls.friends) {
    let div = document.createElement("div");
    friends.appendChild(div);
    div.outerHTML = `<button class="channel hover:bg-gray-700 relative text-right" data-type="f" data-name="${frnd.slice(
      1
    )}" onclick="loadChats(this)">${frnd.slice(1)}</button>`;
  }
};

const loadChats = async (e) => {
  let data = await fetch("/home/getchat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: e.dataset.name, type: e.dataset.type }),
  });
  data = await data.json();

  chatSection.textContent = "";

  chatSection.innerHTML = `<div class="flex flex-col gap-2 items-center p-1" id="oldChats"></div>
<div class="my-auto h-full p-1 w-full flex flex-col gap-2" id="newChats${e.dataset.name}${e.dataset.type}"></div><form id="chatForm" onsubmit="return false;" class="sticky bottom-0 flex items-center p-1 bg-gray-600 gap-2 mb-[0!important]"><input type="text" class="bg-gray-900 h-full w-full rounded-md scrollbar p-2 outline-none tracking-wide" placeholder="Type here..."><button class="material-symbols-outlined p-3 flex items-center justify-center rounded-md bg-green-300 text-black mt-auto outline-none" onclick="sendChat('${e.dataset.name}', '${e.dataset.type}')">send</button></form>`;

  for (const chat of data) {
    document
      .getElementById("oldChats")
      .appendChild(createChatCardOldChats(chat));
  }
  scrollBottom();
};

const createChatCardOldChats = (data) => {
  let div = document.createElement("div");
  div.classList.add("chat");
  if (data.user == sessionStorage.getItem("username")) {
    div.classList.add("me");
  } else {
    div.classList.add("other");
  }
  div.innerHTML = `<span class="chatname">${data.user}</span><p class="chatmessage" style="">${data.text}</p>`;
  return div;
};

const scrollBottom = () => {
  chatSection.scrollTop = chatSection.scrollHeight;
};

channelCreationBtn.onclick = () => {
  chatSection.textContent = "";
  let div = document.createElement("form");
  chatSection.appendChild(div);
  div.outerHTML = `<form onsubmit="return false;" class="w-full h-full flex flex-col gap-4 p-4 justify-center"><input type="text" placeholder="Channel name" id="channelNameCreateInput" name="channelName" class="bg-transparent px-4 pb-2 text-lg text-center outline-none border-b border-b-slate-600"><button class="p-3 border border-green-700 hover:bg-green-700 rounded-md font-bold tracking-wider outline-none" onclick="createChannelAndBoom()" id="createChannel">Create Channel</button></form>`;
};

const createChannelAndBoom = async () => {
  let channelName = document
    .getElementById("channelNameCreateInput")
    .value.trim();
  if (channelName != "") {
    let res = await fetch(`/home/create?channelName=${channelName}`);
    res = await res.json();

    chatSection.textContent = "";
    if (res.status != "DENIED") {
      loadChannelsAndFriends();
      let div = document.createElement("div");
      chatSection.appendChild(div);
      div.outerHTML = `<div class="flex items-center justify-center flex-col select-none"><span class="material-symbols-outlined p-8 text-7xl text-green-300">done</span><span class="text-xl text-green-300">Channel Created</span><span class="text-xl bg-gray-700 mt-5 px-3 py-1 rounded-md">Check your channels section</span></div>`;
    } else {
      let div = document.createElement("div");
      chatSection.appendChild(div);
      div.outerHTML = `<div class="flex items-center justify-center flex-col select-none"><span class="material-symbols-outlined p-8 text-7xl text-red-700">close</span><span class="text-xl text-red-700 font-bold">Channel Name already acquired</span><span
            class="text-xl bg-gray-700 mt-5 px-3 py-1 rounded-md">Retry by clicking 'Create Channel' Button</span></div>`;
    }
  }
};

const sendChat = (channelName, channelType) => {
  const form = document.getElementById("chatForm");
  let inputText = form.firstElementChild.value.trim();
  form.firstElementChild.value = "";
  if (inputText == "") {
    return;
  }
  let doc = document.getElementById(`newChats${channelName}${channelType}`);
  doc.appendChild(
    createChatCardOldChats({
      user: sessionStorage.getItem("username"),
      text: inputText,
    })
  );
  socket.emit("chat", [inputText, channelName, channelType]);
  scrollBottom();
};

// const loadNotifications = async () => {
//     let notifications = await fetch('/home/notifications');
//     notifications = await notifications.json();

//     for (const n of notifications) {
//         let name = n.split(' ')[0]
//         let channel = n.split(' ').slice(1).join(' ');
//         let div = document.createElement('div');
//         notifBar.appendChild(div);
//         div.outerHTML = `<div class="notify flex flex-col p-2  border-b border-b-gray-600 relative">
//         <span><span class="font-bold tracking-wide text-lg">${name}</span> messaged</span>
//         <span class="text-xs">in <span class="text-base text-sky-400">${channel}</span></span>
//         <button
//             class="closeNotification flex w-6 h-6 text-sm absolute right-3 top-3 hover:bg-gray-500  rounded-md"><span
//                 class="material-symbols-outlined">
//                 close
//             </span></button>
//     </div>`;
//     }
// }

const getUserName = async () => {
  let name = await fetch("/home/name");
  name = await name.text();
  sessionStorage.setItem("username", name);
  socket.emit("namesetup", sessionStorage.getItem("username"));
};

loadChannelsAndFriends();
// loadNotifications();
getUserName();
