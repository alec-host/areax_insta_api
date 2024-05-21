# Instagram Messaging App

This is an application to post captions and images to Instagram using the `instagram-private-api` library. The application is built with Node.js and Express, following best practices for separation of concerns and secure handling of credentials.

## Features

- Post a caption to Instagram
- Post a caption with an image to Instagram

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/instagram-posting-app.git
   cd instagram-posting-app
   ```

## Usage

1. npm start

2. Use the following endpoints to post captions and images to Instagram:

    __Post a Caption with an Image__

    POST /post/caption-image

    Content-Type: multipart/form-data

    ```bash
    {
        "username": "your_instagram_username",
        "password": "your_instagram_password",
        "caption": "your_caption",
        "image": "your_image_file"
    }
    ```

## Project Structure

project-root
│   .env
│   app.js
│   package.json
│   README.md
└───controllers
│   │   postController.js
└───routes
│   │   postRoutes.js
└───uploads

**app.js**: The main entry point of the application.
**controllers/postController.js**: Contains the logic for handling the post requests.
**routes/postRoutes.js**: Defines the routes for posting captions and images.
**uploads/**: Directory for storing uploaded images temporarily.

## Dependencies

- express: ^4.17.1
- body-parser: ^1.19.0
- dotenv: ^16.0.0
- instagram-private-api: ^1.46.3
- multer: ^1.4.3

## Acknowledgments

instagram-private-api for the Instagram API client.
Express for the web framework.
Multer for handling multipart/form-data.