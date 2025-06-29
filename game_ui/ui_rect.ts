import { DEBUG_BORDER_COLOR, DEBUG_BORDER_WIDTH, DEBUG_COLOR_ALPHA, DEBUG_LABEL_SIZE } from "./constants";
import { CenterType, UIType } from "./enums";
import { UIRoot } from "./ui_root";
import { channels_to_color, number_to_pixels, to_u8_hash } from "./utils";

export class UIRectBase {
    private ui_local_root: UIRectBase | null;
    private label: string;
    private id: number;
    
    private debug_color: Uint8Array;
    private debug_alpha: number;
    private debug_width_label: HTMLParagraphElement | null;
    private debug_height_label: HTMLParagraphElement | null;
    private debug_label: HTMLParagraphElement | null;

    private bg_defined: boolean;
    private bg_color_rgb: Uint8Array;
    private bg_color_alpha: number;

    private border_defined: boolean;
    private border_width: number;
    private border_color: Uint8Array;
    private border_alpha: number;

    private is_debug: boolean;
    private is_visible: boolean;

    // members below used in children classes
    protected root: HTMLElement;
    protected type: UIType;
    protected children: Array<UIRectBase>;

    protected left_anchor: number = 0;
    protected right_anchor: number = 1;
    protected top_anchor: number = 0;
    protected bottom_anchor: number = 1;

    protected left_offset: number = 0;
    protected right_offset: number = 0;
    protected top_offset: number = 0;
    protected bottom_offset: number = 0;

    protected div_element: HTMLDivElement;

    constructor(in_root: HTMLElement, in_label: string = "") {
        this.id = UIRoot.get_next_id();
        this.type = UIType.RECTANGLE;
        this.root = in_root;
        this.ui_local_root = null;
        this.label = in_label;
        this.children = new Array<UIRectBase>();

        this.is_debug = false;
        this.is_visible = true;

        this.debug_color = new Uint8Array(3);
        this.debug_color[0] = to_u8_hash(this.id);
        this.debug_color[1] = to_u8_hash(this.id + 1);
        this.debug_color[2] = to_u8_hash(this.id + 2);
        this.debug_alpha = DEBUG_COLOR_ALPHA;
        this.debug_width_label = null;
        this.debug_height_label = null;
        this.debug_label = null;

        this.bg_color_rgb = new Uint8Array(3);
        this.bg_color_alpha = 0.0;
        this.bg_defined = false;

        this.border_defined = false;
        this.border_width = 0;
        this.border_color = new Uint8Array(3);
        this.border_alpha = 1.0;

        // create div which cover all the root element
        this.div_element = document.createElement("div");
        this.div_element.style.boxSizing = "border-box";
        this.div_element.style.position = "absolute";
        this.div_element.id = "GUID" + this.id.toString();
        in_root.appendChild(this.div_element);
    }

    private _get_width(): number {
        if (this instanceof UIRoot) {
            return this.div_element.offsetWidth;
        } else {
            return -this.left_offset + this.right_offset + (this.right_anchor - this.left_anchor) * this.root.offsetWidth;
        }
    }

    private _get_height(): number {
        if (this instanceof UIRoot) {
            return this.div_element.offsetHeight;
        } else {
            return -this.top_offset + this.bottom_offset + (this.bottom_anchor - this.top_anchor) * this.root.offsetHeight;
        }
    }

    private _get_left(): number {
        // If root is a UIRoot, then we should check is in contains some border
        // if it is, then subtract it
        let root_border = 0;
        if (this.ui_local_root instanceof UIRoot) {
            root_border = parseFloat(this.root.style.borderLeftWidth);
        }

        return this.left_anchor * this.root.offsetWidth + this.left_offset - (Number.isNaN(root_border) ?  0 : root_border);
    }

    private _get_top(): number {
        // similar for the top shift        
        let root_border = 0;
        if (this.ui_local_root instanceof UIRoot) {
            root_border = parseFloat(this.root.style.borderTopWidth);
        }

        return this.top_anchor * this.root.offsetHeight + this.top_offset - (Number.isNaN(root_border) ?  0 : root_border);
    }

    private _draw_color() {
        let vis = this.get_top_visual();
        if (vis) {
            let vis_style = vis.style;
            if (this.is_debug) {
                vis_style.backgroundColor = channels_to_color(this.debug_color[0], 
                                                            this.debug_color[1],
                                                            this.debug_color[2],
                                                            this.debug_alpha);
            } else {
                if (this.bg_defined) {
                    vis_style.backgroundColor = channels_to_color(this.bg_color_rgb[0], 
                                                                this.bg_color_rgb[1],
                                                                this.bg_color_rgb[2],
                                                                this.bg_color_alpha);
                } else {
                    vis_style.removeProperty("background-color");
                }
            }
        }
    }

