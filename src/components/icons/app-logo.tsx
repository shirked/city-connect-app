import { cn } from "@/lib/utils";

export const AppLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-6 w-6", className)}
    >
      <defs>
        <linearGradient id="pin-gradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#14b8a6" />
        </linearGradient>
        <linearGradient id="eye-gradient" x1="12" y1="10" x2="12" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#84cc16" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C7.58172 2 4 5.58172 4 10C4 15.3137 12 22 12 22C12 22 20 15.3137 20 10C20 5.58172 16.4183 2 12 2ZM12 14.5C10.067 14.5 8.5 12.933 8.5 11C8.5 9.067 10.067 7.5 12 7.5C13.933 7.5 15.5 9.067 15.5 11C15.5 12.933 13.933 14.5 12 14.5Z"
        fill="url(#pin-gradient)"
      />
      <path
        d="M12 14C9.5 14 7.8 11.5 7.8 11.5C7.8 11.5 9.5 9 12 9C14.5 9 16.2 11.5 16.2 11.5C16.2 11.5 14.5 14 12 14Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />
       <circle cx="12" cy="11.5" r="1.5" fill="url(#eye-gradient)" />
       <path
        d="M15.5 5.5L18 8L14.5 11.5"
        stroke="#f97316"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
       <path
        d="M18.5 4.5C17.5 4 16 4 15.5 5.5"
        stroke="#f97316"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
