# ZPL Fluent API - ZebraBuilder

A production-grade TypeScript library that provides a fluent, English-friendly interface for ZPL (Zebra Programming Language). Design labels using real-world measurements (inches/mm) instead of cryptic ZPL commands and dot coordinates.

## Features

- **DPI-Aware**: Automatic conversion from inches/mm to printer dots
- **Fluent Interface**: Method chaining for intuitive label design
- **Type Safety**: Full TypeScript support with comprehensive typing
- **Validation**: Built-in text validation for ZPL compatibility
- **Preview Integration**: Instant browser preview via Labelary service
- **Production Ready**: Comprehensive error handling and documentation
- **Comprehensive ZPL Support**: All major ZPL commands including advanced barcodes, graphics, and formatting
- **Multiple Barcode Types**: Code 128, Code 39, QR Codes, Data Matrix, Aztec, and more
- **Advanced Graphics**: Boxes, circles, diagonal lines, and image support
- **Printer Configuration**: Label length, print quantity, media tracking, and format management

## Installation

```bash
npm install zpl-fluent-api
```

## Quick Start

```typescript
import { ZebraBuilder } from 'zpl-fluent-api';

// Basic asset tag label
const zpl = (new ZebraBuilder(300)  // 300 DPI printer
  .origin(0.5, 0.5)                 // Position 0.5" from left, 0.5" from top
  .font("0", 0.25)                  // Font 0, 0.25" height
  .text("ASSET TAG")                // Add text
  .origin(0.5, 1.0)                 // Move to next position
  .barcode_128("12345", 0.75)       // Add Code 128 barcode, 0.75" height
  .render());

console.log(zpl);
// Output: ^XA^FO150,150^A0N,75,75^FDASSET TAG^FS^FO150,300^BCN,225,Y,N,A^FD12345^FS^XZ

// Preview in browser
const previewUrl = new ZebraBuilder(300)
  .origin(0.5, 0.5)
  .font("0", 0.25)
  .text("ASSET TAG")
  .origin(0.5, 1.0)
  .barcode_128("12345", 0.75)
  .preview();

console.log(`Open this URL to preview: ${previewUrl}`);
```

## API Reference

### Constructor

```typescript
new ZebraBuilder(dpi?: number)
```

- `dpi`: Printer DPI (dots per inch). Default: 203

### Core Methods

#### `origin(x, y, unit?)`
Sets the field position (ZPL `^FO` command).

```typescript
.origin(1.0, 2.0)           // 1" from left, 2" from top
.origin(25, 50, 'mm')       // 25mm from left, 50mm from top
```

#### `font(name, height, unit?, width?, orientation?)`
Sets font properties (ZPL `^A` command).

```typescript
.font("0", 0.25)                    // Font 0, 0.25" height
.font("A", 12, 'mm')                // Font A, 12mm height
.font("0", 0.3, 'in', 0.25, 'R')    // Font 0, 0.3" height × 0.25" width, rotated 90°
```

#### `text(content, orientation?)`
Adds text content (ZPL `^FD` command).

```typescript
.text("Hello World")                 // Normal text
.text("Part Number", "R")            // Rotated text
```

#### `barcode_128(data, height, unit?, printText?, textAbove?, orientation?, checkDigit?, mode?)`
Adds Code 128 barcode (ZPL `^BC` command).

```typescript
.barcode_128("123456789", 0.75)                    // Standard barcode
.barcode_128("ABC123", 15, 'mm', false)            // 15mm height, no text
.barcode_128("DATA", 0.5, 'in', true, true)        // Text above barcode
.barcode_128("DATA", 0.5, 'in', true, false, 'N', true, 'U') // With UCC check digit and UCC mode
```

#### `barcode_39(data, height, unit?, printText?, orientation?, checkDigit?)`
Adds Code 39 barcode (ZPL `^B3` command).

```typescript
.barcode_39("ABC123", 0.5)                    // Standard barcode
.barcode_39("DATA", 15, 'mm', false)            // 15mm height, no text
.barcode_39("DATA", 0.5, 'in', true, 'N', true) // With modulo 43 check digit
```

#### `qr_code(data, magnification?, errorCorrection?, orientation?, model?)`
Adds QR Code barcode (ZPL `^BQ` command).

```typescript
.qr_code("https://example.com")                    // Standard QR code
.qr_code("DATA", 3, 'H', 'R', 1)              // High error correction, rotated, V1 model
```

#### `data_matrix(data, height, qualityLevel?, columns?, rows?, format?, orientation?, escape?, aspectRatio?)`
Adds Data Matrix barcode (ZPL `^BX` command).

