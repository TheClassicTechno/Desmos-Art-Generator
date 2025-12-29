# Desmos-Art-Generator

Made by Julia Huang, Archimedes Li, Mahika Patil, Lino Le Van

## Overview

**Desmos Art Generator** is a JavaScript-based tool designed to automate the creation of mathematical art for use in [Desmos](https://www.desmos.com/), the online graphing calculator. This project includes scripts and utilities to convert images and mathematical patterns into Desmos-friendly graph code, allowing for the creation of complex designs and parametric art.

## Features

- **Automated Art Generation:** Converts input data or images into Desmos-compatible mathematical equations.
- **Image Processing:** Tools to analyze images for color and structure, translating them into suitable mathematical formats for graphing.
- **Export Functionality:** Outputs arrays or text files (such as `testArr.txt`) that can be imported into Desmos.
- **Configurable Parameters:** Easily adjust settings to customize the generated art to your needs.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- npm (usually comes with Node.js)
- (Optional) [Replit](https://replit.com/) or similar online IDE for quick testing

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/TheClassicTechno/Desmos-Art-Generator.git
   cd Desmos-Art-Generator
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Usage

1. Place your source images or configuration files in the appropriate folder (e.g., `image_processing/`).
2. Run the main script:
   ```bash
   node index.js
   ```
3. The script will produce output files that contain Desmos-compatible code or data.
4. Import the output into [Desmos](https://www.desmos.com/calculator) to view your generated art.

## Repository Structure

- `index.js` - Main entry point for generating Desmos art
- `image_processing/` - Scripts and resources for image processing
- `public/` - Additional public assets
- `testArr.txt` - Example output data for Desmos
- `package.json`, `package-lock.json` - Project and dependencies configuration



---

*Create, convert, and visualize beautiful math art with Desmos Art Generator!*
