# AWS Amplify Deployment Guide

This guide will help you deploy your Tavasit calculator to AWS Amplify.

## 🚀 Prerequisites

1. **AWS Account**: You need an AWS account with access to Amplify
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, Bitbucket, etc.)
3. **Node.js**: Ensure your local environment has Node.js 18+ installed

## 📋 Pre-Deployment Checklist

### ✅ Code Changes Made for Production

1. **Debug Logging Disabled**: All console.log statements are now wrapped with `process.env.NODE_ENV === 'development'` checks
2. **Debug Panel Hidden**: The debug panel only shows in development mode
3. **Production Optimizations**: 
   - Source maps disabled in production
   - Compression enabled
   - Security headers configured
   - SWC minification enabled

### ✅ Files Added/Modified

- `amplify.yml` - AWS Amplify build configuration
- `next.config.ts` - Updated for production optimization
- All debug logging wrapped with environment checks
- Debug panel conditionally rendered

## 🔧 Deployment Steps

### 1. Connect to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository and branch

### 2. Configure Build Settings

Amplify will automatically detect the `amplify.yml` file. The build configuration includes:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 3. Environment Variables (Optional)

If you need any environment variables, add them in the Amplify console:
- Go to App settings → Environment variables
- Add any required variables

### 4. Deploy

1. Click "Save and deploy"
2. Amplify will automatically build and deploy your app
3. Monitor the build process in the console

## 🔍 Post-Deployment Verification

### ✅ What Should Work in Production

1. **No Debug Logs**: Console should be clean (no emoji-prefixed logs)
2. **No Debug Panel**: The yellow debug button should not appear
3. **Full Functionality**: All calculator features should work normally
4. **Fast Loading**: Optimized build should load quickly

### ✅ Testing Checklist

- [ ] Welcome page loads correctly
- [ ] Navigation between pages works
- [ ] Form data is captured properly
- [ ] Calculations work correctly
- [ ] Final recommendations display properly
- [ ] No console errors
- [ ] No debug panel visible
- [ ] Mobile responsiveness works

## 🛠️ Troubleshooting

### Build Failures

1. **Node.js Version**: Ensure your `package.json` specifies Node.js 18+
2. **Dependencies**: Check that all dependencies are properly listed
3. **Build Commands**: Verify `npm run build` works locally

### Runtime Issues

1. **Environment Variables**: Check if any required env vars are missing
2. **Image Loading**: Verify image paths are correct
3. **API Calls**: Ensure any external APIs are accessible

### Performance Issues

1. **Bundle Size**: Check if the build is too large
2. **Caching**: Verify cache headers are set correctly
3. **CDN**: Ensure Amplify CDN is enabled

## 🔄 Continuous Deployment

Once deployed, Amplify will automatically:
- Deploy on every push to your main branch
- Run the build process
- Update your live site

## 📊 Monitoring

- **Build Logs**: Available in Amplify console
- **Performance**: Use AWS CloudWatch for monitoring
- **Errors**: Check browser console and Amplify logs

## 🔒 Security Considerations

- Debug information is completely disabled in production
- No sensitive data is logged
- Security headers are configured
- Powered-by header is disabled

## 📱 Mobile Optimization

The app is already optimized for mobile with:
- Responsive design
- Touch-friendly buttons
- Proper viewport settings
- Optimized images

## 🎯 Success Criteria

Your deployment is successful when:
1. ✅ App loads without errors
2. ✅ All functionality works as expected
3. ✅ No debug information is visible
4. ✅ Performance is acceptable
5. ✅ Mobile experience is good

## 📞 Support

If you encounter issues:
1. Check the Amplify build logs
2. Verify your local build works (`npm run build`)
3. Test the app locally in production mode (`NODE_ENV=production npm start`)
4. Review the troubleshooting section above 