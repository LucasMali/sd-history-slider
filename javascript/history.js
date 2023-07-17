const LOADED_STORAGE_KEY = "_history_is_loaded";
const TEXT_TO_IMAGE = "txt2img"
const IMAGE_TO_IMAGE = "img2img"
const HISTORY_TOP_ROW_POSTFIX = "_history_top_row"

function init() {
    // Dynamically obtained from the objects being loaded into Gradio
    txt2img_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    txt2img_neg_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    img2img_neg_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
    img2img_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
}

function swapThem() {
    // Swap from the lower end of the GUI to where we want them to, below the prompts
    const tab = (get_uiCurrentTab()).innerHTML.trim();
    if (tab == TEXT_TO_IMAGE || tab == IMAGE_TO_IMAGE) {
        const top_row = document.getElementById(tab + "_toprow");
        const history_top_row = document.getElementById(tab + HISTORY_TOP_ROW_POSTFIX);
        top_row.after(history_top_row);
    }    
}

function changingTabs() {
    // Listen for changing tabs.
    const tab = (get_uiCurrentTab()).innerHTML.trim();
    if (tab == TEXT_TO_IMAGE || tab == IMAGE_TO_IMAGE) {
        // if (isLoaded(tab)) { 
        //     load_history(tab);
        // }
        swapThem();
    }
}

function isLoaded(tab) {
    // This might be good for when we create a auto load checkbox.
    console.log("is loaded?");
    const t = window.localStorage.getItem(tab + LOADED_STORAGE_KEY) || false;
    console.log(t);
    return t;
}

function buildKey(a, b) {
    return a + "_" + b;
}

function capturePrompts(tabname) {
    const value = {};
    value.negative_prompt = gradioApp().querySelector(
        "#" + tabname + "_neg_prompt textarea"
    ).value;
    value.prompt = gradioApp().querySelector(
        "#" + tabname + "_prompt textarea"
    ).value;
    return value;
}

function updatePromptHistory(tabname) {
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const prompt = gradioApp().querySelector("#" + tabname + "_prompt textarea");
    const negprompt = gradioApp().querySelector(
        "#" + tabname + "_neg_prompt textarea"
    );
    const key = buildKey(tabname, slider.value);
    const value = JSON.parse(window.localStorage.getItem(key));

    prompt.value = value.prompt;
    negprompt.value = value.negative_prompt;
}

function watchPrompts(tabname) {
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );

    slider.max = parseInt(slider.max) + 1;
    slider.value = parseInt(slider.max);
    input.value = parseInt(slider.value);

    
    let value = capturePrompts(tabname);
    let key = buildKey(tabname, slider.value);


    window.localStorage.setItem(key, JSON.stringify(value));
}

function load_history(tabname) {
    if (!isLoaded(tabname)) {
        window.localStorage.setItem(buildKey(tabname, LOADED_STORAGE_KEY), true)
    }
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );

    const items = {...window.localStorage};

    let count = 0;
    let last_prompt = "";
    let last_neg_prompt = "";
    for (let key in items) {
        const re = new RegExp(tabname + "_[0-9]+", "g");
        if (key.match(re)) {
            count++;
        }
    }

    if (count > 0) {
        const value = JSON.parse(items[tabname + "_" + count]);
        last_prompt = value.prompt;
        last_neg_prompt = value.negative_prompt;
        slider.max = parseInt(count);
        slider.value = parseInt(count);
        input.value = parseInt(count);
        document.cookie = "isInit=true";

        const prompt = gradioApp().querySelector(
            "#" + tabname + "_prompt textarea"
        );
        const negprompt = gradioApp().querySelector(
            "#" + tabname + "_neg_prompt textarea"
        );
        prompt.value = last_prompt;
        negprompt.value = last_neg_prompt;
    }
}

function confirm_clear_history(tabname) {
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );

    if (confirm("Clear " + tabname + " prompt history?")) {
        slider.max = 1;
        slider.value = 1;
        input.value = 1;
        const items = {...window.localStorage};
        for (let key in items) {
            const re = new RegExp(tabname + "_[0-9]+", "g");
            if (key.match(re)) {
                window.localStorage.removeItem(key);
            }
        }

        window.localStorage.setItem(
            buildKey(tabname, slider.value),
            JSON.stringify(capturePrompts(tabname))
        );
    }
}


onUiLoaded(async () => {
    swapThem();
    init();
});
onUiTabChange(async () => { changingTabs() });