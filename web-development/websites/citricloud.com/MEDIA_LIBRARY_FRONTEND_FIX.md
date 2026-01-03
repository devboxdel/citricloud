# CMS Media Library: JPG/PNG/GIF Upload Fix

Symptoms: Media Library UI rejects JPG/PNG/GIF while WEBP works. Backend accepts all (verified). Root cause is usually the frontend accept list and/or client-side type checks blocking before the request is sent.

## Required Allowlist (UI)

Use this full set of MIME types and extensions everywhere you validate image uploads:

- MIME: `image/jpeg, image/jpg, image/pjpeg, image/png, image/x-png, image/gif, image/webp`
- Extensions: `.jpeg, .jpg, .png, .gif, .webp`

## HTML `<input type="file">`

```html
<input
  type="file"
  accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/pjpeg,image/png,image/x-png,image/gif,image/webp"
  multiple
>
```

## React Dropzone (react-dropzone)

```tsx
<Dropzone
  accept={{
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/jpg': ['.jpg'],
    'image/pjpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/x-png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
  }}
  multiple
>
  {({getRootProps, getInputProps}) => (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      Upload images
    </div>
  )}
}</Dropzone>
```

## Ant Design Upload

```tsx
<Upload
  accept=".jpeg,.jpg,.png,.gif,.webp,image/jpeg,image/jpg,image/pjpeg,image/png,image/x-png,image/gif,image/webp"
  beforeUpload={(file) => {
    const allowedTypes = new Set([
      'image/jpeg','image/jpg','image/pjpeg',
      'image/png','image/x-png','image/gif','image/webp',
    ]);
    const allowedExt = ['.jpeg','.jpg','.png','.gif','.webp'];
    const name = file.name.toLowerCase();
    const ok = allowedTypes.has(file.type) || allowedExt.some(ext => name.endsWith(ext));
    if (!ok) {
      message.error('Unsupported image type');
      return Upload.LIST_IGNORE;
    }
    const max = 10 * 1024 * 1024; // 10MB to match server
    if (file.size > max) {
      message.error('File too large (max 10MB)');
      return Upload.LIST_IGNORE;
    }
    return true;
  }}
  // if using cookie auth:
  withCredentials
  // if using token auth via axios instance, ensure header is added there
/>
```

## Fetch/Axios request

Ensure the request matches the backend behavior:

- Endpoint: `POST /api/v1/cms/media/upload`
- Form field name: `file`
- Auth: either `Authorization: Bearer <token>` OR cookies with `credentials: 'include'`.

```ts
const form = new FormData();
form.append('file', file);

await axios.post('/api/v1/cms/media/upload', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
  // If cookies:
  withCredentials: true,
  // Or if using token in axios instance, ensure interceptor adds Authorization
});
```

## Troubleshooting Checklist (UI)

1. Open DevTools → Network → attempt upload
   - If request never appears → UI blocked by accept list or `beforeUpload`
   - If request appears but 4xx → auth or endpoint mismatch
2. Verify `file.type` values in console; some browsers report `image/pjpeg` or `image/x-png`.
3. Ensure max size ≤ 10MB to match server (`client_max_body_size 10m`).
4. Confirm base URL points to the correct domain where `/api/v1/cms/media/upload` is available.
5. If using subdomains, verify cookies (SameSite, domain) or switch to Bearer token.

## Expected Success Response (CMS)

```
{ "success": true, "url": "/uploads/{uuid}.{ext}", "filename": "{uuid}.{ext}", "content_type": "image/jpeg" }
```

After patching the UI accept list and validation, JPG/PNG/GIF should upload exactly like WEBP.
