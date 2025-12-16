/**
 * Storyblok Management API Utility
 * Handles component creation, story creation, and asset uploads
 */

const STORYBLOK_SPACE_ID = process.env.REACT_APP_STORYBLOK_SPACE_ID;
const STORYBLOK_MANAGEMENT_TOKEN =
  process.env.REACT_APP_STORYBLOK_MANAGEMENT_TOKEN;
const STORYBLOK_API_URL = "https://mapi.storyblok.com/v1";

// ==================== COMPONENTS ====================

/**
 * Create a new content type component in Storyblok
 * @param {Object} componentData - Component configuration
 * @returns {Promise<Object>} Created component
 */
export const createComponent = async (componentData) => {
  const {
    name,
    display_name = name,
    schema = {},
    preview_tmpl = null,
    is_root = false,
  } = componentData;

  const payload = {
    component: {
      name,
      display_name,
      schema,
      preview_tmpl,
      is_root,
    },
  };

  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/components`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create component: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating component:", error);
    throw error;
  }
};

/**
 * Get list of all components in the space
 * @returns {Promise<Array>} List of components
 */
export const getComponents = async () => {
  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/components`,
      {
        headers: {
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch components: ${response.statusText}`);
    }

    const data = await response.json();
    return data.components;
  } catch (error) {
    console.error("Error fetching components:", error);
    throw error;
  }
};

// ==================== STORIES ====================

/**
 * Create a new story in Storyblok
 * @param {Object} storyData - Story configuration
 * @returns {Promise<Object>} Created story
 */
export const createStory = async (storyData) => {
  const {
    title,
    slug,
    component,
    content = {},
    publish = false,
    path = "",
  } = storyData;

  const payload = {
    story: {
      title,
      slug,
      component,
      content,
      publish,
      path,
    },
  };

  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/stories`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create story: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating story:", error);
    throw error;
  }
};

/**
 * Update an existing story
 * @param {number} storyId - Story ID
 * @param {Object} storyData - Story updates
 * @returns {Promise<Object>} Updated story
 */
export const updateStory = async (storyId, storyData) => {
  const payload = {
    story: storyData,
  };

  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/stories/${storyId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update story: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating story:", error);
    throw error;
  }
};

/**
 * Publish a story
 * @param {number} storyId - Story ID
 * @returns {Promise<Object>} Published story
 */
export const publishStory = async (storyId) => {
  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/stories/${storyId}/publish`,
      {
        method: "PUT",
        headers: {
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to publish story: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error publishing story:", error);
    throw error;
  }
};

// ==================== ASSETS ====================

/**
 * Upload an image asset to Storyblok
 * @param {File} file - Image file to upload
 * @param {string} folder - Asset folder (optional)
 * @returns {Promise<Object>} Asset information
 */
export const uploadAsset = async (file, folder = "") => {
  const formData = new FormData();

  // Append the file with proper structure
  formData.append("filename", file.name);
  formData.append("asset", file);

  // Add folder_id if provided
  if (folder) {
    formData.append("asset[folder_id]", folder);
  }

  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/assets`,
      {
        method: "POST",
        headers: {
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload error response:", errorText);
      throw new Error(
        `Failed to upload asset: ${response.status} ${response.statusText}. ${errorText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading asset:", error);
    throw error;
  }
};

/**
 * Get list of all assets in the space
 * @returns {Promise<Array>} List of assets
 */
export const getAssets = async () => {
  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/assets`,
      {
        headers: {
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch assets: ${response.statusText}`);
    }

    const data = await response.json();
    return data.assets;
  } catch (error) {
    console.error("Error fetching assets:", error);
    throw error;
  }
};

/**
 * Delete an asset
 * @param {number} assetId - Asset ID
 * @returns {Promise<void>}
 */
export const deleteAsset = async (assetId) => {
  try {
    const response = await fetch(
      `${STORYBLOK_API_URL}/spaces/${STORYBLOK_SPACE_ID}/assets/${assetId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: STORYBLOK_MANAGEMENT_TOKEN,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete asset: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting asset:", error);
    throw error;
  }
};
