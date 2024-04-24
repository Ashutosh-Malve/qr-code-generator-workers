/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const qr = require('qr-image');

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Extract the URL from the path (assuming it follows the format http://localhost:8787/{encoded_url})
		const encodedUrl = decodeURIComponent(path.substring(1)); // Remove the leading slash and decode URL

		if (encodedUrl.startsWith('http://') || encodedUrl.startsWith('https://')) {
			// If a valid URL is extracted from the path, generate QR code for this URL
			const qr_png = await generateQRCode(encodedUrl);
			const headers = { "Content-Type": "image/png" };
			return new Response(qr_png, { headers });
		} else {
			// If the extracted URL is not valid, return the landing page HTML
			return new Response(landing, {
				headers: {
					"Content-Type": "text/html"
				}
			});
		}
	},
};

async function generateQRCode(url) {
	const qr_png = qr.imageSync(url);
	return qr_png;
}

const landing = `
<h1>QR Generator</h1>
<p>Enter a URL in the following format and press Enter:</p>
<p>http://localhost:8787/{encoded_url}</p>
<p>This will generate a QR code for the provided URL.</p>

<p>Generated QR Code Image</p>
<img id="qr" src="#" />

<script>
	window.onload = function() {
		const urlPath = window.location.pathname;
		const encodedUrl = urlPath.substring(1); // Remove the leading slash

		if (encodedUrl.startsWith('http://') || encodedUrl.startsWith('https://')) {
			// If a valid URL is present in the path, generate QR code
			generateQRCodeImage(encodedUrl);
		}
	};

	async function generateQRCodeImage(url) {
		const qrUrl = window.location.pathname;

		fetch(qrUrl)
			.then(response => response.blob())
			.then(blob => {
				const reader = new FileReader();
				reader.onloadend = function () {
					document.querySelector("#qr").src = reader.result; // Update the image source with the newly generated QR code
				};
				reader.readAsDataURL(blob);
			})
			.catch(error => {
				console.error('Error generating QR code:', error);
			});
	}
</script>
`;

