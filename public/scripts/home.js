const friendBtn = document.getElementById("frndBtn");
const channelBtn = document.getElementById("channelBtn");
const friends = document.getElementById("friends");
const channels = document.getElementById("channels");
const logOutBtn = document.getElementById("logout");
const notifBar = document.getElementById('notifications');
const searchBtn = document.getElementById('search');
const searchText = document.getElementById('searchText');
const chatSection = document.getElementById("chat");
const currentOnlineFs = document.getElementById('friendsNumberOnline');


const socket = io();

socket.on('chatFrom', (params) => {
    let doc = document.getElementById(`newChats${params.user}${params.type}`);
    if (doc) {
        doc.appendChild(createChatCardOldChats({ user: params.user, text: params.text }));
    }
    scrollBottom();
})

socket.on('onlineFriends', (val) => {
    let online = Number(currentOnlineFs.textContent) + val[0];
    currentOnlineFs.textContent = online >= 0 ? online : 0;
    socket.emit('OnlineFriend', val);
})

socket.on('OnlineFriend', (val) => {
    let online = Number(currentOnlineFs.textContent) + val;
    currentOnlineFs.textContent = online >= 0 ? online : 0;
})

socket.on('friendAdded', (val)=>{
    loadChannelsAndFriends();
    socket.emit('friendAdded', val);
})

const checkAndAdjustChannelFriendBtns = () => {
    if (friendBtn.dataset.open == 'false') {
        friends.classList.add("absolute");
        friends.classList.add("h-0");
        friendBtn.innerHTML = friendBtn.innerHTML.replace('_up', '_down');
    }
    else {
        friends.classList.remove("absolute");
        friends.classList.remove("h-0"); friendBtn.innerHTML = friendBtn.innerHTML.replace('_down', '_up');
    }
    if (channelBtn.dataset.open == 'false') {
        channels.classList.add("absolute");
        channels.classList.add("h-0"); channelBtn.innerHTML = channelBtn.innerHTML.replace('_up', '_down');
    }
    else {
        channels.classList.remove("absolute");
        channels.classList.remove("h-0"); channelBtn.innerHTML = channelBtn.innerHTML.replace('_down', '_up');
    }
}

friendBtn.onclick = () => {
    friendBtn.dataset.open = friendBtn.dataset.open == "open" ? "false" : "open";
    checkAndAdjustChannelFriendBtns();
}

channelBtn.onclick = () => {
    channelBtn.dataset.open = channelBtn.dataset.open == "open" ? "false" : "open";
    checkAndAdjustChannelFriendBtns();
}

logOutBtn.onclick = async () => {
    await fetch("/auth/logout");
    location.href = location.href;
}

searchBtn.onclick = () => {
    if (searchText.classList.contains('bottom-full')) {
        searchText.classList.remove('bottom-full')
        searchText.classList.add('-bottom-full')
    }
    else {
        searchText.classList.remove('-bottom-full')
        searchText.classList.add('bottom-full')
    }
}

searchText.addEventListener('keypress', async (e) => {
    if (e.key == 'Enter') {
        if (e.target.value.trim() == '') {
            chatSection.textContent = '';
            return;
        }
        e.target.blur();
        let searchRes = await fetch('/home/search', {
            method: "POST", headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ text: e.target.value.trim() })
        })
        searchRes = await searchRes.json();

        chatSection.textContent = '';

        for (const res of searchRes) {
            let name, icon;
            if (res.type == "c") {
                icon = "tag";
            } else { icon = "alternate_email" }
            if (res.name) {
                name = res.name;
            } else { name = res.user }
            let div = document.createElement('div');
            chatSection.appendChild(div);
            div.outerHTML = `<div class="result p-4 w-full border-b border-b-gray-600 flex items-center justify-between gap-2"><span class='text-base flex items-center gap-1'><span class="material-symbols-outlined">${icon}</span>${name}</span><button class="px-3 py-1 bg-white text-black font-semibold" data-user="${name}" data-type="${res.type}" onclick="followCommand(this)">Add Friend</button></div>`
            chatSection.appendChild(div);

        }
    }
})

