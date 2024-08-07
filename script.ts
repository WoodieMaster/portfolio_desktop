function select_window(cwindow: HTMLDivElement) {
    const select_class = "w-active";

    if(cwindow.classList.contains(select_class)) return;

    document.querySelector(".w-active")?.classList.remove(select_class);
    cwindow.classList.add(select_class);
    const parent = cwindow.parentElement;

    void parent?.appendChild(cwindow);
}

enum ScaleOptions {
    NONE,
    START,
    END
}

function create_window_resizer(cwindow: HTMLDivElement, scaling: {x: ScaleOptions, y: ScaleOptions}) {
    const element = document.createElement("div");

    if(scaling.x == ScaleOptions.START) element.classList.add("w-scale-left")
    else if(scaling.x == ScaleOptions.END) element.classList.add("w-scale-right")

    if(scaling.y == ScaleOptions.START) element.classList.add("w-scale-top")
    else if(scaling.y == ScaleOptions.END) element.classList.add("w-scale-bottom")

    window_resizer_listeners(cwindow, element, scaling);

    cwindow.appendChild(element);
}

function window_resizer_listeners(cwindow: HTMLDivElement, scale_element: HTMLDivElement, scaling: {x: ScaleOptions, y: ScaleOptions}) {
    let mp_x = 0;
    let mp_y = 0;
    let width = 0;
    let height = 0;

    const movement_event = (event: MouseEvent) => {
        event.stopPropagation();

        select_window(cwindow);

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
            if(newHeight < windowMinHeight) newHeight = windowMinHeight;

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
        if((event.buttons & 1) === 0) {
            is_moving = false;
            document.removeEventListener("mousemove", movement_event);
            return
        }
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
}

function make_window(title: string, icon_src: string, body: HTMLElement, id: string): HTMLDivElement {
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
    nameSpan.className = "w-title";
    nameSpan.textContent = title;

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


    //resizing detectors
    for(let x = 0; x < 3; x++) {
        for(let y = 0; y < 3; y++) {
            if(x === ScaleOptions.NONE && y === ScaleOptions.NONE) continue;
            create_window_resizer(cwindow, {x, y});
        }
    }

    //container
    const container = document.createElement("div");
    container.className = "w-container";

    cwindow.appendChild(container)

    // end
    container.appendChild(header);
    container.appendChild(body);

    select_window(cwindow);
    setup_event_listeners(cwindow, header);

    return cwindow;
}

function setup_menu() {
    menu_element.innerHTML = "";
    for(const app of apps.values()) {
        const app_element = document.createElement("img");
        app_element.src = app.icon_src;

        app_element.addEventListener("click", () => {
            if(app.is_active) app.close();
            else app.start();
        });

        app_element.addEventListener("mouseenter", () => {
            menu_info_element.textContent = app.name;
            menu_info_element.classList.remove("hidden");
        });

        app_element.addEventListener("mouseleave", () => {
            menu_info_element.classList.add("hidden");
        });

        menu_element.appendChild(app_element);
    }
}

async function loadFile(filename: string): Promise<string> {
    const response = await fetch("files/"+filename);
    return response.text();
}

type WindowState = {id: string, x: number, y: number, w:number, h:number};

class App {
    name: string;
    id: string;
    icon_src: string;
    on_start: (app: App) => HTMLDivElement | null;
    element: HTMLDivElement | null = null;
    is_active: boolean = false;

    constructor(name: string, id: string, icon_src: string, on_start: (app: App) => HTMLDivElement | null) {
        this.name = name;
        this.id = id;
        this.icon_src = icon_src;
        this.on_start = on_start;
    }

    start() {
        this.element = this.on_start(this);

        if(this.element !== null) {
            document.body.appendChild(this.element);
        }
        this.is_active = true;
    }

    close() {
        if(this.element !== null) {
            this.element.remove();
            this.element = null;
        }

        this.is_active = false;
    }

    register() {
        apps.set(this.id, this);
    }

    getWindowState(): WindowState | undefined {
        if(this.element != null) {
            const bounds = this.element.getBoundingClientRect();

            return {
                id: this.id,
                x: bounds.left,
                y: bounds.top,
                w: bounds.width,
                h: bounds.height,
            }
        }

        return undefined;
    }

    setWindowState(state: WindowState) {
        if (!this.is_active) this.start();

        if(this.element === null) return;

        this.element.style.left = state.x + "px";
        this.element.style.top = state.y + "px";


        this.element.style.width = state.w + "px";
        this.element.style.height = state.h + "px";
    }

    setWindowTitle(title: string) {
        const el = this.element?.querySelector(".w-header .w-title");
        if(el == undefined) return;
        el.textContent = title;
    }
}

function loadLocalStorage() {
    const app_state = localStorage.getItem("app-states");
    if(app_state !== null) {
        for(const state of JSON.parse(app_state) as WindowState[]) {
            const app = apps.get(state.id);

            if(app === undefined) continue;

            app.setWindowState(state);
        }
    }
}

const apps: Map<string, App> = new Map();

new App("Notepad", "np","assets/notepad.svg",(app) => {
    const content = document.createElement("textarea");
    content.onchange = () => {
        localStorage.setItem("app-np-text", content.value);
    }
    content.value = localStorage.getItem("app-np-text") ?? "";
    return make_window(app.name, app.icon_src, content, appIdPrefix+app.id);
}).register();

new App("Settings", "settings", "assets/settings.svg", (app) => {
    const content = document.createElement("div");
    content.innerHTML = "<h1>Test</h1>";

    return make_window(app.name, app.icon_src, content, appIdPrefix+app.id);
}).register();

new App("HTML Viewer", "html_view", "assets/html_file_icon.svg", (app) => {
    const content = document.createElement("iframe");
    content.src = "files/test.html";
    content.onload = () => {
        content.contentDocument!.onclick = () => select_window(app.element!)

    }

    return make_window(app.name, app.icon_src, content, appIdPrefix+app.id);
}).register();

const appIdPrefix = "app-";
const windowMinHeight = 30;
const windowMinWidth = 50;

const menu_element = document.querySelector("#menu .wrapper") as HTMLDivElement;
const menu_info_element = document.querySelector("#menu-info") as HTMLParagraphElement;

window.addEventListener("contextmenu", (e) => e.preventDefault())

loadLocalStorage();

setup_menu();

window.addEventListener('beforeunload', () => {
    const window_states: WindowState[] = [];

    for(const app of apps.values()) {
        const state = app.getWindowState();

        if (state === undefined) continue;

        window_states.push(state);
    }
    localStorage.setItem("app-states", JSON.stringify(window_states));
});

