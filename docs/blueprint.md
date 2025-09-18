# **App Name**: CityZen

## Core Features:

- User Authentication: Secure login and signup functionality with basic form validation. Uses local storage to persist user sessions.
- Issue Reporting: Allow users to submit new issues with photo upload, location capture, and text description.
- Photo Upload: Enable users to upload photos of the civic issue using the device's camera or gallery.
- Geolocation: Automatically capture the user's current GPS location when reporting an issue. A map can be shown so the user can move the pin if the location is innaccurate.
- Report History: Display a real-time list of the user's submitted issues with photo, description, and status.
- Issue Status Tracker: Display a clear status tracker for each reported issue (e.g., Submitted, In Progress, Resolved). An LLM "tool" monitors for status changes reported via email, using subject and body content as context for determining when and if the status should be changed in the app's front end. A basic history is also provided.

## Style Guidelines:

- Primary color: Friendly blue (#3498DB) for buttons and active elements. It is inviting and trustworthy.
- Background color: Light, off-white (#F9F9F9) for a clean and modern look.
- Accent color: Light green (#2ECC71), an analogous color to the primary blue. To be used for 'resolved' states.
- Body and headline font: 'PT Sans', a modern, warm sans-serif that will function well for body and for shorter headlines.
- Use a pattern of soft, multi-colored geometric icons (location pins, checkmarks, circles) subtly scattered across the background.
- Mobile-first, responsive layout to ensure a seamless experience on various devices.
- Subtle transitions and animations for a smooth and engaging user experience.