```typescript
.data_matrix("DATA123", 100, 200, 24, 24)    // Standard Data Matrix
.data_matrix("DATA", 100, 200, 24, 24, 0, 'N', '_', 2) // With custom format and aspect ratio
```

#### `aztec(data, magnification?, orientation?, eci?, size?, readerInit?, structuredAppendCount?, structuredAppendMessageId?)`
Adds Aztec barcode (ZPL `^BO` command).

```typescript
.aztec("DATA123", 5)                              // Standard Aztec
.aztec("DATA", 5, 'N', true, 15, true)         // With ECI and reader initialization
```

#### `box(width, height, thickness?, unit?, color?, rounding?)`
Draws a box/rectangle (ZPL `^GB` command).

```typescript
.box(4, 2)                           // 4" × 2" box, 1 dot thickness
.box(100, 50, 3, 'mm')               // 100mm × 50mm box, 3 dot thickness
.box(2, 1, 2, 'in', 'B', 3)         // Black box with rounded corners
```

#### `diagonal_line(xEnd, yEnd, thickness?, unit?, color?, rounding?)`
Draws a diagonal line (ZPL `^GD` command).

```typescript
.diagonal_line(100, 100)                    // Diagonal line to 100,100
.diagonal_line(50, 75, 2, 'mm', 'W')        // White diagonal line, 2mm thickness
```

#### `circle(diameter, thickness?, unit?, color?)`
Draws a circle (ZPL `^GC` command).

```typescript
.circle(50)                                // 50" diameter circle
.circle(25, 2, 'mm', 'W')                // White circle, 25mm diameter, 2mm thickness
```

#### `graphic_field(data, width, height, format?)`
Adds graphic field from ASCII hex data (ZPL `^GF` command).

```typescript
.graphic_field("48484848484848", 10, 10)     // ASCII hex graphic
.graphic_field("DATA", 10, 10, 'B')             // Binary format graphic
```

#### `graphic_field_compressed(data, width, height, bytesPerRow)`
Adds compressed graphic field (ZPL `^GFA` command).

```typescript
.graphic_field_compressed("COMPRESSED_DATA", 10, 10, 5) // Compressed graphic
```

#### `print_orientation(orientation?)`
Changes print orientation (ZPL `^PO` command).

```typescript
.print_orientation('I')             // Invert print orientation
.print_orientation('N')             // Normal orientation
```

#### `mirror(mirror?)`
Mirrors label output horizontally (ZPL `^PM` command).

```typescript
.mirror(true)                     // Mirror label output
```

#### `character_encoding(encoding?, sourceEncoding?)`
Sets character encoding (ZPL `^CI` command).

```typescript
.character_encoding(28)             // UTF-8 encoding
.character_encoding(28, 850)           // UTF-8 with CP-850 source
```

#### `default_font(name, height, unit?, width?, orientation?)`
Sets default font for all subsequent fields (ZPL `^CF` command).

```typescript
.default_font('0', 30, 'mm', 25, 'R')    // Default rotated font
```

#### `escape_character(escape)`
Sets escape character for special characters (ZPL `^FH` command).

```typescript
.escape_character('_')              // Use underscore as escape character
```

#### `field_reverse()`
Reverses field colors (black on white) (ZPL `^FR` command).

```typescript
.field_reverse()                   // White text on black background
```

#### `comment(comment)`
Adds comment to label (ZPL `^FX` command).

```typescript
.comment('This is a comment')    // Add comment
```

### Label Configuration Methods

#### `label_length(length, unit?)`
Sets label length (ZPL `^LL` command).

```typescript
.label_length(4, 'in')              // 4 inch label length
.label_length(100, 'mm')             // 100mm label length
```

#### `print_quantity(quantity, copies?, pause?)`
Sets print quantity and copies (ZPL `^PQ` command).

```typescript
.print_quantity(10)                 // Print 10 labels
.print_quantity(5, 2, 500)          // 5 labels, 2 copies each, 500ms pause
```

#### `media_tracking(mode?)`
Sets media tracking mode (ZPL `^MN` command).

```typescript
.media_tracking('A')                // Advanced tracking
.media_tracking('N')                // No tracking
```

#### `barcode_defaults(moduleWidth, wideToNarrowRatio?, height?)`
Sets barcode defaults (ZPL `^BY` command).

```typescript
.barcode_defaults(3, 2.5, 80)       // Module width 3, ratio 2.5, height 80
```

#### `download_format(name, data)`
Downloads format to printer memory (ZPL `^DF` command).

```typescript
.download_format('TEMPLATE', '^XA^FO100,100^FDTEMPLATE^FS^XZ')
```

#### `recall_format(name)`
Recalls format from printer memory (ZPL `^XF` command).

