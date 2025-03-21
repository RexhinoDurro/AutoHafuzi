# Create this file in your api/views folder as placeholder_views
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
    
    # Try to use a font or fallback to default
    try:
        # Use a system font - you may need to adjust this path
        font = ImageFont.truetype("Arial.ttf", 20)
    except IOError:
        # If the font isn't available, use the default bitmap font
        font = ImageFont.load_default()
    
    # Add text to the image
    text = f"{width}x{height}"
    textwidth, textheight = draw.textsize(text, font)
    x = (width - textwidth) / 2
    y = (height - textheight) / 2
    
    # Add the dimensioned text in dark gray
    draw.text((x, y), text, font=font, fill=(100, 100, 100))
    
    # Add a border
    draw.rectangle([(0, 0), (width-1, height-1)], outline=(150, 150, 150))
    
    # Save the image to a bytes buffer
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    
    # Return the image as a response
    return HttpResponse(buffer, content_type='image/jpeg')

# Then add this URL pattern to your api/urls.py:
# path('placeholder/<int:width>/<int:height>/', placeholder_image, name='placeholder_image'),