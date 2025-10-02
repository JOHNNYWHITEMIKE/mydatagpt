# **App Name**: MyDataGPT

## Product Overview & MVP Goals

MyDataGPT is a secure dual-mode application that combines:
- **Public Mode**: ChatGPT assistant interface (open to anyone after login)
- **Vault Mode**: Hidden/PIN/biometric-unlocked private vault for files, photos, contacts, notes, and private browsing

### User Expectations
- **Zero-knowledge storage**: The server operator cannot read user data
- **Secure & recoverable**: Data can be recovered through multiple methods
- **Offline unlock possible**: Cached vault can be opened without internet connection
- **Cross-device sync**: Encrypted data syncs across devices via encrypted cloud storage

### Core Features

- **Secure Data Upload**: Upload various types of data (contacts, photos, documents, etc.) to secure cloud storage with client-side encryption
- **AI-Powered Data Retrieval**: Utilizes LLM (Ollama/OpenAI) to understand queries and retrieve encrypted data. The LLM reasons about fulfilling requests by scanning and searching available encrypted resources
- **Biometric Authentication**: Implements facial recognition and fingerprint authentication for secure user access, leveraging device Secure Enclave/Keystore
- **End-to-End Encryption**: Zero-knowledge encryption - data is encrypted on the client-side before upload, ensuring maximum security and privacy
- **ChatGPT-like Interface**: Familiar chat interface for interacting with both AI assistant and personal data vault
- **Automatic Data Backup Suggestion**: Prompts new users to perform device backup upon initial app launch
- **Data Restore Functionality**: Enables seamless data restoration to new devices
- **PIN/Biometric Unlock**: Multiple unlock methods with secure key derivation and storage

## Style Guidelines:

- Background color: Dark, desaturated gray (#262A30) to convey security and sophistication.
- Primary color: Saturated blue (#59A5F4) reminiscent of chat applications, indicating conversation and assistance.
- Accent color: Bright purple (#B150F1) to highlight interactive elements, indicating security.
- Body and headline font: 'Inter', a grotesque-style sans-serif, provides a modern, objective, neutral look suitable for UI.
- Use simple, minimalist icons with a focus on clarity and security. Consider padlock, shield, and key icons.
- Maintain a clean, streamlined layout, mimicking the chat-style interface of ChatGPT. Ensure readability and easy navigation.
- Incorporate subtle animations for actions such as data loading or authentication to enhance the user experience.

## Recommended Tech Stack

### Mobile
- **Flutter**: Single codebase for iOS + Android
  - Mature ecosystem with excellent native biometric support
  - Good secure storage libraries (flutter_secure_storage, local_auth)
  - Cross-platform consistency

### Frontend (Web - Optional)
- **Next.js/React**: Modern web interface
- **Firebase Hosting**: Static hosting for web app

### Authentication
- **Firebase Authentication**: 
  - Email/password + social login support
  - Issues JWT tokens validated by backends
  - Comprehensive user management

### Backend Services (VPS Docker Compose)
- **Reverse Proxy**: NGINX with TLS termination
  - Domain management and SSL/TLS
  - Routes traffic to appropriate backend services
- **Personal Backend**: Express.js/FastAPI service
  - User metadata management
  - File metadata and blob management
  - Authentication middleware
- **ChatGPT Backend**: Express.js service
  - Proxy to OpenAI or Ollama LLM provider
  - Usage quotas and rate limiting
  - Billing integration

### Storage
- **Object Storage**: MinIO (self-hosted) or S3/Backblaze/Wasabi
  - Stores encrypted blobs
  - Signed URLs for secure access
- **Relational Database**: PostgreSQL
  - User metadata
  - File metadata (filename, size, MIME type, tags)
  - Encryption parameters (salt, IV - non-secret)

### CI/CD
- **GitHub Actions**: 
  - Build mobile artifacts (AAB/IPA)
  - Build and push Docker images
  - Automated deployment via SSH/Ansible

## Architecture & Data Flow

### Overview
1. **User Authentication**: User logs in via Firebase Auth → client receives Firebase ID token
2. **Key Derivation**: Client generates/derives encryption key from PIN/password (never sent to server)
3. **Data Encryption**: All vault data encrypted locally with AES-GCM before upload
4. **Upload**: Client uploads encrypted blob to personal-backend → stored in object store with metadata in PostgreSQL
5. **Storage**: Server stores only metadata + encrypted blob (server never sees plaintext)
6. **Retrieval**: Client requests encrypted blob + IV/salt → downloads and decrypts locally
7. **Chat**: Chat requests routed to chatgpt-backend which validates token and proxies to LLM

### Security Principles
- **Zero-knowledge**: Server cannot decrypt user data
- **Client-side encryption**: All encryption/decryption happens on device
- **Secure key management**: Keys derived from user credentials, stored in device secure storage
- **Token-based auth**: Firebase JWT tokens validate all API requests

## Security Architecture

### Client-Side Encryption & Key Management

#### Key Derivation & Storage Model

**On First Vault Setup:**

1. User picks a **PIN** (or password)
2. Derive symmetric key using PBKDF2 (or Argon2 if available):
   ```
   key = PBKDF2(pin, salt, iterations=100000, keyLen=32)
   ```
3. Store salt (non-secret) with server metadata or locally
4. Store unlock token in platform secure storage (Keychain/Android Keystore) unlockable by biometrics
   - This allows biometric unlock without entering PIN each time
   - **Important**: Biometric only unlocks local key — never send key to server

**For File Encryption:**
- Use AES-GCM or AES-CTR+HMAC with random IV per file
- Store IV and authentication tag alongside ciphertext
- Example: `{ ciphertext, iv, authTag, salt }`

**Implementation (Flutter):**
```dart
// Key derivation with PBKDF2
final derivator = PBKDF2KeyDerivator(HMac(SHA256Digest(), 64))
  ..init(Pbkdf2Parameters(salt, 100000, 32));
final key = Key(derivator.process(Uint8List.fromList(utf8.encode(password))));

// File encryption with AES-GCM
final iv = IV.fromSecureRandom(12);
final encrypter = Encrypter(AES(key, mode: AESMode.gcm));
final encrypted = encrypter.encrypt(data, iv: iv);

// Store salt and IV (non-secret)
await storage.write(key: 'salt', value: base64.encode(salt));
await storage.write(key: 'iv', value: iv.base64);
```

#### Biometric Authentication Flow

1. Use Secure Enclave/Keystore to generate local asymmetric keypair bound to biometric
2. Encrypt symmetric key with public key
3. Store encrypted symmetric key in secure storage
4. On biometric authentication: private key unlocks decryption
5. Libraries: `local_auth`, `flutter_secure_storage`, platform crypto APIs

**Flutter Implementation:**
```dart
// Check biometric availability
final LocalAuthentication auth = LocalAuthentication();
final bool canAuthenticateWithBiometrics = await auth.canCheckBiometrics;

// Authenticate with biometrics
final bool didAuthenticate = await auth.authenticate(
  localizedReason: 'Please authenticate to access your vault',
  options: const AuthenticationOptions(
    stickyAuth: true,
    biometricOnly: true,
  ),
);

// On success, retrieve encryption key from secure storage
if (didAuthenticate) {
  final encryptionKey = await secureStorage.read(key: 'encryption_key');
  // Decrypt data...
}
```

#### Key Recovery Options

**Option 1: Recovery Phrase (Recommended)**
- User writes down seed phrase that can regenerate key
- Zero-knowledge but user bears responsibility
- Best security/usability balance

**Option 2: Escrow**
- Encrypted key copy stored on server protected by user passphrase
- Weakens zero-knowledge but improves recovery UX
- Passphrase must be different from PIN

**Option 3: No Recovery**
- Most secure but risky for UX
- Clear warnings to users about data loss risk

**Policy Recommendation**: Implement recovery phrase with clear documentation

### Server-Side Security Practices

#### Data Handling
- **Never log PII or ciphertext contents** - log reference IDs only
- Server only stores encrypted blobs and metadata
- No access to plaintext data at any point

#### Transport & Communication
- **HTTPS everywhere** with HSTS enabled
- TLS 1.2+ minimum for all connections
- Cert management with Let's Encrypt (automated renewal)

#### Authentication & Authorization
- Verify Firebase tokens server-side with Firebase Admin SDK
- Rate limit all endpoints (e.g., 100 requests/minute per user)
- Implement authz checks: users can only access their own resources
- Use signed URLs or temporary tokens for blob downloads

#### File Upload Security
- Virus scanning with ClamAV integration
- File size limits (e.g., 100MB per file, 10GB total per user)
- MIME type validation
- Content-Type verification

#### Infrastructure Security
- Run services with least privilege (non-root containers)
- Use secrets management (Docker secrets, env vars from secure store)
- Regular security updates for base images
- Content Security Policy headers for web views
- CORS configuration restricted to known origins

#### Example: Express Firebase Auth Middleware

```javascript
// server/middleware/auth.js
const admin = require('firebase-admin');

// Initialize admin with service account (once)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function firebaseAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  
  if (!match) {
    return res.status(401).send({ error: 'Missing token' });
  }
  
  const idToken = match[1];
  
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    console.error('Token verification failed:', err.code);
    res.status(401).send({ error: 'Invalid token' });
  }
}

module.exports = firebaseAuth;
```

### Data Protection Summary

- **End-to-End Encryption**: All vault data encrypted client-side before upload
- **Zero-Knowledge Storage**: Server cannot decrypt user data
- **Data at Rest**: Encrypted blobs in object storage
- **Data in Transit**: TLS/SSL for all communications
- **Authentication & Authorization**: Firebase JWT tokens protect all endpoints
- **Secure Key Management**: Keys derived from user credentials, stored in device secure storage
- **Biometric Protection**: Device Secure Enclave/Keystore integration

## API Endpoints

All endpoints require `Authorization: Bearer <Firebase ID token>` header.

### Personal Data Endpoints

#### `POST /personal/upload`
Upload encrypted blob with metadata.

**Request:**
```javascript
POST /personal/upload
Authorization: Bearer <firebase-token>
Content-Type: multipart/form-data

{
  file: <encrypted-blob>,
  filename: "document.pdf",
  mime_type: "application/pdf",
  size: 1048576,
  salt: "base64-encoded-salt",
  iv: "base64-encoded-iv",
  tags: ["work", "important"]
}
```

**Response:**
```json
{
  "success": true,
  "file_id": "abc123",
  "object_name": "user123/document.pdf"
}
```

#### `GET /personal/meta`
List all files with metadata (no plaintext content).

**Request:**
```javascript
GET /personal/meta
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "files": [
    {
      "id": "abc123",
      "filename": "document.pdf",
      "mime_type": "application/pdf",
      "size": 1048576,
      "salt": "base64-encoded-salt",
      "iv": "base64-encoded-iv",
      "tags": ["work", "important"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total_size": 1048576,
  "file_count": 1
}
```

#### `GET /personal/blob/:id`
Download encrypted blob.

**Request:**
```javascript
GET /personal/blob/abc123
Authorization: Bearer <firebase-token>
```

**Response:**
```
Binary encrypted blob data
Content-Type: application/octet-stream
```

#### `DELETE /personal/blob/:id`
Delete file and metadata.

**Request:**
```javascript
DELETE /personal/blob/abc123
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Chat Endpoints

#### `POST /chatgpt/query`
Forward query to LLM with rate limiting.

**Request:**
```javascript
POST /chatgpt/query
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "prompt": "What files do I have stored?",
  "context": {
    "conversation_id": "conv123",
    "previous_messages": []
  }
}
```

**Response:**
```json
{
  "response": "You have 5 files stored...",
  "conversation_id": "conv123",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100
  }
}
```

### Implementation Example

```javascript
// Example: Upload endpoint with Firebase auth
app.post('/personal/upload', firebaseAuth, upload.single('file'), async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }
  
  // Validate file size
  if (req.file.size > 100 * 1024 * 1024) { // 100MB limit
    return res.status(400).send({ error: 'File too large' });
  }
  
  const bucketName = process.env.MINIO_BUCKET || 'mydatagpt';
  const objectName = `${req.user.uid}/${Date.now()}-${req.file.originalname}`;
  
  try {
    // Upload to MinIO
    await minioClient.putObject(
      bucketName, 
      objectName, 
      req.file.buffer, 
      req.file.size
    );
    
    // Store metadata in PostgreSQL
    const result = await db.query(
      `INSERT INTO files (user_id, file_name, object_name, mime_type, size, salt, iv, tags, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id`,
      [
        req.user.uid,
        req.file.originalname,
        objectName,
        req.body.mime_type,
        req.file.size,
        req.body.salt,
        req.body.iv,
        req.body.tags
      ]
    );
    
    res.send({ 
      success: true,
      file_id: result.rows[0].id,
      object_name: objectName
    });
  } catch (err) {
    console.error('Upload error:', err.code);
    res.status(500).send({ error: 'Failed to upload file' });
  }
});
```

## Client-Side Encryption Implementation

### Conceptual Web Crypto Example

While Flutter uses platform-specific crypto libraries, here's the conceptual flow using Web Crypto API:

```javascript
// 1. Derive key from password using PBKDF2
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// 2. Encrypt file
async function encryptFile(file, password) {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key
  const key = await deriveKey(password, salt);
  
  // Read file as ArrayBuffer
  const fileBuffer = await file.arrayBuffer();
  
  // Encrypt with AES-GCM
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    fileBuffer
  );
  
  return {
    ciphertext: ciphertext,
    salt: salt,
    iv: iv
  };
}