const followCommand = async (e) => {
    let usr = e.dataset.user;
    let typ = e.dataset.type
    let res = await fetch('/home/join', {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: usr, type: typ })
    })
    res = await res.json();
    e.disabled = true;
    e.textContent = 'Friend';
    await loadChannelsAndFriends();
    socket.emit('addFriend', usr);
}

const loadChannelsAndFriends = async () => {
    channels.textContent = '';
    friends.textContent = '';
    let chnls = await fetch('/home/friends');
    chnls = await chnls.json();

    for (const channel of chnls.channels) {
        let div = document.createElement('div');
        channels.appendChild(div);
        div.outerHTML = `<button class="channel hover:bg-gray-700 relative text-right" data-type="c" data-name="${channel.slice(1)}" onclick="loadChats(this)">${channel.slice(1)}</button>`
    }

    for (const frnd of chnls.friends) {
        let div = document.createElement('div');
        friends.appendChild(div);
        div.outerHTML = `<button class="channel hover:bg-gray-700 relative text-right" data-type="f" data-name="${frnd.slice(1)}" onclick="loadChats(this)">${frnd.slice(1)}</button>`
    }
}

const loadChats = async (e) => {
    let data = await fetch('/home/getchat', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({ name: e.dataset.name, type: e.dataset.type })
    })
    data = await data.json();

    chatSection.textContent = '';

    chatSection.innerHTML = `<div class="flex flex-col gap-2 items-center p-1" id="oldChats"></div>
<div class="my-auto h-full p-1 w-full flex flex-col gap-2" id="newChats${e.dataset.name}${e.dataset.type}"></div><form id="chatForm" onsubmit="return false;" class="sticky bottom-0 flex items-center p-1 bg-gray-600 gap-2 mb-[0!important]"><input type="text" class="bg-gray-900 h-full w-full rounded-md scrollbar p-2 outline-none tracking-wide" placeholder="Type here..."><button class="material-symbols-outlined p-3 flex items-center justify-center rounded-md bg-green-300 text-black mt-auto outline-none" onclick="sendChat('${e.dataset.name}', '${e.dataset.type}')">send</button></form>`

    for (const chat of data) {
        document.getElementById('oldChats').appendChild(createChatCardOldChats(chat));
    }
    scrollBottom();
}

const createChatCardOldChats = (data) => {
    let div = document.createElement('div');
    div.classList.add('chat');
    if (data.user == sessionStorage.getItem('username')) {
        div.classList.add('me')
    } else { div.classList.add('other') }
    div.innerHTML = `<span class="chatname">${data.user}</span><p class="chatmessage" style="">${data.text}</p>`
    return div;
}

const scrollBottom = () => {
    chatSection.scrollTop = chatSection.scrollHeight;
}

const sendChat = (channelName, channelType) => {
    const form = document.getElementById('chatForm');
    let inputText = form.firstElementChild.value.trim();
    if (inputText == '') {
        return;
    }
    let doc = document.getElementById(`newChats${channelName}${channelType}`);
    doc.appendChild(createChatCardOldChats({ user: sessionStorage.getItem('username'), text: inputText }));
    socket.emit('chat', [inputText, channelName, channelType]);
    scrollBottom();

}

const loadNotifications = async () => {
    let notifications = await fetch('/home/notifications');
    notifications = await notifications.json();

    for (const n of notifications) {
        let name = n.split(' ')[0]
        let channel = n.split(' ').slice(1).join(' ');
        let div = document.createElement('div');
        notifBar.appendChild(div);
        div.outerHTML = `<div class="notify flex flex-col p-2  border-b border-b-gray-600 relative">
        <span><span class="font-bold tracking-wide text-lg">${name}</span> messaged</span>
        <span class="text-xs">in <span class="text-base text-sky-400">${channel}</span></span>
        <button
            class="closeNotification flex w-6 h-6 text-sm absolute right-3 top-3 hover:bg-gray-500  rounded-md"><span
                class="material-symbols-outlined">
                close
            </span></button>
    </div>`;
    }
}

const getUserName = async () => {
    let name = await fetch('/home/name');
    name = await name.text();
    sessionStorage.setItem('username', name);
    socket.emit('namesetup', sessionStorage.getItem('username'))
}

loadChannelsAndFriends();
loadNotifications();
getUserName();

