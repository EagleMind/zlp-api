/**
 * ZebraBuilder — a fluent TypeScript API for ZPL (Zebra Programming Language).
 *
 * Designs labels with real-world measurements (inches / millimeters / dots)
 * and produces ZPL strings ready to send to a Zebra printer.
 *
 * @example
 * ```ts
 * const zpl = new ZebraBuilder(300)
 *   .origin(0.5, 0.5)
 *   .font('0', 0.25)
 *   .text('ASSET TAG')
 *   .origin(0.5, 1.0)
 *   .barcode128('12345', 0.75)
 *   .render();
 * ```
 */

export type Orientation = 'N' | 'R' | 'I' | 'B';
export type PrintOrientation = 'N' | 'I';
export type Unit = 'in' | 'mm' | 'dots';
export type Color = 'B' | 'W';
export type QrErrorCorrection = 'H' | 'M' | 'L' | 'Q';
export type Code128Mode = 'N' | 'U' | 'A' | 'D';
export type GraphicFormat = 'A' | 'B' | 'C';
export type MediaTrackingMode = 'A' | 'N' | 'D';

export interface FontOptions {
    unit?: Unit;
    width?: number;
    orientation?: Orientation;
}

export interface Barcode128Options {
    unit?: Unit;
    printText?: boolean;
    textAbove?: boolean;
    orientation?: Orientation;
    checkDigit?: boolean;
    mode?: Code128Mode;
}

export interface Barcode39Options {
    unit?: Unit;
    printText?: boolean;
    orientation?: Orientation;
    checkDigit?: boolean;
}

export interface QrCodeOptions {
    magnification?: number;
    errorCorrection?: QrErrorCorrection;
    orientation?: Orientation;
    model?: 1 | 2;
}

export interface DataMatrixOptions {
    unit?: Unit;
    qualityLevel?: number;
    columns?: number;
    rows?: number;
    format?: number;
    orientation?: Orientation;
    escape?: string;
    aspectRatio?: number;
}

export interface AztecOptions {
    magnification?: number;
    orientation?: Orientation;
    eci?: boolean;
    size?: number;
    readerInit?: boolean;
    structuredAppendCount?: number;
    structuredAppendMessageId?: string;
}

export interface ShapeOptions {
    unit?: Unit;
    thickness?: number;
    color?: Color;
    rounding?: number;
}

export interface CircleOptions {
    unit?: Unit;
    thickness?: number;
    color?: Color;
}

export interface PrintQuantityOptions {
    copies?: number;
    pause?: number;
}

export interface BarcodeDefaultsOptions {
    wideToNarrowRatio?: number;
    height?: number;
}

export interface PreviewOptions {
    width?: number;
    height?: number;
    unit?: 'in' | 'mm';
}

const MM_PER_INCH = 25.4;
const INVALID_CHARS = /[\x00-\x05]/;
const START_CMD = '^XA';
const END_CMD = '^XZ';

export class ZebraBuilder {
    private commands: string[] = [];
    private readonly dpi: number;
    private currentX = 0;
    private currentY = 0;

    constructor(dpi = 203) {
        if (!Number.isFinite(dpi) || dpi <= 0) {
            throw new Error(`Invalid DPI: ${dpi}. DPI must be a positive finite number.`);
        }
        this.dpi = dpi;
        this.commands.push(START_CMD);
    }

    getDpi(): number {
        return this.dpi;
    }

    getCurrentPosition(): { x: number; y: number } {
        return { x: this.currentX, y: this.currentY };
    }

    private toDots(value: number, unit: Unit = 'in'): number {
        switch (unit) {
            case 'dots': return Math.round(value);
            case 'mm':   return Math.round((value * this.dpi) / MM_PER_INCH);
            case 'in':
            default:     return Math.round(value * this.dpi);
        }
    }

    private validateText(text: string): void {
        const match = INVALID_CHARS.exec(text);
        if (match) {
            throw new Error(`Text contains unsupported character: ${match[0].charCodeAt(0)}`);
        }
    }

    // -------- Positioning --------

    origin(x: number, y: number, unit: Unit = 'in'): this {
        this.currentX = this.toDots(x, unit);
        this.currentY = this.toDots(y, unit);
        this.commands.push(`^FO${this.currentX},${this.currentY}`);
        return this;
    }

    // -------- Text --------

    font(name: string, height: number, opts: FontOptions = {}): this {
        const unit = opts.unit ?? 'in';
        const orientation = opts.orientation ?? 'N';
        const heightDots = this.toDots(height, unit);
        const widthDots = opts.width !== undefined ? this.toDots(opts.width, unit) : heightDots;
        this.commands.push(`^A${name}${orientation},${heightDots},${widthDots}`);
        return this;
    }

