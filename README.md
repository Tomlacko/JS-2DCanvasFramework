# JS-2DCanvasFramework
A JavaScript 2D canvas/game framework (+other utilities and experiments) I made in 2018 when I was into experimenting with rendering. The code is not great though and the experiments have been just quickly thrown together for fun.

### Live demos:

#### [Debug test / feature showcase](https://tomlacko.github.io/JS-2DCanvasFramework#debug)
- 2D rendering playground used to test features of the framework
- Clicking and dragging (or pressing arrow keys) pans the canvas around, scrolling zooms in and out
- WASD keys move the "Test" rectangle, Q and E rotates it, Num +-*/ keys stretch it in different directions and ,/. keys move it forward and back in perspective
- "[" and "]" rotates the background itself

#### [2 player game test](https://tomlacko.github.io/JS-2DCanvasFramework#shootoff)
- The game is completely stupid and pointless as it was only used for testing purposes
- Shooting the oponent gives you score, all shots are automatically aimed at the opponent
- Blue player moves via WASD, shoots by E and blocks by Q
- Red player moves via arrow keys, shoots by CTRL / right alt and blocks by Num 0

#### [Custom 3D renderer using 2D canvas](https://tomlacko.github.io/JS-2DCanvasFramework#3D)
- The result of me learning the mechanics behind 3D rendering by seeing how far can I get with doing everything manually using a purely 2D canvas.
- Contains 4 built-in scenes that can be loaded by entering their name into the initial prompt:
  - "test" - containing a platform, cube and a particle spawner
  - "deer" - containing a model of a deer
  - "amnesia - containing models exported from the game "Amnesia - The Dark Descent"
  - "empty" - containing nothing
- Regardless of the scene, the controls are:
  - Look around using the mouse, WASD for movement, Space for jumping / flying up, Shift for flying down, Num +/- to adjust movement speed
  - F to shoot a ball in the looking direction
  - E to place a cube in the looking direction
  - Num "/" / "*" changes which object is selected (in order of placement), Q to remove the currently selected object, Num 5 to duplicate the currently selected object
  - Num 2,4,6,8 to move the currently selected object horizontally relative to the looking direction, Num 7,1 to move it up or down, Num 9,3 to scale it
  - Holding shift + pressing Num 1,3,7,9 rotates the currently selected object
