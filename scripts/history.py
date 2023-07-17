import gradio as gr
from modules import scripts
from modules.ui_components import FormGroup


def create_history_slider(tabname):
   with FormGroup(elem_id=f"prompt_history_slider_{tabname}"):
        history = gr.Slider(
            minimum=1,
            maximum=1,
            step=1,
            elem_id=f"{tabname}_prompt_history_slider",
            label="Prompt History",
            value=1,
        )
        history.input(
            fn=lambda *x: x,
            _js="function(){updatePromptHistory('" + tabname + "')}",
            inputs=None,
            outputs=None,
        )
        history.release( #this is for the case where the user goes too fast or off the page.
            fn=lambda *x: x,
            _js="function(){updatePromptHistory('" + tabname + "')}",
            inputs=None,
            outputs=None,
        )

        return history

class HistoryScript(scripts.Script):
    def __init__(self) -> None:
        super().__init__()

    def title(self):
        return "History"

    def show(self, is_img2img):
        return scripts.AlwaysVisible

    def ui(self, is_img2img):
        id_part = "img2img" if is_img2img else "txt2img"
        with gr.Row(elem_id=f"{id_part}_history_top_row", variant="compact", scale=100):
            with gr.Column(elem_id="history_col", scale=11):
                history_slider = create_history_slider(id_part)
            with gr.Column(elem_id="history_col", scale=1):
                with gr.Row(elem_id="history_button_row", variant="compact"):
                    clear_history = gr.Button("Clear", visible=True, label="Clear history")
                    clear_history.click(
                        fn=lambda *x: x,
                        _js="function(){confirm_clear_history('" + id_part + "')}",
                        inputs=None,
                        outputs=None,
                    )
                    load_history = gr.Button("Load", visible=True, label="Load history")
                    load_history.click(
                        fn=lambda *x: x,
                        _js="function(){load_history('" + id_part + "')}",
                        inputs=None,
                        outputs=None,
                    )
        return [history_slider, clear_history, load_history]