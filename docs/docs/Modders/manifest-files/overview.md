---
sidebar_position: 1
---

# Overview

The manifest files are essential if you want to mod Character Studio with your own assets and selection screens. They are found in various parts of the project, and basically are the main file other than art assets that you would need to modify to make an avatar builder program. For more info go to the full documentation page for any manifest in the sidebar.


## [Character Selection](./character-select.md)

The first manifest.json file is for the select screen that loads up profiles for character bases models and their associated assets. Think of each of these as a new character template, like picking a class in an MMO or choosing your fighter in a video game. They point to the manifest.json files for each character profile's traits.

![Screenshot from 2024-02-16 02-27-37](/img/HkU6ZQWhT.png)

This section is also where it can be possible to load up characters or traits you own after connecting to the app with a web3 wallet, although this functionality is not built in yet.

<details>

<summary> View sample file </summary>

```json!
[
  {
    "name": "Feminine",
    "description": "Anata Female",
    "portrait": "./assets/portraitImages/anata.png",
    "manifest":"./anata-vrm/female/manifest.json",
    "icon": "./assets/icons/class-neural-hacker.svg",
    "format": "vrm"
  },
  {
    "name": "Masculine",
    "description": "Anata Male",
    "portrait": "./assets/portraitImages/anata_male.png",
    "manifest":"./anata-vrm/male/manifest.json",
    "icon": "./assets/icons/class-neural-hacker.svg",
    "format": "vrm"
  }
]
```

</details>

The next section will have more information about the manifest.json files being referenced.


---

## [Character Traits](./character-traits.md)

Setting up this manifest will populate the asset trait section with your own traits that people can select from. It will also serve the character studio for cull trait model options (remove faces underneath) based on the layers, so the triangles disappear underneath the clothing for example.

![Screenshot from 2024-02-19 13-42-19](/img/By1NZXbhT.jpg)

**Example Files**

- https://github.com/memelotsqui/character-assets/blob/main/neurohacker/manifest.json
- https://github.com/M3-org/loot-assets/blob/main/loot/models/manifest.json


<details>

<summary> View part of a sample file </summary>

