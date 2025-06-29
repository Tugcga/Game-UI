import { UIType } from "./enums";
import { UIImage } from "./ui_image";
import { UIRect, UIRectBase } from "./ui_rect";
import { UIText } from "./ui_text";
import { number_to_pixels } from "./utils";

export class UIRoot extends UIRectBase {
    private static next_id: number = 0;

    constructor(in_root: HTMLElement, in_label: string = "") {
        super(in_root, in_label);
        this.type = UIType.ROOT;

        this._snap_size_to_root()
        let r_style = this.div_element.style;
        r_style.position = "relative";
        r_style.boxSizing = "border-box";
        r_style.boxSizing = "border-box";
        r_style.overflow = "hidden";

        const resize_observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                this._on_resize();
            }
        });

        // track only the size of the root element for the ui root object
        resize_observer.observe(in_root);
    }

    public static get_next_id(): number {
        const id = UIRoot.next_id;
        UIRoot.next_id++;

        return id;
    }

    private _snap_size_to_root() {
        this.div_element.style.width = number_to_pixels(this.root.clientWidth);
        this.div_element.style.height = number_to_pixels(this.root.clientHeight);
    }

    private _on_resize() {
        this._snap_size_to_root();
        this.draw();

        // we should relocate the current div and also all children
        for (const child of this.children) {
            child.locate();
        }
    }

    add_rect(in_root: UIRectBase, in_label: string = ""): UIRect {
        const root_div = in_root.get_div_element();
        let new_rect = new UIRect(root_div, in_label);
        new_rect.set_ui_local_root(in_root);
        in_root.add_child(new_rect);

        return new_rect;
    }

    add_image(in_root: UIRectBase, file_path: string, in_label: string = ""): UIImage {
        const root_div = in_root.get_div_element();
        let img = new UIImage(root_div, file_path, in_label);
        img.set_ui_local_root(in_root);
        in_root.add_child(img);

        return img;
    }

    add_text(in_root: UIRectBase, in_label: string = ""): UIText {
        const root_div = in_root.get_div_element();
        let txt = new UIText(root_div, in_label);
        txt.set_ui_local_root(in_root);
        in_root.add_child(txt);

        return txt;
    }
}