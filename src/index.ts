/**
 * ZPL Fluent API — main entry point.
 *
 * A fluent TypeScript API for ZPL (Zebra Programming Language) with real-world
 * measurements and a Labelary-based preview helper.
 */

export { ZebraBuilder } from './zebra_builder';
export type {
    Orientation,
    PrintOrientation,
    Unit,
    Color,
    QrErrorCorrection,
    Code128Mode,
    GraphicFormat,
    MediaTrackingMode,
    FontOptions,
    Barcode128Options,
    Barcode39Options,
    Barcode93Options,
    Interleaved2of5Options,
    EAN13Options,
    UPcaOptions,
    CodabarOptions,
    FieldNumberOptions,
    FieldVariableOptions,
    QrCodeOptions,
    DataMatrixOptions,
    AztecOptions,
    ShapeOptions,
    CircleOptions,
    PrintQuantityOptions,
    BarcodeDefaultsOptions,
    PreviewOptions,
} from './zebra_builder';
