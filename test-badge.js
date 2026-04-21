// Simple test to verify ZPL generation
class ZebraBuilder {
    constructor(dpi = 203) {
        this.dpi = dpi;
        this.commands = ['^XA'];
        this.currentX = 0;
        this.currentY = 0;
    }

    toDots(value, unit = 'in') {
        if (unit === 'mm') {
            return Math.round((value / 25.4) * this.dpi);
        }
        return Math.round(value * this.dpi);
    }

    origin(x, y, unit = 'in') {
        this.currentX = this.toDots(x, unit);
        this.currentY = this.toDots(y, unit);
        this.commands.push(`^FO${this.currentX},${this.currentY}`);
        return this;
    }

    font(name, height, opts = {}) {
        const unit = opts.unit ?? 'in';
        const orientation = opts.orientation ?? 'N';
        const heightDots = this.toDots(height, unit);
        const widthDots = opts.width !== undefined ? this.toDots(opts.width, unit) : heightDots;
        this.commands.push(`^A${name}${orientation},${heightDots},${widthDots}`);
        return this;
    }

    text(content) {
        this.commands.push(`^FD${content}^FS`);
        return this;
    }

    qr_code(data, opts = {}) {
        const orientation = opts.orientation ?? 'N';
        const model = opts.model ?? 2;
        const magnification = opts.magnification ?? 5;
        const errorCorrection = opts.errorCorrection ?? 'M';
        const modelValue = model === 2 ? '' : String(model);
        this.commands.push(`^BQ${orientation},${modelValue},${magnification},${errorCorrection}`);
        this.commands.push(`^FD${data}^FS`);
        return this;
    }

    labelLength(length, unit = 'in') {
        this.commands.push(`^LL${this.toDots(length, unit)}`);
        return this;
    }

    labelWidth(width, unit = 'in') {
        this.commands.push(`^PW${this.toDots(width, unit)}`);
        return this;
    }

    characterEncoding(encoding = 28, sourceEncoding) {
        const source = sourceEncoding !== undefined ? `,${sourceEncoding}` : '';
        this.commands.push(`^CI${encoding}${source}`);
        return this;
    }

    comment(comment) {
        this.commands.push(`^FX${comment}`);
        return this;
    }

    box(width, height, opts = {}) {
        const unit = opts.unit ?? 'in';
        const thickness = opts.thickness ?? 1;
        const color = opts.color ?? 'B';
        const rounding = opts.rounding ?? 0;
        this.commands.push(`^GB${this.toDots(width, unit)},${this.toDots(height, unit)},${thickness},${color},${rounding}^FS`);
        return this;
    }

    render() {
        return this.commands.join('') + '^XZ';
    }
}

// Test badge creation
function createEventBadge(badge) {
    const builder = new ZebraBuilder(300);
    
    // Label setup - 2.7" x 2.0" badge (812 x 609 dots at 300 DPI)
    builder.labelWidth(2.7, 'in');
    builder.labelLength(2.0, 'in');
    
    // UTF-8 encoding
    builder.characterEncoding(28);
    
    // Add border
    builder.origin(0.1, 0.1, 'in')
        .box(2.5, 1.8, { unit: 'in', thickness: 2 });
    
    // Participant Type
    builder.origin(0.2, 1.7, 'in')
        .font('0', 0.16, { unit: 'in' })
        .text(badge.participantType?.toUpperCase() || '');
    
    // First Name
    builder.origin(0.2, 1.4, 'in')
        .font('0', 0.24, { unit: 'in' })
        .text(badge.firstName?.toUpperCase() || '');
    
    // Last Name
    builder.origin(0.2, 1.1, 'in')
        .font('0', 0.24, { unit: 'in' })
        .text(badge.lastName?.toUpperCase() || '');
    
    // Designation
    builder.origin(0.2, 0.8, 'in')
        .font('0', 0.12, { unit: 'in' })
        .text(badge.designation?.toUpperCase() || '');
    
    // Organization
    builder.origin(0.2, 0.5, 'in')
        .font('0', 0.12, { unit: 'in' })
        .text(badge.organization?.toUpperCase() || '');
    
    // QR Code
    builder.origin(2.0, 0.2, 'in')
        .qr_code(`https://justnetwork.tech/${badge.user_name}`, {
            magnification: 4,
            errorCorrection: 'M'
        });
    
    return builder.render();
}

// Test data
const attendeeBadge = {
    participantType: 'ATTENDEE',
    firstName: 'Jane',
    lastName: 'Smith',
    designation: 'Product Manager',
    organization: 'StartupXYZ',
    user_name: 'janesmith',
    isPurpleRole: false
};

console.log('=== Generated ZPL ===');
const zpl = createEventBadge(attendeeBadge);
console.log(zpl);

console.log('\n=== Preview URL ===');
const previewUrl = `https://labelary.com/viewer.html?zpl=${encodeURIComponent(zpl)}&width=2.7&height=2.0&dpmm=12`;
console.log(previewUrl);
