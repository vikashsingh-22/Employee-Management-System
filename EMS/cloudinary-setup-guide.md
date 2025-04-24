# Cloudinary Setup Guide for Profile Photo Upload

## Creating an Upload Preset in Cloudinary

1. Log in to your Cloudinary account at https://cloudinary.com/console
2. Navigate to Settings > Upload
3. Scroll down to the "Upload presets" section
4. Click "Add upload preset"
5. Configure the preset with the following settings:
   - Preset name: `ml_default` (this is the default preset we're using in the code)
   - Signing Mode: **Unsigned** (this is critical for browser uploads)
   - Folder: `employee_profiles` (optional)
   - Eager transformations: You can add transformations like resizing if needed
6. Save the preset

**Important Note:** The 'Upload preset not found' error occurs when the preset name specified in the code doesn't exist in your Cloudinary account, or when the preset is not configured for unsigned uploads.

## Testing the Profile Photo Upload Feature

1. Start your backend server
2. Start your frontend application
3. Navigate to the Profile page
4. Click on the upload button (camera icon) in the profile section
5. Select an image to upload
6. The image should be uploaded to Cloudinary and displayed in your profile

## Troubleshooting

If you encounter any issues:

1. Check browser console for errors
2. Verify that the Cloudinary script is loaded correctly
3. Ensure your Cloudinary credentials are correct
4. Confirm that the upload preset exists and is configured for unsigned uploads