// 3. Upload encrypted file
async function uploadEncryptedFile(file, password, firebaseToken) {
  const encrypted = await encryptFile(file, password);
  
  const formData = new FormData();
  formData.append('file', new Blob([encrypted.ciphertext]));
  formData.append('filename', file.name);
  formData.append('mime_type', file.type);
  formData.append('size', file.size);
  formData.append('salt', btoa(String.fromCharCode(...encrypted.salt)));
  formData.append('iv', btoa(String.fromCharCode(...encrypted.iv)));
  
  const response = await fetch('/personal/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${firebaseToken}`
    },
    body: formData
  });
  
  return await response.json();
}

// 4. Download and decrypt file
async function downloadAndDecryptFile(fileId, password, salt, iv, firebaseToken) {
  // Download encrypted blob
  const response = await fetch(`/personal/blob/${fileId}`, {
    headers: {
      'Authorization': `Bearer ${firebaseToken}`
    }
  });
  
  const encryptedData = await response.arrayBuffer();
  
  // Derive key with stored salt
  const key = await deriveKey(password, salt);
  
  // Decrypt with stored IV
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encryptedData
  );
  
  return decrypted;
}
```

### Flutter Implementation Reference

The Flutter app already implements encryption using the `encrypt` package:

```dart
class EncryptionService {
  final _storage = const FlutterSecureStorage();

