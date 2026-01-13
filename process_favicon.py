
from PIL import Image

def make_square(image_path, out_path_ico, out_path_png):
    img = Image.open(image_path)
    width, height = img.size
    new_size = max(width, height)
    
    # Create new transparent square image
    new_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
    
    # Paste original image in center
    paste_x = (new_size - width) // 2
    paste_y = (new_size - height) // 2
    new_img.paste(img, (paste_x, paste_y))
    
    # Save as ICO (32x32 for standard favicon)
    # Typically ICO contains multiple sizes, but 32x32 is minimal safe
    icon_sizes = [(32, 32), (16, 16), (48, 48), (64, 64)]
    new_img.save(out_path_ico, format='ICO', sizes=icon_sizes)
    
    # Save as PNG (keep high res square)
    new_img.save(out_path_png, format='PNG')
    print(f"Processed images saved to {out_path_ico} and {out_path_png}")

make_square('public/logo.png', 'src/app/favicon.ico', 'src/app/icon.png')
