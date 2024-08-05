function select_window(cwindow: HTMLDivElement) {
    const select_class = "w-active";

    if(cwindow.classList.contains(select_class)) return;

    document.querySelector(".w-active")?.classList.remove(select_class);
    cwindow.classList.add(select_class);
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
    const result = document.createElement("div");
    result.className = "window";
    result.id = id;

    // result dimensions / positions
    result.style.width = window.innerWidth / 2 + "px";
    result.style.height = window.innerHeight / 2 + "px";

    result.style.left = window.innerWidth / 4 + "px";
    result.style.top = window.innerHeight / 4 + "px";


    // header
    const header = document.createElement("div");
    header.className = "w-header";

    setup_event_listeners(result, header);

    //- buttons
    const buttons = document.createElement("div");
    buttons.className = "w-buttons";
    buttons.onmousedown = (e) => { e.stopPropagation(); }

    //- close button
    const closeButton = document.createElement("button");
    closeButton.className = "w-close";
    closeButton.textContent = "x";
    closeButton.onclick = () => { result.remove(); }

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
    result.appendChild(header);
    result.appendChild(body);

    result.appendChild(scaleLeft);
    result.appendChild(scaleBottom);
    result.appendChild(scaleRight);
    result.appendChild(scaleTop);

    select_window(result);

    return result;
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

let np_text = "";

const app_list_element = document.querySelector("#menu .wrapper") as HTMLDivElement;

window.addEventListener("contextmenu", (e) => e.preventDefault())

add_app_list();