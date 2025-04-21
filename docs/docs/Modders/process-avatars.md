# Preparing Assets

After cloning and installing [Character Studio](https://github.com/m3-org/CharacterStudio), you will want to then copy your assets into the public folder and check the `.env` variable to ensure it's configured to the right location.


---

## Blender

**Requirements**:
- https://www.blender.org/download/lts/ Tested with Blender 3.6
- https://github.com/saturday06/VRM-Addon-for-Blender Need this plugin

**When modeling traits**

It's recommended to separate traits into different blend files for each trait type (clothing, hair, etc). You don't want blend files to get too big or it'll be hard to open and debug later.

Pro tip: Artists designing traits should always import the rigged base mesh in order to keep things aligned so everything can merge correctly as a VRM file. We don't have the ability to adjust position/scale/rotation after importing in the app yet, so adjust in blender.

**Preparing to export**

> Note: If you encounter issues try Blender LTS 3.6, when we last tested Blender 4.0 the material export was not working properly.

You should first have the [Saturday06 VRM add-on](https://github.com/saturday06/VRM-Addon-for-Blender) downloaded and installed first. Every trait is parented to a VRM armature, of which we are mainly using version VRM 0. Some traits might have additional bones than others, which is why we have every trait parented to their own VRM armatures vs parenting everything to 1 VRM armature.

![](/img/SJebjntDeT.jpg)

**REMEMBER TO CHANGE EXPORT PATH!**

We have written a blender python script to help with batch exporting VRM files, make sure to modify the export path to destination folder, all the VRM files will export there.

Here's how to run it: `blender -b -P scripts/blender_export.py -- blends/Waist.blend`

```python!
import bpy
import os
import sys

def export_vrm(input_blend):
    # Set the path to the input blend file
    bpy.ops.wm.open_mainfile(filepath=os.path.abspath(input_blend))

    # REMEMBER TO SET THE VIEW LAYER NAME
    view_layer_name = 'ViewLayer'
    view_layer = bpy.context.scene.view_layers.get(view_layer_name)

    if view_layer is None:
        print(f"View Layer '{view_layer_name}' not found.")
        sys.exit(1)

    bpy.context.window.view_layer = view_layer

    # Get a list of all visible objects in the scene
    visible_objects = [obj for obj in bpy.context.scene.objects if obj.parent is None]

    # Iterate over each visible object and export it as a separate VRM file
    for obj in visible_objects:
        # Skip objects not in the specified view layer
        if obj.name not in view_layer.objects:
            print(f"Object '{obj.name}' is not in view layer '{view_layer_name}'. Skipping.")
            continue

        # Search for a mesh in the hierarchy of children
        mesh = None
        for child in obj.children_recursive:
            if child.type == 'MESH':
                mesh = child
                # If a mesh is found and it's in the view layer, select it for export
                if mesh and mesh.name in view_layer.objects:
                    # Set the filename for the exported VRM file
                    armature = mesh.parent
                    armature.data.vrm_addon_extension.spec_version = "0.0"
                    filename = mesh.name + ".vrm"

                    # Select the mesh for export
                    bpy.context.view_layer.objects.active = mesh
                    mesh.select_set(True)

                    # Export the mesh (VRM)
                    bpy.ops.export_scene.vrm(
                        filepath=os.path.join(export_path, filename),  # Corrected line
                        export_invisibles=False,
                        enable_advanced_preferences=True,
                        export_fb_ngon_encoding=False,
                        export_only_selections=True,
                        armature_object_name=obj.name
                    )

if __name__ == "__main__":
    # Check if the command line arguments are provided
    if "--" in sys.argv:
        argv = sys.argv[sys.argv.index("--") + 1:]  # Get arguments after "--"
    else:
        argv = []

    # Default export path, CHANGE THIS!
    export_path = "/home/user/Desktop/Exports"

    # Ensure the export folder exists; create it if it doesn't
    os.makedirs(export_path, exist_ok=True)

    # Set the path to the input blend file
    input_blend = os.path.abspath(argv[0]) if argv else None

    if not input_blend:
        print("Error: Input .blend file not provided.")
        sys.exit(1)

    export_vrm(input_blend)
```

You can either use the Scripting tab in the blender gui to run it or run it headlessly by saving as a python script then passing the blend file as an argument like so:

`blender -b -P blender_export.py -- clothing_traits.blend`


![](/img/Bke-i2YPeT.jpg)


---

## Unity

Requirements:
- https://github.com/vrm-c/UniVRM/

![](/img/HkeZs2Kvla.jpg)



reference: https://hackmd.io/@XR/character-studio-overview
