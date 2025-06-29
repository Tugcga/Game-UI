export function number_to_pixels(value: number) {
    return value.toString() + "px";
}

export function channels_to_color(r: number, g: number, b: number, a: number = 1.0) {
    return "rgba(" + r.toString() + ", " + g.toString() + ", " + b.toString() + ", " + a.toString() + ")";
}

export function to_u8_hash(value: number) {
    return value * 16807 % 256;
}