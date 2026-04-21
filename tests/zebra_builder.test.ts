/**
 * Tests for the ZebraBuilder fluent API.
 */

import { ZebraBuilder } from '../src/zebra_builder';

describe('ZebraBuilder', () => {
  let builder: ZebraBuilder;

  beforeEach(() => {
    builder = new ZebraBuilder(203);
  });

  describe('Basic Functionality', () => {
    it('creates a basic label with text', () => {
      const zpl = builder
        .origin(0.5, 0.5)
        .font('0', 0.25)
        .text('TEST')
        .render();

      expect(zpl).toContain('^XA');
      expect(zpl).toContain('^FO102,102');
      expect(zpl).toContain('^A0N,51,51');
      expect(zpl).toContain('^FDTEST^FS');
      expect(zpl).toContain('^XZ');
    });

    it('handles metric units correctly', () => {
      const zpl = builder
        .origin(10, 10, 'mm')
        .font('0', 5, { unit: 'mm' })
        .text('METRIC')
        .render();

      expect(zpl).toContain('^FO80,80');
      expect(zpl).toContain('^A0N,40,40');
    });

    it('supports method chaining', () => {
      const result = builder
        .origin(0.25, 0.25)
        .font('0', 0.15)
        .text('CHAIN')
        .origin(0.25, 0.5)
        .barcode128('123', 0.25)
        .render();

      expect(result).toContain('^FDCHAIN^FS');
      expect(result).toContain('^BCN,51,Y,N,N,');
      expect(result).toContain('^FD123^FS');
    });
  });

  describe('Barcode Methods', () => {
    it('creates Code 128 barcode with default settings', () => {
      const zpl = builder
        .origin(0, 0)
        .barcode128('DATA123', 0.5)
        .render();

      expect(zpl).toContain('^BCN,102,Y,N,N,');
      expect(zpl).toContain('^FDDATA123^FS');
    });

    it('creates Code 128 barcode with all options', () => {
      const zpl = builder
        .origin(0, 0)
        .barcode128('DATA123', 0.5, {
          printText: true,
          textAbove: false,
          orientation: 'N',
          checkDigit: true,
          mode: 'U',
        })
        .render();

      expect(zpl).toContain('^BCN,102,Y,N,Y,U');
      expect(zpl).toContain('^FDDATA123^FS');
    });

    it('creates Code 39 barcode', () => {
      const zpl = builder
        .origin(0, 0)
        .barcode39('ABC123', 0.5, { checkDigit: true })
        .render();

      expect(zpl).toContain('^B3N,102,Y,,Y');
      expect(zpl).toContain('^FDABC123^FS');
    });

    it('creates QR code with default settings', () => {
      const zpl = builder
        .origin(0, 0)
        .qr_code('https://example.com')
        .render();

      expect(zpl).toContain('^BQN,,5,M');
      expect(zpl).toContain('^FDhttps://example.com^FS');
    });

    it('creates QR code with custom settings', () => {
      const zpl = builder
        .origin(0, 0)
        .qr_code('DATA', {
          magnification: 3,
          errorCorrection: 'H',
          orientation: 'R',
          model: 1,
        })
        .render();

      expect(zpl).toContain('^BQR,1,3,H');
      expect(zpl).toContain('^FDDATA^FS');
    });

    it('creates Data Matrix barcode with dot-based height', () => {
      const zpl = builder
        .origin(0, 0)
        .dataMatrix('DATA123', 100, { qualityLevel: 200, columns: 24, rows: 24 })
        .render();

      expect(zpl).toContain('^BXN,100,200,24,24,0,,');
      expect(zpl).toContain('^FDDATA123^FS');
    });

    it('creates Aztec barcode', () => {
      const zpl = builder
        .origin(0, 0)
        .aztec('DATA123', {
          magnification: 5,
          eci: true,
          size: 15,
          readerInit: true,
        })
        .render();

      expect(zpl).toContain('^BON,5,Y,15,Y');
      expect(zpl).toContain('^FDDATA123^FS');
    });
  });

  describe('Graphic Methods', () => {
    it('creates a basic box', () => {
      const zpl = builder.origin(0, 0).box(2, 1).render();
      expect(zpl).toContain('^GB406,203,1,B,0^FS');
    });

    it('creates box with custom thickness and color', () => {
      const zpl = builder
        .origin(0, 0)
        .box(1, 1, { thickness: 3, color: 'W' })
        .render();

      expect(zpl).toContain('^GB203,203,3,W,0^FS');
    });

    it('creates box with rounded corners', () => {
      const zpl = builder
        .origin(0, 0)
        .box(2, 1, { rounding: 3 })
        .render();

      expect(zpl).toContain('^GB406,203,1,B,3^FS');
    });

    it('draws diagonal line', () => {
      const zpl = builder
        .origin(0, 0)
        .diagonalLine(100, 100, { thickness: 2 })
        .render();

      expect(zpl).toContain('^GD20300,20300,2,B,0^FS');
    });

    it('draws circle', () => {
      const zpl = builder
        .origin(0, 0)
        .circle(50, { thickness: 2 })
        .render();

      expect(zpl).toContain('^GC10150,2,B^FS');
    });

    it('adds graphic field', () => {
      const zpl = builder
        .origin(0, 0)
        .graphicField('48484848484848', 10, 10, 'A')
        .render();

      expect(zpl).toContain('^GFA,10,10,14');
      expect(zpl).toContain('^FD48484848484848^FS');
    });

    it('adds compressed graphic field', () => {
      const zpl = builder
        .origin(0, 0)
        .graphicFieldCompressed('DATA', 10, 10, 5)
        .render();

      expect(zpl).toContain('^GFA,10,10,5,4');
      expect(zpl).toContain('^FDDATA^FS');
    });
  });

  describe('Font Method', () => {
    it('sets font with height only', () => {
      const zpl = builder.origin(0, 0).font('0', 0.2).render();

      expect(zpl).toContain('^A0N,41,41');
    });

    it('sets font with custom width', () => {
      const zpl = builder
        .origin(0, 0)
        .font('0', 0.2, { width: 0.15 })
        .render();

      expect(zpl).toContain('^A0N,41,30');
    });

    it('sets font with orientation', () => {
      const zpl = builder
        .origin(0, 0)
        .font('0', 0.2, { orientation: 'R' })
        .render();

      expect(zpl).toContain('^A0R,41,41');
    });
  });

  describe('Utility Methods', () => {
    it('generates a preview URL with HTTPS and dpmm hint', () => {
      const url = builder
        .origin(0, 0)
        .font('0', 0.1)
        .text('PREVIEW')
        .preview();

      expect(url).toContain('https://labelary.com/viewer.html?zpl=');
      expect(url).toContain('dpmm=8'); // 203 dpi → 8 dpmm
      expect(decodeURIComponent(url)).toContain('^XA');
      expect(decodeURIComponent(url)).toContain('^FDPREVIEW^FS');
      expect(decodeURIComponent(url)).toContain('^XZ');
    });

    it('includes width and height in preview URL when provided', () => {
      const url = builder.text('X').preview({ width: 4, height: 6 });
      expect(url).toContain('width=4');
      expect(url).toContain('height=6');
    });

    it('resets builder state', () => {
      builder.origin(1, 1).font('0', 0.2).text('TEST');

      const resetZpl = builder
        .reset()
        .origin(0.5, 0.5)
        .text('RESET')
        .render();

      expect(resetZpl).toContain('^FO102,102');
      expect(resetZpl).toContain('^FDRESET^FS');
      expect(resetZpl).not.toContain('^FDTEST^FS');
    });

    it('returns current DPI', () => {
      expect(builder.getDpi()).toBe(203);
      expect(new ZebraBuilder(600).getDpi()).toBe(600);
    });

    it('returns current position', () => {
      builder.origin(1, 1);
      expect(builder.getCurrentPosition()).toEqual({ x: 203, y: 203 });
    });
  });

  describe('Formatting Methods', () => {
    it('sets print orientation', () => {
      expect(builder.printOrientation('I').render()).toContain('^POI');
    });

    it('emits ^PMY when mirror is enabled', () => {
      expect(builder.mirror(true).render()).toContain('^PMY');
    });

    it('emits ^PMN when mirror is explicitly disabled', () => {
      expect(builder.mirror(false).render()).toContain('^PMN');
    });

    it('sets character encoding', () => {
      expect(builder.characterEncoding(28).render()).toContain('^CI28');
    });

    it('sets default font', () => {
      const zpl = builder
        .defaultFont('0', 30, { unit: 'mm', width: 25, orientation: 'R' })
        .render();

      expect(zpl).toContain('^CFR0,240,200');
    });

    it('sets escape character', () => {
      expect(builder.escapeCharacter('_').render()).toContain('^FH_');
    });

    it('reverses field colors', () => {
      expect(builder.fieldReverse().render()).toContain('^FR');
    });

    it('adds comment', () => {
      expect(builder.comment('This is a comment').render()).toContain('^FXThis is a comment');
    });
  });

  describe('Error Handling', () => {
    it('accepts valid text', () => {
      expect(() => builder.text('Valid Text')).not.toThrow();
    });

    it('rejects text with unsupported control characters', () => {
      expect(() => builder.text('Invalid\x00Text')).toThrow('Text contains unsupported character');
    });

    it('rejects non-positive DPI', () => {
      expect(() => new ZebraBuilder(0)).toThrow(/Invalid DPI/);
      expect(() => new ZebraBuilder(-200)).toThrow(/Invalid DPI/);
      expect(() => new ZebraBuilder(Number.NaN)).toThrow(/Invalid DPI/);
      expect(() => new ZebraBuilder(Number.POSITIVE_INFINITY)).toThrow(/Invalid DPI/);
    });
  });

  describe('DPI Conversion', () => {
    it('converts measurements correctly for different DPI values', () => {
      expect(new ZebraBuilder(150).origin(1, 1).render()).toContain('^FO150,150');
      expect(new ZebraBuilder(300).origin(1, 1).render()).toContain('^FO300,300');
      expect(new ZebraBuilder(600).origin(1, 1).render()).toContain('^FO600,600');
    });

    it('handles metric conversion correctly', () => {
      expect(builder.origin(25.4, 25.4, 'mm').render()).toContain('^FO203,203');
    });

    it('accepts raw dots via the `dots` unit', () => {
      expect(builder.origin(150, 150, 'dots').render()).toContain('^FO150,150');
    });
  });

  describe('Label Configuration Methods', () => {
    it('sets label length', () => {
      expect(builder.labelLength(4, 'in').render()).toContain('^LL812');
    });

    it('sets print quantity', () => {
      const zpl = builder.printQuantity(10, { copies: 2, pause: 500 }).render();
      expect(zpl).toContain('^PQ10,2,500');
    });

    it('sets media tracking', () => {
      expect(builder.mediaTracking('A').render()).toContain('^MNA');
    });

    it('sets barcode defaults', () => {
      const zpl = builder
        .barcodeDefaults(3, { wideToNarrowRatio: 2.5, height: 100 })
        .render();

      expect(zpl).toContain('^BY3,2.5,100');
    });

    it('skips ratio with empty placeholder when only height is given', () => {
      const zpl = builder.barcodeDefaults(3, { height: 100 }).render();
      expect(zpl).toContain('^BY3,,100');
    });

    it('downloads and recalls format', () => {
      const zpl = builder
        .downloadFormat('TEST', '^XA^FO100,100^AN0,30,30^FDTEST^FS^XZ')
        .recallFormat('TEST')
        .render();

      expect(zpl).toContain('^DFTEST');
      expect(zpl).toContain('^XA^FO100,100^AN0,30,30^FDTEST^FS^XZ');
      expect(zpl).toContain('^XFTEST');
    });
  });

  describe('Complex Labels', () => {
    it('creates a comprehensive label with all features', () => {
      const zpl = new ZebraBuilder(300)
        .characterEncoding(28)
        .barcodeDefaults(2, { wideToNarrowRatio: 3, height: 80 })
        .box(2, 1, { thickness: 3 })
        .origin(0.1, 0.1)
        .defaultFont('0', 0.12)
        .text('PRODUCT')
        .origin(0.1, 0.3)
        .qr_code('https://example.com/product/123', { magnification: 4 })
        .origin(0.1, 0.5)
        .barcode39('ABC123', 0.4, { checkDigit: true })
        .origin(1.5, 0.8)
        .font('0', 0.15, { width: 0.15, orientation: 'R' })
        .fieldReverse()
        .text('$29.99')
        .printQuantity(1)
        .comment('End of label')
        .render();

      expect(zpl).toContain('^CI28');
      expect(zpl).toContain('^BY2,3,80');
      expect(zpl).toContain('^GB600,300,3,B,0^FS');
      expect(zpl).toContain('^CFN0,36,36');
      expect(zpl).toContain('^FDPRODUCT^FS');
      expect(zpl).toContain('^BQN,,4,M');
      expect(zpl).toContain('^FDhttps://example.com/product/123^FS');
      expect(zpl).toContain('^B3N,120,Y,,Y');
      expect(zpl).toContain('^FDABC123^FS');
      expect(zpl).toContain('^A0R,45,45');
      expect(zpl).toContain('^FR');
      expect(zpl).toContain('^FD$29.99^FS');
      expect(zpl).toContain('^PQ1,1');
      expect(zpl).toContain('^FXEnd of label');
      expect(zpl).toContain('^XZ');
    });
  });
});
