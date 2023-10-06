document.addEventListener('DOMContentLoaded', async function() {
    let local_slider = document.getElementById('local').getElementsByClassName('slider')[0];
    let local_value = document.getElementById('local').getElementsByClassName('value')[0];

    let global_slider = document.getElementById('global').getElementsByClassName('slider')[0];
    let global_value = document.getElementById('global').getElementsByClassName('value')[0];


    let response = await chrome.storage.local.get("global_speed");
    let global_speed = response["global_speed"];
    if (!global_speed) {
        global_speed = 1;
    }
    global_slider.value = global_speed;
    global_value.innerHTML = global_speed;

    let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let speed = 0;
    if (!tab.url.startsWith("chrome://")) {
        response = await chrome.runtime.sendMessage({action: "get_speed", tab_id: tab.id});
        speed = response["speed"];
        if (speed == 0) {
            speed = global_speed;
        }
    }
    else {
        speed = global_speed;
    }
    local_slider.value = speed;
    local_value.innerHTML = speed;    
   

    local_slider.addEventListener('input', async function() {
        new_value = local_slider.value;
        local_value.innerHTML = new_value; 

        let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        if (tab.url.startsWith("chrome://")) return;
        chrome.runtime.sendMessage({action: "set_speed", tab_id: tab.id, speed: new_value});
    });

    global_slider.addEventListener('input', async function() {
        new_value = global_slider.value;
        global_value.innerHTML = new_value; 

        //also modify the local slider
        local_slider.value = new_value;
        local_value.innerHTML = new_value;

        await chrome.storage.local.set({"global_speed": new_value});
        chrome.runtime.sendMessage({action: "clear_speeds"});
    });

});