# Optimize avatars



Optimizing VRM models by hand can be very tedious and time consuming. We have designed a simple drag and drop solution that can reduce the amount of draw calls and overall filesize of VRM avatars by:

- merging textures together with an image atlas
    - handles transparent textures separatly
- merging skinned meshes together

The information on the right hand side will let you know how many skinned meshes and texture materials you have to pick the best option.

![Screenshot from 2024-02-15 12-52-24](/img/r1EneCsip.png)

Here is how the output textures look when picking the option to keep both standard and mtoon shader materials:

![image](/img/rkH3-CjjT.png)


Here is how the texture files look when deciding to merge to mtoon or standard:

![image](/img/BkED-RssT.png)

Overall deciding to merge to mtoon or standard shader will result in less draw calls and file size, whereas keeping both can retain the closest likeness to the original incase you have both shaders in the original.

![image](/img/S1J-b0jip.png)

In this example I was able to shave an extra 20% off the filesize from choosing to merge to mtoon shader. Here's results from other files we tested:

![image](/img/B19_9WDNa.png)
https://twitter.com/dankvr/status/1724189158623654346

- https://twitter.com/dankvr/status/1725247568446165082
- https://twitter.com/dankvr/status/1722857264606814394

If interested in modifying the optimizer page, see `src/pages/Optimizer.jsx` and its related dependencies.
