# **App Name**: MyDataGPT

## Core Features:

- Secure Data Upload: Allows users to upload various types of data (contacts, photos, documents, etc.) to a secure cloud storage.
- AI-Powered Data Retrieval: Utilizes the Ollama artifish/llama3.2 model (configured to impersonate ChatGPT) to understand user queries and retrieve the requested data from the encrypted database. The LLM reasons about how to fulfill the user request by applying the tool to scan and search available encrypted resources.
- Facial Recognition Authentication: Implements facial recognition for secure user authentication, ensuring only authorized users can access their data.
- End-to-End Encryption: Provides end-to-end encryption to protect data both in transit and at rest, ensuring maximum data security and privacy.
- ChatGPT-like Interface: Replicates the look and feel of the ChatGPT interface, providing a familiar and user-friendly experience for interacting with the database.
- Automatic Data Backup Suggestion: Prompts new users to perform a full device backup upon initial app launch, ensuring data is secured in case of device loss or damage.
- Data Restore Functionality: Enables users to restore their data to a new device, seamlessly transferring their personal information and settings.

## Style Guidelines:

- Background color: Dark, desaturated gray (#262A30) to convey security and sophistication.
- Primary color: Saturated blue (#59A5F4) reminiscent of chat applications, indicating conversation and assistance.
- Accent color: Bright purple (#B150F1) to highlight interactive elements, indicating security.
- Body and headline font: 'Inter', a grotesque-style sans-serif, provides a modern, objective, neutral look suitable for UI.
- Use simple, minimalist icons with a focus on clarity and security. Consider padlock, shield, and key icons.
- Maintain a clean, streamlined layout, mimicking the chat-style interface of ChatGPT. Ensure readability and easy navigation.
- Incorporate subtle animations for actions such as data loading or authentication to enhance the user experience.

## Architecture

- **Frontend**: A web-based interface built with a modern JavaScript framework (e.g., React, Vue, or Svelte) that provides the chat interface and interacts with the backend services.
- **Backend**:
    - **Reverse Proxy**: An NGINX server that acts as a reverse proxy for all incoming traffic, routing requests to the appropriate backend service.
    - **Personal Backend**: An Express.js service that handles user authentication, file uploads, and metadata management.
    - **ChatGPT Backend**: An Express.js service that proxies requests to the Ollama model, providing a secure and authenticated interface to the LLM.
- **Database**: A PostgreSQL database for storing user metadata, file metadata, and other application data.
- **Object Storage**: A MinIO instance for storing encrypted user data.
- **Authentication**: Firebase Authentication for user authentication and management.

## Security

- **End-to-End Encryption**: All data is encrypted on the client-side before being uploaded to the server, ensuring that only the user can access their data.
- **Data at Rest Encryption**: All data is stored in an encrypted format in the MinIO object storage.
- **Data in Transit Encryption**: All communication between the client and the server is encrypted using TLS/SSL.
- **Authentication and Authorization**: All API endpoints are protected by Firebase Authentication, ensuring that only authenticated users can access their data.
- **Secure Key Management**: Encryption keys are managed on the client-side, ensuring that the server never has access to unencrypted data.

## API Endpoints

- `POST /personal/upload`: Uploads a file to the secure cloud storage.
- `GET /personal/meta`: Retrieves metadata for all files in the user's account.
- `GET /personal/blob/:id`: Retrieves a single file from the secure cloud storage.
- `DELETE /personal/blob/:id`: Deletes a file from the secure cloud storage.
- `POST /chatgpt/query`: Proxies a query to the Ollama model.

## Client-Side Encryption & Key Management

- **Key Derivation**: When a user creates an account, a new encryption key is generated on the client-side. This key is derived from the user's password using a key derivation function such as PBKDF2.
- **Key Storage**: The encryption key is never stored on the server. Instead, it is stored in the browser's local storage and is encrypted with the user's password.
- **File Encryption**: When a user uploads a file, the file is encrypted on the client-side using the user's encryption key. The encrypted file is then uploaded to the server.
- **File Decryption**: When a user downloads a file, the encrypted file is downloaded from the server. The file is then decrypted on the client-side using the user's encryption key.

## Deployment and CI/CD

- **Continuous Integration**: When a developer pushes code to the main branch, a GitHub Actions workflow is triggered. The workflow builds the Docker images for the backend services and runs the tests.
- **Continuous Deployment**: If the tests pass, the workflow deploys the new Docker images to the server. The workflow also updates the NGINX configuration to route traffic to the new containers.

## Testing

- **Unit Tests**: Unit tests are written for all backend services. The tests are written using a testing framework such as Jest or Mocha.
- **Integration Tests**: Integration tests are written to test the interaction between the backend services. The tests are written using a testing framework such as Supertest.
- **End-to-End Tests**: End-to-end tests are written to test the entire application. The tests are written using a testing framework such as Cypress or Puppeteer.
