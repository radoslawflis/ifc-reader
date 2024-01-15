# IFC Reader App

Live App: https://ifc-reader-app.netlify.app/

## About the project

IFC Reader Application is a tool designed to improve exploration and analysis of IFC models. This viewer provides a user-friendly interface with a borad range of features to facilitate inspection, navigation, filtering and data extraction for IFC models. This project utilizes IFC.js library based on three.js providing a strong foundation for rendering and interacting with IFC models.

## Features

-   Load any IFC model to be displayed in the viewer
-   Display properties of any IFC element
-   Clipping plane to see section
-   Query model by name or type of IFC element
-   Tree of IFC model
-   Selection and zoom to object tool
-   Controls with yomotsu camera-controls
-   Context to manage loaded models in the scene
-   Fetch properties as JSON with possibility to filter them
-   Cube navigation + Minimap

## Technologies Used

-   Front-end: IFC.js, HTML, CSS, JavaScript, Typescript, React, Context API, Three.js, 
-   Styling: Tailwind CSS
  
## Why I built the project this way

Developing this project let me understand foundations of ifc.js which is a library based on three.js. Throughout the research I encountered and explored the limitations of data fetching, analyses, and extraction within the IFC.js engine from its data structures to its rendering capabilities. The development process provided practical insights into the challenges associated with working with BIM data. Additionally It was an important challenge to combine technologies of React, Typescript and Three.js with Ifc.js. During the process of getting acquainted with technology I was able to report issues to the official repository of ifc.js to contribute to open source community.