    private _draw_dimensions() {
        // for debug mode
        // we should write the size of each rect
        this.debug_width_label?.remove();
        this.debug_width_label = null;
        this.debug_height_label?.remove();
        this.debug_height_label = null;
        if (this.is_debug) {
            let vis = this.div_element;
            let vis_style = vis.style;
            // create new p-element
            this.debug_width_label = document.createElement("p");
            // setup the style
            let w_style = this.debug_width_label.style;
            w_style.position = "absolute";
            //w_style.left = number_to_pixels(this._get_width() / 2 - (vis_style.borderLeftWidth.length == 0 ? 0 : parseFloat(vis_style.borderLeftWidth)));
            w_style.top = number_to_pixels(1);
            w_style.margin = number_to_pixels(0);
            w_style.padding = number_to_pixels(0);
            w_style.fontSize = number_to_pixels(DEBUG_LABEL_SIZE);
            w_style.fontFamily = "arial";
            w_style.width = "100%";
            w_style.textAlign = "center";
            this.debug_width_label.innerText = Math.floor(this._get_width()).toString();
            vis.appendChild(this.debug_width_label);

            // and also for height dimension
            this.debug_height_label = document.createElement("p");
            // setup the style
            let h_style = this.debug_height_label.style;
            h_style.position = "absolute";
            h_style.left = number_to_pixels(1);
            h_style.top = "calc(50% - 6px)";
            h_style.margin = number_to_pixels(0);
            h_style.padding = number_to_pixels(0);
            h_style.fontSize = number_to_pixels(DEBUG_LABEL_SIZE);
            h_style.fontFamily = "arial";
            this.debug_height_label.innerText = Math.floor(this._get_height()).toString();
            vis.appendChild(this.debug_height_label);
        }
    }

    private _draw_label() {
        // we draw rect label only in debug mode
        this.debug_label?.remove();
        this.debug_label = null;
        if (this.is_debug) {
            this.debug_label = document.createElement("p");
            let l_style = this.debug_label.style;
            l_style.position = "absolute";
            l_style.left = number_to_pixels(0);
            l_style.right = number_to_pixels(0);
            l_style.top = number_to_pixels(0);
            l_style.bottom = number_to_pixels(0);
            l_style.transform = "translate(0%, calc(50% - 6px))";
            l_style.margin = number_to_pixels(0);
            l_style.padding = number_to_pixels(0);
            l_style.fontSize = number_to_pixels(DEBUG_LABEL_SIZE);
            l_style.fontFamily = "arial";
            l_style.textAlign = "center";

            this.debug_label.innerText = this.label + " (" + this.id.toString() + ")";
            this.div_element.appendChild(this.debug_label);
        }
    }

    private _draw_border() {
        let vis = this.get_top_visual();
        if (vis) {
            let vis_style = vis.style;
            if (this.is_debug) {
                vis_style.border = DEBUG_BORDER_WIDTH.toString() + "px solid " + DEBUG_BORDER_COLOR;
            } else {
                if (this.border_defined) {
                    vis_style.border = this.border_width.toString() + "px solid " + channels_to_color(this.border_color[0], this.border_color[1], this.border_color[2], this.border_alpha);
                } else {
                    vis_style.removeProperty("border");
                }
            }
        }
    }

    protected draw() {
        this._draw_color();
        this._draw_border();
        this._draw_dimensions();
        this._draw_label();
    }

    // this method should be override in the child class
    // for locate sub-elements of the rect
    protected post_locate() {

    }

    protected get_top_visual(): HTMLElement {
        return this.div_element;
    }

    private get_ui_root(): UIRoot | UIRectBase {
        // return global UI root object
        let local_root = this.ui_local_root;
        if (local_root == null) {
            return this;
        } else {
            if (local_root instanceof UIRoot) {
                return local_root;
            } else {
                return local_root.get_ui_root();
            }
        }
    }

    private _set_visibility(value: boolean) {
        this.div_element.style.visibility = value ? "visible" : "hidden";
    }

    // inner public methods
    set_ui_local_root(in_ui_root: UIRectBase) {
        this.ui_local_root = in_ui_root;
    }

    add_child(in_child: UIRectBase) {
        this.children.push(in_child);
    }

    locate() {
        let rect_style = this.div_element.style;
        // calculate the size
        rect_style.width = number_to_pixels(this._get_width());

        rect_style.height = number_to_pixels(this._get_height());

        // next, calculate position
        rect_style.left = number_to_pixels(this._get_left());
        rect_style.top = number_to_pixels(this._get_top());

        // after reposition we should update debug labels
        this.draw();
        this.post_locate();

        // and then relocate all children elements
        for (const child of this.children) {
            child.locate();
        }
    }

    // getters/setters
    get_label(): string {
        return this.label;
    }

    get_id(): number {
        return this.id;
    }

    get_id_str(): string {
        return "GUID" + this.id.toString();
    }

    get_div_element(): HTMLDivElement {
        return this.div_element;
    }

