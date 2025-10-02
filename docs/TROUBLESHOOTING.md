# Troubleshooting Guide

This guide provides solutions to common issues you may encounter while working with MyDataGPT.

## Table of Contents
- [VS Code and GitHub Copilot Issues](#vs-code-and-github-copilot-issues)
- [Development Environment Setup](#development-environment-setup)
- [Build and Runtime Issues](#build-and-runtime-issues)

## VS Code and GitHub Copilot Issues

### How to Switch GitHub Copilot Accounts in VS Code

If you accidentally logged into GitHub Copilot with the wrong GitHub/Gmail account and need to switch to your intended account, follow these steps:

#### Method 1: Sign Out Through VS Code Settings

1. **Open VS Code Command Palette**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)

2. **Sign out of GitHub**
   - Type "GitHub Copilot: Sign Out" and select it
   - Alternatively, type "Accounts: Sign Out of GitHub" to sign out of all GitHub services

3. **Sign in with the correct account**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) again
   - Type "GitHub Copilot: Sign In" and select it
   - Follow the prompts to sign in with your correct GitHub account

#### Method 2: Clear VS Code Authentication

1. **Open VS Code Settings**
   - Go to File > Preferences > Settings (or Code > Preferences > Settings on Mac)
   - Or press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)

2. **Access Accounts**
   - Click on the "Accounts" icon in the bottom left corner of VS Code (looks like a profile icon)
   - You should see a list of signed-in accounts

3. **Sign out of the wrong account**
   - Find the GitHub account you want to remove
   - Click on it and select "Sign Out"

4. **Sign in with the correct account**
   - Click "Sign in with GitHub to use GitHub Copilot"
   - Follow the browser authentication flow to sign in with your intended account

#### Method 3: Manual Token Removal (Advanced)

If the above methods don't work, you can manually clear authentication tokens:

1. **Close VS Code completely**

2. **Delete authentication data**
   
   **On Windows:**
   ```
   %APPDATA%\Code\User\globalStorage\github.copilot
   ```
   
   **On macOS:**
   ```
   ~/Library/Application Support/Code/User/globalStorage/github.copilot
   ```
   
   **On Linux:**
   ```
   ~/.config/Code/User/globalStorage/github.copilot
   ```

3. **Restart VS Code**
   - Open VS Code and you'll be prompted to sign in again

4. **Sign in with the correct account**
   - Follow the authentication prompts with your intended GitHub account

### Common GitHub Copilot Issues

#### Copilot Not Providing Suggestions

1. **Check Copilot Status**
   - Look at the Copilot icon in the bottom right of VS Code
   - If it shows an error or warning icon, click it to see details

2. **Verify Copilot Subscription**
   - Ensure your GitHub account has an active Copilot subscription
   - Visit https://github.com/settings/copilot to check your subscription status

3. **Restart Copilot**
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Developer: Reload Window" and select it

#### Copilot Extension Not Loading

1. **Reinstall the Extension**
   - Go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
   - Search for "GitHub Copilot"
   - Click "Uninstall" and then "Install"

2. **Check VS Code Version**
   - Copilot requires VS Code version 1.70.0 or higher
   - Update VS Code if needed

## Development Environment Setup

### Firebase Configuration Issues

If you encounter Firebase authentication or configuration issues:

1. **Check Environment Variables**
   - Ensure your `.env` file contains all required Firebase configuration
   - Never commit `.env` files to version control

2. **Verify Firebase Project Setup**
   - Make sure you've created a Firebase project at https://console.firebase.google.com
   - Enable Authentication and Firestore in your Firebase project

### Node.js Version Issues

This project uses Node.js 20. If you encounter compatibility issues:

```bash
# Check your Node.js version
node --version

# If using nvm, switch to Node 20
nvm install 20
nvm use 20
```

### Package Installation Issues

If `npm install` fails:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

## Build and Runtime Issues

### Next.js Build Failures

If the Next.js build fails:

1. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Check for TypeScript Errors**
   ```bash
   npx tsc --noEmit
   ```

### Flutter Build Issues

If Flutter builds fail:

1. **Clean Flutter Build**
   ```bash
   cd flutter_app/my_data_gpt_app
   flutter clean
   flutter pub get
   flutter build
   ```

2. **Update Flutter**
   ```bash
   flutter upgrade
   ```

### Docker Issues

If Docker containers won't start:

1. **Check Docker Status**
   ```bash
   docker ps -a
   docker-compose logs
   ```

2. **Rebuild Containers**
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

## Getting Help

If you continue to experience issues:

1. **Check Existing Issues**: Visit the [GitHub Issues](https://github.com/JOHNNYWHITEMIKE/mydatagpt/issues) page to see if your problem has been reported
2. **Create a New Issue**: If you can't find a solution, create a new issue with:
   - A clear description of the problem
   - Steps to reproduce
   - Your environment details (OS, VS Code version, Node version, etc.)
   - Any error messages or logs

## Additional Resources

- [VS Code Documentation](https://code.visualstudio.com/docs)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Flutter Documentation](https://docs.flutter.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
