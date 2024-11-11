# season-ing

# 3D Seasonal Globe Visualization

This project is a 3D interactive globe visualization that simulates different seasons on separate globes, each representing a unique environment for Spring, Summer, Fall, and Winter. The project uses Three.js for rendering and includes interactive controls, lighting effects, and animated features like a jumping cat and time-based lighting changes.

## Features

- **Four Seasonal Globes**: Each globe displays textures and objects suited to a particular season:
  - **Spring**: Cherry blossoms, spring trees, and other spring-themed objects.
  - **Summer**: Beach scenes with umbrellas, beach balls, and palm trees.
  - **Fall**: Autumn foliage, fall trees, and benches.
  - **Winter**: Snow-covered surfaces with winter textures and ambient lighting.

- **Dynamic Lighting**: Light source that orbits the globe to simulate a day/night cycle, adjusting color and intensity based on time.

- **Interactive Controls**: Buttons to switch between seasons, with each button scaling the selected season's globe to full size while shrinking the others.

- **Cat Animation**: A cat model can jump when triggered by the space bar, simulating playful movement on the globe's surface.

- **Meteor Shower and Star Field**: During nighttime, a meteor shower or star field appears around the globe, creating a visually engaging nighttime effect.

- **Clock Display**: A real-time clock is shown on the interface, synchronized with the Korean Standard Time (KST).
<br>

## Getting Started

### Prerequisites

- **Three.js** - The project relies on Three.js for 3D rendering and controls.
- **WebGL Support** - A modern browser with WebGL support is required.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HwangGoeun/season-ing.git
   ```
2. Ensure you have the textures and models folders in the project directory to load the required assets.
### Running the Project
1. Open globe.html in a WebGL-enabled browser.
2. Use the provided buttons to switch between seasons and observe the lighting and environmental changes.
3. Use the space bar to make the cat model jump, and the interactive slider to adjust lighting or other parameters.

## File Structure

- **globe.html** - The main HTML file that loads the scene and interactive elements.
- **globe.js** - JavaScript code that initializes the Three.js scene, handles object placement, and defines animations and controls.
- **Textures and Models** - A collection of seasonal textures and 3D models representing each season's unique elements.

## Key Functions
- **init()**: Sets up the Three.js scene, renderer, camera, and lighting.
- **setupClock()**: Initializes the real-time clock display.
- **updateLightPosition()**: Updates the light source position based on time, creating a realistic day/night effect.
- **Season Functions (e.g., spring_camera(), summer_camera())**: Scale the corresponding season's globe to focus, shrinking the other globes.
- **handleJump()**: Controls the jumping animation of the cat model on the globe's surface.

## Acknowledgments
This project uses various open-source models and textures to enhance the seasonal appearance of each globe. Special thanks to the contributors of Three.js and to the creators of the 3D models and textures used in this project.

# Members

| Name           | GitHub                   |
|----------------|--------------------------|
| 🌸 Hwang Goeun | https://github.com/HwangGoeun |
| 🌴 Kwon SoYeong | https://github.com/ksy0725 |
| 🍁 Kang Jiyun | https://github.com/1stMourinhoFan |
| ☃️ Lee chaeeun | https://github.com/may0611 |
