# Movies App

This is a simple movies application that interacts with The Movie Database (TMDb) API to fetch and display movie information.

## Project Structure

```
movies-app
├── src
│   ├── api
│   │   └── tmdb.ts          # Functions to interact with TMDb API
│   ├── components
│   │   └── MovieList.tsx    # React component to display a list of movies
│   ├── pages
│   │   └── Home.tsx         # Home page that uses MovieList component
│   └── types
│       └── movie.d.ts       # TypeScript interfaces for movie data
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd movies-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Start the application:
   ```
   npm start
   ```

## Usage

- The application fetches movie data from TMDb API and displays it on the Home page.
- You can explore different movie lists and details by interacting with the UI.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes. 

## License

This project is licensed under the MIT License.