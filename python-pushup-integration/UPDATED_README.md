# CoreSync Push-up Tracker Integration (Updated)

This guide explains how to integrate your Python push-up counter with CoreSync using secure API tokens.

## Setup Instructions

### 1. Generate an API Token

1. Log into CoreSync at https://coresync.com
2. Go to Settings (click your profile icon)
3. Scroll to the "API Tokens" section
4. Click "Generate Token"
5. Give it a name like "Push-up Tracker"
6. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

### 2. Install Required Python Package

```bash
pip install requests
```

### 3. Modify Your Python Script

Add this code to your push-up counter script:

```python
import requests
import json

# Configuration
CORESYNC_API_URL = "https://jqsgqnamltsmsqxkligt.supabase.co/functions/v1/log-external-workout"
API_TOKEN = "cs_YOUR_TOKEN_HERE"  # Replace with your actual token from CoreSync

def log_to_coresync(reps, exercise_name="Push-ups"):
    """Send workout data to CoreSync"""
    headers = {
        "X-API-Token": API_TOKEN,
        "Content-Type": "application/json",
    }
    
    data = {
        "exercise_name": exercise_name,
        "reps": reps,
        "sets": 1,
        "notes": "Auto-logged from Python push-up tracker"
    }
    
    try:
        response = requests.post(CORESYNC_API_URL, json=data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Logged to CoreSync: {result['message']}")
            print(f"   Calories burned: {result['calories']}")
            return True
        else:
            print(f"❌ Failed to log: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error logging to CoreSync: {e}")
        return False

# Add this at the end of your push-up counter, where you currently save to CSV
# Right after: df.to_csv(csv_name, ...) or print(f"Saved {len(log)} reps...")

if rep_count > 0:  # Only log if reps were recorded
    log_to_coresync(rep_count, "Push-ups")
```

### 4. Integration Point

In your existing script, find where you save the reps to CSV (around line 147-148):
```python
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    # ... CSV saving code ...
    print(f"Saved {len(log)} reps to {csv_name}")
```

Add the CoreSync logging right after:
```python
if log:
    df = pd.DataFrame(log)
    csv_name = "pushup_log.csv"
    # ... CSV saving code ...
    print(f"Saved {len(log)} reps to {csv_name}")
    
    # NEW: Log to CoreSync
    total_reps = len(log)
    log_to_coresync(total_reps, "Push-ups")
```

## How It Works

1. Your Python script detects and counts push-ups using computer vision
2. When you finish (press 'q'), the script sends the rep count to CoreSync API using your API token
3. CoreSync creates a workout entry with:
   - Exercise: Push-ups
   - Reps: Your counted reps
   - Estimated calories burned
   - Auto-generated workout duration
4. The workout appears in your CoreSync dashboard, analytics, and leaderboard!

## Advantages of API Tokens

✅ **More Secure**: Tokens can be revoked without changing your password
✅ **No Expiration**: Unlike JWT tokens, API tokens don't expire automatically
✅ **Easy Management**: View, revoke, or delete tokens in Settings
✅ **Better Tracking**: See when each token was last used

## Managing Your Tokens

- **View Tokens**: Go to Settings → API Tokens
- **Revoke Token**: Temporarily disable without deleting (can't be undone)
- **Delete Token**: Permanently remove a token
- **Monitor Usage**: See when each token was last used

## Troubleshooting

**401 Unauthorized Error**: 
- Your API token is invalid or has been revoked
- Generate a new token in Settings

**Connection Error**: 
- Check your internet connection
- Verify the API URL is correct

**Missing Data**: 
- Ensure `rep_count` or `len(log)` has a value > 0 before logging

## Security Best Practices

- ✅ Keep your API token private - don't share it or commit it to GitHub
- ✅ Store the token in an environment variable or config file (not in your code)
- ✅ Revoke tokens immediately if they're compromised
- ✅ Use separate tokens for different applications
- ✅ Regularly review and clean up unused tokens

## Example: Using Environment Variables

Create a `.env` file:
```
CORESYNC_API_TOKEN=cs_your_token_here
```

Update your Python script:
```python
import os
from dotenv import load_dotenv

load_dotenv()
API_TOKEN = os.getenv('CORESYNC_API_TOKEN')
```

Install python-dotenv:
```bash
pip install python-dotenv
```