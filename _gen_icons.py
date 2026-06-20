import struct, zlib

def create_png(width, height, color_hex):
    """Create a simple PNG with a solid color and 'S' letter."""
    r = int(color_hex[1:3], 16)
    g = int(color_hex[3:5], 16)
    b = int(color_hex[5:7], 16)
    
    def chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    
    # Image data: gradient with 'S' centered
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter none
        for x in range(width):
            # Gradient background
            t = y / height
            rr = int(r * (1-t) + 255 * t)
            gg = int(g * (1-t) + 184 * t)
            bb = int(b * (1-t) + 48 * t)
            # Draw 'S' letter (simplified)
            cx, cy = width//2, height//2
            dx, dy = abs(x - cx), abs(y - cy)
            if dx < width*0.12 and dy < height*0.3:
                raw += bytes([255, 255, 255, 255])  # white center
            elif dx < width*0.18 and dy < height*0.35:
                raw += bytes([255, 255, 255, 200])  # glow
            else:
                raw += bytes([rr, gg, bb, 255])
    
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', ihdr)
    png += chunk(b'IDAT', zlib.compress(raw))
    png += chunk(b'IEND', b'')
    return png

# Generate icons
for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
    with open('assets/' + name, 'wb') as f:
        f.write(create_png(size, size, '#FF2D55'))
    print(f'Created {name} ({size}x{size})')

print('Icons generated')
