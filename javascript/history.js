const TEXT_TO_IMAGE = "txt2img"
const IMAGE_TO_IMAGE = "img2img"
const HISTORY_TOP_ROW_POSTFIX = "_history_top_row"

function init() {
    // Dynamically obtained from the objects being loaded into Gradio
    txt2img_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    txt2img_neg_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    img2img_neg_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
    img2img_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
    txt2img_clear_prompt.addEventListener("click", () => deletePrompts(TEXT_TO_IMAGE));
    img2img_clear_prompt.addEventListener("click", ()=> deletePrompts(IMAGE_TO_IMAGE))

}

function swapThem() {
    document.getElementById("txt2img_toprow").after(document.getElementById("txt2img"+HISTORY_TOP_ROW_POSTFIX));
    document.getElementById("img2img_toprow").after(document.getElementById("img2img"+HISTORY_TOP_ROW_POSTFIX));  
}

function _buildKey(a, b) {
    return a + "_" + b;
}

function _emptyPrompt() {
    const value = {};
    value.negative_prompt = ''
    value.prompt = ''
    return value;
}

function _capturePrompts(tabname) {
    const value = {};
    value.negative_prompt = gradioApp().querySelector(
        "#" + tabname + "_neg_prompt textarea"
    ).value;
    value.prompt = gradioApp().querySelector(
        "#" + tabname + "_prompt textarea"
    ).value;
    return value;
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
    
    const value = _capturePrompts(tabname);
    const key = _buildKey(tabname, slider.value);

    window.localStorage.setItem(key, JSON.stringify(value));
}

function deletePrompts(tabname) {
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    
    slider.max = parseInt(slider.max) + 1;
    slider.value = parseInt(slider.max);
    input.value = parseInt(slider.value);
    
    const value = _emptyPrompt();
    const key = _buildKey(tabname, slider.value);

    window.localStorage.setItem(key, JSON.stringify(value));    
    load_history(tabname);
}

// Webui methods.
function update_prompt_history(tabname) {
    console.log("update prompt history")
    console.log(tabname)

    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const prompt = gradioApp().querySelector("#" + tabname + "_prompt textarea");
    const negprompt = gradioApp().querySelector(
        "#" + tabname + "_neg_prompt textarea"
    );
    const key = _buildKey(tabname, slider.value);
    const value = JSON.parse(window.localStorage.getItem(key));

    prompt.value = value.prompt;
    negprompt.value = value.negative_prompt;
}

function load_history(tabname) {
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
            _buildKey(tabname, slider.value),
            JSON.stringify(_capturePrompts(tabname))
        );
    }
}

// Callbacks
onUiLoaded(async () => {
    init();
    swapThem();
});
