# Library Management System

A robust backend service for managing a library system, built with TypeScript, Express, and PostgreSQL following Domain-Driven Design (DDD) and Clean Architecture principles.

## Overview

This system allows users to:
- Borrow books
- Return books with ratings
- View their borrowing history
- Browse books

### Key Features

- **Dependency Injection**: Using Awilix for IoC container
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Centralized error handling with custom error types
- **Validation**: Request validation using express-validator
- **Logging**: Structured logging with Winston
- **Testing**: Comprehensive test coverage with Jest

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- PostgreSQL (if running locally)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kadirdeniz/invent-analytics-backend-case.git
   cd invent-analytics-backend-case
   ```

2. Start all services using Docker Compose:
    ```bash
    docker-compose up -d
    ```

## Testing

To run tests:
```bash
npm run test:unit
npm run test:repository
```

## Project Structure

```bash
.   
├── Dockerfile
├── LICENSE
├── README.md
├── coverage
│   ├── clover.xml
│   ├── coverage-final.json
│   ├── lcov-report
│   └── lcov.info
├── docker-compose.yml
├── docs
│   ├── Invent_Analytics_Backend_Developer_Case.pdf
│   └── Library Case API Collection.postman_collection.json
├── jest.config.js
├── package-lock.json
├── package.json
├── src
│   ├── app.ts
│   ├── config
│   ├── controllers
│   ├── index.ts
│   ├── middleware
│   ├── migrations
│   ├── models
│   ├── repositories
│   ├── routes
│   ├── services
│   ├── test
│   ├── utils
│   └── validations
└── tsconfig.json
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

Kadir Deniz

kadirdenz@hotmail.com