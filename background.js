let tab_speed = {};

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
    if (request.action === "get_speed") {
        let speed = tab_speed[request.tab_id];
        if (!speed) {
            speed = 0
        }
        sendResponse({status: "get_speed success", speed: speed});
    }
    if (request.action === "set_speed") {
        tab_speed[request.tab_id] = request.speed;
        sendResponse({status: "set_speed success"});
    }
    if (request.action === "clear_speeds") {
        tab_speed = {};
        sendResponse({status: "clear_speeds success"});
    }
});

let counter = 0;

async function update_all_tabs () {
    let tabs = await chrome.tabs.query({});
    for (let tab of tabs) {
        if (tab.url.startsWith("chrome://")) {
            continue;
        }
        if (!tab_speed[tab.id]) {
            let global_speed = await chrome.storage.local.get("global_speed");
            global_speed = global_speed["global_speed"];
            if (!global_speed) {
                global_speed = 1;
            }
            tab_speed[tab.id] = global_speed;
        }
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: function(new_speed) {
                document.querySelectorAll("video", "audio").forEach(function(e) {e.playbackRate = new_speed;});
            },
            args: [tab_speed[tab.id]]
        });
    }

    // every 100 operations, clear unused tab ids
    counter++;
    if (counter == 100) {
        counter = 0;
        let tab_ids = tabs.map(tab => tab.id);
        // console.log(tabs.map(tab => tab.url));
        for (let tab_id in tab_speed) {
            if (!tab_ids.includes(tab_id)) {
                // delete tab_speed[tab_id];
            }
        }
    }
}

// update every 1000ms
setInterval(update_all_tabs, 1000);