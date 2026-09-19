const API_URL = import.meta.env.VITE_ROOM_UPLOAD_API_URL;

export async function uploadRoomImageToS3(file) {
  if (!API_URL) {
    throw new Error("Room upload API URL is not configured.");
  }

  // 1. Ask Lambda for a presigned S3 upload URL
  const presignResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });

  if (!presignResponse.ok) {
    const errorText = await presignResponse.text();
    throw new Error(
      `Failed to create upload URL: ${presignResponse.status} ${errorText}`
    );
  }

  const { uploadUrl, key } = await presignResponse.json();

  if (!uploadUrl || !key) {
    throw new Error("AWS did not return a valid upload URL.");
  }

  // 2. Upload the actual image directly to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      `S3 upload failed: ${uploadResponse.status}`
    );
  }

  return {
    key,
    fileName: file.name,
  };
}
