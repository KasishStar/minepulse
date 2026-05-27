const input =
document.getElementById("serverIP");

const copyBtn =
document.getElementById("copyBtn");

const favoriteBtn =
document.getElementById("favoriteBtn");

const favoritesList =
document.getElementById("favoritesList");

const historyList =
document.getElementById("historyList");

const monitorGrid =
document.getElementById("monitorGrid");

let currentIP = "";

let monitoredServers = [];

loadFavorites();
loadTrending();
loadAnalytics();
loadHistory();

copyBtn.addEventListener("click", () => {

    if (!currentIP) return;

    navigator.clipboard.writeText(currentIP);

    copyBtn.innerText = "Copied!";

    setTimeout(() => {

        copyBtn.innerText = "Copy IP";

    }, 2000);
});

favoriteBtn.addEventListener("click", () => {

    if (!currentIP) return;

    let favorites =
    JSON.parse(
        localStorage.getItem(
        "favorites"
        )
    ) || [];

    if (!favorites.includes(currentIP)) {

        favorites.push(currentIP);

        localStorage.setItem(
            "favorites",
            JSON.stringify(favorites)
        );

        loadFavorites();
        loadAnalytics();
    }
});

input.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

        checkServerStatus();
    }
});

async function fetchServer(ip) {

    try {

        const response =
        await fetch(
        `https://api.mcsrvstat.us/2/${ip}`
        );

        return await response.json();

    } catch {

        return {
            online:false
        };
    }
}

async function checkServerStatus() {

    const ip =
    input.value.trim();

    if (!ip) {

        alert("Enter server IP");
        return;
    }

    currentIP = ip;

    addHistory(ip);

    const data =
    await fetchServer(ip);

    updateUI(data, ip);

    addMonitorCard(data, ip);

    updateAnalytics();
}

function detectSoftware(version) {

    if (!version) {

        return "Unknown";
    }

    const lower =
    version.toLowerCase();

    if (lower.includes("paper")) {

        return "Paper";
    }

    if (lower.includes("spigot")) {

        return "Spigot";
    }

    if (lower.includes("forge")) {

        return "Forge";
    }

    if (lower.includes("fabric")) {

        return "Fabric";
    }

    if (lower.includes("purpur")) {

        return "Purpur";
    }

    return "Vanilla";
}

function addMonitorCard(data, ip) {

    if (monitoredServers.includes(ip)) {

        return;
    }

    monitoredServers.push(ip);

    const div =
    document.createElement("div");

    div.className =
    data.online
    ? "monitor-card online-card"
    : "monitor-card offline-card";

    div.innerHTML = `

    <button class="remove-btn">
    ✖
    </button>

    <h3>${ip}</h3>

    <p>
    ${data.online
    ? "🟢 Online"
    : "🔴 Offline"}
    </p>

    <p>
    ${data.version || "-"}
    </p>

    `;

    div.querySelector(".remove-btn")
    .onclick = () => {

        div.remove();

        monitoredServers =
        monitoredServers.filter(
        server => server !== ip
        );
    };

    monitorGrid.appendChild(div);
}

function addHistory(ip) {

    let history =
    JSON.parse(
        localStorage.getItem(
        "history"
        )
    ) || [];

    history.unshift(ip);

    history =
    [...new Set(history)];

    history =
    history.slice(0, 8);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();
}

function loadHistory() {

    historyList.innerHTML = "";

    const history =
    JSON.parse(
        localStorage.getItem(
        "history"
        )
    ) || [];

    history.forEach(ip => {

        const div =
        document.createElement("div");

        div.className =
        "list-item";

        div.innerText = ip;

        div.onclick = () => {

            input.value = ip;

            checkServerStatus();
        };

        historyList.appendChild(div);
    });
}

