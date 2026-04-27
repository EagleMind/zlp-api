# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.3.0] - 2026-04-27

### Added
- New barcode types: Code 93, Interleaved 2 of 5, EAN-13, UPC-A, Codabar
- Ellipse graphic command for drawing ellipses
- Field commands: fieldPosition, defaultOrientation, fieldNumber, fieldVariable, fieldExtraction
- Input validation for barcode data (empty checks, digit validation, format validation)
- Unit support for labelHome and fieldBlock methods
- Comprehensive error messages for invalid barcode data

### Changed
- Updated Codabar startStopCharacter to use literal union type ('A' | 'B' | 'C' | 'D')
- Simplified fieldExtraction to use direct parameters instead of options object
- Improved barcode93 height handling to always convert to dots
- Removed FieldExtractionOptions interface (no longer needed)
- Removed height from Barcode93Options (now a required parameter)

### Fixed
- Fixed barcode93 height parameter handling to ensure proper dot conversion

## [2.2.0] - Previous Release

### Features
- Comprehensive fluent TypeScript API for ZPL (Zebra Programming Language)
- Real-world measurements (inches/mm) instead of counting dots
- DPI support for accurate label sizing
- Barcode types: Code 128, Code 39, QR Code, Data Matrix, Aztec
- Graphics: boxes, circles, diagonal lines
- Text formatting with multiple fonts and orientations
- Label configuration: length, width, quantity, orientation
- Character encoding support
- Mirror printing
- Preview integration via native zlp rendering
- Full TypeScript type safety