```json!
{
  "assetsLocation": "./loot-assets/",
  "format": "vrm",
  "traitsDirectory": "./models/",
  "thumbnailsDirectory": "./models/",
  "exportScale": 1,
  "animationPath": [
    "./animations/1_T-Pose.fbx",
    "./animations/2_Idle.fbx",
    "./animations/3_Walking.fbx",
    "./animations/4_Waving.fbx"
  ],
  "traitIconsDirectorySvg": "./icons/",
  "defaultCullingLayer": -1,
  "defaultCullingDistance": [
    0.1,
    0.01
  ],
  "initialTraits": [
    "Body",
    "Head",
    "Hand",
    "Foot",
    "Chest",
    "Waist",
    "Neck"
  ],
  "offset": [
    0.0,
    0.48,
    0.0
  ],
  "traits": [
    {
      "trait": "Body",
      "name": "Body",
      "icon": "",
      "type": "mesh",
      "iconGradient": "",
      "iconSvg": "BODY.svg",
      "cullingLayer": 0,
      "cameraTarget": {
        "distance": 3.0,
        "height": 0.8
      },
      "cullingDistance": [
        0.1,
        0.01
      ],
      "collection": [
        {
          "id": "orion",
          "name": "orion",
          "directory": "Body/orion.vrm",
          "thumbnail": "Body/orion.png"
        }
      ]
    },
    {
      "trait": "Head",
      "name": "Head",
      "icon": "",
      "type": "mesh",
      "iconGradient": "",
      "iconSvg": "HEAD.svg",
      "cullingLayer": -1,
      "cameraTarget": {
        "distance": 3.0,
        "height": 0.8
      },
      "cullingDistance": [
        0.1,
        0.01
      ],
      "collection": [
        {
          "id": "leather_cap",
          "name": "leather cap",
          "directory": "Head/leather_cap.vrm",
          "thumbnail": "Head/leather_cap.png"
        },
        {
          "id": "linen_hood",
          "name": "linen hood",
          "directory": "Head/linen_hood.vrm",
          "thumbnail": "Head/linen_hood.png"
        },
        {
          "id": "great_helm",
          "name": "great helm",
          "directory": "Head/great_helm.vrm",
          "thumbnail": "Head/great_helm.png"
        },
        {
          "id": "cap",
          "name": "cap",
          "directory": "Head/cap.vrm",
          "thumbnail": "Head/cap.png"
        },
        {
          "id": "war_cap",
          "name": "war cap",
          "directory": "Head/war_cap.vrm",
          "thumbnail": "Head/war_cap.png"
        },
        {
          "id": "full_helm",
          "name": "full helm",
          "directory": "Head/full_helm.vrm",
          "thumbnail": "Head/full_helm.png"
        },
        {
          "id": "ornate_helm",
          "name": "ornate helm",
          "directory": "Head/ornate_helm.vrm",
          "thumbnail": "Head/ornate_helm.png"
        },
        {
          "id": "ancient_helm",
          "name": "ancient helm",
          "directory": "Head/ancient_helm.vrm",
          "thumbnail": "Head/ancient_helm.png"
        },
        {
          "id": "helm",
          "name": "helm",
          "directory": "Head/helm.vrm",
          "thumbnail": "Head/helm.png"
        },
        {
          "id": "crown",
          "name": "crown",
          "directory": "Head/crown.vrm",
          "thumbnail": "Head/crown.png"
        },
        {
          "id": "dragons_crown",
          "name": "dragons crown",
          "directory": "Head/dragons_crown.vrm",
          "thumbnail": "Head/dragons_crown.png"
        },
        {
          "id": "divine_hood",
          "name": "divine hood",
          "directory": "Head/divine_hood.vrm",
          "thumbnail": "Head/divine_hood.png"
        },
        {
          "id": "silk_hood",
          "name": "silk hood",
          "directory": "Head/silk_hood.vrm",
          "thumbnail": "Head/silk_hood.png"
        },
        {
          "id": "demon_crown",
          "name": "demon crown",
          "directory": "Head/demon_crown.vrm",
          "thumbnail": "Head/demon_crown.png"
        },
        {
          "id": "hood",
          "name": "hood",
          "directory": "Head/hood.vrm",
          "thumbnail": "Head/hood.png"
        }
      ]
    },
    {
      "trait": "Hand",
      "name": "Hand",
      "icon": "",
      "type": "mesh",
      "iconGradient": "",
      "iconSvg": "HAND.svg",
      "cullingLayer": -1,
      "cameraTarget": {
        "distance": 3.0,
        "height": 0.8
      },
      "cullingDistance": [
        0.1,
        0.01
      ],
      "collection": [
        {
          "id": "holy_gauntlets",
          "name": "holy gauntlets",
          "directory": "Hand/holy_gauntlets.vrm",
          "thumbnail": "Hand/holy_gauntlets.png"
        },
        {
          "id": "ornate_gloves",
          "name": "ornate gloves",
          "directory": "Hand/ornate_gloves.vrm",
          "thumbnail": "Hand/ornate_gloves.png"
        },
...
```

</details>


---

## [VRM to LoRAs Training Data](./vrm-to-lora.md)

