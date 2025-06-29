import { DEBUG_BORDER_COLOR, DEBUG_BORDER_WIDTH } from "./constants";
import { UIType } from "./enums";
import { UIRect } from "./ui_rect";
import { UIRoot } from "./ui_root";
import { number_to_pixels } from "./utils";

export class UIImage extends UIRect {
    private img_element: HTMLImageElement;
    private img_id: number;

    constructor(in_root: HTMLElement, in_filepath: string, in_label: string = "") {
        super(in_root, in_label);
        this.type = UIType.IMAGE;

        this.img_element = document.createElement("img") as HTMLImageElement;
        this.img_id = UIRoot.get_next_id();
        this.img_element.id = "GUID" + this.img_id.toString();
        this.img_element.src = in_filepath;
        this.img_element.draggable = false;

        this.img_element.style.userSelect = "none";
        this.img_element.style.boxSizing = "border-box";
        this.img_element.style.position = "absolute";

        this.div_element.appendChild(this.img_element);
    }

    // called after locate the main rect
    // here we should properly locate the image element inside this rect
    post_locate() {
        if (this.img_element) {
            this.img_element.width = this.div_element.offsetWidth;
            this.img_element.height = this.div_element.offsetHeight;

            let i_style = this.img_element.style;
            // extract parent border size
            let left_border = parseFloat(this.div_element.style.borderLeftWidth);
            let top_border = parseFloat(this.div_element.style.borderTopWidth);
            i_style.left = number_to_pixels(Number.isNaN(left_border) ? 0 : -1 * left_border);
            i_style.top = number_to_pixels(Number.isNaN(top_border) ? 0 : -1 * top_border);
        }
    }

    get_top_visual(): HTMLElement {
        return this.img_element;
    }

    get_img_id(): number {
        return this.img_id;
    }

    get_img_id_str(): string {
        return "GUID" + this.img_id.toString();
    }
}