    text(content: string): this {
        this.validateText(content);
        this.commands.push(`^FD${content}^FS`);
        return this;
    }

    // -------- Barcodes --------

    barcode128(data: string, height: number, opts: Barcode128Options = {}): this {
        const heightDots = this.toDots(height, opts.unit ?? 'in');
        const orientation = opts.orientation ?? 'N';
        const showText     = opts.printText  !== false ? 'Y' : 'N';
        const textPosition = opts.textAbove  === true  ? 'Y' : 'N';
        const uccCheck     = opts.checkDigit === true  ? 'Y' : 'N';
        const mode = opts.mode ?? 'A';
        const modeValue = mode === 'A' ? '' : mode;
        this.commands.push(
            `^BC${orientation},${heightDots},${showText},${textPosition},${uccCheck},${modeValue}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    barcode39(data: string, height: number, opts: Barcode39Options = {}): this {
        const heightDots = this.toDots(height, opts.unit ?? 'in');
        const orientation = opts.orientation ?? 'N';
        const showText   = opts.printText  !== false ? 'Y' : 'N';
        const mod43Check = opts.checkDigit === true  ? 'Y' : 'N';
        this.commands.push(
            `^B3${orientation},${heightDots},${showText},,${mod43Check}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    qr_code(data: string, opts: QrCodeOptions = {}): this {
        const orientation = opts.orientation ?? 'N';
        const model = opts.model ?? 2;
        const magnification = opts.magnification ?? 5;
        const errorCorrection = opts.errorCorrection ?? 'M';
        const modelValue = model === 2 ? '' : String(model);
        this.commands.push(
            `^BQ${orientation},${modelValue},${magnification},${errorCorrection}`,
            `^FH\\^FD${data}^FS`,
        );
        return this;
    }

    dataMatrix(data: string, height: number, opts: DataMatrixOptions = {}): this {
        const heightDots = this.toDots(height, opts.unit ?? 'dots');
        const orientation = opts.orientation ?? 'N';
        const qualityLevel = opts.qualityLevel ?? 200;
        const columns = opts.columns ?? '';
        const rows = opts.rows ?? '';
        const format = opts.format ?? 0;
        const escape = opts.escape ?? '';
        const aspect = opts.aspectRatio !== undefined && opts.aspectRatio !== 1 ? opts.aspectRatio : '';
        this.commands.push(
            `^BX${orientation},${heightDots},${qualityLevel},${columns},${rows},${format},${escape},${aspect}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    aztec(data: string, opts: AztecOptions = {}): this {
        const orientation = opts.orientation ?? 'N';
        const magnification = opts.magnification ?? 3;
        const eci        = opts.eci        === true ? 'Y' : 'N';
        const readerInit = opts.readerInit === true ? 'Y' : 'N';
        const size = opts.size ?? '';
        const appendCount = opts.structuredAppendCount ?? '';
        const appendId = opts.structuredAppendMessageId ?? '';
        this.commands.push(
            `^BO${orientation},${magnification},${eci},${size},${readerInit},${appendCount},${appendId}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    // -------- Shapes --------

    box(width: number, height: number, opts: ShapeOptions = {}): this {
        const unit = opts.unit ?? 'in';
        const thickness = opts.thickness ?? 1;
        const color = opts.color ?? 'B';
        const rounding = opts.rounding ?? 0;
        this.commands.push(
            `^GB${this.toDots(width, unit)},${this.toDots(height, unit)},${thickness},${color},${rounding}^FS`,
        );
        return this;
    }

    diagonalLine(xEnd: number, yEnd: number, opts: ShapeOptions = {}): this {
        const unit = opts.unit ?? 'in';
        const thickness = opts.thickness ?? 1;
        const color = opts.color ?? 'B';
        const rounding = opts.rounding ?? 0;
        this.commands.push(
            `^GD${this.toDots(xEnd, unit)},${this.toDots(yEnd, unit)},${thickness},${color},${rounding}^FS`,
        );
        return this;
    }

    circle(diameter: number, opts: CircleOptions = {}): this {
        const unit = opts.unit ?? 'in';
        const thickness = opts.thickness ?? 1;
        const color = opts.color ?? 'B';
        this.commands.push(`^GC${this.toDots(diameter, unit)},${thickness},${color}^FS`);
        return this;
    }

    // -------- Graphic fields --------

    graphicField(data: string, width: number, height: number, format: GraphicFormat = 'A'): this {
        this.commands.push(
            `^GF${format},${width},${height},${data.length}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    graphicFieldCompressed(data: string, width: number, height: number, bytesPerRow: number): this {
        this.commands.push(
            `^GFA,${width},${height},${bytesPerRow},${data.length}`,
            `^FD${data}^FS`,
        );
        return this;
    }

    // -------- Label / format config --------

    printOrientation(orientation: PrintOrientation = 'N'): this {
        this.commands.push(`^PO${orientation}`);
        return this;
    }

    mirror(enabled = true): this {
        this.commands.push(enabled ? '^PMY' : '^PMN');
        return this;
    }

    characterEncoding(encoding = 28, sourceEncoding?: number): this {
        const source = sourceEncoding !== undefined ? `,${sourceEncoding}` : '';
        this.commands.push(`^CI${encoding}${source}`);
        return this;
    }

    defaultFont(name: string, height: number, opts: FontOptions = {}): this {
        const unit = opts.unit ?? 'in';
        const orientation = opts.orientation ?? 'N';
        const heightDots = this.toDots(height, unit);
        const widthDots = opts.width !== undefined ? this.toDots(opts.width, unit) : heightDots;
        this.commands.push(`^CF${orientation}${name},${heightDots},${widthDots}`);
        return this;
    }

    escapeCharacter(escape: string): this {
        this.commands.push(`^FH${escape}`);
        return this;
    }

    fieldReverse(): this {
        this.commands.push('^FR');
        return this;
    }

    labelShift(shift: number): this {
        this.commands.push(`^LS${shift}`);
        return this;
    }

    labelHome(x: number, y: number): this {
        this.commands.push(`^LH${x},${y}`);
        return this;
    }

    fieldBlock(width: number, maxLines: number, secondaryParameter: number, justification: string, hangingIndent: number): this {
        this.commands.push(`^FB${width},${maxLines},${secondaryParameter},${justification},${hangingIndent}`);
        return this;
    }

    fieldHex(): this {
        this.commands.push(`^FH\\`);
        return this;
    }

    comment(comment: string): this {
        this.commands.push(`^FX${comment}`);
        return this;
    }

    labelLength(length: number, unit: Unit = 'in'): this {
        this.commands.push(`^LL${this.toDots(length, unit)}`);
        return this;
    }

    labelWidth(width: number, unit: Unit = 'in'): this {
        this.commands.push(`^PW${this.toDots(width, unit)}`);
        return this;
    }

    printQuantity(quantity: number, opts: PrintQuantityOptions = {}): this {
        const copies = opts.copies ?? 1;
        const pause = opts.pause !== undefined ? `,${opts.pause}` : '';
        this.commands.push(`^PQ${quantity},${copies}${pause}`);
        return this;
    }

    mediaTracking(mode: MediaTrackingMode = 'N'): this {
        this.commands.push(`^MN${mode}`);
        return this;
    }

    barcodeDefaults(moduleWidth: number, opts: BarcodeDefaultsOptions = {}): this {
        let cmd = `^BY${moduleWidth}`;
        if (opts.wideToNarrowRatio !== undefined) {
            cmd += `,${opts.wideToNarrowRatio}`;
            if (opts.height !== undefined) cmd += `,${opts.height}`;
        } else if (opts.height !== undefined) {
            cmd += `,,${opts.height}`;
        }
        this.commands.push(cmd);
        return this;
    }

    downloadFormat(name: string, data: string): this {
        this.commands.push(`^DF${name}`, data, END_CMD);
        return this;
    }

    recallFormat(name: string): this {
        this.commands.push(`^XF${name}`);
        return this;
    }

    // -------- Rendering --------

    /**
     * Build a Labelary preview URL for the current label.
     * Use `width` / `height` to control the rendered canvas size.
     */
    preview(opts: PreviewOptions = {}): string {
        const zpl = this.render();
        const parts: string[] = [`zpl=${encodeURIComponent(zpl)}`];
        const unit = opts.unit ?? 'in';
        if (opts.width !== undefined) {
            parts.push(`width=${unit === 'mm' ? opts.width / MM_PER_INCH : opts.width}`);
        }
        if (opts.height !== undefined) {
            parts.push(`height=${unit === 'mm' ? opts.height / MM_PER_INCH : opts.height}`);
        }
        parts.push(`dpmm=${Math.round(this.dpi / MM_PER_INCH)}`);
        return `https://labelary.com/viewer.html?${parts.join('&')}`;
    }

    /** Render the complete ZPL string ready to send to a printer. */
    render(): string {
        return this.commands.join('') + END_CMD;
    }

    /** Reset state so the builder can compose a new label. */
    reset(): this {
        this.commands = [START_CMD];
        this.currentX = 0;
        this.currentY = 0;
        return this;
    }
}