This manifest is inspired by the [VRM to LoRA guide](https://hackmd.io/@reneil1337/avatar-lora) by [reneil1337](https://github.com/reneil1337) will generate training data that can be used for training LoRAs using tools such as [Kohya](https://github.com/bmaltais/kohya_ss). It automates a tedious part of the process when capturing screenshots and tagging the data, then it's up to you to train.

![rendercombined](/img/H1OJTfb36.jpg)

Here's a snippet of an [example manifest](https://github.com/M3-org/CharacterStudio/blob/lora-data-creator/public/lora-assets/manifest.json) for exporting LoRA training data. The animations being used are no-skin mixamo animation files that used Y-bot as the character. In the future we plan to implement VRMA (VRM animation) file support.

<details>

<summary> View a sample </summary>

```json!
{
    "assetsLocation": "./lora-assets/",
    "animationsDirectory": "/animations/",
    "backgroundGrayscale": 0,
    "backgroundDescription": "plain black background",
    "width":1024,
    "height":1024,
    "topFrameOffsetPixels":64,
    "bottomFrameOffsetPixels":64,
    "dataCollection":[
        {
            "animationPath":"Walking.fbx",
            "animationFrame":8,
            "lookAtCamera":false,
            "expression":"happy",
            "cameraPosition":[-0.5,-0.2,1],
            "cameraFrame":"fullShot",
            "description":"a person slowly walking full shot"
        },
...
```

</details>

For more information don't forget to check out this guide: https://hackmd.io/@reneil1337/avatar-lora

---

## [Personality.json](./ai-personalities.md)

This is an experimental feature for prepopulating and customizing personalities for VRM avatars for AI chatbot application use cases. There's also an ongoing effort to standardize this type of metadata as a [gltf extension](https://github.com/omigroup/gltf-extensions/tree/main/extensions/2.0/OMI_personality) if interested.

![Screenshot from 2024-02-19 13-46-05](/img/B11GGmZnT.jpg)


<details>

<summary> View snippet from an example </summary>

```json
{
    "generalPersonalityQuestions": [
        "Tell me about a time you fought a hard battle?",
        "How do you handle pressure?",
        "How do you adapt to change?",
        "How do you handle conflict?",
        "Tell me about your squad?",
        "Talk about a big choice you made?",
        "How do you deal with criticism from othres?",
        "Got a win you're proud of?",
        "Tell me about a time you stepped up and lead?",
        "What is success to you?"
    ],
    "generalPersonalityAnswers": [
        "Fought a mean boss in the virtual realm, hacked my way out.",
        "Psh, my rig runs smooth under pressure!",
        "Adapting to new servers, piece a cake.",
        "Solved with code, easy.",
        "Run raids with my guild all the time.",
        "Made choices that upped my XP, no brainer.",
        "Debugging my game all day.",
        "Got a legendary drop, proudest moment.",
        "Led my guild to victory in a PvP tourney.",
        "Max level, duh."
    ],
...
```

</details>


---

## [Generating Manifest Files](./generate-manifest-files.md)

Some useful scripts for generating manifest files for use in https://github.com/M3-org/characterstudio. YMMV.


<details>

## Adding Your Own Traits

This is for the typical usecase of creating your own avatar builder with your traits, like you see on the left side of the screenshot below.

> Note: You'll need to generate your own screenshots. I recommend [screenshot-glb](https://github.com/Shopify/screenshot-glb) which works with VRM files as well and keep the base filenames same as the VRM files.

![Screenshot from 2024-02-19 21-15-46](/img/BkMdoF-2T.jpg)

You will need to modify the paths for the templates, it's currently configured for https://github.com/m3-org/loot-assets.

**Here is how the folder structure looks before generating manifest.json**

![image](/img/HyonISbnT.png)

This is the script I'm using for generating a manifest for https://github.com/m3-org/loot-assets


```python!
import os
import json

def generate_manifest(directory_path):
    manifest_template = {
        "assetsLocation": "./loot/",
        "format": "vrm",
        "traitsDirectory": "./loot/models/",
        "thumbnailsDirectory": "./loot/models/",
        "exportScale": 1,
        "animationPath": get_animation_paths(),
        "traitIconsDirectorySvg": "./loot/icons/",
        "defaultCullingLayer": -1,
        "defaultCullingDistance": [0.1, 0.01],
        "initialTraits": ["Body", "Head", "Hand", "Foot", "Chest", "Waist", "Neck"], 
        "offset": [0.0, 0.48, 0.0],
        "traits": generate_traits(directory_path),
        "textureCollections": [],
        "colorCollections": []
    }

    return json.dumps(manifest_template, indent=2)

def get_animation_paths():
    animation_directory = "./animations"
    animation_paths = [os.path.join(animation_directory, file) for file in os.listdir(animation_directory) if file.endswith(".fbx")]
    return sorted(animation_paths)


def generate_traits(directory_path):
    traits = []

    trait_culling_layers = {
        "Body": 0,
        "Head": -1,
        "Hand": -1,
        "Foot": -1,
        "Chest": 0,
        "Neck": -1,
        "Waist": -1
    }

    for trait_name, culling_layer in trait_culling_layers.items():
        trait = {
            "trait": trait_name,
            "name": trait_name.capitalize(),
            "icon": "",
            "type": "mesh",
            "iconGradient": "",
            "iconSvg": f"{trait_name.upper()}.svg",
            "cullingLayer": culling_layer,
            "cameraTarget": {"distance": 3.0, "height": 0.8},
            "cullingDistance": [0.1, 0.01],
            "collection": generate_collection(directory_path, trait_name)
        }

        traits.append(trait)

    return traits

def generate_collection(directory_path, trait_name):
    trait_directory_path = os.path.join(directory_path, trait_name)

    return [
        {
            "id": entry[:-4],
            "name": entry[:-4].replace("_", " "),
            "directory": f"{trait_name}/{entry}",
            "thumbnail": f"{trait_name}/{entry[:-4]}.png"
        }
        for entry in os.listdir(trait_directory_path)
        if entry.endswith(".vrm")
    ]

if __name__ == "__main__":
    directory_path = "./models/"
    manifest_content = generate_manifest(directory_path)

    with open("./models/manifest.json", "w") as manifest_file:
        manifest_file.write(manifest_content)

    print("Manifest file generated successfully.")
```

**This is how to run it**

`python3 scripts/generate_manifest.py`

---

## Based on Existing NFT Collection

**Handling Messy NFT Metadata**

Oftentimes metadata traits in NFT collections will contain a bunch of special characters and may not always match 1:1 with the visual trait. In these cases you will want a higher abstraction level system if you want to do things like to match the original metadata filenames to renamed versions you're using when handling the actual assets.

First, we create a schema on how we go about renaming from the NFT metadata traits to a machine readable version with a CSV file containing every unique trait per row. For Anata project it looks like this:

```csv!
Body,trait_type,Category,Original,Rename
Feminine,Brace,BRACE,Abstract Vision Brace,Abstract_Vision_Brace
Feminine,Brace,BRACE,Arrow Brace Blue,Arrow_Brace_Blue
Feminine,Brace,BRACE,Arrow Brace Fallen Angel,Arrow_Brace_Fallen_Angel
Feminine,Brace,BRACE,Arrow Brace Green,Arrow_Brace_Green
Feminine,Brace,BRACE,Arrow Brace Holy,Arrow_Brace_Holy
```

We include the body and category because we needed to rename the `trait_type` values too since some contained special characters and also because there were occasions where the same trait value showed up in different categories. We save this file as master_renamed_f

Then with this script we generate a manifest file per NFT ID, using the JSON of the original metadata + the CSV file containing original and renamed values as arguments like so:


```python!
import argparse
import csv
import json
import os

# Define the culling layer mapping
# -1 = always show
# 0 = usually body / skin
# 1 = will cull with 0 (so usually clothing)
# 2 = will cull with 0 and 1 (so usually hair)
# etc..
culling_layer_mapping = {
    "Body": 0,
    "Brace": 0,
    "Clips and Kanzashi": -1,
    "Clothing": 1,
    "Earring": -1,
    "Face Other": -1,
    "Glasses": -1,
    "Hair": 1,
    "Hair Accessory Other": -1,
    "Halos": -1,
    "Hats": -1,
    "Head": -1,
    "Head Accessory Other": -1,
    "Masks": -1,
    "Neck": -1,
    "Ribbons and Bows": -1,
    "Sigil": -1,
    "Tail": -1,
    "Weapon": -1,
    "Weapon Brace": -1,
    "Wings": -1
}

def read_csv_mapping(csv_file_path):
    id_mapping = {}

    with open(csv_file_path, 'r') as csvfile:
        csv_reader = csv.DictReader(csvfile)
        for row in csv_reader:
            original_name = row['Original']
            renamed_name = row['Rename']

            id_mapping[original_name] = renamed_name

    return id_mapping

def get_animation_paths(directory_path):
    animation_directory = os.path.join(directory_path, "_animations")
    animation_paths = [os.path.join("./anata-vrm/_animations", file) for file in os.listdir(animation_directory) if file.endswith(".fbx")]
    return sorted(animation_paths)


def get_id_from_mapping(trait_name, id_mapping):
    # Get the original name directly using trait_name
    renamed_name = id_mapping.get(trait_name, None)

    return renamed_name if renamed_name is not None else trait_name

def create_manifest(input_file, csv_file, id_mapping):
    """
    Generate a *_manifest.json file based on a given *_attributes.json file and a CSV file.

    Args:
        input_file (str): The input JSON file (*_attributes.json).
        csv_file (str): The input CSV file.

    This script takes an input JSON file (*_attributes.json) and a CSV file and generates a corresponding
    *_manifest.json file with specific formatting. It maps trait types to culling layers
    based on the culling_layer_mapping and creates the manifest accordingly.
    """

    with open(input_file, 'r') as f:
        data = json.load(f)

    with open(csv_file, 'r') as csv_file:
        csv_reader = csv.DictReader(csv_file)
        name_mapping = {row['Original']: row['Rename'] for row in csv_reader}

    folder_name = data["name"]
    output_file = f"{folder_name}_manifest.json"

    # Define the template for the manifest
    manifest = {
        "thumbnail": f"./anata-vrm/_thumbnails/t_{folder_name}.jpg",
        "format": "vrm",
        "traitsDirectory": f"./anata-vrm/male/",
        "thumbnailsDirectory": f"./anata-vrm/male/",
        "exportScale": 0.7,
        "animationPath": get_animation_paths(directory_path),
        "traitIconsDirectorySvg": "./assets/_icons/",
        "requiredTraits": ["Body"],
        "defaultCullingLayer": -1,
        "defaultCullingDistance": [0.3, 0.3],
        "offset": [0, 0.48, 0],
        "initialTraits": ["Body", "Hair", "Clothing", "Head", "Face Other", "Clips and Kanzashi", "Neck", "Masks", "Glasses", "Hats", "Head Accessory Other", "Hair Accessory Other", "Ribbons and Bows", "Earring", "Wings", "Halos", "Tail"],
        "traits": [],
        "textureCollections": []
    }

    for attribute in data["attributes"]:
        trait_type = attribute["trait_type"]
        trait_value = attribute["value"]
        original_name = attribute.get("Original")  # Get the "Original" name from the attribute
        renamed_name = attribute.get("Rename")

        # Use the original name if available in the CSV mapping, otherwise use the trait_value
        display_name = name_mapping.get(original_name, trait_value)

        trait_entry = {
            "trait": trait_type,
            "name": trait_type.capitalize(),
            "icon": "",
            "type": "mesh",
            "iconGradient": "",
            "iconSvg": f"{trait_type.upper()}.svg",
            "cullingLayer": culling_layer_mapping.get(trait_type, -1),
            "cameraTarget": {"distance": 5, "height": 1.2},
            "cullingDistance": [0.03, 0.03] if trait_type =="Body" else [0.3, 0.3],
            "collection": [
                {
                    "id": trait_value,
                    "name": trait_value,
                    "directory": "BODY/male.vrm" if trait_type == "Body" else f"{folder_name}/{get_id_from_mapping(renamed_name or trait_value, id_mapping)}.vrm",
                    "thumbnail": "BODY/male.png" if trait_type == "Body" else f"{folder_name}/thumbnails/{get_id_from_mapping(renamed_name or trait_value, id_mapping)}.png",
                    "textureCollection": "Body Skin" if trait_type == "Body" else ""
                }
            ]
        }

        manifest["traits"].append(trait_entry)

    # Append textureCollections for "BODY" trait
    body_collection = {
        "trait": "Body Skin",
        "collection": [
            {
                "id": f"skin_{folder_name}",
                "name": f"Eyes {folder_name}",
                "directory": f"{folder_name}/skin_{folder_name}.png",
                "thumbnail": f"{folder_name}/skin_{folder_name}.png"
            }
        ]
    }
    manifest["textureCollections"].append(body_collection)

    with open(output_file, 'w') as output:
        json.dump(manifest, output, indent=2)

if __name__ == '__main__':
    directory_path = "/home/jin/repo/anata-vrm/"
    parser = argparse.ArgumentParser(description="Generate *_manifest.json file from *_attributes.json files")
    parser.add_argument("input_file", help="Input JSON file (*_attributes.json)")
    parser.add_argument("csv_file", help="Input CSV file with name mapping")
    args = parser.parse_args()
    id_mapping = read_csv_mapping(args.csv_file)

    create_manifest(args.input_file, args.csv_file, id_mapping)  # Include id_mapping argument
```

Can run on a folder containing JSON files from the chain like this:

`for i in *.json; do python3 generate_manifest.py "$i" master_renamed_filenames.csv; done`

</details>
