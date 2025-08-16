# Required Inputs for Fitness App Audit

## Database Access

### PostgreSQL (Read-only)
- **Variable**: `POSTGRES_URL`
- **Format**: `postgresql://user:password@host:port/database`
- **How to obtain**: Request read-only credentials from DevOps team
- **Minimal scope**: SELECT permissions on analytics tables
- **Issuance URL**: Internal database admin panel

## GitHub Integration

### GitHub Personal Access Token
- **Variable**: `GITHUB_TOKEN`
- **How to obtain**: https://github.com/settings/tokens/new
- **Minimal scopes**: `repo` (for private repos) or `public_repo` (for public)
- **Additional**: Set `GITHUB_REPO_DEFAULT` to `owner/repo` format

## Slack Integration

### Slack Bot Token
- **Variables**: `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET`
- **How to obtain**: https://api.slack.com/apps
- **Minimal scopes**: `chat:write`, `channels:read`
- **Setup**: Create new app → OAuth & Permissions → Install to workspace

## Health APIs

### HealthKit (iOS)
- **Variable**: `HEALTHKIT_ENTITLEMENTS`
- **How to obtain**: Apple Developer Portal → Identifiers → App IDs → Configure HealthKit
- **Requirements**: Valid Apple Developer account, app provisioning profile
- **Permissions**: Read/Write for workout, heart rate, calories, distance

### Google Fit (Android)
- **Variable**: `GOOGLE_FIT_API_KEY`
- **How to obtain**: https://console.cloud.google.com/
- **Setup**: Enable Fitness API → Create credentials → API key
- **Scopes**: `fitness.activity.read`, `fitness.activity.write`, `fitness.body.read`

## Firebase Configuration

### Firebase Project
- **Variables**: All `FIREBASE_*` variables
- **How to obtain**: https://console.firebase.google.com/
- **Setup**: Create project → Project settings → General → Your apps → Config
- **Services needed**: Authentication, Firestore, Cloud Messaging, Analytics

## Payment Processing

### Stripe
- **Variables**: `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **How to obtain**: https://dashboard.stripe.com/apikeys
- **Test mode**: Use test keys for audit (starts with `pk_test_` and `sk_test_`)
- **Webhook**: Set up endpoint for subscription events

### In-App Purchases
- **iOS**: `APP_STORE_CONNECT_API_KEY` from App Store Connect
- **Android**: `GOOGLE_PLAY_API_KEY` from Play Console → API access

## Analytics

### Mixpanel
- **Variable**: `MIXPANEL_TOKEN`
- **How to obtain**: https://mixpanel.com/project/settings
- **Location**: Project Settings → Project Token

### Amplitude
- **Variable**: `AMPLITUDE_API_KEY`
- **How to obtain**: https://analytics.amplitude.com/
- **Location**: Settings → Projects → API Keys

## Push Notifications

### Firebase Cloud Messaging
- **Variable**: `FCM_SERVER_KEY`
- **How to obtain**: Firebase Console → Project Settings → Cloud Messaging
- **Legacy**: Server key (for backward compatibility)

### Apple Push Notification Service
- **Variables**: `APNS_KEY_ID`, `APNS_TEAM_ID`
- **How to obtain**: Apple Developer Portal → Keys → Create key (APNs)
- **File needed**: .p8 key file (store securely, not in repo)

## Error Monitoring

### Sentry
- **Variable**: `SENTRY_DSN`
- **How to obtain**: https://sentry.io/ → Settings → Projects → Client Keys
- **Note**: Use separate DSNs for dev/staging/production

### Bugsnag
- **Variable**: `BUGSNAG_API_KEY`
- **How to obtain**: https://app.bugsnag.com/ → Settings → Project Settings
- **Integration**: Install notifier libraries for each platform

## Security Notes

1. **Never commit real values** - Use .env files and add to .gitignore
2. **Rotate regularly** - Set up key rotation schedule
3. **Use minimal scopes** - Only request necessary permissions
4. **Separate environments** - Use different keys for dev/staging/prod
5. **Audit trail** - Log all API key usage for security monitoring