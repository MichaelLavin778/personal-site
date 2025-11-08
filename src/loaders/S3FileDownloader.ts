// Simple utilities for downloading files from a PUBLIC S3 bucket from the browser.
// These functions assume the bucket objects are publicly readable (or available
// via a CORS-enabled pre-signed URL). They do NOT require AWS credentials.

/**
 * Build a public S3 URL for a given bucket and object key. It encodes each
 * path segment so keys with spaces or special chars work correctly.
 */
export function getPublicS3Url(bucket: string, key: string): string {
	const encodedKey = key
		.split('/')
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	return `https://${bucket}.s3.us-east-2.amazonaws.com/${encodedKey}`;
}

/**
 * Fetch the object from a public S3 URL and return a Blob. Returns undefined
 * on network error or non-OK response.
 */
export async function fetchPublicS3Blob(bucket: string, key: string): Promise<Blob | undefined> {
	try {
		const url = getPublicS3Url(bucket, key);
		const res = await fetch(url);
		if (!res.ok) {
			console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
			return undefined;
		}
		return await res.blob();
	} catch (err) {
		console.error('Error fetching public S3 object:', err);
		return undefined;
	}
}

/**
 * Download a file from a public S3 bucket and trigger a browser download.
 * Returns true on success, false otherwise.
 */
export async function downloadPublicS3File(bucket: string, key: string, filename?: string): Promise<boolean> {
	const blob = await fetchPublicS3Blob(bucket, key);
	if (!blob) return false;

	const url = URL.createObjectURL(blob);
	try {
		const a = document.createElement('a');
		a.href = url;
		a.download = filename ?? key.split('/').pop() ?? 'download';
		// Required for Firefox: anchor must be in the DOM
		document.body.appendChild(a);
		a.click();
		a.remove();
		return true;
	} catch (err) {
		console.error('Error triggering download:', err);
		return false;
	} finally {
		// release the object URL after a short delay to ensure download started
		setTimeout(() => URL.revokeObjectURL(url), 10_000);
	}
}

export default fetchPublicS3Blob;

