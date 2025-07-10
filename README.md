# AthenaAPI

AthenaAPI is the backend service for **Athenai**, the Epicureans Accounts Payable System. This API provides endpoints for managing accounts payable operations, document processing, RPA integrations, SMS notifications, and more. It is built with Node.js, Express, and MongoDB.

## Features

- **Authentication**: Secure login and session management.
- **Accounts Payable**: Generate, remove, and print AP documents.
- **Treasury Clearing**: Print treasury clearing details.
- **SAP Integration**: Print AP SAP details.
- **Archimedes Integration**: Print Archimedes details.
- **Maintenance**: Manage value classes and GL document types.
- **RPA Integration**: Automated processing of incoming files for AP, Treasury, SAP, Bank Statements, and Clearing.
- **SMS Notifications**: Send SMS alerts for workflow events.
- **Scheduled Tasks**: Cron jobs to trigger automated processes based on file uploads.

## Endpoints

| Route                              | Description                                 |
|-------------------------------------|---------------------------------------------|
| `/auth`                            | Authentication endpoints                    |
| `/ap/generate`                     | Generate AP documents                       |
| `/ap/remove`                       | Remove AP documents                         |
| `/ap/printDetails`                 | Print AP document details                   |
| `/treasuryClearing/printDetails`   | Print treasury clearing details             |
| `/apSap/printDetails`              | Print AP SAP details                        |
| `/archimedes/printDetails`         | Print Archimedes details                    |
| `/ValCl`                           | Manage value classes                        |
| `/glDocType`                       | Manage GL document types                    |
| `/rpa`                             | RPA-related endpoints                       |
| `/sms`                             | SMS notification endpoints                  |

## Scheduled Automation

A cron job runs every hour to check for new files in specific directories. If files are found, the corresponding automated process is triggered:

- AP
- Treasury
- AP SAP
- Bank Statement
- Clearing

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-org/athenaapi.git
    cd athenaapi
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file based on `.env.example` and set your environment variables.

4. Start the server:
    ```sh
    npm start
    ```

The server will run on the port specified in your `.env` file or default to `3000`.

## Project Structure

```
/config           # Database connection and configuration
/helpers          # Utility functions and automation triggers
/routes           # Express route handlers
/fileUploads      # Incoming files for RPA processing
server.js         # Main application entry point
```

## License

This project is proprietary and intended for use by Epicureans and authorized partners only.

---

For questions or support, contact the Epicurean's IT team.
