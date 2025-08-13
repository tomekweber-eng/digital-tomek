# GitHub Integration Setup Guide

## Overview
Your portfolio website now has comprehensive GitHub integration for the AI chat system. This allows you to:

1. **Authenticate users via GitHub OAuth**
2. **Automatically log chat interactions to your repository**
3. **Administer the chat system through GitHub**
4. **Display your GitHub profile on the website**

## Setup Required

### 1. GitHub OAuth App Registration
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Digital Tomek Chat
   - **Homepage URL**: https://tomaszweber.com
   - **Authorization callback URL**: https://digital-tomek.vercel.app/api/github-auth
4. Save the **Client ID** and **Client Secret**

### 2. Environment Variables
Add these to your Vercel deployment:

```
GITHUB_CLIENT_ID=your_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_oauth_app_client_secret
GITHUB_ACCESS_TOKEN=your_personal_access_token
OPENAI_API_KEY=your_openai_api_key
```

### 3. GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a token with these permissions:
   - `repo` (full repository access)
   - `read:user` (read user profile)
3. This token is used for creating chat log issues and repository management

## Features Implemented

### 1. GitHub Authentication in Chat Widget
- **Login Button**: Users can authenticate with GitHub
- **User Display**: Shows authenticated username with admin indicator
- **Session Management**: Maintains login state across sessions

### 2. Automatic Chat Logging
- **GitHub Issues**: Long conversations and admin chats are automatically logged as GitHub issues
- **Structured Data**: Each log includes timestamp, user, message, and response
- **Labels**: Chat logs are tagged with `chat-log` and `automated` labels

### 3. Admin Features
- **Admin Detection**: Recognizes `tomekweber-eng` as admin
- **Enhanced Responses**: Admin gets additional technical information
- **Repository Management**: Admin can manage knowledge base through API

### 4. GitHub Profile Integration
- **Contact Section**: Added GitHub icon and link in the contact section
- **Professional Display**: Shows your GitHub profile alongside LinkedIn

## API Endpoints Created

### `/api/github-auth`
- Handles GitHub OAuth flow
- Manages user sessions
- Redirects authenticated users back to main site

### `/api/github-webhook`
- Receives GitHub webhook events
- Logs repository changes
- Can trigger knowledge base updates

### `/api/github-admin`
- Admin-only endpoint for repository management
- Chat statistics and analytics
- Knowledge base file updates

### `/api/chat` (Enhanced)
- Now includes GitHub user context
- Automatic chat logging for important conversations
- Admin-specific responses

## Repository Structure
Your `tomekweber-eng/digital-tomek` repository will now contain:
- **Issues**: Automatic chat logs with structured data
- **Knowledge folder**: JSON files for chat context
- **Webhook integration**: Real-time updates from repository changes

## Next Steps

1. **Set up OAuth App** and get credentials
2. **Add environment variables** to Vercel
3. **Test authentication** by clicking the GitHub login in chat
4. **Configure webhooks** (optional) for real-time repository updates
5. **Monitor chat logs** in your GitHub repository issues

## Security Notes
- OAuth credentials should never be exposed client-side
- Personal access token has repository access - keep secure
- Chat logs are stored in your private repository
- Admin access is restricted to your GitHub username only

## Benefits
- **Professional Integration**: Shows technical expertise
- **Chat Analytics**: Track user interactions and popular questions
- **Content Management**: Update knowledge base through GitHub
- **Authentication**: Know who's chatting with your AI
- **Backup**: All conversations are logged and searchable

Your portfolio now demonstrates advanced integration between AI, OAuth, and repository management - perfect for showcasing your technical capabilities!
