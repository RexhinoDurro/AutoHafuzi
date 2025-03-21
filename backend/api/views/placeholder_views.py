# Create this file as placeholder_view.py in your api/views directory

from PIL import Image, ImageDraw, ImageFont
from django.http import HttpResponse
from io import BytesIO

def placeholder_image(request, width, height):
    """Generate a placeholder image with the specified dimensions"""
    # Default width and height if not provided
    width = int(width) if width else 800
    height = int(height) if height else 600
    
    # Create a gray image
    img = Image.new('RGB', (width, height), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    
    # Try to use a system font or fallback to default
    try:
        # First try Arial (Windows) or DejaVuSans (Linux)
        try:
            font = ImageFont.truetype("Arial.ttf", 20)
        except IOError:
            try:
                font = ImageFont.truetype("DejaVuSans.ttf", 20)
            except IOError:
                font = ImageFont.load_default()
    except Exception:
        # If anything goes wrong, use the default bitmap font
        font = ImageFont.load_default()
    
    # Add text to the image
    text = f"{width}x{height}"
    
    # Handle newer Pillow versions where textsize is deprecated
    try:
        # For newer Pillow versions
        text_bbox = draw.textbbox((0, 0), text, font=font)
        textwidth = text_bbox[2] - text_bbox[0]
        textheight = text_bbox[3] - text_bbox[1]
    except AttributeError:
        # For older Pillow versions
        try:
            textwidth, textheight = draw.textsize(text, font)
        except:
            # Fallback if all else fails
            textwidth, textheight = 50, 20
    
    # Position the text in the center
    x = (width - textwidth) / 2
    y = (height - textheight) / 2
    
    # Add the dimensioned text in dark gray
    try:
        draw.text((x, y), text, font=font, fill=(100, 100, 100))
    except:
        # Simple fallback if text drawing fails
        draw.rectangle([(width//3, height//3), (width*2//3, height*2//3)], fill=(100, 100, 100))
    
    # Add a border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(150, 150, 150))
    
    # Save the image to a bytes buffer
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    
    # Return the image as a response
    return HttpResponse(buffer, content_type='image/jpeg')