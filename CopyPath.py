import os

def list_directory_structure(src):
    # Print the root directory itself
    print(os.path.basename(src))  # Prints the name of the root directory, like 'src'
    
    # Walk through the directories and print each directory's name
    for dirpath, dirnames, filenames in os.walk(src):
        # Calculate the relative path of the current directory
        relative_path = os.path.relpath(dirpath, src)
        
        # Skip the root directory since we printed it earlier
    
        print(relative_path)

        for filename in filenames:
            print(os.path.join(relative_path, filename))

src_dir = r"C:\\Users\\User\\Desktop\\final_project\\front-end\src"  # Your source directory
list_directory_structure(src_dir)
