# Create

Create can be accessed by clicking the first Menu Button in the `Landing` page


**Summary**

Allows users to select a character class `manifest` from the provided `characters-manifest` in `.env`. The component fetches a list of the provided classes and displays them in a side scrollable container, wllowing the user to select a class. class may be disabled. When a class is selected, the component fetches the corresponding `manifest` and transitions to a `Appearance` view.


**Logic**

This component purpose is to fetch classes defined in the `character-manifest-json` and display the options to the user to create their character and move to `appearance` menu.


**Functions**

- `selectClass`: For each option within `manifest.json` defined in `.env` an option will be displayed to choose class and go to next component page `Appearance` 


**Utils functions**

- `back`: Go back to Landing page.