    // user commands
    set_color(r: number, g: number, b: number, a: number = 1.0) {
        this.bg_color_rgb[0] = r;
        this.bg_color_rgb[1] = g;
        this.bg_color_rgb[2] = b;
        this.bg_color_alpha = a;
        this.bg_defined = true;

        this._draw_color();
    }

    set_border(width: number, r: number, g: number, b: number, a: number = 1.0) {
        this.border_defined = true;
        this.border_width = width;
        this.border_color[0] = r;
        this.border_color[1] = g;
        this.border_color[2] = b;
        this.border_alpha = a;

        this._draw_border();
    }

    set_debug(is_activate: boolean) {
        this.is_debug = is_activate;
        this.draw();

        this.locate();
        
        // and also for all children
        for (const child of this.children) {
            child.set_debug(is_activate);
            child.draw();

            child.locate();
        }
    }

    toggle_debug () {
        this.set_debug(!this.is_debug);
    }

    hide() {
        this.is_visible = false;
        this._set_visibility(false);
    }

    unhide() {
        this.is_visible = true;
        this._set_visibility(true);
    }

    toggle_visibility() {
        if (this.is_visible) {
            this.hide();
        } else {
            this.unhide();
        }
    }

}

export class UIRect extends UIRectBase {
    constructor(in_root: HTMLElement, in_label: string = "") {
        super(in_root, in_label);

        // snap to left top corner
        this.set_anchors(0.0, 0.0, 0.0, 0.0);
        // and also zero offsets
        // this will produce zero rect
        this.set_offsets(0.0, 0.0, 0.0, 0.0);
    }

    add_class(name: string) {
        this.div_element.classList.add(name);
    }

    delete_class(name: string) {
        this.div_element.classList.remove(name);
    }

    set_anchors(left_anchor: number = 0.0, right_anchor: number = 1.0, top_anchor: number = 0.0, bottom_anchor: number = 1.0) {
        this.left_anchor = Math.min(left_anchor, right_anchor);
        this.right_anchor = Math.max(left_anchor, right_anchor);
        this.top_anchor = Math.min(top_anchor, bottom_anchor);
        this.bottom_anchor = Math.max(top_anchor, bottom_anchor);

        this.locate();
    }

    set_offsets(left_offset: number = 0.0, right_offset: number = 0.0, top_offset: number = 0.0, bottom_offset: number = 0.0) {
        this.left_offset = left_offset;
        this.right_offset = right_offset;
        this.top_offset = top_offset;
        this.bottom_offset = bottom_offset;

        this.locate();
    }

    set_fixed_size(width: number, height: number, left_anchor: number, top_anchor: number, center: CenterType, left_offset: number, top_offset: number) {
        this.left_anchor = left_anchor;
        this.right_anchor = left_anchor;
        this.top_anchor = top_anchor;
        this.bottom_anchor = top_anchor;

        if (center == CenterType.LEFT_TOP) {
            this.left_offset = left_offset;
            this.right_offset = width + left_offset;
            this.top_offset = top_offset;
            this.bottom_offset = height + top_offset;
        } else if (center == CenterType.LEFT_MIDDLE) {
            this.left_offset = left_offset;
            this.right_offset = width + left_offset;
            this.top_offset = top_offset - height / 2;
            this.bottom_offset = top_offset + height / 2;
        } else if (center == CenterType.LEFT_BOTTOM) {
            this.left_offset = left_offset;
            this.right_offset = width + left_offset;
            this.top_offset = top_offset - height;
            this.bottom_offset = top_offset;
        } else if (center == CenterType.CENTER_TOP) {
            this.left_offset = left_offset - width / 2;
            this.right_offset = left_offset + width / 2;
            this.top_offset = top_offset;
            this.bottom_offset = height + top_offset;
        } else if (center == CenterType.CENTER_MIDDLE) {
            this.left_offset = left_offset - width / 2;
            this.right_offset = left_offset + width / 2;
            this.top_offset = top_offset - height / 2;
            this.bottom_offset = top_offset + height / 2;
        } else if (center == CenterType.CENTER_BOTTOM) {
            this.left_offset = left_offset - width / 2;
            this.right_offset = left_offset + width / 2;
            this.top_offset = top_offset - height;
            this.bottom_offset = top_offset;
        } else if (center == CenterType.RIGHT_TOP) {
            this.left_offset = left_offset - width;
            this.right_offset = left_offset;
            this.top_offset = top_offset;
            this.bottom_offset = height + top_offset;
        } else if (center == CenterType.RIGHT_MIDDLE) {
            this.left_offset = left_offset - width;
            this.right_offset = left_offset;
            this.top_offset = top_offset - height / 2;
            this.bottom_offset = top_offset + height / 2;
        } else {
            // CenterType.RIGHT_BOTTOM
            this.left_offset = left_offset - width;
            this.right_offset = left_offset;
            this.top_offset = top_offset - height;
            this.bottom_offset = top_offset;
        }
        
        this.locate();
    }
}