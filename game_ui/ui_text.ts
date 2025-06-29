import { TextAlignType, UIType } from "./enums";
import { UIRect } from "./ui_rect";
import { UIRoot } from "./ui_root";
import { channels_to_color, number_to_pixels } from "./utils";

export class UIText extends UIRect {
    private txt_element: HTMLParagraphElement;
    private txt_id: number;
    private txt_align: TextAlignType;
    private txt_color: Uint8Array;
    private txt_alpha: number;

    constructor(in_root: HTMLElement, in_label: string = "") {
        super(in_root, in_label);
        this.type = UIType.TEXT;

        this.txt_element = document.createElement("p") as HTMLParagraphElement;
        this.txt_id = UIRoot.get_next_id();
        this.txt_element.id = "GUID" + this.txt_id.toString();
        this.txt_align = TextAlignType.CENTER_TOP;
        this.txt_color = new Uint8Array(3);
        this.txt_alpha = 1.0;

        this.txt_element.style.userSelect = "none";
        this.txt_element.style.boxSizing = "border-box";
        this.txt_element.style.position = "absolute";
        this.txt_element.style.margin = number_to_pixels(0);
        this.txt_element.style.padding = number_to_pixels(0);
        this.txt_element.style.width = "100%";

        this.div_element.appendChild(this.txt_element);
    }

    private _calc_text_height(): number {
        let h = 0;
        for (const r of this.txt_element.getClientRects()) {
            h += r.height;
        }

        return h;
    }

    set_text(text: string) {
        this.txt_element.innerText = text;

        this.set_align(this.txt_align);
    }

    set_font(family: string, size: number, weight: number) {
        this.txt_element.style.fontFamily = family;
        this.txt_element.style.fontSize = number_to_pixels(size);
        this.txt_element.style.fontWeight = weight.toString();
    }

    set_align(type: TextAlignType) {
        this.txt_align = type;
        let txt_style = this.txt_element.style;
        if (type == TextAlignType.LEFT_TOP) {
            txt_style.textAlign = "left";
        } else if (type == TextAlignType.LEFT_MIDDLE) {
            txt_style.textAlign = "left";
            const height = this._calc_text_height() / 2;
            txt_style.top = "calc(50% - " + height.toString() + "px)";
        } else if (type == TextAlignType.LEFT_BOTTOM) {
            txt_style.textAlign = "left";
            const height = this._calc_text_height();
            txt_style.top = "calc(100% - " + height.toString() + "px)";
        } else if (type == TextAlignType.CENTER_TOP) {
            txt_style.textAlign = "center";
        } else if (type == TextAlignType.CENTER_MIDDLE) {
            txt_style.textAlign = "center";
            const height = this._calc_text_height() / 2;
            txt_style.top = "calc(50% - " + height.toString() + "px)";
        } else if (type == TextAlignType.CENTER_BOTTOM) {
            txt_style.textAlign = "center";
            const height = this._calc_text_height();
            txt_style.top = "calc(100% - " + height.toString() + "px)";
        } else if (type == TextAlignType.RIGHT_TOP) {
            txt_style.textAlign = "right";
        } else if (type == TextAlignType.RIGHT_MIDDLE) {
            txt_style.textAlign = "right";
            const height = this._calc_text_height() / 2;
            txt_style.top = "calc(50% - " + height.toString() + "px)";
        } else {
            // type == TextAlignType.RIGHT_BOTTOM
            txt_style.textAlign = "right";
            const height = this._calc_text_height();
            txt_style.top = "calc(100% - " + height.toString() + "px)";
        }
    }

    set_text_color(r: number, g: number, b: number, a: number = 1.0) {
        this.txt_color[0] = r;
        this.txt_color[1] = g;
        this.txt_color[2] = b;
        this.txt_alpha = a;

        this.txt_element.style.color = channels_to_color(this.txt_color[0],
                                                         this.txt_color[0],
                                                         this.txt_color[0],
                                                         this.txt_alpha);
    }

    get_img_id(): number {
        return this.txt_id;
    }

    get_img_id_str(): string {
        return "GUID" + this.txt_id.toString();
    }
}