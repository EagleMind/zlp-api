# Zebra Printer Templating API 🏷️

Design beautiful labels for Zebra printers without the headache of cryptic ZPL commands. Use real-world measurements (inches/mm) instead of counting dots!

[![npm version](https://img.shields.io/npm/v/zpl-fluent-api.svg)](https://www.npmjs.com/package/zpl-fluent-api)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## ✨ Why Zebra Printer Templating API?

Writing raw ZPL code is painful. You have to:
- Manually convert inches to dots based on printer DPI
- Memorize cryptic commands like `^FO150,300^BCN,225,Y,N,A`
- Debug by trial and error
- No type safety or autocomplete

**Zebra Printer Templating API** solves all of this:

```typescript
// ❌ Old way (cryptic ZPL)
const zpl = '^XA^FO150,150^A0N,75,75^FDASSET TAG^FS^FO150,300^BCN,225,Y,N,A^FD12345^FS^XZ';

// ✅ New way (fluent & readable)
const zpl = new ZebraBuilder(300)
  .origin(0.5, 0.5)        // Position in inches
  .font('0', 0.25)         // Font with real height
  .text('ASSET TAG')
  .origin(0.5, 1.0)
  .barcode128('12345', 0.75)  // Barcode with readable height
  .render();
```

## 🚀 Quick Start

### Installation

```bash
npm install zpl-fluent-api
```

### Your First Label

```typescript
import { ZebraBuilder } from 'zpl-fluent-api';

// Create a simple asset tag label
const zpl = new ZebraBuilder(300)  // 300 DPI printer
  .origin(0.5, 0.5)               // 0.5" from left, 0.5" from top
  .font('0', 0.25)                // Font 0, 0.25" height
  .text('ASSET TAG')
  .origin(0.5, 1.0)               // Move to next position
  .barcode128('12345', 0.75)      // Code 128 barcode, 0.75" height
  .render();

console.log(zpl);
// Output: ^XA^FO150,150^A0N,75,75^FDASSET TAG^FS^FO150,300^BCN,225,Y,N,A^FD12345^FS^XZ
```

### Preview in Browser

```typescript
const previewUrl = new ZebraBuilder(300)
  .origin(0.5, 0.5)
  .font('0', 0.25)
  .text('ASSET TAG')
  .origin(0.5, 1.0)
  .barcode128('12345', 0.75)
  .preview();

console.log(`Open this URL to preview: ${previewUrl}`);
// Opens Labelary viewer in your browser!
```

## 📚 Features

- **🎯 DPI-Aware** - Automatic conversion from inches/mm to printer dots
- **🔗 Fluent Interface** - Chain methods for intuitive label design
- **🛡️ Type Safety** - Full TypeScript support with comprehensive types
- **✅ Validation** - Built-in text validation for ZPL compatibility
- **👁️ Preview Integration** - Instant browser preview via Labelary
- **🏭 Production Ready** - Comprehensive error handling
- **📊 37+ ZPL Commands** - All major template-building commands
- **🔢 10+ Barcode Types** - Code 128, Code 39, QR, Data Matrix, Aztec, EAN, UPC, and more
- **🎨 Advanced Graphics** - Boxes, circles, ellipses, diagonal lines, and images
- **⚙️ Label Configuration** - Length, width, quantity, orientation, and more

## 📖 API Reference

### Constructor

```typescript
new ZebraBuilder(dpi?: number)
```

**Parameters:**
- `dpi` - Printer DPI (dots per inch). Default: `203`

**Common DPI values:**
- `150` (6 dpmm) - Low resolution
- `203` (8 dpmm) - Standard (default)
- `300` (12 dpmm) - High resolution
- `600` (24 dpmm) - Ultra high resolution

---

### 📍 Positioning & Text

#### `origin(x, y, unit?)`
Sets the field position (ZPL `^FO` command).

```typescript
.origin(1.0, 2.0)           // 1" from left, 2" from top
.origin(25, 50, 'mm')       // 25mm from left, 50mm from top
```

#### `font(name, height, unit?, width?, orientation?)`
Sets font properties (ZPL `^A` command).

```typescript
.font('0', 0.25)                    // Font 0, 0.25" height
.font('A', 12, 'mm')                // Font A, 12mm height
.font('0', 0.3, 'in', 0.25, 'R')    // Font 0, 0.3" height × 0.25" width, rotated 90°
```

#### `text(content)`
Adds text content (ZPL `^FD` command).

```typescript
.text('Hello World')        // Normal text
```

#### `fieldPosition(x, y, unit?)`
Alternative field positioning (ZPL `^FT` command).

```typescript
.fieldPosition(1.0, 2.0)     // 1" from left, 2" from top
```

---

### 🔢 Barcodes

#### `barcode128(data, height, opts?)`
Code 128 barcode (ZPL `^BC` command).

```typescript
.barcode128('123456789', 0.75)                    // Standard
.barcode128('ABC123', 15, 'mm', { printText: false })  // No text
.barcode128('DATA', 0.5, 'in', { printText: true, textAbove: true })
```

#### `barcode39(data, height, opts?)`
Code 39 barcode (ZPL `^B3` command).

```typescript
.barcode39('ABC123', 0.5)                    // Standard
.barcode39('DATA', 15, 'mm', { printText: false })
.barcode39('DATA', 0.5, 'in', { checkDigit: true })
```

#### `qr_code(data, opts?)`
QR Code (ZPL `^BQ` command).

```typescript
.qr_code('https://example.com')                    // Standard
.qr_code('DATA', { magnification: 3, errorCorrection: 'H' })
```

#### `dataMatrix(data, height, opts?)`
Data Matrix (ZPL `^BX` command).

```typescript
.dataMatrix('DATA123', 100, { unit: 'dots', qualityLevel: 200 })
```

#### `aztec(data, opts?)`
Aztec barcode (ZPL `^BO` command).

```typescript
.aztec('DATA123', { magnification: 5 })
```

#### `barcode93(data, height, opts?)`
Code 93 barcode (ZPL `^BA` command).

```typescript
.barcode93('ABC123', 0.5)
```

#### `interleaved2of5(data, height, opts?)`
Interleaved 2 of 5 (ZPL `^BD` command).

```typescript
.interleaved2of5('12345', 0.75)
```

#### `ean13(data, height, opts?)`
EAN-13 barcode (ZPL `^BE` command).

```typescript
.ean13('123456789012', 0.75)
```

#### `upcA(data, height, opts?)`
UPC-A barcode (ZPL `^BU` command).

```typescript
.upcA('123456789012', 0.75)
```

#### `codabar(data, height, opts?)`
Codabar barcode (ZPL `^BK` command).

```typescript
.codabar('A123456B', 0.5)
```

---

### 🎨 Shapes & Graphics

#### `box(width, height, opts?)`
Draws a box/rectangle (ZPL `^GB` command).

```typescript
.box(4, 2)                           // 4" × 2" box
.box(100, 50, { unit: 'mm', thickness: 3 })
.box(2, 1, { unit: 'in', color: 'B', rounding: 3 })
```

#### `diagonalLine(xEnd, yEnd, opts?)`
Draws a diagonal line (ZPL `^GD` command).

```typescript
.diagonalLine(100, 100)                    // Diagonal line
.diagonalLine(50, 75, { unit: 'mm', thickness: 2, color: 'W' })
```

#### `circle(diameter, opts?)`
Draws a circle (ZPL `^GC` command).

```typescript
.circle(50)                                // 50" diameter
.circle(25, { unit: 'mm', thickness: 2, color: 'W' })
```

#### `ellipse(horizontalDiameter, verticalDiameter, opts?)`
Draws an ellipse (ZPL `^GE` command).

```typescript
.ellipse(100, 50)                          // 100" × 50" ellipse
.ellipse(50, 25, { unit: 'mm', thickness: 2 })
```

#### `graphicField(data, width, height, format?)`
Graphic field from hex data (ZPL `^GF` command).

```typescript
.graphicField('48484848484848', 10, 10)     // ASCII hex
.graphicField('DATA', 10, 10, 'B')          // Binary format
```

#### `recallGraphic(name, x, y, unit?)`
Recall stored graphic (ZPL `^XG` command).

```typescript
.recallGraphic('LOGO', 0.5, 0.5)
```

---

### ⚙️ Configuration

#### `labelLength(length, unit?)`
Sets label length (ZPL `^LL` command).

```typescript
.labelLength(4, 'in')              // 4 inch label
.labelLength(100, 'mm')            // 100mm label
```

#### `labelWidth(width, unit?)`
Sets label width (ZPL `^PW` command).

```typescript
.labelWidth(6, 'in')               // 6 inch width
```

#### `printQuantity(quantity, opts?)`
Sets print quantity (ZPL `^PQ` command).

```typescript
.printQuantity(10)                 // Print 10 labels
.printQuantity(5, { copies: 2, pause: 500 })
```

#### `printOrientation(orientation?)`
Changes print orientation (ZPL `^PO` command).

```typescript
.printOrientation('I')             // Invert orientation
.printOrientation('N')             // Normal
```

#### `mirror(enabled?)`
Mirrors label output (ZPL `^PM` command).

```typescript
.mirror(true)                      // Mirror label
.mirror(false)                     // Normal
```

#### `characterEncoding(encoding, sourceEncoding?)`
Sets character encoding (ZPL `^CI` command).

```typescript
.characterEncoding(28)             // UTF-8
.characterEncoding(28, 850)        // UTF-8 with CP-850 source
```

#### `defaultFont(name, height, opts?)`
Sets default font (ZPL `^CF` command).

```typescript
.defaultFont('0', 30, { unit: 'mm', width: 25, orientation: 'R' })
```

#### `defaultOrientation(orientation?)`
Sets default field orientation (ZPL `^FW` command).

```typescript
.defaultOrientation('N')           // Normal
.defaultOrientation('R')           // Rotated 90°
```

---

### 🔧 Field Options

#### `fieldReverse()`
Reverses field colors (ZPL `^FR` command).

```typescript
.fieldReverse()                    // White text on black
```

#### `fieldBlock(width, maxLines, secondaryParameter, justification, hangingIndent)`
Multi-line text block (ZPL `^FB` command).

```typescript
.fieldBlock(200, 5, 0, 'L', 0)
```

#### `fieldNumber(fieldNumber, opts?)`
Named field (ZPL `^FN` command).

```typescript
.fieldNumber(1)
.fieldNumber(2, { formatNumber: 100 })
```

#### `fieldVariable(fieldNumber, opts?)`
Variable field (ZPL `^FV` command).

```typescript
.fieldVariable(1)
```

#### `fieldExtraction(sourceField, startPosition, length, opts?)`
Data extraction (ZPL `^FE` command).

```typescript
.fieldExtraction(1, 0, 10)
```

#### `escapeCharacter(escape)`
Sets escape character (ZPL `^FH` command).

```typescript
.escapeCharacter('_')              // Use underscore as escape
```

#### `fieldHex()`
Enables hex mode (ZPL `^FH` command).

```typescript
.fieldHex()
```

#### `comment(text)`
Adds comment (ZPL `^FX` command).

```typescript
.comment('This is a comment')
```

---

### 🏷️ Label Settings

#### `labelHome(x, y)`
Sets label home position (ZPL `^LH` command).

```typescript
.labelHome(10, 10)
```

#### `labelShift(shift)`
Shifts label position (ZPL `^LS` command).

```typescript
.labelShift(10)
```

#### `mediaTracking(mode?)`
Sets media tracking (ZPL `^MN` command).

```typescript
.mediaTracking('A')                // Advanced tracking
.mediaTracking('N')                // No tracking
```

#### `barcodeDefaults(moduleWidth, opts?)`
Sets barcode defaults (ZPL `^BY` command).

```typescript
.barcodeDefaults(3, { wideToNarrowRatio: 2.5, height: 80 })
```

#### `downloadFormat(name, data)`
Downloads format to memory (ZPL `^DF` command).

```typescript
.downloadFormat('TEMPLATE', '^XA^FO100,100^FDTEMPLATE^FS^XZ')
```

#### `recallFormat(name)`
Recalls format from memory (ZPL `^XF` command).

```typescript
.recallFormat('TEMPLATE')
```

---

### 🛠️ Utility Methods

#### `render()`
Returns the complete ZPL code.

```typescript
const zpl = builder.render();
```

#### `preview(labelWidth?, labelHeight?)`
Generates a Labelary preview URL.

```typescript
const url = builder.preview();              // Default 4×6 inch
const url = builder.preview(3, 2);         // 3×2 inch label
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

---

## 💡 Examples

### 🏷️ Product Label

```typescript
const productLabel = new ZebraBuilder(300)
  .characterEncoding(28)                    // UTF-8 encoding
  .barcodeDefaults(2, { wideToNarrowRatio: 3, height: 80 })
  .box(2, 1, { thickness: 3 })              // Border box
  .origin(0.1, 0.1)
  .defaultFont('0', 0.12, { unit: 'in' })
  .text('PRODUCT')
  .origin(0.1, 0.3)
  .qr_code('https://example.com/product/123', { magnification: 4, errorCorrection: 'M' })
  .origin(0.1, 0.5)
  .barcode39('ABC123', 0.4, { unit: 'in', printText: true, checkDigit: true })
  .origin(1.5, 0.8)
  .font('0', 0.15, { unit: 'in', width: 0.15, orientation: 'R' })
  .fieldReverse()
  .text('$29.99')
  .printQuantity(1)
  .comment('End of label')
  .render();
```

### 📊 Multi-Barcode Label

```typescript
const multiBarcodeLabel = new ZebraBuilder(203)
  .origin(0.25, 0.25)
  .font('0', 0.15)
  .text('MULTI-BARCODE EXAMPLE')
  .origin(0.25, 0.5)
  .qr_code('https://example.com', { magnification: 3, errorCorrection: 'H' })
  .origin(0.25, 1.0)
  .dataMatrix('DATA123', 100, { unit: 'dots', qualityLevel: 200, columns: 24, rows: 24 })
  .origin(0.25, 1.5)
  .aztec('AZTEC123', { magnification: 5, eci: true, size: 15 })
  .origin(0.25, 2.0)
  .circle(50, { thickness: 2 })
  .render();
```

### 🎨 Graphic-Intensive Label

```typescript
const graphicLabel = new ZebraBuilder(300)
  .box(4, 3, { thickness: 3 })
  .origin(0.1, 0.1)
  .circle(30, { thickness: 2 })
  .origin(0.5, 0.1)
  .diagonalLine(100, 50, { thickness: 2 })
  .origin(0.1, 0.5)
  .font('0', 0.12)
  .fieldReverse()
  .text('GRAPHIC LABEL')
  .origin(0.1, 0.8)
  .font('0', 0.08)
  .text('with shapes and graphics')
  .origin(0.1, 1.2)
  .graphicField('48484848484848', 20, 10)
  .origin(0.1, 1.8)
  .barcode128('GRAPHIC123', 0.5)
  .mirror(true)
  .render();
```

### 📏 Metric Units

```typescript
const metricLabel = new ZebraBuilder(203)
  .origin(10, 10, 'mm')      // 10mm from edges
  .font('0', 5, { unit: 'mm' })
  .text('METRIC LABEL')
  .origin(10, 20, 'mm')
  .barcode128('987654321', 15, { unit: 'mm' })
  .box(90, 50, { unit: 'mm', thickness: 2 })
  .render();
```

### 🏪 Retail Label with EAN-13

```typescript
const retailLabel = new ZebraBuilder(300)
  .origin(0.25, 0.25)
  .font('0', 0.2)
  .text('PREMIUM COFFEE')
  .origin(0.25, 0.5)
  .ean13('123456789012', 0.75, { printText: true })
  .origin(0.25, 1.0)
  .font('0', 0.15)
  .text('$12.99')
  .origin(2.5, 0.5)
  .qr_code('https://shop.example.com/coffee', { magnification: 5 })
  .render();
```

---

## 🎯 DPI Support

The library automatically converts your measurements to dots based on your printer's DPI:

| DPI | dpmm | Use Case |
|-----|------|----------|
| 150 | 6 | Low resolution, draft printing |
| 203 | 8 | Standard thermal printers (default) |
| 300 | 12 | High resolution, detailed labels |
| 600 | 24 | Ultra high resolution, small text |

```typescript
// All of these produce the same physical size on their respective printers
new ZebraBuilder(203).origin(1, 1)     // 203 dots
new ZebraBuilder(300).origin(1, 1)     // 300 dots
new ZebraBuilder(600).origin(1, 1)     // 600 dots
```

---

## ⚠️ Error Handling

The library includes built-in validation to catch common mistakes:

```typescript
try {
  const builder = new ZebraBuilder(300);
  builder.text('Valid text');
  const zpl = builder.render();
} catch (error) {
  console.error('ZPL Error:', error.message);
}
```

Common errors caught:
- Invalid DPI values
- Unsupported characters in text
- Invalid orientation values

---

## 👁️ Browser Preview

The `preview()` method generates URLs that work with [Labelary's online ZPL viewer](https://labelary.com):

```typescript
const url = builder.preview();
// Opens: http://labelary.com/viewer.html?zpl=^XA^FO100^FDHello^FS^XZ

// Custom label size
const customUrl = builder.preview(3, 2);  // 3×2 inch label
```

Just open the URL in your browser to see your label rendered instantly!

---

## 🛡️ TypeScript Support

Full TypeScript definitions included for excellent autocomplete and type safety:

```typescript
import { ZebraBuilder } from 'zpl-fluent-api';

const builder: ZebraBuilder = new ZebraBuilder(300);
const url: string = builder.preview();
```

All options interfaces are fully typed:

```typescript
const opts: Barcode128Options = {
  printText: true,
  textAbove: false,
  orientation: 'N',
  checkDigit: false,
  mode: 'A'
};
```

---

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure all tests pass (`npm test`)
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for developers who love clean, readable code
- Inspired by the need to make ZPL accessible to everyone
- Thanks to Zebra Technologies for the ZPL specification

---

## 📞 Support

- 📖 [Documentation](https://github.com/EagleMind/zlp-api#readme)
- 🐛 [Report Issues](https://github.com/EagleMind/zlp-api/issues)
- 💬 [Discussions](https://github.com/EagleMind/zlp-api/discussions)

---

**Made with ❤️ for label designers everywhere**
