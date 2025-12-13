/**
 * LinkedIn API Client
 * Handles posting content to LinkedIn
 */

interface LinkedInProfile {
  id: string
  firstName: string
  lastName: string
  profilePicture?: string
}

interface LinkedInPostResponse {
  id: string
  created: {
    time: number
  }
}

/**
 * Post content to LinkedIn
 */
export async function postToLinkedIn(
  accessToken: string,
  userId: string,
  content: string
): Promise<LinkedInPostResponse> {
  console.log('[LinkedIn] Attempting to post to LinkedIn')
  console.log('[LinkedIn] User ID:', userId)
  console.log('[LinkedIn] Content length:', content.length)

  const requestBody = {
    author: `urn:li:person:${userId}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  }

  console.log('[LinkedIn] Request body:', JSON.stringify(requestBody, null, 2))

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(requestBody),
  })

  console.log('[LinkedIn] Response status:', response.status)
  console.log('[LinkedIn] Response headers:', Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[LinkedIn] API Error Response:', errorText)
    console.error('[LinkedIn] Status:', response.status)
    console.error('[LinkedIn] Status Text:', response.statusText)

    // Parse error details if possible
    try {
      const errorJson = JSON.parse(errorText)
      console.error('[LinkedIn] Error Details:', JSON.stringify(errorJson, null, 2))
    } catch (e) {
      // Error text is not JSON
    }

    throw new Error(`LinkedIn API error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  const result = await response.json()
  console.log('[LinkedIn] Successfully posted! Response:', JSON.stringify(result, null, 2))

  return result
}

/**
 * Post content with image to LinkedIn
 */
export async function postToLinkedInWithImage(
  accessToken: string,
  userId: string,
  content: string,
  imageUrl: string
): Promise<LinkedInPostResponse> {
  // First, register the image upload
  const registerResponse = await fetch(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: `urn:li:person:${userId}`,
          serviceRelationships: [
            {
              relationshipType: 'OWNER',
              identifier: 'urn:li:userGeneratedContent',
            },
          ],
        },
      }),
    }
  )

  if (!registerResponse.ok) {
    throw new Error(`Failed to register image upload: ${registerResponse.status}`)
  }

  const registerData = await registerResponse.json()
  const uploadUrl = registerData.value.uploadMechanism[
    'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
  ].uploadUrl
  const asset = registerData.value.asset

  // Download image and upload to LinkedIn
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: imageBuffer,
  })

  // Create post with image
  const postResponse = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: 'IMAGE',
          media: [
            {
              status: 'READY',
              description: {
                text: 'Post image',
              },
              media: asset,
              title: {
                text: 'Image',
              },
            },
          ],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!postResponse.ok) {
    const errorText = await postResponse.text()
    throw new Error(`Failed to create post with image: ${errorText}`)
  }

  return await postResponse.json()
}

/**
 * Get LinkedIn user profile
 */
export async function getLinkedInProfile(
  accessToken: string
): Promise<LinkedInProfile> {
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`)
  }

  const data = await response.json()
  return {
    id: data.sub,
    firstName: data.given_name,
    lastName: data.family_name,
    profilePicture: data.picture,
  }
}