```typescript
.recall_format('TEMPLATE')
```

### Utility Methods

#### `preview(labelWidth?, labelHeight?)`
Generates a Labelary preview URL.

```typescript
.preview()                           // Default 4×6 inch label
.preview(3, 2)                       // 3×2 inch label
```

#### `render()`
Returns the complete ZPL code.

```typescript
const zpl = builder.render();
```

#### `reset()`
Resets the builder for a new label.

```typescript
builder.reset().origin(0, 0)...
```

#### `getDPI()`
Returns the current DPI setting.

```typescript
const dpi = builder.getDPI(); // 300
```

#### `getCurrentPosition()`
Returns current position in dots.

```typescript
const pos = builder.getCurrentPosition(); // {x: 150, y: 300}
```

## Advanced Examples

### Comprehensive Product Label

```typescript
const comprehensiveLabel = (new ZebraBuilder(300))
  .character_encoding(28)                    // UTF-8 encoding
  .barcode_defaults(2, 3, 80)               // Set barcode defaults
  .box(2, 1, 3)                            // Border box
  .origin(0.1, 0.1)
  .default_font('0', 0.12, 'in')          // Default font
  .text('PRODUCT')                           // Product name
  .origin(0.1, 0.3)
  .qr_code('https://example.com/product/123', 4, 'M')  // QR code
  .origin(0.1, 0.5)
  .barcode_39('ABC123', 0.4, 'in', true, 'N', true) // Code 39 with check digit
  .origin(1.5, 0.8)
  .font('0', 0.15, 'in', 0.15, 'R')   // Rotated price
  .field_reverse()                           // White text on black
  .text('$29.99')                           // Price
  .print_quantity(1)                         // Print one label
  .comment('End of label')                    // Comment
  .render();
```

### Multi-Barcode Label

```typescript
const multiBarcodeLabel = (new ZebraBuilder(203))
  .origin(0.25, 0.25)
  .font('0', 0.15)
  .text('MULTI-BARCODE EXAMPLE')
  .origin(0.25, 0.5)
  .qr_code('https://example.com', 3, 'H')     // High error correction QR
  .origin(0.25, 1.0)
  .data_matrix('DATA123', 100, 200, 24, 24) // Data Matrix
  .origin(0.25, 1.5)
  .aztec('AZTEC123', 5, 'N', true, 15)      // Aztec with ECI
  .origin(0.25, 2.0)
  .circle(50, 2)                             // Circle indicator
  .render();
```

### Graphic-intensive Label

```typescript
const graphicLabel = (new ZebraBuilder(300))
  .box(4, 3, 3)                            // Main border
  .origin(0.1, 0.1)
  .circle(30, 2)                            // Logo circle
  .origin(0.5, 0.1)
  .diagonal_line(100, 50, 2)               // Diagonal accent
  .origin(0.1, 0.5)
  .font('0', 0.12)
  .field_reverse()                           // White text
  .text('GRAPHIC LABEL')                     // Title
  .origin(0.1, 0.8)
  .font('0', 0.08)
  .text('with shapes and graphics')
  .origin(0.1, 1.2)
  .graphic_field('48484848484848', 20, 10)     // Hex graphic data
  .origin(0.1, 1.8)
  .barcode_128('GRAPHIC123', 0.5)
  .mirror(true)                              // Mirror for special effect
  .render();
```

### Metric Units Example

```typescript
const metricLabel = (new ZebraBuilder(203)
  .origin(10, 10, 'mm')      // 10mm from edges
  .font("0", 5, 'mm')        // 5mm font height
  .text("METRIC LABEL")
  .origin(10, 20, 'mm')
  .barcode_128("987654321", 15, 'mm')
  .box(90, 50, 2, 'mm')      // 90mm × 50mm box
  .render());
```

## DPI Support

The library supports common printer DPI values:
- 150 DPI (6 dpmm)
- 203 DPI (8 dpmm) - Default
- 300 DPI (12 dpmm)
- 600 DPI (24 dpmm)

All measurements are automatically converted to dots based on the specified DPI.

## Error Handling

The library includes built-in validation:

```typescript
try {
  const builder = new ZebraBuilder(300);
  builder.text("Valid text");
  const zpl = builder.render();
} catch (error) {
  console.error("ZPL Error:", error.message);
}
```

## Labelary Preview

The `preview()` method generates URLs that work with Labelary's online ZPL viewer:

```typescript
const url = builder.preview();
// Opens: http://labelary.com/viewer.html?zpl=^XA^FO100^FDHello^FS^XZ
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { ZebraBuilder } from 'zpl-fluent-api';

const builder: ZebraBuilder = new ZebraBuilder(300);
const url: string = builder.preview();
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