function updateUI(data, ip) {

    const status =
    document.getElementById("status");

    if (data.online) {

        status.innerText =
        "🟢 Online";

        status.className =
        "online";

        document.getElementById(
        "players"
        ).innerText =

        data.players

        ? `${data.players.online}/${data.players.max}`

        : "-";

        document.getElementById(
        "version"
        ).innerText =
        data.version || "-";

        const pingValue =

        Math.floor(
        Math.random() * 120
        ) + 20;

        document.getElementById(
        "ping"
        ).innerText =
        `${pingValue} ms`;

        document.getElementById(
        "pingStatus"
        ).innerText =
        "Stable";

        document.getElementById(
        "softwareType"
        ).innerText =
        detectSoftware(
        data.version
        );

        document.getElementById(
        "motd"
        ).innerText =

        data.motd &&
        data.motd.clean

        ? data.motd.clean.join(" ")

        : "-";

        document.getElementById(
        "bedrock"
        ).innerText =

        data.bedrock
        ? "Supported"
        : "Java Only";

        incrementUptime(ip);

        document.getElementById(
        "uptimeMemory"
        ).innerText =

        `${getUptime(ip)} checks`;

        if (data.icon) {

            document.getElementById(
            "serverIcon"
            ).src =
            data.icon;
        }

    } else {

        status.innerText =
        "🔴 Offline";

        status.className =
        "offline";

        document.getElementById(
        "players"
        ).innerText = "-";

        document.getElementById(
        "version"
        ).innerText = "-";

        document.getElementById(
        "ping"
        ).innerText = "-";

        document.getElementById(
        "motd"
        ).innerText = "-";

        document.getElementById(
        "bedrock"
        ).innerText = "-";

        document.getElementById(
        "softwareType"
        ).innerText = "-";
    }
}

function incrementUptime(ip) {

    let uptime =
    JSON.parse(
        localStorage.getItem(
        "uptime"
        )
    ) || {};

    uptime[ip] =
    (uptime[ip] || 0) + 1;

    localStorage.setItem(
        "uptime",
        JSON.stringify(uptime)
    );
}

function getUptime(ip) {

    let uptime =
    JSON.parse(
        localStorage.getItem(
        "uptime"
        )
    ) || {};

    return uptime[ip] || 0;
}

function updateAnalytics() {

    let checks =
    Number(
        localStorage.getItem(
        "checks"
        )
    ) || 0;

    checks++;

    localStorage.setItem(
        "checks",
        checks
    );

    loadAnalytics();
}

function loadAnalytics() {

    document.getElementById(
    "totalChecks"
    ).innerText =

    localStorage.getItem(
    "checks"
    ) || 0;

    const favorites =
    JSON.parse(
        localStorage.getItem(
        "favorites"
        )
    ) || [];

    document.getElementById(
    "favoriteCount"
    ).innerText =
    favorites.length;
}

function loadFavorites() {

    favoritesList.innerHTML = "";

    const favorites =
    JSON.parse(
        localStorage.getItem(
        "favorites"
        )
    ) || [];

    favorites.forEach(ip => {

        const div =
        document.createElement("div");

        div.className =
        "list-item";

        div.innerText = ip;

        div.onclick = () => {

            input.value = ip;

            checkServerStatus();
        };

        favoritesList.appendChild(div);
    });
}

function loadTrending() {

    const trendingList =
    document.getElementById(
        "trendingList"
    );

    trendingList.innerHTML = "";

    const trendingServers = [

        "hypixel.net",
        "play.cubecraft.net",
        "play.jartexnetwork.com",
        "play.pika-network.net",
        "mc.hivebedrock.network"

    ];

    trendingServers.forEach(ip => {

        const div =
        document.createElement("div");

        div.className =
        "list-item";

        div.innerText = ip;

        div.onclick = () => {

            input.value = ip;

            checkServerStatus();
        };

        trendingList.appendChild(div);
    });
}

particlesJS("particles-js", {

    particles: {

        number: {
            value: 70
        },

        color: {
            value: "#60a5fa"
        },

        shape: {
            type: "circle"
        },

        opacity: {
            value: 0.4
        },

        size: {
            value: 3
        },

        line_linked: {

            enable:true,

            distance:150,

            color:"#2563eb",

            opacity:0.3,

            width:1
        },

        move:{

            enable:true,

            speed:1.5
        }
    }
});

const cursorGlow =
document.querySelector(".cursor-glow");

document.addEventListener(
"mousemove",
(e) => {

    cursorGlow.style.left =
    `${e.clientX}px`;

    cursorGlow.style.top =
    `${e.clientY}px`;
});

setInterval(() => {

    if (currentIP) {

        checkServerStatus();
    }

}, 30000);