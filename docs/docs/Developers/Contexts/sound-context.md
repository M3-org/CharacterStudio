# Sound Context

Sound Context is used to get sound files and play them in any page or component by just providing the name of the sound.

It uses `sound-files.json` file to setup audio locations, offset and duration of each sound file, then each audio is defined within soundContext  in the useSound function.

**Functions**

- `playSound(name, delay)`: Play sound given a name and a delay time.