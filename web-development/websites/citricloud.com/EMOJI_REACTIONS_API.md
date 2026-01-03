# Emoji Reactions API Guide

## Overview
The emoji reactions feature allows users to react to blog comments with emojis across web, iOS, and Android platforms. All reactions are synced in real-time.

## Available Emojis
- 👍 Thumbs Up
- ❤️ Heart
- 😊 Smile
- 🎉 Party
- 🔥 Fire
- 👏 Clap

## API Endpoints

### 1. Add/Update Reaction
**POST** `/api/v1/cms/public/blog/comments/{comment_id}/reaction`

**Request Body:**
```json
{
  "emoji": "👍",
  "user_identifier": "user@example.com",
  "platform": "ios"
}
```

**Parameters:**
- `emoji` (required): The emoji to react with
- `user_identifier` (required): User's email or unique device ID
- `platform` (optional): "web", "ios", or "android" (default: "web")

**Response:**
```json
{
  "success": true,
  "reactions": {
    "👍": 5,
    "❤️": 3,
    "😊": 2
  }
}
```

### 2. Remove Reaction
**DELETE** `/api/v1/cms/public/blog/comments/{comment_id}/reaction?user_identifier=user@example.com`

**Query Parameters:**
- `user_identifier` (required): User's email or unique device ID

**Response:**
```json
{
  "success": true,
  "reactions": {
    "❤️": 3,
    "😊": 2
  }
}
```

### 3. Get User's Reaction
**GET** `/api/v1/cms/public/blog/comments/{comment_id}/user-reaction?user_identifier=user@example.com`

**Query Parameters:**
- `user_identifier` (required): User's email or unique device ID

**Response:**
```json
{
  "emoji": "👍",
  "created_at": "2025-12-24T15:30:00Z"
}
```

Or if no reaction:
```json
{
  "emoji": null
}
```

### 4. Get Comments with Reactions
**GET** `/api/v1/cms/public/blog/posts/{post_id}/comments`

**Response:**
```json
[
  {
    "id": 1,
    "content": "Great post!",
    "author_name": "John Doe",
    "reactions": {
      "👍": 5,
      "❤️": 3,
      "😊": 2
    },
    "created_at": "2025-12-24T15:00:00Z"
  }
]
```

## Implementation Notes

### For iOS (Swift)
```swift
struct CommentReactionRequest: Codable {
    let emoji: String
    let user_identifier: String
    let platform: String
}

func addReaction(commentId: Int, emoji: String, userId: String) async {
    let url = URL(string: "https://blog.citricloud.com/api/v1/cms/public/blog/comments/\(commentId)/reaction")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = CommentReactionRequest(
        emoji: emoji,
        user_identifier: userId,
        platform: "ios"
    )
    request.httpBody = try? JSONEncoder().encode(body)
    
    let (data, _) = try? await URLSession.shared.data(for: request)
    // Handle response
}
```

### For Android (Kotlin)
```kotlin
data class CommentReactionRequest(
    val emoji: String,
    val user_identifier: String,
    val platform: String
)

suspend fun addReaction(commentId: Int, emoji: String, userId: String) {
    val url = "https://blog.citricloud.com/api/v1/cms/public/blog/comments/$commentId/reaction"
    val request = CommentReactionRequest(
        emoji = emoji,
        user_identifier = userId,
        platform = "android"
    )
    
    val response = httpClient.post(url) {
        contentType(ContentType.Application.Json)
        setBody(request)
    }
    // Handle response
}
```

## Features

### Real-time Sync
- Reactions are synchronized across all platforms instantly
- When a user reacts, the count updates for all connected clients
- Users can change their reaction (replaces previous one)
- Only one reaction per user per comment

### User Identification
- **Web**: Uses logged-in user's email
- **iOS/Android**: Can use email, user ID, or device identifier
- Unique constraint ensures one reaction per user

### Platform Tracking
- Each reaction tracks which platform it came from
- Useful for analytics and platform-specific features

## Error Handling

### Common Error Codes
- `400`: Missing required parameters
- `404`: Comment not found or reaction not found
- `401`: Authentication required (for comment submission)

### Example Error Response
```json
{
  "detail": "user_identifier required"
}
```

## Best Practices

1. **Optimistic UI Updates**: Update UI immediately, then sync with server
2. **Rate Limiting**: Implement client-side debouncing to prevent spam
3. **Offline Support**: Queue reactions when offline, sync when online
4. **User Feedback**: Show loading states and error messages
5. **Analytics**: Track which emojis are most popular

## Testing

Use the following endpoints to test:
- Base URL: `https://blog.citricloud.com`
- Test with any blog post comments
- Monitor real-time sync across devices
