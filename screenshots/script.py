import os
from glob import glob
from PIL import Image
from multiprocessing import Pool
import argparse

MAX_DISTANCE = 130
GREENSCREEN_COLOR = (137, 245, 12)
PADDING = 10
MIN_BBOX_SIZE = 50  
USED_THREADS = 12

def calculate_green_dominance(pixel):
    total_color = sum(pixel[:3])
    green_dominance = pixel[1] / total_color if total_color > 0 else 0
    return green_dominance

def crop_image(image, threshold=10):
    width, height = image.size

    pixels = image.load()
    
    left_crop = 0
    top_crop = 0
    right_crop = width
    bottom_crop = height

    for y in range(height):
        in_row = 0

        for x in range(width):
            if pixels[x, y][3] > 0:
                in_row += 1
        
        if in_row > threshold:
            top_crop = y - PADDING
            break

    for y in range(height - 1, -1, -1):
        in_row = 0

        for x in range(width):
            if pixels[x, y][3] > 0:
                in_row += 1
        
        if in_row > threshold:
            bottom_crop = y + PADDING
            break

    for x in range(width):
        in_col = 0

        for y in range(height):
            if pixels[x, y][3] > 0:
                in_col += 1
        
        if in_col > threshold:
            left_crop = x - PADDING
            break

    for x in range(width - 1, -1, -1):
        in_col = 0

        for y in range(height):
            if pixels[x, y][3] > 0:
                in_col += 1
        
        if in_col > threshold:
            right_crop = x + PADDING
            break

    
    cropped_image = image.crop((left_crop, top_crop, right_crop, bottom_crop))

    return cropped_image

def remove_greenscreen(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")

    data = img.getdata()

    new_data = []
    for item in data:
        distance = sum((a - b) ** 2 for a, b in zip(item[:3], GREENSCREEN_COLOR)) ** 0.5
        
        if distance < MAX_DISTANCE and calculate_green_dominance(item) > 0.5:
            new_data.append((0, 0, 0, 0))  
        else:
            new_data.append(item)

    img.putdata(new_data)

    cropped_img = crop_image(img)
    data = cropped_img.getdata()

    new_data = []
    for item in data:
        distance = sum((a - b) ** 2 for a, b in zip(item[:3], GREENSCREEN_COLOR)) ** 0.5

        if distance < MAX_DISTANCE and calculate_green_dominance(item) > 0.4:
            grayish_color = (60, 60, 60, 150)  
            new_data.append(grayish_color)
        else:
            new_data.append(item)

    cropped_img.putdata(new_data)
    
    if cropped_img:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        cropped_img.save(output_path, "PNG")

def process_image(args):
    input_output_tuple, force, output_message = args
    input_file, output_file = input_output_tuple
    
    if not force and os.path.exists(output_file):
        if output_message:
            print(f"Skipping {input_file} (already exists).")
        return False
    
    remove_greenscreen(input_file, output_file)
    
    if output_message:
        print(f"Processed {input_file}.")
    
    return True

def process_images(input_folder, output_folder, num_threads=0, force=False):
    input_files = glob(os.path.join(input_folder, "**", "*.png"), recursive=True)
    
    input_output_tuples = []
    for input_file in input_files:
        rel_path = os.path.relpath(input_file, input_folder)
        
        output_file = os.path.join(output_folder, rel_path)
        input_output_tuples.append((input_file, output_file))

    total_files = len(input_output_tuples)
    print(f"Found {total_files} images to process.")

    if num_threads == 0:
        processed_count = 0
        skipped_count = 0
        
        for i, input_output_tuple in enumerate(input_output_tuples):
            args = (input_output_tuple, force, False)
            was_processed = process_image(args)
            
            if was_processed:
                processed_count += 1
                print(f"Processed {input_output_tuple[0]}. ({i+1}/{total_files})")
            else:
                skipped_count += 1
                print(f"Skipped {input_output_tuple[0]} (already exists). ({i+1}/{total_files})")
        
        print(f"Completed: {processed_count} processed, {skipped_count} skipped.")
    else: 
        print(f"Processing images using {num_threads} threads.")
        
        args_list = [(tup, force, False) for tup in input_output_tuples]
        
        with Pool(num_threads) as p:
            results = p.map(process_image, args_list)
        
        processed_count = sum(1 for r in results if r)
        skipped_count = len(results) - processed_count
        print(f"Completed: {processed_count} processed, {skipped_count} skipped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Remove greenscreen and crop images.")
    parser.add_argument("--usethreads", action="store_true", help="Use threads to process images.")
    parser.add_argument("--force", action="store_true", help="Force processing of images even if output already exists.")
    
    args = parser.parse_args()

    script_directory = os.path.dirname(os.path.abspath(__file__))
    input_directory = os.path.join(script_directory, "input")
    output_directory = os.path.join(script_directory, "output")

    num_threads = USED_THREADS if args.usethreads else 0

    process_images(input_directory, output_directory, num_threads, args.force)