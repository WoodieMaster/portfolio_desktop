function select_window(cwindow: HTMLDivElement) {
    const select_class = "w-active";

    if(cwindow.classList.contains(select_class)) return;

    document.querySelector(".w-active")?.classList.remove(select_class);
    cwindow.classList.add(select_class);
}

enum ScaleOptions {
    NONE,
    START,
    END
}

function setup_scale_listener(cwindow: HTMLDivElement, scale_element: HTMLDivElement, scaling: {x: ScaleOptions, y: ScaleOptions}) {
    let mp_x = 0;
    let mp_y = 0;
    let width = 0;
    let height = 0;

    const movement_event = (event: MouseEvent) => {
        if(scaling.x != ScaleOptions.NONE) {
            let dx = scaling.x == ScaleOptions.END? event.x - mp_x: mp_x - event.x;

            let newWidth = width + dx;
            if(newWidth < windowMinWidth) newWidth = windowMinWidth;

            cwindow.style.width = newWidth + "px";

            if (scaling.x == ScaleOptions.START) {
                cwindow.style.left = event.x + "px";
            }
        }

        if(scaling.y != ScaleOptions.NONE) {
            let dy = scaling.y == ScaleOptions.END? event.y - mp_y: mp_y - event.y;

            let newHeight = height + dy;
            if(newHeight < windowMinWidth) newHeight = windowMinHeight;

            cwindow.style.height = newHeight + "px";

            if (scaling.y == ScaleOptions.START) {
                cwindow.style.top = event.y + "px";
            }
        }
    }
    scale_element.addEventListener("mousedown", (e) => {
        e.stopPropagation();

        mp_x = e.x;
        mp_y = e.y;

        const bounds = cwindow.getBoundingClientRect();

        width = bounds.width;
        height = bounds.height;

        document.addEventListener("mousemove", movement_event);
    })

    document.addEventListener("mouseup", () => document.removeEventListener("mousemove", movement_event));
}

function setup_event_listeners(cwindow: HTMLDivElement, header: HTMLDivElement) {
    let off_x = 0;
    let off_y = 0;

    const movement_event = (event: MouseEvent) => {
        let x = event.clientX + off_x;
        let y = event.clientY + off_y;

        const bounds = cwindow.getBoundingClientRect();

        if(x < 0) x = 0;
        else if (x > window.innerWidth - bounds.width) x = window.innerWidth - bounds.width;
        if(y < 0) y = 0;
        else if (y > window.innerHeight - bounds.height) y = window.innerHeight - bounds.height;


        cwindow.style.left = x + "px"
        cwindow.style.top = y + "px"
    }

    let is_moving = false;

    //movement
    header.addEventListener("mousedown", (event) => {
        if(is_moving) return;
        is_moving = true;
        const bounds = cwindow.getBoundingClientRect();
        off_x = bounds.left - event.clientX;
        off_y = bounds.top - event.clientY;

        document.addEventListener("mousemove", movement_event)
    });

    cwindow.addEventListener("mousedown", () => select_window(cwindow));

    document.addEventListener("mouseup", () => {
        is_moving = false;
        document.removeEventListener("mousemove", movement_event)
    })
}

function make_window(name: string, icon_src: string, body: HTMLElement, id: string): HTMLDivElement {
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
    buttons.onmousedown = (e) => { e.stopPropagation(); }

    //- close button
    const closeButton = document.createElement("button");
    closeButton.className = "w-close";
    closeButton.textContent = "x";
    closeButton.onclick = () => { cwindow.remove(); }

    buttons.appendChild(closeButton)


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

    // end
    cwindow.appendChild(header);
    cwindow.appendChild(body);

    cwindow.appendChild(scaleLeft);
    cwindow.appendChild(scaleBottom);
    cwindow.appendChild(scaleRight);
    cwindow.appendChild(scaleTop);

    select_window(cwindow);
    setup_event_listeners(cwindow, header);

    setup_scale_listener(cwindow, scaleLeft, {x: ScaleOptions.START, y: ScaleOptions.NONE});
    setup_scale_listener(cwindow, scaleRight, {x: ScaleOptions.END, y: ScaleOptions.NONE});
    setup_scale_listener(cwindow, scaleTop, {x: ScaleOptions.NONE, y: ScaleOptions.START});
    setup_scale_listener(cwindow, scaleBottom, {x: ScaleOptions.NONE, y: ScaleOptions.END});

    return cwindow;
}

function add_app_list() {
    app_list_element.innerHTML = "";
    for(const app of apps) {
        const app_element = document.createElement("img");
        app_element.src = app.icon_src;

        app_element.addEventListener("click", () => {
            const current = document.getElementById(appIdPrefix+app.id);
            if(current != null) return current.remove();

            app.on_start(app);
        })

        app_list_element.appendChild(app_element);
    }
}

class App {
    name: string;
    id: string;
    icon_src: string;
    on_start: (app: App) => void

    constructor(name: string, id: string, icon_src: string, on_start: (app: App)=>void) {
        this.name = name;
        this.id = id;
        this.icon_src = icon_src;
        this.on_start = on_start.bind(this);
    }
}

const apps: App[] = [
    new App("Settings", "settings", "assets/settings.svg", async (app: App) => {
        const content = document.createElement("div");
        content.innerHTML = "<h1>BALLS</h1>";

        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix+app.id));
    }),
    new App("Notepad", "np","assets/notepad.svg",async (app: App) => {
        const content = document.createElement("textarea");
        content.onchange = () => {
            localStorage.setItem("app-np-text", content.value);
            console.log(np_text)
        }
        content.value = localStorage.getItem("app-np-text") ?? "";
        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix+app.id));
    }),
    new App("Custom Browser","browser","assets/browser.svg", async(app: App) => {
        const content = document.createElement("iframe");
        content.src = "https://google.com";

        document.body.appendChild(make_window(app.name, app.icon_src, content, appIdPrefix+app.id));
    })
];

const appIdPrefix = "app-";
const windowMinHeight = 30;
const windowMinWidth = 50;

let np_text = "";

const app_list_element = document.querySelector("#menu .wrapper") as HTMLDivElement;

window.addEventListener("contextmenu", (e) => e.preventDefault())

add_app_list();