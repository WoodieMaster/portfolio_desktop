"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function select_window(cwindow) {
    var _a;
    const select_class = "w-active";
    if (cwindow.classList.contains(select_class))
        return;
    (_a = document.querySelector(".w-active")) === null || _a === void 0 ? void 0 : _a.classList.remove(select_class);
    cwindow.classList.add(select_class);
}
var ScaleOptions;
(function (ScaleOptions) {
    ScaleOptions[ScaleOptions["NONE"] = 0] = "NONE";
    ScaleOptions[ScaleOptions["START"] = 1] = "START";
    ScaleOptions[ScaleOptions["END"] = 2] = "END";
})(ScaleOptions || (ScaleOptions = {}));
function setup_scale_listener(cwindow, scale_element, scaling) {
    let mp_x = 0;
    let mp_y = 0;
    let width = 0;
    let height = 0;
    const movement_event = (event) => {
        event.stopPropagation();
        select_window(cwindow);
        if (scaling.x != ScaleOptions.NONE) {
            let dx = scaling.x == ScaleOptions.END ? event.x - mp_x : mp_x - event.x;
            let newWidth = width + dx;
            if (newWidth < windowMinWidth)
                newWidth = windowMinWidth;
            cwindow.style.width = newWidth + "px";
            if (scaling.x == ScaleOptions.START) {
                cwindow.style.left = event.x + "px";
            }
        }
        if (scaling.y != ScaleOptions.NONE) {
            let dy = scaling.y == ScaleOptions.END ? event.y - mp_y : mp_y - event.y;
            let newHeight = height + dy;
            if (newHeight < windowMinHeight)
                newHeight = windowMinHeight;
            cwindow.style.height = newHeight + "px";
            if (scaling.y == ScaleOptions.START) {
                cwindow.style.top = event.y + "px";
            }
        }
    };
    scale_element.addEventListener("mousedown", (e) => {
        e.stopPropagation();
        mp_x = e.x;
        mp_y = e.y;
        const bounds = cwindow.getBoundingClientRect();
        width = bounds.width;
        height = bounds.height;
        document.addEventListener("mousemove", movement_event);
    });
    document.addEventListener("mouseup", () => document.removeEventListener("mousemove", movement_event));
}
function setup_event_listeners(cwindow, header) {
    let off_x = 0;
    let off_y = 0;
    const movement_event = (event) => {
        let x = event.clientX + off_x;
        let y = event.clientY + off_y;
        const bounds = cwindow.getBoundingClientRect();
        if (x < 0)
            x = 0;
        else if (x > window.innerWidth - bounds.width)
            x = window.innerWidth - bounds.width;
        if (y < 0)
            y = 0;
        else if (y > window.innerHeight - bounds.height)
            y = window.innerHeight - bounds.height;
        cwindow.style.left = x + "px";
        cwindow.style.top = y + "px";
    };
    let is_moving = false;
    //movement
    header.addEventListener("mousedown", (event) => {
        if (is_moving)
            return;
        is_moving = true;
        const bounds = cwindow.getBoundingClientRect();
        off_x = bounds.left - event.clientX;
        off_y = bounds.top - event.clientY;
        document.addEventListener("mousemove", movement_event);
    });
    cwindow.addEventListener("mousedown", () => select_window(cwindow));
    document.addEventListener("mouseup", () => {
        is_moving = false;
        document.removeEventListener("mousemove", movement_event);
    });
}
function make_window(name, icon_src, body, id) {
    // result setup
    const cwindow = document.createElement("div");
    cwindow.className = "window";
    cwindow.id = id;
    // result dimensions / positions
    cwindow.style.width = window.innerWidth / 2 + "px";
    cwindow.style.height = window.innerHeight / 2 + "px";
    cwindow.style.left = window.innerWidth / 4 + "px";
    cwindow.style.top = window.innerHeight / 4 + "px";
    // header
    const header = document.createElement("div");
    header.className = "w-header";
    //- buttons
    const buttons = document.createElement("div");
    buttons.className = "w-buttons";
    buttons.onmousedown = (e) => { e.stopPropagation(); };
    //- close button
    const closeButton = document.createElement("button");
    closeButton.className = "w-close";
    closeButton.textContent = "x";
    closeButton.onclick = () => { cwindow.remove(); };
    buttons.appendChild(closeButton);
    //- name span
    const nameSpan = document.createElement("span");
    nameSpan.className = "w-name";
    nameSpan.textContent = name;
    //- icon img
    const iconImg = document.createElement("img");
    iconImg.className = "w-icon";
    iconImg.src = icon_src;
    //appending
    header.appendChild(iconImg);
    header.appendChild(nameSpan);
    header.appendChild(buttons);
    // body
    body.classList.add("w-body");
    //scalar detector
    const scaleLeft = document.createElement("div");
    const scaleRight = document.createElement("div");
    const scaleTop = document.createElement("div");
    const scaleBottom = document.createElement("div");
    scaleLeft.className = "w-scale-left";
    scaleRight.className = "w-scale-right";
    scaleTop.className = "w-scale-top";
    scaleBottom.className = "w-scale-bottom";
    //container
    const container = document.createElement("div");
    container.className = "w-container";
    cwindow.appendChild(container);
    // end
    container.appendChild(header);
    container.appendChild(body);
    cwindow.appendChild(scaleLeft);
    cwindow.appendChild(scaleBottom);
    cwindow.appendChild(scaleRight);
    cwindow.appendChild(scaleTop);
    select_window(cwindow);
    setup_event_listeners(cwindow, header);
    setup_scale_listener(cwindow, scaleLeft, { x: ScaleOptions.START, y: ScaleOptions.NONE });
    setup_scale_listener(cwindow, scaleRight, { x: ScaleOptions.END, y: ScaleOptions.NONE });
    setup_scale_listener(cwindow, scaleTop, { x: ScaleOptions.NONE, y: ScaleOptions.START });
    setup_scale_listener(cwindow, scaleBottom, { x: ScaleOptions.NONE, y: ScaleOptions.END });
    return cwindow;
}
function add_app_list() {
    app_list_element.innerHTML = "";
    for (const app of apps) {
        const app_element = document.createElement("img");
        app_element.src = app.icon_src;
        app_element.addEventListener("click", () => {
            const current = document.getElementById(appIdPrefix + app.id);
            if (current != null)
                return current.remove();
            app.on_start(app);
        });
        app_list_element.appendChild(app_element);
    }
}
class App {
    constructor(name, id, icon_src, on_start) {
        this.name = name;
        this.id = id;
        this.icon_src = icon_src;
        this.on_start = on_start.bind(this);
    }
}
const apps = [
    new App("Settings", "settings", "assets/settings.svg", (app) => __awaiter(void 0, void 0, void 0, function* () {
        const content = document.createElement("div");
        content.innerHTML = "<h1>BALLS</h1>";
        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix + app.id));
    })),
    new App("Notepad", "np", "assets/notepad.svg", (app) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const content = document.createElement("textarea");
        content.onchange = () => {
            localStorage.setItem("app-np-text", content.value);
            console.log(np_text);
        };
        content.value = (_a = localStorage.getItem("app-np-text")) !== null && _a !== void 0 ? _a : "";
        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix + app.id));
    })),
    new App("Custom Browser", "browser", "assets/browser.svg", (app) => __awaiter(void 0, void 0, void 0, function* () {
        const content = document.createElement("iframe");
        content.src = "https://google.com";
        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix + app.id));
    }))
];
const appIdPrefix = "app-";
const windowMinHeight = 30;
const windowMinWidth = 50;
let np_text = "";
const app_list_element = document.querySelector("#menu .wrapper");
window.addEventListener("contextmenu", (e) => e.preventDefault());
add_app_list();
