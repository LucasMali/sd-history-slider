const TEXT_TO_IMAGE = "txt2img";
const IMAGE_TO_IMAGE = "img2img";
const HISTORY_KEY = "history_prompt";
const PROMPT_KEY = "p";
const NEGATIVE_PROMPT_KEY = "n";

function _emptyPrompt() {
    return {
        [PROMPT_KEY]: "",
        [NEGATIVE_PROMPT_KEY]: "",
    }
}

function _initPromptHistory() {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(
        {
            [TEXT_TO_IMAGE]:
                [
                    {
                        [PROMPT_KEY]: "",
                        [NEGATIVE_PROMPT_KEY]: "",
                    }
                ],
            [IMAGE_TO_IMAGE]:
                [
                    {
                        [PROMPT_KEY]: "",
                        [NEGATIVE_PROMPT_KEY]: "",
                    }
                ]
        }
    ));
}


function _capturePrompts(tabname) {
    const prompt = "#" + tabname + "_prompt textarea";
    const negprompt = "#" + tabname + "_neg_prompt textarea";
    return {
        [PROMPT_KEY]: gradioApp().querySelector(prompt).value,
        [NEGATIVE_PROMPT_KEY]: gradioApp().querySelector(negprompt).value
    };
}

function _loadHistory(tabname) {
    let history;

    if (history = window.localStorage.getItem(HISTORY_KEY)) {
        history = JSON.parse(history);
        if (tabname) {
            return history[tabname];
        }
    }

    return history;
    
}

function _storeHistory(tabname) {
    let history = _loadHistory();
    const value = _capturePrompts(tabname);
    
    history[tabname].push(value);

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function _increaseSlider(tabname, number = 1) {
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    slider.max = parseInt(slider.max) + number;
    slider.value = parseInt(slider.max);
    input.value = parseInt(slider.value);
}

function init() {
    // Dynamically obtained from the objects being loaded into Gradio
    txt2img_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    txt2img_neg_prompt.addEventListener("input", () => watchPrompts(TEXT_TO_IMAGE));
    img2img_neg_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
    img2img_prompt.addEventListener("input", () => watchPrompts(IMAGE_TO_IMAGE));
    txt2img_clear_prompt.addEventListener("click", () => deletePrompts(TEXT_TO_IMAGE));
    img2img_clear_prompt.addEventListener("click", () => deletePrompts(IMAGE_TO_IMAGE))
    // Set the initial history
    if (!window.localStorage.getItem(HISTORY_KEY)) {
        _initPromptHistory();
    }
}

function moveHistorySlidersUnderPrompts() {
    document.getElementById(TEXT_TO_IMAGE+"_toprow").after(document.getElementById(TEXT_TO_IMAGE+"_history_top_row"));
    document.getElementById(IMAGE_TO_IMAGE+"_toprow").after(document.getElementById(IMAGE_TO_IMAGE+"_history_top_row"));  
}

function watchPrompts(tabname) {
    _increaseSlider(tabname);
    _storeHistory(tabname);
}

function deletePrompts(tabname) {
    let history = _loadHistory();
    _increaseSlider(tabname);
    history[tabname].push(_emptyPrompt())

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));    
    load_history(tabname);
}

// Webui methods.
function update_prompt_history(tabname) {

    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const prompt = gradioApp().querySelector("#" + tabname + "_prompt textarea");
    const negprompt = gradioApp().querySelector(
        "#" + tabname + "_neg_prompt textarea"
    );

    const value = JSON.parse(window.localStorage.getItem(HISTORY_KEY))[tabname][slider.value - 1];

    prompt.value = value[PROMPT_KEY];
    negprompt.value = value[NEGATIVE_PROMPT_KEY];
}

function load_history(tabname) {
    const slider = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> input"
    );
    const input = gradioApp().querySelector(
        "#" + tabname + "_prompt_history_slider> div input"
    );

    let history = JSON.parse(window.localStorage.getItem(HISTORY_KEY));

    last_prompt = history[tabname][history[tabname].length - 1][PROMPT_KEY];
    last_neg_prompt = history[tabname][history[tabname].length - 1][NEGATIVE_PROMPT_KEY];

    slider.max = parseInt(history[tabname].length);
    slider.value = parseInt(history[tabname].length);
    input.value = parseInt(history[tabname].length);

    gradioApp().querySelector("#" + tabname + "_prompt textarea").value = last_prompt;
    gradioApp().querySelector("#" + tabname + "_neg_prompt textarea").value = last_neg_prompt;
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
    
        _initPromptHistory();
    }
}

// Callbacks
onUiLoaded(async () => {
    init();
    moveHistorySlidersUnderPrompts();
});