  // Derive key using PBKDF2
  encrypt.Key _deriveKey(String password, Uint8List salt) {
    final derivator = PBKDF2KeyDerivator(HMac(SHA256Digest(), 64))
      ..init(Pbkdf2Parameters(salt, 100000, 32));
    return encrypt.Key(derivator.process(
      Uint8List.fromList(utf8.encode(password))
    ));
  }

  // Encrypt data
  Future<Map<String, dynamic>> encryptData(String password, String data) async {
    final salt = encrypt.IV.fromSecureRandom(16).bytes;
    final key = _deriveKey(password, salt);
    final iv = encrypt.IV.fromSecureRandom(12);
    final encrypter = encrypt.Encrypter(
      encrypt.AES(key, mode: encrypt.AESMode.gcm)
    );
    
    final encrypted = encrypter.encrypt(data, iv: iv);
    
    // Store salt and IV in secure storage
    await _storage.write(key: 'salt', value: base64.encode(salt));
    await _storage.write(key: 'iv', value: iv.base64);
    
    return {
      'encryptedData': encrypted.base64,
      'salt': base64.encode(salt),
      'iv': iv.base64,
    };
  }

  // Decrypt data
  Future<String> decryptData(
    String password, 
    String encryptedData
  ) async {
    final saltString = await _storage.read(key: 'salt');
    final ivString = await _storage.read(key: 'iv');
    
    if (saltString == null || ivString == null) {
      throw Exception('Salt or IV not found in secure storage');
    }
    
    final salt = base64.decode(saltString);
    final iv = encrypt.IV.fromBase64(ivString);
    final key = _deriveKey(password, salt);
    final encrypter = encrypt.Encrypter(
      encrypt.AES(key, mode: encrypt.AESMode.gcm)
    );
    
    return encrypter.decrypt64(encryptedData, iv: iv);
  }
}
```

### Key Management Best Practices

1. **Never store encryption keys on server**
2. **Use secure storage** (Keychain/Keystore) for encrypted keys on device
3. **Salt must be random** and unique per user
4. **IV must be random** and unique per encryption operation
5. **Store salt and IV** alongside ciphertext (they are non-secret)
6. **Use strong KDF parameters**: PBKDF2 with 100,000+ iterations or Argon2
7. **Implement key rotation** for long-lived data
8. **Clear keys from memory** after use when possible

## App UX & Hidden Vault Behavior (Store Policy Safe)

### Important: Store Compliance

**Don't disguise the app as a different app class** - full calculator disguise can trigger policy violations.

**Recommended Approach:**
- Present app as an AI assistant with an optional secure vault feature
- Describe dual functionality openly in store listing and privacy policy
- Provide hidden gesture or secret code for convenience, but **no deception**
- Apple/Google require honest disclosure about encryption/storage and data collection

### Vault Access Flows

**Normal Mode:**
- Default: Chat interface for AI assistant
- Standard Firebase authentication

**Vault Mode Access:**
- **Option 1**: Enter special command in chat (e.g., `mydatagpt <PIN>`)
- **Option 2**: Hidden gesture (long press on specific UI element)
- **Option 3**: Dedicated vault button with PIN/biometric prompt

**Recommendation**: Use dedicated UI with clear vault icon and biometric prompt for best UX and compliance.

## App Store & Play Store Requirements

### Apple App Store

**Requirements:**
- Apple Developer account ($99/year)
- Privacy policy URL required
- App Privacy section in App Store Connect (data types collected)
- Export compliance declaration for encryption
  - Most client-side AES is standard and exempt
  - Check Apple guidance: https://help.apple.com/app-store-connect/#/dev88f5c7bf9
  - Consider legal counsel if unsure

**Testing:**
- Test on real iOS devices (TestFlight beta testing)
- Enable FaceID/TouchID integration
- Test Keychain integration
- Verify background behavior and battery usage

**Store Listing:**
- Clear screenshots demonstrating chat + vault features
- Transparent description of encryption and zero-knowledge storage
- List all permissions (storage, camera, biometrics)

### Google Play Store

**Requirements:**
- Google Play Console account ($25 one-time fee)
- Privacy policy URL required
- Data safety form (declare storage, encryption, data types)
- Target latest Android API level

**Testing:**
- Test on multiple Android devices
- Test biometric authentication (fingerprint, face unlock)
- Verify background limitations
- Test battery optimization exceptions if needed

**Store Listing:**
- Screenshots showing all major features
- Clear description of security features
- Permissions explanation

### Common Requirements

**Transparency:**
- **DO**: Clearly describe vault feature and data protection
- **DO**: Explain how encryption works
- **DO**: State that you cannot access user data
- **DON'T**: Claim you can retrieve lost data if you cannot
- **DON'T**: Hide the vault functionality or mislead users

**Privacy Policy Must Include:**
- What data is collected (metadata vs. content)
- How encryption works
- Whether server can access data (no)
- Data retention and deletion policies
- User rights (GDPR compliance if applicable)

**Screenshots & Descriptions:**
- Show chat interface
- Show vault unlock screen
- Show file upload/management interface
- Demonstrate security features

## Deployment and CI/CD

### Mobile CI/CD (GitHub Actions)

**Build Pipeline:**
```yaml
name: Mobile Build

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Run tests
        run: flutter test
      
      - name: Build AAB
        run: flutter build appbundle --release
        env:
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: android-release
          path: build/app/outputs/bundle/release/app-release.aab

  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Run tests
        run: flutter test
      
      - name: Build IPA
        run: flutter build ipa --release
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: ios-release
          path: build/ios/ipa/*.ipa
```

**Secrets to Configure:**
- `KEYSTORE_PASSWORD`: Android signing key password
- `KEY_PASSWORD`: Android key password
- `MATCH_PASSWORD`: iOS signing certificate password (using fastlane match)

### Backend CI/CD

**Docker Build & Deploy:**
```yaml
name: Backend Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build personal-backend
        run: |
          cd personal-backend
          docker build -t mydatagpt/personal-backend:latest .
      
      - name: Build chatgpt-backend
        run: |
          cd chatgpt-backend
          docker build -t mydatagpt/chatgpt-backend:latest .
      
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push mydatagpt/personal-backend:latest
          docker push mydatagpt/chatgpt-backend:latest
      
      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/mydatagpt
            docker compose pull
            docker compose up -d --remove-orphans
            docker system prune -f
```

**Alternative: Ansible Deployment:**
```yaml
- name: Deploy to VPS
  run: |
    ansible-playbook -i inventory/production deploy.yml
```

### Certificate Management

**Let's Encrypt with Certbot:**
- Automated renewal via cron job or systemd timer
- Mount certificates into NGINX container
- Monitor expiration dates

```bash
# Renewal command (automated via cron)
certbot renew --quiet --deploy-hook "docker compose restart reverse-proxy"
```

### Continuous Integration Best Practices

1. **Run tests on every push** - unit, integration, and e2e tests
2. **Build artifacts for every release branch**
3. **Use semantic versioning** for releases
4. **Tag releases** in Git
5. **Automated rollback** on deployment failure
6. **Monitor deployment health** after each deploy

## Monitoring, Backups & Operations

### Monitoring

**Application Monitoring:**
- **Prometheus + Grafana**: Metrics collection and visualization
- **Alternative**: UptimeRobot for simple uptime monitoring
- **Cloud Logging**: Centralized logs (ELK stack or Grafana Loki)

**Key Metrics to Monitor:**
- API response times
- Error rates (4xx, 5xx)
- Authentication failures
- Storage usage per user
- Database connection pool
- LLM API usage and costs
- Container health and restarts

**Alerting:**
- Server downtime
- High error rates
- Storage quota exceeded
- Certificate expiration (< 7 days)
- Unusual authentication patterns

### Logging Best Practices

**DO:**
- Log request IDs for tracing
- Log authentication events (success/failure)
- Log error codes and types
- Use structured logging (JSON format)

**DON'T:**
- Log PII (emails, names, phone numbers)
- Log ciphertext contents
- Log encryption keys or tokens
- Log full request/response bodies with user data

**Example Logging:**
```javascript
// Good - structured logging without PII
logger.info('File upload', {
  requestId: req.id,
  userId: req.user.uid,
  fileSize: req.file.size,
  mimeType: req.body.mime_type,
  timestamp: new Date().toISOString()
});

// Bad - contains PII and sensitive data
logger.info(`User ${req.user.email} uploaded ${req.file.originalname}`);
```

### Backups

**Database Backups:**
```bash
# Daily PostgreSQL backup
pg_dump -h localhost -U postgres mydatagpt > backup-$(date +%Y%m%d).sql

# Compress and encrypt backup
tar -czf - backup-$(date +%Y%m%d).sql | \
  openssl enc -aes-256-cbc -salt -out backup-$(date +%Y%m%d).sql.tar.gz.enc

# Upload to S3 or remote storage
aws s3 cp backup-$(date +%Y%m%d).sql.tar.gz.enc s3://backups/
```

**Object Storage Replication:**
- Enable versioning in MinIO/S3
- Configure cross-region replication
- Retain encrypted backups for 30+ days
- Store decryption keys offline/separately

**Backup Testing:**
- Test restore procedures quarterly
- Verify backup integrity
- Document recovery time objectives (RTO)
- Document recovery point objectives (RPO)

### Incident Response Plan

**Preparation:**
1. Document all system access credentials
2. Create incident response runbook
3. Define escalation procedures
4. Maintain contact list for on-call

**Response Steps:**
1. **Identify**: Detect and verify incident
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine root cause and scope
4. **Remediate**: Apply fixes and patches
5. **Recover**: Restore services and verify
6. **Review**: Post-mortem and documentation

**Security Incidents:**
- Revoke compromised API keys immediately
- Rotate Firebase service account credentials
- Force user password resets if auth compromised
- Notify affected users within legal timeframes
- Document incident for compliance

## Privacy, Legal & Compliance

### Privacy Policy Requirements

**Must Disclose:**
- **Data Collection**: What data is collected (metadata, encrypted files)
- **Data Usage**: How data is used (storage, retrieval, AI processing)
- **Data Access**: Who can access data (only the user)
- **Encryption**: How data is protected (E2EE, zero-knowledge)
- **Data Retention**: How long data is kept
- **Data Deletion**: How users can delete their data
- **Third Parties**: What services are used (Firebase, MinIO/S3, OpenAI)
- **Cookies/Tracking**: What tracking is performed
- **User Rights**: GDPR rights if applicable

**Example Privacy Policy Sections:**

```markdown
## Data Collection and Storage

MyDataGPT collects and stores:
- Account information (email, user ID) via Firebase Authentication
- File metadata (filename, size, type, upload date)
- Encrypted file contents in object storage
- Chat conversation history (optional)

## Zero-Knowledge Encryption

All personal files are encrypted on your device before upload. We use 
industry-standard AES-256-GCM encryption. Your encryption key is derived 
from your PIN/password and never leaves your device. This means:

- We cannot access your files or data
- We cannot recover your data if you lose your PIN
- Only you can decrypt and access your files

## Data Deletion

You can delete your account and all associated data at any time through 
the app settings. Upon deletion:
- All files are permanently deleted from storage
- All metadata is removed from our database
- Account information is deleted from Firebase
- Backups are purged within 30 days
```

### Terms of Service

**Key Sections:**
- User responsibilities (password security, lawful use)
- Service limitations and availability
- Liability limitations
- Data loss disclaimer (emphasize user responsibility for recovery phrase)
- Acceptable use policy
- Account termination conditions
- Dispute resolution

### GDPR Compliance (if targeting EU users)

**User Rights:**
1. **Right to Access**: Provide data export functionality
2. **Right to Deletion**: Implement account deletion
3. **Right to Portability**: Export data in standard format
4. **Right to Rectification**: Allow data corrections

**Legal Basis:**
- Legitimate interest for security features
- Consent for optional features (analytics)
- Contract performance for core services

**Data Controller Obligations:**
- Appoint DPO if required
- Maintain data processing records
- Implement data breach notification (72 hours)
- Conduct DPIA for high-risk processing

### Other Considerations

**CCPA (California)**: If serving California users
**COPPA**: If allowing users under 13 (not recommended)
**HIPAA**: If storing health data (requires additional controls)
**Financial Data**: PCI-DSS compliance if storing payment card data

**Recommendation**: Consult with legal counsel for:
- Privacy policy and terms of service review
- Export compliance for encryption
- Data protection compliance (GDPR, CCPA)
- Liability limitations and disclaimers

## Performance & Cost Considerations

### Cost Optimization

**Storage Costs:**
- Object storage: $0.01-0.05 per GB/month (MinIO/Backblaze cheaper than S3)
- Database: PostgreSQL on VPS (~$10-20/month) or managed (~$15-50/month)
- Offer storage tiers: Free (1GB), Premium (100GB), Enterprise (1TB+)

**Bandwidth Costs:**
- Egress from object storage can be expensive
- Use CDN for static assets only (non-sensitive content)
- Implement client-side compression before encryption

**Compute Costs:**
- LLM API costs: $0.001-0.03 per 1K tokens
- Implement usage quotas per user tier
- Cache common responses
- Consider self-hosted LLM (Ollama) to reduce costs

### Performance Optimization

**Client-Side:**
- Compress files before encryption (reduce size by 50-70%)
- Lazy load vault contents
- Implement pagination for file lists
- Cache decrypted thumbnails temporarily
- Progressive upload with retry logic

**Server-Side:**
- Use connection pooling for database
- Implement Redis cache for hot data
- Use signed URLs for direct object storage access (bypass server)
- Implement rate limiting per user
- Use database indexes on frequently queried columns

**Example: Image Optimization:**
```dart
// Flutter - compress image before encryption
Future<File> compressImage(File image) async {
  final result = await FlutterImageCompress.compressWithFile(
    image.absolute.path,
    quality: 85,
    format: CompressFormat.jpeg,
  );
  return File(image.path)..writeAsBytesSync(result);
}
```

## Testing Strategy

### Unit Tests

**Backend (Jest/Mocha):**
```javascript
describe('Firebase Auth Middleware', () => {
  it('should reject requests without token', async () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    await firebaseAuth(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should accept valid token', async () => {
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {};
    const next = jest.fn();
    await firebaseAuth(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
```

**Flutter (flutter_test):**
```dart
test('Encryption service should encrypt and decrypt data', () async {
  final service = EncryptionService();
  final password = 'test-password';
  final data = 'sensitive data';
  
  final encrypted = await service.encryptData(password, data);
  final decrypted = await service.decryptData(
    password, 
    encrypted['encryptedData']
  );
  
  expect(decrypted, equals(data));
});
```

### Integration Tests

**API Integration (Supertest):**
```javascript
describe('POST /personal/upload', () => {
  it('should upload file successfully', async () => {
    const token = await getTestFirebaseToken();
    const response = await request(app)
      .post('/personal/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('test'), 'test.txt')
      .field('mime_type', 'text/plain');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('file_id');
  });
});
```

### End-to-End Tests

**Mobile (Flutter Integration Tests):**
```dart
testWidgets('User can login and upload file', (tester) async {
  await tester.pumpWidget(MyApp());
  
  // Login
  await tester.enterText(find.byType(TextField), '123456');
  await tester.tap(find.text('Unlock'));
  await tester.pumpAndSettle();
  
  // Upload file
  await tester.tap(find.byIcon(Icons.upload));
  // ... file picker interaction
  await tester.pumpAndSettle();
  
  expect(find.text('File uploaded'), findsOneWidget);
});
```

**Web (Cypress/Playwright):**
```javascript
describe('Vault Access', () => {
  it('should unlock vault with correct PIN', () => {
    cy.visit('/');
    cy.get('[data-testid=pin-input]').type('123456');
    cy.get('[data-testid=unlock-button]').click();
    cy.contains('My Files').should('be.visible');
  });
});
```

### Security Testing

**Pre-Launch Security Review:**
- Penetration testing (hire third-party security firm)
- Vulnerability scanning (OWASP ZAP, Burp Suite)
- Dependency scanning (npm audit, Snyk)
- Code review focusing on auth and crypto
- Test encryption implementation thoroughly

**Ongoing Security:**
- Automated dependency updates (Dependabot)
- Regular security audits
- Bug bounty program (optional)

## MVP Feature List (Build Order)

### Phase 1: Core Foundation (Weeks 1-2)
- [x] Firebase Authentication integration
- [x] Basic chat UI (ChatGPT-like interface)
- [x] ChatGPT backend with basic proxy to LLM
- [x] Personal backend with Firebase auth middleware
- [x] MinIO object storage setup
- [x] PostgreSQL database with initial schema

### Phase 2: Encryption & Storage (Weeks 3-4)
- [ ] Client-side encryption service (PBKDF2 + AES-GCM)
- [ ] Secure key derivation and storage
- [ ] File upload with encryption
- [ ] File download with decryption
- [ ] Metadata storage in PostgreSQL
- [ ] Basic file listing UI

### Phase 3: Vault & Authentication (Weeks 5-6)
- [ ] PIN setup and validation
- [ ] Secure storage integration (Keychain/Keystore)
- [ ] Vault unlock screen
- [ ] Biometric authentication (fingerprint/face)
- [ ] Session management
- [ ] Vault file browser UI

### Phase 4: File Management (Weeks 7-8)
- [ ] File preview (decrypt only in secure view)
- [ ] File deletion
- [ ] File renaming
- [ ] File tagging and categories
- [ ] Search functionality
- [ ] Sorting and filtering

### Phase 5: Recovery & Backup (Weeks 9-10)
- [ ] Recovery phrase generation
- [ ] Recovery phrase verification
- [ ] Backup export (encrypted archive)
- [ ] Backup import and restore
- [ ] Account recovery flow
- [ ] Data migration between devices

### Phase 6: Hardening & Polish (Weeks 11-12)
- [ ] Virus scanning integration (ClamAV)
- [ ] Rate limiting implementation
- [ ] Usage quotas per tier
- [ ] Monitoring and logging
- [ ] Error handling and user feedback
- [ ] UI/UX polish and animations

### Phase 7: Admin & Billing (Weeks 13-14)
- [ ] Admin dashboard for metrics
- [ ] User management panel
- [ ] Subscription tiers (Free, Premium, Enterprise)
- [ ] Billing integration (Stripe)
- [ ] Usage tracking and limits
- [ ] Email notifications

### Phase 8: Pre-Launch (Weeks 15-16)
- [ ] Security audit and penetration testing
- [ ] Privacy policy and terms of service
- [ ] App store screenshots and descriptions
- [ ] Beta testing (TestFlight + closed track)
- [ ] Performance optimization
- [ ] Documentation and help pages

## Release & Post-Release Checklist

### Pre-Launch Checklist

**Security:**
- [ ] Third-party security review completed
- [ ] All dependencies up to date
- [ ] Vulnerability scanning passed
- [ ] Encryption implementation audited
- [ ] Firebase security rules configured
- [ ] API rate limiting implemented
- [ ] Logging sanitized (no PII)

**Legal & Compliance:**
- [ ] Privacy policy finalized and published
- [ ] Terms of service finalized and published
- [ ] GDPR compliance verified (if applicable)
- [ ] Export compliance declaration filed (iOS)
- [ ] Data deletion procedures tested

**Testing:**
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing on multiple devices
- [ ] Beta testing feedback incorporated
- [ ] Recovery flows tested thoroughly

**App Store Preparation:**
- [ ] Screenshots prepared (iOS + Android)
- [ ] App descriptions written
- [ ] Keywords researched and selected
- [ ] Privacy nutrition labels completed
- [ ] App icons finalized
- [ ] Store listing previewed

**Infrastructure:**
- [ ] Production environment configured
- [ ] SSL certificates installed and tested
- [ ] Backups configured and tested
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Scaling plan prepared

### Launch Day

- [ ] Deploy final version to production
- [ ] Submit to App Store and Play Store
- [ ] Monitor error rates and performance
- [ ] Be available for critical issues
- [ ] Announce launch on social media
- [ ] Monitor user feedback

### Post-Launch (First Week)

- [ ] Monitor crash reports daily
- [ ] Respond to user support requests
- [ ] Track key metrics (downloads, DAU, retention)
- [ ] Fix critical bugs immediately
- [ ] Gather user feedback
- [ ] Update documentation based on questions

### Post-Launch (First Month)

- [ ] Analyze usage patterns
- [ ] Iterate on UX based on feedback
- [ ] Add most-requested features
- [ ] Optimize performance bottlenecks
- [ ] Build user community
- [ ] Plan next major release

### Ongoing Operations

- [ ] Weekly: Review error logs and metrics
- [ ] Monthly: Security updates and patches
- [ ] Quarterly: Security audit
- [ ] Quarterly: Backup restore test
- [ ] Quarterly: Review and update policies
- [ ] Annually: Full penetration test
